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
          80: '#ea528a',
          sub: "#f998a7"
        },
        secondary: {
          100: '#f58360',
          sub: '#ffe1d8'
        },
        textColor: {
          100: '#42131a',
          80: '#66353b'
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
        slideLeft: 'slideLeft 360s linear infinite',
        slideRight: 'slideRight 360s linear infinite',
      },
      boxShadow: {
        'button-theme': '0 2px 25px 5px rgba(255, 100, 100, 0.9)',
        'dark-theme': '0 0 10px 5px rgba(80, 0, 20, 0.2)',
      }
    },
  },
  plugins: [],
}

