import { createClient } from '@supabase/supabase-js';

// Supabase URL과 API 키를 환경 변수에서 가져옵니다.
// 실제 배포 시에는 실제 URL과 API 키를 환경 변수로 설정해야 합니다.
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'your-supabase-anon-key';

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

// Supabase 관련 함수들

// 연락처 저장
export async function saveContact(contactData: Omit<Contact, 'id' | 'created_at' | 'processed'>) {
  const { data, error } = await supabase
    .from('contacts')
    .insert([{ ...contactData, processed: false }])
    .select();
  
  if (error) throw error;
  return data[0];
}

// 모든 연락처 가져오기
export async function getAllContacts() {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

// 특정 연락처 가져오기
export async function getContactById(id: number) {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

// 연락처 처리 상태 업데이트
export async function updateContactProcessed(id: number, processed: boolean) {
  const { data, error } = await supabase
    .from('contacts')
    .update({ processed })
    .eq('id', id)
    .select();
  
  if (error) throw error;
  return data[0];
}

// 뉴스 아이템 저장
export async function saveNewsItem(newsData: Omit<NewsItem, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('news')
    .insert([newsData])
    .select();
  
  if (error) throw error;
  return data[0];
}

// 모든 뉴스 가져오기
export async function getAllNews() {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .order('published_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

// 활성화된 뉴스만 가져오기 (웹사이트 표시용)
export async function getActiveNews() {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('active', true)
    .order('published_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

// 뉴스 아이템 업데이트
export async function updateNewsItem(id: number, newsData: Partial<Omit<NewsItem, 'id' | 'created_at'>>) {
  const { data, error } = await supabase
    .from('news')
    .update(newsData)
    .eq('id', id)
    .select();
  
  if (error) throw error;
  return data[0];
}

// 뉴스 아이템 삭제
export async function deleteNewsItem(id: number) {
  const { error } = await supabase
    .from('news')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
} 