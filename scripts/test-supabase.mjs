// One-off connectivity test: calls get_modal_spectrum() and prints mode names
import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

// Parse .env manually (no dotenv dependency needed)
const envVars = {}
try {
  const raw = readFileSync(new URL('../.env', import.meta.url), 'utf8')
  for (const line of raw.split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/)
    if (match) envVars[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '')
  }
} catch {
  // Fall back to process.env if .env not present
}

const url = envVars.SUPABASE_URL || process.env.SUPABASE_URL
const key = envVars.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, key)

const { data, error } = await supabase.rpc('get_modal_spectrum')
if (error) {
  console.error('Supabase error:', error.message)
  process.exit(1)
}

console.log('✓ Supabase connected. Modal spectrum (brightest → darkest):')
data.forEach((m, i) => console.log(`  ${i + 1}. ${m.name} (brightness: ${m.brightness_level})`))
