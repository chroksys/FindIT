const SUPABASE_URL = "https://nnxmomkafguipaiqvxuh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ueG1vbWthZmd1aXBhaXF2eHVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwODQ5OTcsImV4cCI6MjA5ODY2MDk5N30.Dt_EGFYzhQm4Q5xlEZKYM0LG4_ioYDnvNBU_yEWn9nw";

async function test() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/notifications`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      user_id: '75f5609d-3332-4928-aeb8-c1632d31df69',
      type: 'follow',
      message: 'test',
      link: '/test',
      read: false
    })
  });
  const data = await res.text();
  console.log('Status:', res.status);
  console.log('Response:', data);
}

test().catch(console.error);
