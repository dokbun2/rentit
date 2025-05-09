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

-- Table 권한 설정 - 테이블에 RLS 활성화
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 삽입 가능하도록 정책 설정 (문의 폼 제출용)
CREATE POLICY "Anyone can insert contacts" ON public.contacts
  FOR INSERT TO PUBLIC
  WITH CHECK (true);

-- 인증된 사용자만 조회, 수정 가능하도록 정책 설정
CREATE POLICY "Authenticated users can view contacts" ON public.contacts
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update contacts" ON public.contacts
  FOR UPDATE TO authenticated
  USING (true);

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

-- Table 권한 설정 - 테이블에 RLS 활성화
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 뉴스를 볼 수 있도록 정책 설정
CREATE POLICY "Anyone can read news" ON public.news
  FOR SELECT TO PUBLIC
  USING (true);

-- 인증된 사용자만 뉴스 관리 가능하도록 정책 설정
CREATE POLICY "Authenticated users can insert news" ON public.news
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update news" ON public.news
  FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete news" ON public.news
  FOR DELETE TO authenticated
  USING (true); 