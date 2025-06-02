import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xxoqkjlbvjzjreyfmete.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4b3Framxidmp6anJleWZtZXRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2MjY2NjIsImV4cCI6MjA2MTIwMjY2Mn0.NnbPzr2jrbqJPmWsWUdKUU0NSPQ6f690ntrTlbtnpDk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 