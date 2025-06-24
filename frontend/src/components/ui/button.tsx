import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
// import { motion } from 'framer-motion'; // Removed for performance
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  // Base styles - iPhone-inspired clean design
  'inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors duration-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none',
  {
    variants: {
      variant: {
        // Primary - Apple Blue with liquid glass effect
        default:
          'glass-button bg-apple-blue/90 text-white hover:bg-apple-blue shadow-glass hover:shadow-glass-lg backdrop-blur-xl border-apple-blue/20',
        
        // Secondary - Elegant glass effect
        secondary:
          'glass-button bg-white/10 text-system-gray-900 hover:bg-white/20 shadow-glass hover:shadow-glass-lg backdrop-blur-xl border-white/20 dark:text-white dark:hover:bg-white/10',
        
        // Destructive - Apple Red for critical actions
        destructive:
          'glass-button bg-apple-red/90 text-white hover:bg-apple-red shadow-glass hover:shadow-glass-lg backdrop-blur-xl border-apple-red/20',
        
        // Outline - Minimal and clean
        outline:
          'border border-system-gray-200 bg-transparent hover:bg-system-gray-50 hover:text-system-gray-900 dark:border-system-gray-700 dark:hover:bg-system-gray-800 dark:hover:text-white',
        
        // Ghost - Ultra minimal
        ghost:
          'hover:bg-system-gray-100 hover:text-system-gray-900 dark:hover:bg-system-gray-800 dark:hover:text-white',
        
        // Link - Text-based
        link: 'text-apple-blue underline-offset-4 hover:underline',
        
        // Medical status variants
        success:
          'glass-button bg-medical-success/90 text-white hover:bg-medical-success shadow-glass hover:shadow-glass-lg backdrop-blur-xl border-medical-success/20',
        
        warning:
          'glass-button bg-medical-warning/90 text-white hover:bg-medical-warning shadow-glass hover:shadow-glass-lg backdrop-blur-xl border-medical-warning/20',
        
        // Special premium variant with gradient
        premium:
          'glass-button bg-gradient-to-r from-apple-blue via-apple-purple to-apple-pink text-white shadow-glass-lg hover:shadow-glass-xl backdrop-blur-xl border-transparent hover:scale-[1.02]',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-lg px-3 text-xs',
        lg: 'h-12 rounded-2xl px-8 text-base',
        xl: 'h-14 rounded-2xl px-10 text-lg',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8 rounded-lg',
        'icon-lg': 'h-12 w-12 rounded-2xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        
        {leftIcon && !loading && (
          <span className="mr-2 flex items-center">{leftIcon}</span>
        )}
        
        <span className="flex items-center">{children}</span>
        
        {rightIcon && (
          <span className="ml-2 flex items-center">{rightIcon}</span>
        )}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };