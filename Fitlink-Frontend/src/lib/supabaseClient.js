// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Variables que vienen del archivo .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Crea y exporta el cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
