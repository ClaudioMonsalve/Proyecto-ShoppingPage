// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// Pon aquí tu URL y tu ANON KEY
const SUPABASE_URL = 'https://oigjcdezysslhyuxfeew.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pZ2pjZGV6eXNzbGh5dXhmZWV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NTI5MTYsImV4cCI6MjA3NTQyODkxNn0.mz0guPPkGjE5AgcKlFcDIOyOjbSQy3Ta8zYXx95VmIw'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
