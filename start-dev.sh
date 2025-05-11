#!/bin/bash

# Supabase 환경 변수 설정
export VITE_SUPABASE_URL="https://sarpiggygpqzitvcdiqk.supabase.co"
export VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhcnBpZ2d5Z3Bxeml0dmNkaXFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5MzAxMjQsImV4cCI6MjA2MjUwNjEyNH0.7n07LjbdZ4qqXQ4Lis40LWSGgNFynUB8tHqlUosceAM"

# 실행 중인 5002 포트 프로세스 찾고 종료
echo "실행 중인 5002 포트 프로세스 확인 중..."
PID=$(lsof -t -i:5002)
if [ -n "$PID" ]; then
  echo "포트 5002를 사용 중인 프로세스 (PID: $PID) 종료 중..."
  kill $PID
  sleep 1
fi

# 개발 서버 시작
echo "개발 서버 시작 중..."
npm run dev 