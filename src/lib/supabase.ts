import { createClient } from '@supabase/supabase-js';

// Hardcoding the keys directly to bypass Vite's environment variable caching issues
const supabaseUrl = 'https://igbjdrhcincbtjuarvoj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnYmpkcmhjaW5jYnRqdWFydm9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNjY3MzIsImV4cCI6MjA5MTg0MjczMn0.dVFNPJXnyWTd8IXOZ0MiqdqAxl0b9WjIjBl-A1hZRMs';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
