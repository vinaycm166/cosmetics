/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Official Dew & Go Brand Retail Palette
        burgundy: {
          DEFAULT: '#581227',
          light: '#78233C',
          dark: '#430C1D',
        },
        berry: {
          DEFAULT: '#581227',
          light: '#78233C',
          dark: '#430C1D',
        },
        rose: {
          DEFAULT: '#E84F87',
          light: '#F075A2',
          dark: '#D0326D',
        },
        coral: {
          DEFAULT: '#FF8A75',
          light: '#FFA695',
          dark: '#E66952',
        },
        blush: {
          DEFAULT: '#FFF0F5',
          50: '#FFF9FB',
          100: '#FFF0F5',
          200: '#FCE1EB',
        },
        lavender: {
          DEFAULT: '#E9E1FF',
          50: '#F5F1FF',
          100: '#E9E1FF',
          200: '#D6C8FF',
        },
        warmcream: {
          DEFAULT: '#FFF9F4',
          50: '#FFFCFA',
          100: '#FFF9F4',
          200: '#F9EEE3',
        },
        charcoal: {
          DEFAULT: '#29242A',
          50: '#756D77',
          100: '#4F4851',
          900: '#29242A',
        },
        background: '#FFF9F4', // Warm cream background
        foreground: '#29242A', // Primary charcoal text
        brand: {
          DEFAULT: '#E84F87', // Rose pink primary brand color
          50: '#FFF0F5',
          100: '#FCE1EB',
          200: '#F9B7CE',
          300: '#F58EB2',
          400: '#F06698',
          500: '#E84F87',
          600: '#D0326D',
          700: '#A82154',
          800: '#721C46', // Berry
          900: '#561434',
        },
        muted: '#756D77',
        border: '#EFE7E1',
        sale: '#E84F87',
        success: {
          DEFAULT: '#267653',
          50: '#F0F9F4',
          100: '#E1F3EA',
          500: '#267653',
        },
        neutral: {
          50: '#FFF9F4',
          100: '#F7EFE9',
          200: '#EFE7E1',
          300: '#DFD5CD',
          400: '#B8ABA0',
          500: '#756D77',
          600: '#5A525C',
          700: '#413A43',
          800: '#29242A',
          900: '#1C181D',
        },
        champagne: {
          DEFAULT: '#D4AF37',
          50: '#FDFBF7',
          100: '#F5EED9',
          200: '#EBDCB4',
          300: '#DFC68B',
          400: '#D4AF37',
          500: '#B89225',
          600: '#947217',
          700: '#6E520D',
        },
        alabaster: '#FCFAF7',
        obsidian: '#1A1618',
      },
      fontFamily: {
        editorial: ['"Cormorant Garamond"', 'Didot', 'Bodoni MT', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'Manrope', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(41, 35, 35, 0.05)',
        'card': '0 2px 8px rgba(41, 35, 35, 0.06)',
        'dropdown': '0 4px 16px rgba(41, 35, 35, 0.08)',
        'elevated': '0 8px 24px rgba(41, 35, 35, 0.09)',
        'editorial': '0 20px 40px -15px rgba(41, 36, 42, 0.08), 0 0 1px rgba(41, 36, 42, 0.1)',
        '3d-float': '0 25px 50px -12px rgba(114, 28, 70, 0.2), 0 8px 16px -4px rgba(41, 36, 42, 0.06)',
        'glow-rose': '0 0 35px -5px rgba(232, 79, 135, 0.35)',
        'glow-champagne': '0 0 35px -5px rgba(212, 175, 55, 0.3)',
      },
      borderRadius: {
        'sm': '4px',
        'DEFAULT': '6px',
        'md': '8px',
        'lg': '10px',
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      }
    },
  },
  plugins: [],
}
