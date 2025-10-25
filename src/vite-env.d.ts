// Author-Hemant Arora
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Make TS accept Swiper’s CSS entry points
declare module 'swiper/css';
declare module 'swiper/css/navigation';
declare module 'swiper/css/pagination';

// (Optional) if your TS setup complains about any CSS imports:
declare module '*.css';