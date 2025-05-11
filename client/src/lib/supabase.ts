import { createClient } from '@supabase/supabase-js';

// Supabase 접속 정보
const supabaseUrl = 'https://zizuzfbixdajmdstagfw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppenV6ZmJpeGRham1kc3RhZ2Z3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3NDcxMjIsImV4cCI6MjA2MjMyMzEyMn0.wr9_JeKV1j5-LnQQNRjOlOkuyMt8otEHv2oziSUmQk8';

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