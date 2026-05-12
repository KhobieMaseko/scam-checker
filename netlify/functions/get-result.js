const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'GET') return { statusCode: 405, headers, body: 'Method Not Allowed' };

  const id = event.queryStringParameters?.id;

  if (!id) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing id parameter' }) };
  }

  // Basic UUID format check
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid id format' }) };
  }

  const { data, error } = await supabase
    .from('submissions')
    .select('id, created_at, verdict, scam_type, confidence, red_flags, safe_signals, explanation, summary, what_to_do, upvotes, downvotes, content')
    .eq('id', id)
    .single();

  if (error || !data) {
    return { statusCode: 404, headers, body: JSON.stringify({ error: 'Result not found' }) };
  }

  return { statusCode: 200, headers, body: JSON.stringify(data) };
};
