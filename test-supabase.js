const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://igbjdrhcincbtjuarvoj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnYmpkcmhjaW5jYnRqdWFydm9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNjY3MzIsImV4cCI6MjA5MTg0MjczMn0.dVFNPJXnyWTd8IXOZ0MiqdqAxl0b9WjIjBl-A1hZRMs';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  console.log("Attempting sign up...");
  const { data, error } = await supabase.auth.signUp({
    email: 'velocity_test@example.com',
    password: 'VelocityPassword123!',
    options: {
      data: { full_name: 'Test Rider' }
    }
  });

  if (error) {
    console.error("SignUp Error:", error.message);
  } else {
    console.log("SignUp Success!");
    console.log("User ID:", data.user?.id);
    console.log("Email:", data.user?.email);
  }
}

testAuth();
