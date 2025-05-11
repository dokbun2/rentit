import { createClient } from '@supabase/supabase-js';

// Supabase 접속 정보
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 콘솔에 정보 출력 (디버깅용)
console.log('SUPABASE_URL (디버깅):', supabaseUrl);
console.log('SUPABASE_ANON_KEY 설정 여부:', supabaseAnonKey ? '설정됨' : '설정되지 않음');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase 환경 변수가 설정되지 않았습니다!');
}

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('Supabase 클라이언트 초기화 상태:', !!supabase);
// URL 로깅 (프라이빗 프로퍼티 접근 대신 문자열로 표시)
console.log('현재 사용 중인 Supabase URL:', supabaseUrl);

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