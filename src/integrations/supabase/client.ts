// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://rudqsudqvymzrsfktxso.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1ZHFzdWRxdnltenJzZmt0eHNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNjQ4MDgsImV4cCI6MjA2MjY0MDgwOH0.Dq1nvmNzUJJdAxzehQs2OVrPtHZhc-XRoPkuFp8FwSc";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);