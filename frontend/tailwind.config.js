/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand Colors
        primary: {
          DEFAULT: '#14F195', 
          hover: '#0DD180',   
        },
        secondary: {
          DEFAULT: '#9945FF', 
          hover: '#8739E5',
        },
        // New Tertiary Color (USDC/Trust bridge)
        tertiary: {
          DEFAULT: '#00C2FF', 
        },

        // Neutral Shades 
        dark: {
          DEFAULT: '#000000', 
          bg: '#0F172A',      
          surface: '#1E293B', 
          border: '#334155',  
        },
        light: {
          DEFAULT: '#FFFFFF', 
          muted: '#94A3B8',   
        },
        // Status Colors
        success: '#22C55E', 
        error: '#EF4444',   
        warning: '#F59E0B', 
      },
    },
  },
  plugins: [],
}