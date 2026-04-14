const Groq = require("groq-sdk");
const { createClient } = require("@supabase/supabase-js");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const SYSTEM_PROMPT = `You are an expert fraud analyst who helps everyday people identify scams. 
You have deep knowledge of all major scam types including: phishing emails, job scams (fake job offers, work-from-home fraud), 
romance scams, investment/crypto scams, lottery/prize scams, government impersonation, tech support scams, 
rental scams, advance-fee fraud (419), impersonation scams (Amazon, PayPal, banks), and social engineering.

When analyzing a message, you must respond with ONLY a valid JSON object — no other text, no markdown, no explanation outside the JSON.

The JSON must follow this exact structure:
{
  "verdict": "scam" | "likely_scam" | "suspicious" | "likely_safe",
  "confidence": <integer 0-100>,
  "scam_type": <string or null>,
  "summary": <one sentence verdict for the user, plain language, max 20 words>,
  "red_flags": [<array of strings, each describing one specific red flag found in the text>],
  "safe_signals": [<array of strings, each describing one reassuring element if any>],
  "explanation": <2-4 sentence plain English explanation of your reasoning>,
  "what_to_do": [<array of 2-4 actionable steps the person should take right now>]
}

Verdict definitions:
- "scam": Very high confidence this is fraudulent (80%+)
- "likely_scam": Strong indicators but not definitive (60-79%)
- "suspicious": Something feels off, proceed with extreme caution (40-59%)
- "likely_safe": No significant red flags found (<40% scam probability)

scam_type values (use exactly these strings or null):
job_scam | phishing | romance_scam | investment_scam | lottery_scam | 
government_impersonation | tech_support_scam | rental_scam | advance_fee | 
impersonation | social_engineering | other

Be direct and specific. Reference actual phrases or details from the submitted text in your red_flags.
If the text is too short or ambiguous to analyze, set verdict to "suspicious" and explain why more context is needed.

IMPORTANT: Return ONLY the raw JSON object. No markdown fences, no explanation before or after, just the JSON.`;

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let content;
  try {
    const body = JSON.parse(event.body);
    content = body.content?.trim();
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid request body" }) };
  }

  if (!content || content.length < 10) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Please paste more text — at least a sentence or two." }),
    };
  }

  if (content.length > 8000) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Text too long. Please paste up to 8,000 characters." }),
    };
  }

  let analysisResult;
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1024,
      temperature: 0.1,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Please analyze this message/text for scam indicators:\n\n---\n${content}\n---`,
        },
      ],
    });

    const rawText = completion.choices[0]?.message?.content || "";

    // Strip markdown fences if the model adds them anyway
    const cleaned = rawText.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");
    analysisResult = JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error("Groq API error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Analysis failed. Please try again." }),
    };
  }

  const truncatedContent =
    content.length > 500 ? content.substring(0, 500) + "..." : content;

  try {
    const { data, error } = await supabase
      .from("submissions")
      .insert({
        content: truncatedContent,
        verdict: analysisResult.verdict,
        scam_type: analysisResult.scam_type || null,
        confidence: analysisResult.confidence,
        red_flags: analysisResult.red_flags || [],
        safe_signals: analysisResult.safe_signals || [],
        explanation: analysisResult.explanation,
      })
      .select("id")
      .single();

    if (!error && data) {
      analysisResult.submission_id = data.id;
    }
  } catch (dbErr) {
    console.error("Supabase insert error:", dbErr);
  }

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(analysisResult),
  };
};
