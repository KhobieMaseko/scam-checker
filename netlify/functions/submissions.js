const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

exports.handler = async (event) => {
  const params = event.queryStringParameters || {};
  const filter = params.filter || "all";
  const search = params.search || "";
  const page = parseInt(params.page || "0");
  const limit = 12;

  let query = supabase
    .from("submissions")
    .select("id, created_at, verdict, scam_type, confidence, red_flags, explanation, upvotes, downvotes, content")
    .order("created_at", { ascending: false })
    .range(page * limit, page * limit + limit - 1);

  if (filter !== "all") {
    query = query.eq("verdict", filter);
  }

  if (search) {
    query = query.ilike("content", `%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Failed to fetch submissions" }),
    };
  }

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(data),
  };
};
