const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Try to read .env.local manually since we're running a standalone script
function loadEnv() {
  try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const envConfig = fs.readFileSync(envPath, 'utf8');
      envConfig.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim().replace(/^['"]|['"]$/g, '');
          process.env[key] = value;
        }
      });
    }
  } catch (e) {
    console.error('Error loading .env.local:', e);
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const gameId = 'a2e9607b-3786-4d15-909e-1b7ed7ec9ef3';

console.log('Testing Supabase Connection...');
console.log('URL:', supabaseUrl);
console.log('Key exists:', !!supabaseKey);
console.log('Target Game UUID:', gameId);

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFetch() {
  try {
    console.log('\nFetching game data...');
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('game_id', gameId)
      .single();

    if (error) {
      console.error('❌ Error fetching game:', error);
      console.log('\nConstructed CURL command for debugging:');
      console.log(`curl -X GET '${supabaseUrl}/rest/v1/games?game_id=eq.${gameId}&select=*' \\
  -H "apikey: ${supabaseKey}" \\
  -H "Authorization: Bearer ${supabaseKey}"`);
    } else {
      console.log('✅ Successfully fetched game data:');
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testFetch();
