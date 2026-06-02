/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          purple: {
            DEFAULT: '#a855f7', // violet-500
            glow: '#c084fc',    // violet-400
          },
          blue: {
            DEFAULT: '#06b6d4',  // cyan-500
            glow: '#22d3ee',     // cyan-400
          },
          pink: {
            DEFAULT: '#ec4899',  // pink-500
            glow: '#f472b6',     // pink-400
          }
        },
        dark: {
          bg: '#0a0a0c',        // ultra dark background
          card: '#121216',      // premium dark card
          border: '#1f1f29',    // border color
          input: '#1a1a24'
        },
        chic: {
          blush: {
            DEFAULT: '#E8C5C8',
            glow: '#F5E6E8',
            soft: '#FFF0F2',
          },
          rose: {
            DEFAULT: '#D89CA3',
            glow: '#EAD1D4',
          },
          gold: {
            DEFAULT: '#D4A373',
            glow: '#EADBC8',
          },
          cream: '#FAF6F6',
          dark: '#3A2A2D',
          gray: '#7D6F72',
          card: '#FFFFFF',
          border: '#EAD1D4',
          input: '#FAF6F6'
        }
      },
      animation: {
        'flash': 'flashEffect 0.6s ease-out forwards',
        'neon-pulse': 'neonPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'chic-pulse': 'chicPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scale-up': 'scaleUp 0.3s ease-out forwards',
        'shutter': 'shutter 0.2s ease-out',
      },
      keyframes: {
        flashEffect: {
          '0%': { opacity: '1', backgroundColor: '#ffffff' },
          '100%': { opacity: '0', backgroundColor: 'transparent' },
        },
        neonPulse: {
          '0%, 100%': {
            boxShadow: '0 0 4px #a855f7, 0 0 12px rgba(168, 85, 247, 0.4)',
            borderColor: '#a855f7'
          },
          '50%': {
            boxShadow: '0 0 16px #a855f7, 0 0 24px rgba(168, 85, 247, 0.7)',
            borderColor: '#c084fc'
          }
        },
        chicPulse: {
          '0%, 100%': {
            boxShadow: '0 0 4px #D89CA3, 0 0 12px rgba(216, 156, 163, 0.3)',
            borderColor: '#D89CA3'
          },
          '50%': {
            boxShadow: '0 0 16px #D89CA3, 0 0 24px rgba(216, 156, 163, 0.6)',
            borderColor: '#E8C5C8'
          }
        },
        scaleUp: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        shutter: {
          '0%': { opacity: '0.3' },
          '100%': { opacity: '1' }
        }
      }
    },
  },
  plugins: [],
}
