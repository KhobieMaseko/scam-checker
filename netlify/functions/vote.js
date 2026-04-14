const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

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

  let id, vote;
  try {
    const body = JSON.parse(event.body);
    id = body.id;
    vote = body.vote;
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid body" }) };
  }

  if (!id || !["up", "down"].includes(vote)) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing id or vote" }) };
  }

  const column = vote === "up" ? "upvotes" : "downvotes";

  const { data: current, error: fetchErr } = await supabase
    .from("submissions")
    .select(column)
    .eq("id", id)
    .single();

  if (fetchErr || !current) {
    return { statusCode: 404, body: JSON.stringify({ error: "Submission not found" }) };
  }

  const { error: updateErr } = await supabase
    .from("submissions")
    .update({ [column]: (current[column] || 0) + 1 })
    .eq("id", id);

  if (updateErr) {
    return { statusCode: 500, body: JSON.stringify({ error: "Vote failed" }) };
  }

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({ success: true }),
  };
};
