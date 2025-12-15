// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  // 🚨 ATENÇÃO: Configure os caminhos corretos aqui.
  content: [
    './index.html',
    // Mude esta linha para refletir seu projeto Vue/Vite (geralmente src/**/*.{vue,js,ts...})
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
