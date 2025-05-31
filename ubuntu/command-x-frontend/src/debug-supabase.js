// Debug script to check Supabase configuration
console.log('Environment variables:')
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY)

// Test if we can create a Supabase client
try {
  const { createClient } = await import('@supabase/supabase-js')
  
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  
  console.log('Creating Supabase client...')
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  console.log('Supabase client created successfully')
  
  // Test a simple query
  console.log('Testing database connection...')
  const { data, error } = await supabase.from('users').select('count')
  
  if (error) {
    console.error('Database error:', error)
  } else {
    console.log('Database connection successful:', data)
  }
  
} catch (error) {
  console.error('Error:', error)
}
