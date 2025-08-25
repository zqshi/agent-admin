/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 品牌色彩系统
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // 语义化颜色
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        // 苹果风格中性色 (更轻量)
        gray: {
          25: '#fefefe',
          50: '#fafafa', 
          100: '#f5f5f7',
          200: '#e8e8ed',
          300: '#d2d2d7',
          400: '#98989d',
          500: '#6e6e73',
          600: '#48484a',
          700: '#3a3a3c',
          800: '#2c2c2e',
          900: '#1c1c1e',
          950: '#000000',
        }
      },
      // 苹果风格字体系统
      fontFamily: {
        'sans': [
          '-apple-system', 
          'BlinkMacSystemFont',
          'SF Pro Display', 
          'Segoe UI', 
          'Roboto', 
          'Helvetica Neue', 
          'Arial', 
          'sans-serif'
        ],
        'mono': [
          'JetBrains Mono',
          'Fira Code', 
          'Menlo', 
          'Monaco', 
          'Cascadia Code', 
          'Consolas', 
          'Courier New', 
          'monospace'
        ],
      },
      // 苹果风格字号系统 (更宽松的行高)
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.2rem' }],
        'sm': ['0.875rem', { lineHeight: '1.4rem' }],
        'base': ['1rem', { lineHeight: '1.6rem' }],
        'lg': ['1.125rem', { lineHeight: '1.8rem' }],
        'xl': ['1.25rem', { lineHeight: '2rem' }],
        '2xl': ['1.5rem', { lineHeight: '2.4rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.8rem' }],
        '4xl': ['2.25rem', { lineHeight: '3.2rem' }],
        '5xl': ['3rem', { lineHeight: '3.6rem' }],
        '6xl': ['3.75rem', { lineHeight: '4.2rem' }],
      },
      // 间距系统 (8pt grid)
      spacing: {
        '0.5': '0.125rem',  // 2px
        '1': '0.25rem',     // 4px
        '1.5': '0.375rem',  // 6px
        '2': '0.5rem',      // 8px
        '2.5': '0.625rem',  // 10px
        '3': '0.75rem',     // 12px
        '3.5': '0.875rem',  // 14px
        '4': '1rem',        // 16px
        '5': '1.25rem',     // 20px
        '6': '1.5rem',      // 24px
        '7': '1.75rem',     // 28px
        '8': '2rem',        // 32px
        '9': '2.25rem',     // 36px
        '10': '2.5rem',     // 40px
        '11': '2.75rem',    // 44px
        '12': '3rem',       // 48px
        '14': '3.5rem',     // 56px
        '16': '4rem',       // 64px
        '20': '5rem',       // 80px
        '24': '6rem',       // 96px
        '32': '8rem',       // 128px
      },
      // 苹果风格圆角系统 (更大的圆角)
      borderRadius: {
        'none': '0',
        'xs': '0.25rem',    // 4px
        'sm': '0.375rem',   // 6px
        'base': '0.5rem',   // 8px
        'md': '0.75rem',    // 12px
        'lg': '1rem',       // 16px
        'xl': '1.25rem',    // 20px
        '2xl': '1.5rem',    // 24px
        '3xl': '2rem',      // 32px
        'full': '9999px',
      },
      // 苹果风格阴影系统 (更柔和)
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'base': '0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
        'md': '0 10px 15px -3px rgba(0, 0, 0, 0.06), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
        'lg': '0 20px 25px -5px rgba(0, 0, 0, 0.06), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
        'xl': '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
        // 苹果风格特有的阴影
        'apple': '0 2px 16px 0 rgba(0, 0, 0, 0.06)',
        'apple-lg': '0 8px 30px 0 rgba(0, 0, 0, 0.08)',
      }
    },
  },
  plugins: [],
}