/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/workspace/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        // Studio 浅色主题
        'studio-bg': '#f8fafc',        // Slate 50
        'studio-surface': '#ffffff',   // White
        'studio-border': '#e2e8f0',    // Slate 200
        'studio-text': '#0f172a',      // Slate 900
        'studio-text-muted': '#64748b', // Slate 500
        'studio-primary': '#2563eb',   // Blue 600
        'studio-hover': '#f1f5f9',     // Slate 100
      },
    },
  },
  plugins: [],
}
