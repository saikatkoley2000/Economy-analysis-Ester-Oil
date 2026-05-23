import type { Express } from "express";
import type { Server } from 'node:http';
import { storage } from "./storage";
import { knowledgeBase, matchQuestion, interpolateAnswer, getExpertFallback } from "@shared/knowledgeBase";
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

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
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

      // 2. Question is not in the listed Q&As -> activate the live terminal bridge file
      const bridgePath = path.join(__dirname, "..", "shared", "agent_bridge.json");
      
      // Write the pending question
      fs.writeFileSync(bridgePath, JSON.stringify({
        question: message,
        status: "pending",
        answer: "",
        timestamp: new Date().toISOString()
      }, null, 2));

      // 3. Poll the bridge file for up to 60 seconds, waiting for Antigravity to write the answer
      const maxWaitSeconds = 60;
      for (let i = 0; i < maxWaitSeconds; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (fs.existsSync(bridgePath)) {
          try {
            const content = fs.readFileSync(bridgePath, "utf-8");
            const bridgeData = JSON.parse(content);
            if (bridgeData.status === "answered" && bridgeData.answer) {
              return res.json({
                answer: bridgeData.answer,
                source: "antigravity_agent"
              });
            }
          } catch (e) {
            // Ignore temporary parse errors while file is being written
          }
        }
      }

      // 4. Fallback response if it times out
      const fallbackAnswer = getExpertFallback(message, data, comparison, selectedOil);
      return res.json({
        answer: fallbackAnswer,
        source: "offline_fallback"
      });

    } catch (error: any) {
      console.error("Chat route error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}

