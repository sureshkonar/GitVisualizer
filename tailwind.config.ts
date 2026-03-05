import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular']
      },
      colors: {
        gitBg: '#0D1117',
        gitPanel: '#161B22',
        gitGreen: '#238636',
        gitBlue: '#58A6FF'
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(88,166,255,0.15), 0 0 40px rgba(88,166,255,0.25)'
      },
      backgroundImage: {
        grid: 'linear-gradient(rgba(88,166,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(88,166,255,0.05) 1px, transparent 1px)'
      }
    }
  },
  plugins: []
};

export default config;
