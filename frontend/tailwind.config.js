/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Apple & Liquid Glass Design System Colors
      colors: {
        // Primary Apple Colors
        apple: {
          blue: '#007AFF',
          green: '#34C759', 
          indigo: '#5856D6',
          orange: '#FF9500',
          pink: '#FF2D92',
          purple: '#AF52DE',
          red: '#FF3B30',
          teal: '#5AC8FA',
          yellow: '#FFCC00',
        },
        
        // System Colors (Apple HIG)
        system: {
          gray: {
            50: '#F9F9F9',
            100: '#F2F2F7',
            200: '#E5E5EA',
            300: '#D1D1D6',
            400: '#C7C7CC',
            500: '#AEAEB2',
            600: '#8E8E93',
            700: '#636366',
            800: '#48484A',
            900: '#1C1C1E',
          },
        },
        
        // Liquid Glass Effects
        glass: {
          primary: 'rgba(255, 255, 255, 0.1)',
          secondary: 'rgba(255, 255, 255, 0.05)',
          accent: 'rgba(0, 122, 255, 0.1)',
          border: 'rgba(255, 255, 255, 0.2)',
          shadow: 'rgba(0, 0, 0, 0.1)',
        },
        
        // Medical-specific Colors
        medical: {
          success: '#34C759',
          warning: '#FF9500',
          error: '#FF3B30',
          info: '#007AFF',
          critical: '#FF2D92',
        },
      },
      
      // Typography (SF Pro inspired)
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Display',
          'SF Pro Text',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'SF Mono',
          'Monaco',
          'Inconsolata',
          'Roboto Mono',
          'monospace',
        ],
      },
      
      // Fluid Typography Scale
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      
      // Spacing based on Apple 4pt grid
      spacing: {
        '0.5': '2px',
        '1': '4px',
        '1.5': '6px',
        '2': '8px',
        '2.5': '10px',
        '3': '12px',
        '3.5': '14px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '7': '28px',
        '8': '32px',
        '9': '36px',
        '10': '40px',
        '11': '44px',
        '12': '48px',
        '14': '56px',
        '16': '64px',
        '20': '80px',
        '24': '96px',
        '28': '112px',
        '32': '128px',
        '36': '144px',
        '40': '160px',
        '44': '176px',
        '48': '192px',
        '52': '208px',
        '56': '224px',
        '60': '240px',
        '64': '256px',
        '72': '288px',
        '80': '320px',
        '96': '384px',
      },
      
      // Border Radius (Apple-style rounded corners)
      borderRadius: {
        'none': '0',
        'sm': '4px',
        'DEFAULT': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '32px',
        'full': '9999px',
      },
      
      // Box Shadows (Liquid Glass Effects)
      boxShadow: {
        'glass-sm': '0 1px 2px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'glass': '0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'glass-lg': '0 8px 32px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'glass-xl': '0 16px 64px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'inner-glass': 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
        'focus-ring': '0 0 0 3px rgba(0, 122, 255, 0.3)',
      },
      
      // Animation & Motion
      transitionTimingFunction: {
        'apple': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        'spring': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      
      transitionDuration: {
        '75': '75ms',
        '100': '100ms',
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '500': '500ms',
        '700': '700ms',
        '1000': '1000ms',
      },
      
      // Backdrop Blur for Liquid Glass
      backdropBlur: {
        'glass': '16px',
        'glass-lg': '24px',
        'glass-xl': '32px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    
    // Custom Liquid Glass Plugin
    function({ addUtilities, theme }) {
      const glassUtilities = {
        '.glass': {
          backgroundColor: theme('colors.glass.primary'),
          backdropFilter: 'blur(16px) saturate(180%)',
          border: `1px solid ${theme('colors.glass.border')}`,
          boxShadow: theme('boxShadow.glass'),
        },
        '.glass-secondary': {
          backgroundColor: theme('colors.glass.secondary'),
          backdropFilter: 'blur(12px) saturate(160%)',
          border: `1px solid ${theme('colors.glass.border')}`,
          boxShadow: theme('boxShadow.glass-sm'),
        },
        '.glass-accent': {
          backgroundColor: theme('colors.glass.accent'),
          backdropFilter: 'blur(20px) saturate(200%)',
          border: `1px solid ${theme('colors.apple.blue')}20`,
          boxShadow: theme('boxShadow.glass-lg'),
        },
      };
      
      addUtilities(glassUtilities);
    },
    
    // Custom Medical Status Colors
    function({ addUtilities, theme }) {
      const medicalUtilities = {
        '.status-normal': {
          backgroundColor: theme('colors.medical.success'),
          color: 'white',
        },
        '.status-warning': {
          backgroundColor: theme('colors.medical.warning'),
          color: 'white',
        },
        '.status-critical': {
          backgroundColor: theme('colors.medical.error'),
          color: 'white',
        },
        '.status-info': {
          backgroundColor: theme('colors.medical.info'),
          color: 'white',
        },
      };
      
      addUtilities(medicalUtilities);
    },
  ],
};