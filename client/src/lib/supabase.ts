import { createClient } from '@supabase/supabase-js';

// Supabase 환경 변수에서 URL과 API 키 가져오기
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// 개발 환경에서 환경 변수 확인
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase 환경 변수가 설정되지 않았습니다. 어드민 기능이 작동하지 않을 수 있습니다.');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '설정됨' : '설정되지 않음');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '설정됨' : '설정되지 않음');
}

let supabaseClient = null;

// Supabase 클라이언트 생성 (브라우저가 있는 경우에만)
try {
  if (typeof window !== 'undefined' && supabaseUrl && supabaseAnonKey) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    });
    console.log('Supabase 클라이언트가 초기화되었습니다.');
  }
} catch (error) {
  console.error('Supabase 클라이언트 초기화 오류:', error);
}

export const supabase = supabaseClient;

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