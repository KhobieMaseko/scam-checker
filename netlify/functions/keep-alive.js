const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

exports.handler = async () => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const { error } = await supabase
      .from('submissions')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Supabase ping failed:', error.message);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ ok: false, error: error.message, ts: new Date().toISOString() }),
      };
    }

    console.log('Supabase ping successful:', new Date().toISOString());
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true, ts: new Date().toISOString() }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ ok: false, error: err.message }),
    };
  }
};
