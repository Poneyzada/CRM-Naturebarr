/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nature: {
          50: '#f7faeb',
          100: '#eff5d6',
          200: '#e1ecc0',
          300: '#cfdf9b',
          400: '#bfd570',
          500: '#afcb48', // Cor exata enviada pelo usuário (#afcb48)
          600: '#94b032',
          700: '#738a24',
          800: '#5a6d1f',
          900: '#4a5b1c',
          950: '#27320b',
        },
        limebrand: '#afcb48',
      }
    },
  },
  plugins: [],
}
