import { createClient } from '@supabase/supabase-js';

// Credentials provided by the user
const SUPABASE_URL = 'https://ywgbayioaklkhhgreqmd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3Z2JheWlvYWtsa2hoZ3JlcW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MTg2NTUsImV4cCI6MjA3OTk5NDY1NX0.zq6uMmiyMi1OfnggWBc3l84CH3QlhF9TBy5rhLbkNzU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Safely decrements user credits using the Database RPC function.
 */
export const deductCredits = async (userId: string, amount: number = 1) => {
  const { error } = await supabase.rpc('decrement_credits', { 
    row_id: userId, 
    count: amount 
  });
  
  if (error) {
    console.error("Error deducting credits:", error);
    throw new Error("Could not update credit balance.");
  }
};
