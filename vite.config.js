import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'My Second Brain',
        short_name: 'SecondBrain',
        description: '나만의 완벽한 학습 아카이브',
        theme_color: '#0d0d0d',
        background_color: '#0d0d0d',
        display: 'standalone', // 브라우저 UI를 없애고 앱처럼 실행
        icons: [
          {
            src: '192x192.png', // public 폴더에 아이콘 이미지 추가 필요
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
});