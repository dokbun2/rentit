import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 필요한 디렉토리 생성
fs.mkdirSync(path.join(__dirname, '.vercel', 'output', 'static'), { recursive: true });
fs.mkdirSync(path.join(__dirname, '.vercel', 'output', 'functions'), { recursive: true });

// config 생성
const config = {
  version: 3,
  routes: [
    { src: '/api/(.*)', dest: '/api' },
    { handle: 'filesystem' },
    { src: '/(.*)', dest: '/index.html' }
  ]
};

fs.writeFileSync(
  path.join(__dirname, '.vercel', 'output', 'config.json'),
  JSON.stringify(config, null, 2)
);

// API 함수 설정
const apiFunction = {
  runtime: 'nodejs18.x',
  memory: 1024,
  maxDuration: 10
};

fs.writeFileSync(
  path.join(__dirname, '.vercel', 'output', 'functions', 'api.func', '.vc-config.json'),
  JSON.stringify(apiFunction, null, 2)
);

console.log('Vercel build configuration completed'); 