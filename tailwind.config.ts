import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'beige': '#F5F1ED',
        'olive': '#556B2F',
        'dark-olive': '#3D4E1F',
        'light-olive': '#9CAF5C',
      },
      backgroundColor: {
        'glass': 'rgba(255, 255, 255, 0.7)',
      },
      boxShadow: {
        'premium': '0 8px 32px rgba(0, 0, 0, 0.08)',
        'premium-lg': '0 16px 48px rgba(0, 0, 0, 0.12)',
      },
      borderRadius: {
        '2xl': '16px',
      },
      fontFamily: {
        'sans': ['system-ui', 'sans-serif'],
      },
      animation: {
        'fadeIn': 'fadeIn 0.3s ease-in-out',
        'slideUp': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
export default config
