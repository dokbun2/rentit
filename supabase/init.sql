-- 문의 테이블 생성
CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  service TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  processed BOOLEAN DEFAULT FALSE
);

-- 뉴스 테이블 생성
CREATE TABLE IF NOT EXISTS news (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT DEFAULT '일반',
  tag TEXT DEFAULT '뉴스',
  tag_color TEXT DEFAULT 'bg-primary-dark/30',
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  active BOOLEAN DEFAULT TRUE
);

-- 관리자 인증 설정
-- Supabase에서 관리자 계정은 Authentication 서비스를 통해 관리됩니다.
-- 관리자 역할을 위한 RLS(Row Level Security) 정책 설정

-- contacts 테이블에 대한 RLS 정책
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- 인증된 사용자만 모든 연락처를 볼 수 있는 정책
CREATE POLICY "인증된 사용자는 모든 연락처를 볼 수 있음" ON contacts
FOR SELECT USING (auth.role() = 'authenticated');

-- 인증된 사용자만 연락처 상태를 변경할 수 있는 정책
CREATE POLICY "인증된 사용자는 연락처 상태를 업데이트할 수 있음" ON contacts
FOR UPDATE USING (auth.role() = 'authenticated');

-- news 테이블에 대한 RLS 정책
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- 인증된 사용자만 모든 뉴스를 관리할 수 있는 정책
CREATE POLICY "인증된 사용자는 모든 뉴스를 볼 수 있음" ON news
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "인증된 사용자는 뉴스를 추가할 수 있음" ON news
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "인증된 사용자는 뉴스를 업데이트할 수 있음" ON news
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "인증된 사용자는 뉴스를 삭제할 수 있음" ON news
FOR DELETE USING (auth.role() = 'authenticated');

-- 일반 사용자(비인증)도 활성화된 뉴스를 볼 수 있는 정책
CREATE POLICY "모든 사용자는 활성화된 뉴스를 볼 수 있음" ON news
FOR SELECT USING (active = TRUE); 