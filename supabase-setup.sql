-- 새 Supabase 프로젝트 설정을 위한 SQL 스크립트

-- contacts 테이블 생성
CREATE TABLE IF NOT EXISTS public.contacts (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL, 
  service TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_processed BOOLEAN DEFAULT false
);

-- RLS 정책 설정: 기본적으로 보안을 활성화
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- 익명 사용자가 contacts 테이블에 삽입할 수 있도록 허용
CREATE POLICY "Allow anonymous inserts to contacts"
ON public.contacts
FOR INSERT
TO public
WITH CHECK (true);

-- news 테이블 생성 (뉴스 기능을 사용하는 경우)
CREATE TABLE IF NOT EXISTS public.news (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  tag TEXT,
  tag_color TEXT,
  image_url TEXT,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  active BOOLEAN DEFAULT true
);

-- 스크립트 실행 방법:
-- 1. Supabase 대시보드(https://app.supabase.com)에 로그인
-- 2. 새 프로젝트 선택
-- 3. 왼쪽 메뉴에서 "SQL Editor" 선택
-- 4. 이 스크립트 내용을 복사하여 붙여넣기
-- 5. "Run" 버튼 클릭하여 실행 