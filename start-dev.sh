#!/bin/bash

# Supabase 환경 변수 설정
export VITE_SUPABASE_URL="https://zizuzfbixdajmdstagfw.supabase.co"
export VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppenV6ZmJpeGRham1kc3RhZ2Z3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3NDcxMjIsImV4cCI6MjA2MjMyMzEyMn0.wr9_JeKV1j5-LnQQNRjOlOkuyMt8otEHv2oziSUmQk8"

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