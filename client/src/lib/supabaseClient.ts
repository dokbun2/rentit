import { createClient } from '@supabase/supabase-js';

// Supabase URL과 API 키를 환경 변수에서 가져옵니다.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// 개발 환경에서 환경 변수 확인
if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase 환경 변수가 설정되지 않았습니다. 어드민 기능이 작동하지 않을 수 있습니다.');
}

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseKey);

// 타입 정의
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