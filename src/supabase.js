import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://itfguqdfbdnfelwxhizl.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0Zmd1cWRmYmRuZmVsd3hoaXpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNTI3ODAsImV4cCI6MjA5MjYyODc4MH0.RhRagKDA4TvmGQ9Az7jYChDcWwdhMjZPnwKtGmYAnlU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)