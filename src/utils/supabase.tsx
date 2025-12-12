// src/utils/supabase.tsx
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../database.types'; // パスは実プロジェクトに合わせる

const supabaseUrl = process.env.VITE_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase の URL / ANON KEY が環境変数に設定されていません');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
