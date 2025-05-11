import { createClient } from '@supabase/supabase-js';

// Supabase 접속 정보
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zixuzfhxdajmdlsqnfw.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppeHV6Zmh4ZGFqbWRsc3FuZnciLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcxNTQxNDQwNiwiZXhwIjoyMDMwOTkwNDA2fQ.nNNXnxIcMYUxpOZBgysXxhbMZpFbYbR2PS1_F4VVrOU';

// 콘솔에 정보 출력 (디버깅용)
console.log('SUPABASE_URL (디버깅):', supabaseUrl);
console.log('SUPABASE_ANON_KEY 설정 여부:', supabaseAnonKey ? '설정됨' : '설정되지 않음');

// Supabase 클라이언트 생성
let supabaseClient;
try {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  });
  console.log('Supabase 클라이언트 초기화 성공');
} catch (error) {
  console.error('Supabase 클라이언트 초기화 오류:', error);
  supabaseClient = null;
}

export const supabase = supabaseClient;
console.log('Supabase 클라이언트 상태:', !!supabase);

export default supabase;

// 타입 내보내기
export type { SupabaseClient } from '@supabase/supabase-js';

// 추가 타입 정의
export interface Contact {
  id: number;
  name: string;
  phone: string;
  email: string;
  service: string;
  message: string;
  created_at: string;
  processed: boolean;
}

export interface NewsItem {
  id: number;
  title: string;
  category: string;
  tag: string;
  tag_color: string;
  description: string;
  image: string;
  published_at: string;
  active: boolean;
} 