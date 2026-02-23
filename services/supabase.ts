
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxclbfnothhqgajfbcwe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4Y2xiZm5vdGhocWdhamZiY3dlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMjU5MTgsImV4cCI6MjA4NTkwMTkxOH0.MniuoH43VD0FQAIdTdDstrI8mQogWyqGjTZFOvJRdmo';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Utility for fetching common date formats
export const getSystemDate = () => {
  const now = new Date();
  return {
    iso: now.toISOString().split('T')[0],
    formatted: now.toLocaleDateString('fr-FR'),
    js: now
  };
};

// Utility to fetch metrics/logs from application side
export const logMetric = (scope: string, message: string, type: 'info' | 'error' | 'success' = 'info') => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] [${scope}] ${message}`);
};
