import { createClient } from '@supabase/supabase-js';

// Supabase 접속 정보 - 하드코딩하여 연결 안정성 향상
const supabaseUrl = 'https://zixuzfhxdajmdlsqnfw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppeHV6Zmh4ZGFqbWRsc3FuZnciLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcxNTQxNDQwNiwiZXhwIjoyMDMwOTkwNDA2fQ.nNNXnxIcMYUxpOZBgysXxhbMZpFbYbR2PS1_F4VVrOU';

// 콘솔 로깅 최소화
console.log('Supabase 클라이언트 초기화 시작');

// Supabase 클라이언트 생성 - 연결 옵션 개선
let supabaseClient;
try {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      // 네트워크 연결 재시도 설정
      fetch: (url, options) => {
        return fetch(url, {
          ...options,
          // 타임아웃 증가
          signal: AbortSignal.timeout(30000),
          // 크로스도메인 쿠키 허용
          credentials: 'include',
        });
      },
    },
  });
  console.log('Supabase 클라이언트 초기화 성공');
} catch (error) {
  console.error('Supabase 클라이언트 초기화 오류:', error);
  supabaseClient = null;
}

export const supabase = supabaseClient;

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