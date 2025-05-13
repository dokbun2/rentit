import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
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