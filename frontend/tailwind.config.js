/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        space: {
          950: '#05050F',
          900: '#0A0A18',
          800: '#0F0F24',
          700: '#14142E',
          600: '#1C1C3A',
        },
        impostor: {
          DEFAULT: '#C51111',
          light: '#FF4444',
          dark: '#8B0000',
        },
        crewmate: {
          DEFAULT: '#132ED2',
          light: '#4A6FFF',
        },
        medic: {
          DEFAULT: '#11802D',
          light: '#19C119',
        },
        visor: '#7FDBFF',
      },
      fontFamily: {
        sans: ['var(--font-outfit)', 'system-ui', 'sans-serif'],
        bebas: ['var(--font-bebas)', 'cursive'],
      },
      animation: {
        'twinkle':      'twinkle 3s ease-in-out infinite',
        'crew-bounce':  'crewBounce 2.5s ease-in-out infinite',
        'role-pop':     'rolePop 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
        'slide-up':     'slideUp 0.4s ease forwards',
        'count-down':   'countDown 1.5s linear forwards',
        'reveal':       'reveal 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
        'fade-in':      'fadeIn 0.5s ease forwards',
        'glow-pulse':   'glowPulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
