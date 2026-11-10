/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        totc: {
          teal: "#49BBBD",
          'teal-light': "#EBF5FF",
          'teal-dark': "#3DA5A7",
          cyan: "#23BDEE",
          mint: "#00CBB8",
          navy: "#252641",
          purple: "#2F327D",
          dark: "#010514",
          orange: "#F48C06",
          coral: "#F67766",
          pink: "#D7577D",
          red: "#EA5959",
          gray: "#696984",
          'gray-light': "#F4F7FB",
          'gray-dark': "#595959",
          'gray-sub': "#545567",
        }
      },
      fontFamily: {
        poppins: ['"Poppins"', 'sans-serif'],
        nunito: ['"Nunito Sans"', 'sans-serif'],
      },
      boxShadow: {
        'totc-card': '0px 20px 40px rgba(0, 0, 0, 0.05)',
        'totc-float': '0px 10px 30px rgba(73, 187, 189, 0.15)',
        'totc-subtle': '0px 15px 44px rgba(13, 15, 28, 0.08)',
      },
      borderRadius: {
        '20': '20px',
        '24': '24px',
        '30': '30px',
        '40': '40px',
      }
    },
  },
  plugins: [],
}
