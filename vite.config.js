import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs';

// 정적 파일을 직접 복사하는 플러그인 생성
const copyStaticFiles = () => {
  return {
    name: 'copy-static-files',
    closeBundle: () => {
      // dist 폴더가 있는지 확인
      if (!fs.existsSync('dist')) {
        fs.mkdirSync('dist', { recursive: true });
      }
      
      // sitemap.xml 복사
      if (fs.existsSync('public/sitemap.xml')) {
        fs.copyFileSync('public/sitemap.xml', 'dist/sitemap.xml');
        console.log('✅ sitemap.xml 파일이 복사되었습니다.');
      }
      
      // robots.txt 복사
      if (fs.existsSync('public/robots.txt')) {
        fs.copyFileSync('public/robots.txt', 'dist/robots.txt');
        console.log('✅ robots.txt 파일이 복사되었습니다.');
      }
    }
  };
};

export default defineConfig({
  plugins: [
    react(),
    copyStaticFiles()
  ],
  assetsInclude: ['**/*.xml', '**/*.txt'],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      output: {
        // 상대 경로 문제 해결을 위한 설정
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // 정적 파일을 dist에 복사하도록 설정
    copyPublicDir: true
  },
  // public 폴더 내의 파일이 정적 파일로 처리되도록 설정
  publicDir: 'public'
}); 