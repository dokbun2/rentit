import { createClient } from '@supabase/supabase-js';

// Supabase 접속 정보
// 환경 변수가 설정되어 있지 않을 경우를 대비해 하드코딩된 값을 사용
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://sarpiggygpqzitvcdiqk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhcnBpZ2d5Z3Bxeml0dmNkaXFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5MzAxMjQsImV4cCI6MjA2MjUwNjEyNH0.7n07LjbdZ4qqXQ4Lis40LWSGgNFynUB8tHqlUosceAM';

// 콘솔에 정보 출력 (디버깅용)
console.log('SUPABASE_URL:', supabaseUrl);
console.log('SUPABASE_ANON_KEY:', supabaseAnonKey ? '설정됨' : '설정되지 않음');

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('Supabase 클라이언트 초기화 상태:', !!supabase);

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