/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          100: '#f21e6f',
          sub: "#f998a7"
        },
        secondary: {
          100: '#f58360',
        },
        textColor: {
          100: '#382222',
          80: '#5b1d1d'
        },
        textColorOpposite: {
          100: 'white'
        },
        translucentWhite: 'rgba(255, 255, 255, 0.35)'
      },
      keyframes: {
        slideLeft: {
          '100%': { transform: 'translateX(-50%)' },
        },
        slideRight: {
          '100%': { transform: 'translateX(50%)' },
        }
      },
      animation: {
        slideLeft: 'slideLeft 60s linear infinite',
        slideRight: 'slideRight 60s linear infinite',
      },
    },
  },
  plugins: [],
}

