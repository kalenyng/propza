/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts,scss}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        surfaceSecondary: 'var(--surface-secondary)',
        card: 'var(--card)',
        border: 'var(--border)',
        text: 'var(--text)',
        textMuted: 'var(--text-muted)',
        accent: 'var(--accent)',
        accentSoft: 'var(--accent-soft)'
      },
      borderRadius: {
        xl2: '20px',
        xl3: '28px'
      },
      boxShadow: {
        soft: 'var(--shadow-sm)',
        lift: 'var(--shadow-md)'
      }
    }
  },
  plugins: []
};
