import type { Express } from "express";
import type { Server } from 'node:http';
import { storage } from "./storage";
import { knowledgeBase, matchQuestion, interpolateAnswer, getExpertFallback } from "../shared/knowledgeBase";

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

      // 3. Fallback to Gemini API if key is provided in environment variables
      const apiKey = process.env.GEMINI_API_KEY;
      console.log("DEBUG API KEY:", apiKey ? "EXISTS" : "MISSING");
      if (apiKey) {
        try {
          const prompt = `You are the authoritative "Savita Technical Advisor" for Savita Oil Technologies Limited.
Savita is the manufacturer of all kinds of Mineral Oil, Natural Ester Oil (branded as bioTRANSOL) and Synthetic Ester Oil (branded as Transol Synth 100).
Savita is the pioneer who started production and business of both Ester Technologies in India first, making them the absolute best in local engineering and quality.

Never name competitor products (like FR3, Midel, Cargill, Apar, Envirotemp).

Here is the current customer report data:
- Customer Name: ${data.customerName || "Customer"} (Note: DO NOT use the customer's name in your answer unless the user specifically asks a highly formal or executive-level question. Keep standard technical questions conversational without naming them).
- Project Type: ${data.projectType === "new_transformer" ? "Procuring a BRAND NEW transformer" : "Retrofilling an EXISTING transformer"}
- Transformer Rating: ${data.transformerRating} MVA
- Voltage Class: ${data.voltageClass} kV
- Oil Volume: ${data.oilVolume} Litres

Here is the calculated financial and operational comparison results:
- Best Value choice: ${comparison.bestValue} (Ester savings: bioTRANSOL: ${comparison.naturalSavings}, Transol Synth 100: ${comparison.syntheticSavings})
- bioTRANSOL (Natural Ester) Payback: ${comparison.naturalPayback} years, BCR: ${comparison.naturalBenefitCostRatio}
- Transol Synth 100 (Synthetic Ester) Payback: ${comparison.syntheticPayback} years, BCR: ${comparison.syntheticBenefitCostRatio}

Answer the user's question directly and concisely. Be professional and authoritative, but DO NOT be overly descriptive or verbose. 
CRITICAL FORMATTING RULES:
1. NEVER use LaTeX math blocks (like $$ or \\[ \\]). If you need to write a formula, use simple plain text (e.g., "NPV = Sum of discounted cash flows - Initial Cost").
2. Pitch Ester technology (bioTRANSOL/Transol Synth 100) convincingly showing CapEx offsets on fire protection, paper life extension, and lifecycle TCO savings, but keep it brief.
3. Always use the branded names bioTRANSOL and Transol Synth 100.
4. Do NOT start your answer by greeting the customer by name for basic questions. Just answer the question.

User Question: "${message}"`;

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000);

          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
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

