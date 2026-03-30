import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function updateAdmin() {
  console.log('Checking user alexhales@gmail.com...')
  // First update the role in users table
  const { data, error } = await supabase
    .from('users')
    .update({ role: 'admin' })
    .eq('email', 'alexhales@gmail.com')
    .select()
    
  if (error) {
    console.error('Error updating user:', error)
  } else {
    console.log('User updated successfully:', data)
  }
}

updateAdmin()
