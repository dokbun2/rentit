import { News } from "@/types/news";
import { supabase } from "@/lib/supabase";

export async function getNews(): Promise<News[]> {
  try {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('뉴스 데이터를 불러오는 중 오류가 발생했습니다:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('뉴스 데이터를 불러오는 중 예외가 발생했습니다:', error);
    return [];
  }
}

export async function getNewsById(id: number): Promise<News | null> {
  try {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`ID ${id}의 뉴스를 불러오는 중 오류가 발생했습니다:`, error);
      return null;
    }
    
    return data || null;
  } catch (error) {
    console.error(`ID ${id}의 뉴스를 불러오는 중 예외가 발생했습니다:`, error);
    return null;
  }
} 