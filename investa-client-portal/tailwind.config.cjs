/** Minimal Tailwind config for Investa client portal */
const plugin = require('tailwindcss/plugin');

module.exports = {
  content: [
    './src/**/*.{html,ts,scss}',
  ],
  theme: {
    extend: {},
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