import { matchQuestion, interpolateAnswer, getExpertFallback } from "../shared/knowledgeBase";

export default async function handler(req: any, res: any) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, data, comparison, targetOil } = req.body || {};

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
      return res.status(200).json({
        answer,
        matchedId: matchedKB.id,
        source: "local_knowledge_base"
      });
    }

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
        const timeoutId = setTimeout(() => controller.abort(), 4000);

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
            return res.status(200).json({
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
    return res.status(200).json({
      answer: fallbackAnswer,
      source: "offline_fallback"
    });

  } catch (error: any) {
    console.error("Vercel Serverless Chat Route Error:", error);
    // Return standard JSON error, preventing a full crash
    return res.status(500).json({ error: error.message || "Unknown error occurred", stack: error.stack });
  }
}
