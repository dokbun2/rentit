# RentIt

웹 애플리케이션 프로젝트입니다.

## 기술 스택

- **프론트엔드**: React, TypeScript, TailwindCSS, Shadcn UI
- **백엔드**: Express.js, Node.js
- **데이터베이스**: PostgreSQL (Neon)
- **ORM**: Drizzle ORM
- **인증**: Passport.js
- **라우팅**: Wouter

## 로컬 개발 환경 설정

1. 저장소 클론:
```bash
git clone <repository-url>
cd rentit
```

2. 의존성 설치:
```bash
npm install
```

3. `.env` 파일 생성:
`.env.example` 파일을 복사하여 `.env` 파일을 생성하고 필요한 환경 변수를 설정합니다.

4. 개발 서버 실행:
```bash
npm run dev
```

## 배포

### Vercel 배포 방법

1. GitHub Desktop을 통해 GitHub 저장소에 코드를 푸시합니다.

2. Vercel 계정에 로그인합니다.

3. "New Project" 버튼을 클릭합니다.

4. GitHub 저장소를 선택합니다.

5. 다음 환경 변수를 설정합니다:
   - `DATABASE_URL`: PostgreSQL 데이터베이스 URL
   - `SESSION_SECRET`: 세션 암호화를 위한 비밀 키
   - `NODE_ENV`: production

6. 빌드 명령어를 `npm run build:vercel`로 변경하세요.

7. "Deploy" 버튼을 클릭합니다.

**[주의] 404 오류가 발생하는 경우:**
- Express 서버가 Vercel의 Serverless 환경에서 올바르게 동작하기 위해 `api/index.js` 파일을 확인하세요
- `vercel.json` 파일에서 라우팅 설정이 올바른지 확인하세요

## 프로젝트 구조

- `/client`: 프론트엔드 코드
- `/server`: 백엔드 코드
- `/shared`: 프론트엔드와 백엔드 간 공유 코드
- `/migrations`: 데이터베이스 마이그레이션 파일 

## Supabase 관리자 대시보드 구현

### 1. Supabase 설정하기

1. [Supabase](https://supabase.com/) 계정을 생성하고 새 프로젝트를 만듭니다.
2. `supabase/init.sql` 파일의 SQL을 Supabase SQL 에디터에서 실행하여 필요한 테이블과 권한을 설정합니다.
3. Supabase URL과 Anon Key를 환경 변수로 설정합니다.

```
# .env 파일
SUPABASE_URL=https://your-supabase-url.supabase.co
SUPABASE_KEY=your-supabase-anon-key
VITE_SUPABASE_URL=https://your-supabase-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Storage에서 `rentit-media` 버킷을 생성하고 권한을 설정합니다.

### 2. 관리자 계정 생성하기

1. Supabase 대시보드에서 Authentication > Users로 이동하여 관리자 계정을 생성합니다.
2. 이메일 주소와 비밀번호로 관리자 계정을 생성합니다.

### 3. 관리자 대시보드 사용하기

관리자 대시보드는 `/admin/login` 경로에서 접근할 수 있습니다.

#### 3.1 문의 관리

- 고객 문의 목록 확인
- 문의 상세 정보 확인
- 처리 상태 변경 (처리 완료/미처리)

#### 3.2 뉴스 관리

- 뉴스 목록 확인
- 뉴스 추가, 수정, 삭제
- 이미지 업로드
- 뉴스 활성화/비활성화 