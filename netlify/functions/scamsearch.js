exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };
  if (event.httpMethod !== "GET") return { statusCode: 405, headers, body: JSON.stringify({ error: "Method Not Allowed" }) };

  const token = process.env.SCAMSEARCH_API_TOKEN;
  if (!token) {
    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({ error: "not_configured", message: "ScamSearch API token not set. Add SCAMSEARCH_API_TOKEN to your environment variables." }),
    };
  }

  const { term, type } = event.queryStringParameters || {};
  if (!term || term.trim().length < 3) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Please enter at least 3 characters to search." }) };
  }

  const searchType = ["all", "email", "phone", "address", "user"].includes(type) ? type : "all";

  try {
    const url = `https://scamsearch.io/api/search?search=${encodeURIComponent(term.trim())}&type=${searchType}&api_token=${token}`;
    const res = await fetch(url);
    const data = await res.json();
    return { statusCode: 200, headers, body: JSON.stringify(data) };
  } catch (err) {
    console.error("ScamSearch error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "ScamSearch lookup failed. Please try again." }) };
  }
};
