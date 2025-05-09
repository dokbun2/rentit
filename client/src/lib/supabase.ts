import { createClient } from '@supabase/supabase-js';

// Supabase 환경 변수에서 URL과 API 키 가져오기
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// 개발 환경에서 환경 변수 확인
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase 환경 변수가 설정되지 않았습니다. 어드민 기능이 작동하지 않을 수 있습니다.');
}

// Supabase 클라이언트 생성 (브라우저가 있는 경우에만)
export const supabase = typeof window !== 'undefined' 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

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