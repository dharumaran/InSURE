import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        base: '#0A0E1A',
        card: '#0F1524',
        glass: 'rgba(255,255,255,0.03)',
        dim: {
          border: 'rgba(255,255,255,0.07)',
          text: '#3D4F6B',
        },
        bright: {
          border: 'rgba(59,158,255,0.30)',
        },
        accent: '#3B9EFF',
        success: '#00D68F',
        danger: '#FF5370',
        warning: '#FFB547',
        purple: '#B388FF',
        fg: '#F0F4FF',
        'fg-muted': '#8899BB',
      },
      boxShadow: {
        glow: '0 0 30px rgba(59,158,255,0.08)',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
      },
    },
  },
  plugins: [],
} satisfies Config
