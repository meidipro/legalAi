// Filename: lib/supabase-client.ts
import { createClient } from '@supabase/supabase-js'

// These lines read the variables you just set in Vercel.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// This creates a single, reusable Supabase client instance for your entire app.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)