/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        'sm': '0.1875rem', // 3px border radius mimicking Notion
      }
    },
  },
  plugins: [],
}
