async function loadSupabase() {
    const { createClient } = await import("@supabase/supabase-js");
  
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;  // 🔥 Change this line
  
    return createClient(supabaseUrl, supabaseKey);
}

module.exports = loadSupabase;
