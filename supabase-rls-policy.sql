-- contacts 테이블의 RLS 활성화 확인
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Allow anonymous inserts to contacts" ON public.contacts;

-- 익명 사용자의 삽입을 허용하는 정책 생성
CREATE POLICY "Allow anonymous inserts to contacts"
ON public.contacts
FOR INSERT
TO public
WITH CHECK (true);

-- (선택사항) 관리자만 읽기 허용하는 정책
-- 관리자 역할이 있는 경우에만 아래 정책을 활성화하세요
-- CREATE POLICY "Allow admins to read contacts"
-- ON public.contacts
-- FOR SELECT
-- USING (auth.role() = 'authenticated');

-- SQL 스크립트 실행 방법:
-- 1. Supabase 대시보드에 로그인 (https://app.supabase.io/)
-- 2. 프로젝트 선택
-- 3. SQL 에디터로 이동
-- 4. 이 스크립트를 붙여넣고 실행 