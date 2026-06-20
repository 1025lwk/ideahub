/** @type {import('tailwindcss').Config} */
// TailwindCSS 仅用于基础布局和重置样式，UI 组件统一使用 Ant Design
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  // 禁用 Tailwind 的 preflight，避免与 Ant Design 样式冲突
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        primary: '#1677ff',
      },
    },
  },
  plugins: [],
};
