// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// Pon aquí tu URL y tu ANON KEY
const SUPABASE_URL = 'https://fmgfeqdmmjvyawoczwjt.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtZ2ZlcWRtbWp2eWF3b2N6d2p0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NTMxMjcsImV4cCI6MjA3NTQyOTEyN30.tCYUSrZlWMiBGpZmLdW_1PeIe_r9REqaKovy85eYbbA'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
