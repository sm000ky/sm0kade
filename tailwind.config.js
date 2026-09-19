/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        arcade: {
          dark: '#0a0a10',
          screen: '#05070a',
          bezel: '#12131c',
          border: '#2a2b3d',
          neonCyan: '#00f0ff',
          neonAmber: '#ffaa00',
          neonPink: '#ff007f',
          neonGreen: '#00ff66',
          crimson: '#e60049'
        }
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        mono: ['"VT323"', 'monospace', 'Courier New']
      },
      boxShadow: {
        'neon-cyan': '0 0 15px rgba(0, 240, 255, 0.5), inset 0 0 15px rgba(0, 240, 255, 0.2)',
        'neon-pink': '0 0 15px rgba(255, 0, 127, 0.5), inset 0 0 15px rgba(255, 0, 127, 0.2)',
        'neon-amber': '0 0 15px rgba(255, 170, 0, 0.5)',
        'crt': 'inset 0 0 80px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 240, 255, 0.15)'
      },
      animation: {
        'scanline': 'scanline 8s linear infinite',
        'flicker': 'flicker 0.15s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' }
        },
        flicker: {
          '0%': { opacity: '0.97' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0.98' }
        }
      }
    },
  },
  plugins: [],
}
