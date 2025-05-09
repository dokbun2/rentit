-- contacts 테이블 생성
CREATE TABLE IF NOT EXISTS public.contacts (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  service TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed BOOLEAN DEFAULT FALSE
);

-- Table 권한 설정
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- 관리자만 contacts 테이블에 접근할 수 있도록 정책 설정
CREATE POLICY "Admin can select contacts" ON public.contacts
  FOR SELECT USING (auth.role() = 'authenticated');
  
CREATE POLICY "Admin can insert contacts" ON public.contacts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');
  
CREATE POLICY "Admin can update contacts" ON public.contacts
  FOR UPDATE USING (auth.role() = 'authenticated');

-- news 테이블 생성
CREATE TABLE IF NOT EXISTS public.news (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  tag TEXT,
  tag_color TEXT DEFAULT 'purple',
  description TEXT,
  image TEXT,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  active BOOLEAN DEFAULT TRUE
);

-- Table 권한 설정
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- news 테이블 정책 설정
CREATE POLICY "Anyone can read news" ON public.news
  FOR SELECT USING (true);
  
CREATE POLICY "Admin can insert news" ON public.news
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  
CREATE POLICY "Admin can update news" ON public.news
  FOR UPDATE USING (auth.role() = 'authenticated');
  
CREATE POLICY "Admin can delete news" ON public.news
  FOR DELETE USING (auth.role() = 'authenticated'); 