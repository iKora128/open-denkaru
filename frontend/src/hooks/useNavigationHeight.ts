'use client';

import { useEffect, useState } from 'react';

/**
 * Hook to get the current navigation bar height
 * Helps maintain consistent spacing across the app
 */
export function useNavigationHeight() {
  const [navHeight, setNavHeight] = useState(64); // Default 64px (h-16)

  useEffect(() => {
    const updateNavHeight = () => {
      const navElement = document.querySelector('nav');
      if (navElement) {
        const height = navElement.getBoundingClientRect().height;
        setNavHeight(height);
      }
    };

    // Update on mount
    updateNavHeight();

    // Update on resize
    window.addEventListener('resize', updateNavHeight);
    
    // Update on orientation change (mobile)
    window.addEventListener('orientationchange', updateNavHeight);

    return () => {
      window.removeEventListener('resize', updateNavHeight);
      window.removeEventListener('orientationchange', updateNavHeight);
    };
  }, []);

  return {
    navHeight,
    paddingTop: `${navHeight + 16}px`, // Add 16px extra padding
    marginTop: `${navHeight}px`,
    cssVar: `--nav-height: ${navHeight}px;`,
    tailwindClass: navHeight <= 64 ? 'pt-20' : 'pt-24' // Dynamic class based on height
  };
}

/**
 * CSS custom property for navigation height
 * Can be used in CSS files
 */
export const setNavigationHeightCSS = (height: number) => {
  document.documentElement.style.setProperty('--nav-height', `${height}px`);
  document.documentElement.style.setProperty('--nav-padding', `${height + 16}px`);
};