module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  plugins: [
   require('tailwind-scrollbar-hide'),
  ],
  safelist: [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'data-[state=open]:bg-red-500',
    'data-[state=open]:bg-blue-500',
    'data-[state=open]:bg-green-500',
    'data-[state=open]:bg-purple-500',
  ],
}
