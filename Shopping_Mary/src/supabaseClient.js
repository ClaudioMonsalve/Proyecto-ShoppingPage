// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// Pon aquí tu URL y tu ANON KEY
const SUPABASE_URL = 'https://mromohsaigquffgkzgny.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yb21vaHNhaWdxdWZmZ2t6Z255Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NTI5MTksImV4cCI6MjA3NTQyODkxOX0.Kc1dlQqya4-6e8KJ2uhNw-fWh5pi5Fc_pTUc0EIKvpw'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
