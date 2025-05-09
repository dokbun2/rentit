import { createClient } from '@supabase/supabase-js';

// Supabase 환경 변수에서 URL과 API 키 가져오기
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 타입 내보내기
export type { SupabaseClient } from '@supabase/supabase-js'; 