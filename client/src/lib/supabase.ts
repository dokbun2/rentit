import { createClient } from '@supabase/supabase-js';

// Supabase 접속 정보
// 새 프로젝트 생성 후 아래 URL과 API 키를 새 프로젝트의 값으로 교체하세요
const supabaseUrl = 'https://sarpiggygpqzitvcdiqk.supabase.co'; // 여기에 새 프로젝트 URL 입력
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhcnBpZ2d5Z3Bxeml0dmNkaXFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5MzAxMjQsImV4cCI6MjA2MjUwNjEyNH0.7n07LjbdZ4qqXQ4Lis40LWSGgNFynUB8tHqlUosceAM'; // 여기에 새 anon key 입력

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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