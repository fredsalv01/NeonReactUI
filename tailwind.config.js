/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      colors: {
        gs: {
          bg:        '#0D0F14',
          surface:   '#13161E',
          card:      '#181C26',
          border:    '#232837',
          accent:    '#00C9A7',
          'accent-dim': '#00C9A720',
          warn:      '#F59E0B',
          danger:    '#EF4444',
          muted:     '#4A5568',
          text:      '#E2E8F0',
          soft:      '#94A3B8',
          teal:      '#0EA5E9',
        },
      },
      animation: {
        'fade-in':     'fadeIn .35s ease both',
        'slide-in':    'slideIn .3s ease both',
        'spin-fast':   'spin .7s linear infinite',
        'pulse':       'pulse 1.8s cubic-bezier(0.4,0,0.6,1) infinite',
        'slide-up':    'slideUp .3s ease both',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0', transform: 'translateY(10px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideIn: { from: { opacity: '0', transform: 'translateX(-14px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        pulse:   { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.4' } },
      },
    },
  },
  plugins: [],
}
