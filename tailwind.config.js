/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 极简色彩系统 - 苹果风格
      colors: {
        // 单一品牌主色 - 简洁蓝
        primary: '#0066FF',

        // 语义化颜色 - 仅保留核心状态色
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',

        // 7级灰度系统 - 苹果级精细灰度
        gray: {
          25: '#FEFEFE',   // 最浅背景
          50: '#FAFBFC',   // 页面背景
          100: '#F4F5F7',  // 区域背景
          200: '#E4E7EC',  // 边线颜色
          300: '#D0D5DD',  // 禁用状态
          500: '#667085',  // 次要文字
          600: '#475467',  // 主要文字
          900: '#1D2939',  // 标题文字
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
      // 3层阴影系统 - 苹果风格层次
      boxShadow: {
        // Layer 1 - 基础卡片阴影 (无边框时的层次感)
        'base': '0 1px 3px rgba(16, 24, 40, 0.10), 0 1px 2px rgba(16, 24, 40, 0.06)',

        // Layer 2 - 悬浮状态阴影 (hover、focus状态)
        'elevated': '0 4px 8px rgba(16, 24, 40, 0.08), 0 2px 4px rgba(16, 24, 40, 0.06)',

        // Layer 3 - 模态/最高层阴影 (modal、dropdown)
        'modal': '0 20px 25px rgba(16, 24, 40, 0.10), 0 10px 10px rgba(16, 24, 40, 0.04)',

        // 兼容性保留 (逐步移除)
        'sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px rgba(0, 0, 0, 0.07)',
        'lg': '0 10px 15px rgba(0, 0, 0, 0.10)',
      }
    },
  },
  plugins: [],
}