import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://exfsipwxedgvlhsmfrub.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4ZnNpcHd4ZWRndmxoc21mcnViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzODU5MjEsImV4cCI6MjA4OTk2MTkyMX0.xTbNOnxJQtbB-WznEHXCrP7mqJWVVH5yl-mx7G50kYw'

export const supabase = createClient(supabaseUrl, supabaseKey)
