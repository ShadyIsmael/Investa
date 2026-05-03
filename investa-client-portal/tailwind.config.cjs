/** Premium Tailwind config for Investa client portal (May 2026 UI/UX Upgrade) */
const plugin = require('tailwindcss/plugin');

module.exports = {
  content: [
    './src/**/*.{html,ts,scss}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6', // Core Vibrant Blue
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        slate: {
          50: '#f8fafc',
          800: '#1e293b',
          900: '#0f172a', // Luxury Dark Background
        },
        accent: '#10b981', // Emerald Success/Accent
      },
      fontFamily: {
        sans: ['Outfit', 'Poppins', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 4px 30px rgba(0, 0, 0, 0.05)',
        'premium': '0 10px 40px -10px rgba(15, 23, 42, 0.08)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    // Provide RTL/LTR variants so classes like `rtl:rotate-180` and `rtl:space-x-reverse` work
    plugin(function({ addVariant, e, modifySelectors, separator }) {
      addVariant('rtl', ({ modifySelectors }) => {
        modifySelectors(({ className }) => `:dir(rtl) .${e(`rtl${separator}${className}`)}`);
      });
      addVariant('ltr', ({ modifySelectors }) => {
        modifySelectors(({ className }) => `:dir(ltr) .${e(`ltr${separator}${className}`)}`);
      });
    })
  ]
};