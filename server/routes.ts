import type { Express } from "express";
import type { Server } from 'node:http';
import { storage } from "./storage";
import { knowledgeBase, matchQuestion, interpolateAnswer, getExpertFallback } from "../shared/knowledgeBase";
import * as fs from "fs";
import * as path from "path";

// Bridge helper functions to extract answers from the current agent conversation
function getConversationId(): string {
  const metadataStr = process.env.ANTIGRAVITY_SOURCE_METADATA;
  if (metadataStr) {
    try {
      const meta = JSON.parse(metadataStr);
      if (meta?.tool?.conversationId) {
        return meta.tool.conversationId;
      }
    } catch (e) {}
  }
  return "a4d83421-e098-47f5-aa14-9177c76b4606";
}

function getWordSimilarity(str1: string, str2: string): number {
  const clean = (s: string) => s.toLowerCase().replace(/[?.!,:;\-*()_"]/g, " ").replace(/\s+/g, " ").trim();
  const words1 = clean(str1).split(" ").filter(w => w.length > 2);
  const words2 = clean(str2).split(" ").filter(w => w.length > 2);
  if (words1.length === 0) return 0;
  let matches = 0;
  for (const w of words1) {
    if (words2.includes(w)) {
      matches++;
    }
  }
  return matches / words1.length;
}

function parseUserRequest(content: string): string {
  const startTag = "<USER_REQUEST>";
  const endTag = "</USER_REQUEST>";
  let req = content;
  if (content.includes(startTag) && content.includes(endTag)) {
    req = content.substring(content.indexOf(startTag) + startTag.length, content.indexOf(endTag)).trim();
  }
  return req;
}

function findAnswerInTranscript(query: string): { answer: string; score: number } | null {
  const conversationId = getConversationId();
  const userProfile = process.env.USERPROFILE || "C:\\Users\\Admin";
  const transcriptPath = path.join(
    userProfile,
    ".gemini",
    "antigravity",
    "brain",
    conversationId,
    ".system_generated",
    "logs",
    "transcript.jsonl"
  );

  if (!fs.existsSync(transcriptPath)) {
    return null;
  }

  try {
    const lines = fs.readFileSync(transcriptPath, "utf-8").split("\n").filter(Boolean);
    
    interface Turn {
      userQuery: string;
      modelAnswers: string[];
    }

    const turns: Turn[] = [];
    let currentTurn: Turn | null = null;

    for (const line of lines) {
      try {
        const obj = JSON.parse(line);
        if (obj.source === "USER_EXPLICIT" && obj.type === "USER_INPUT") {
          if (currentTurn) {
            turns.push(currentTurn);
          }
          currentTurn = {
            userQuery: parseUserRequest(obj.content || ""),
            modelAnswers: []
          };
        } else if (obj.source === "MODEL" && currentTurn) {
          if (obj.content && (!obj.tool_calls || obj.tool_calls.length === 0)) {
            currentTurn.modelAnswers.push(obj.content);
          }
        }
      } catch (e) {
        // Line parse error
      }
    }
    if (currentTurn) {
      turns.push(currentTurn);
    }

    let bestMatch: Turn | null = null;
    let highestScore = 0;

    for (const turn of turns) {
      const score = getWordSimilarity(query, turn.userQuery);
      if (score > highestScore && score >= 0.4) {
        highestScore = score;
        bestMatch = turn;
      }
    }

    if (bestMatch && bestMatch.modelAnswers.length > 0) {
      return {
        answer: bestMatch.modelAnswers[bestMatch.modelAnswers.length - 1],
        score: highestScore
      };
    }
  } catch (err) {
    console.error("Error reading transcript:", err);
  }

  return null;
}

export function registerRoutes(
  httpServer: Server,
  app: Express
): Server {
  // GET questions for frontend search/expansion list
  app.get("/api/qa/questions", (_req, res) => {
    try {
      res.json({ questions: knowledgeBase });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST chat query with live inputs and comparison results
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, data, comparison, targetOil } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }
      if (!data || !comparison) {
        return res.status(400).json({ error: "Active report data and comparison outputs are required" });
      }

      const selectedOil = targetOil || (comparison.bestValue !== "Mineral Oil" ? comparison.bestValue : "Natural Ester");

      // 1. Try local match first (of the 52 questions)
      const matchedKB = matchQuestion(message);
      if (matchedKB) {
        const answer = interpolateAnswer(matchedKB.answerTemplate, data, comparison, selectedOil);
        return res.json({
          answer,
          matchedId: matchedKB.id,
          source: "local_knowledge_base"
        });
      }


      // Removed faulty transcript bridge so it properly falls through to Gemini API
      // 3. Fallback to Gemini API if key is provided in environment variables
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey) {
        try {
          const prompt = `You are the authoritative "Savita Technical Advisor" for Savita Oil Technologies Limited.
Savita is the manufacturer of all kinds of Mineral Oil, Natural Ester Oil (branded as bioTRANSOL) and Synthetic Ester Oil (branded as TRANSOLSYNTH).
Savita is the pioneer who started production and business of both Ester Technologies in India first, making them the absolute best in local engineering and quality.

Never name competitor products (like FR3, Midel, Cargill, Apar, Envirotemp).

Here is the current customer report data:
- Customer Name: ${data.customerName || "Customer"}
- Transformer Rating: ${data.transformerRating} MVA
- Voltage Class: ${data.voltageClass} kV
- Oil Volume: ${data.oilVolume} Litres

Here is the calculated financial and operational comparison results:
- Best Value choice: ${comparison.bestValue} (Ester savings: bioTRANSOL: ${comparison.naturalSavings}, TRANSOLSYNTH: ${comparison.syntheticSavings})
- bioTRANSOL (Natural Ester) Payback: ${comparison.naturalPayback} years, BCR: ${comparison.naturalBenefitCostRatio}
- TRANSOLSYNTH (Synthetic Ester) Payback: ${comparison.syntheticPayback} years, BCR: ${comparison.syntheticBenefitCostRatio}

Answer the user's question with professional authority. Be concise, pitch Ester technology (bioTRANSOL/TRANSOLSYNTH) convincingly showing CapEx offsets on fire protection, paper life extension, and lifecycle TCO savings. Always use the branded names bioTRANSOL and TRANSOLSYNTH.

User Question: "${message}"`;

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);

          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
              }),
              signal: controller.signal
            }
          );
          clearTimeout(timeoutId);

          if (response.ok) {
            const resJson: any = await response.json();
            const generatedText = resJson?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (generatedText) {
              return res.json({
                answer: generatedText.trim(),
                source: "gemini_api"
              });
            }
          }
        } catch (apiErr) {
          console.error("Gemini API call failed:", apiErr);
        }
      }

      // 4. Default offline fallback response
      const fallbackAnswer = getExpertFallback(message, data, comparison, selectedOil);
      return res.json({
        answer: fallbackAnswer,
        source: "offline_fallback"
      });

    } catch (error: any) {
      console.error("Chat route error:", error);
      res.status(500).json({ error: error.message, stack: error.stack });
    }
  });

  return httpServer;
}

