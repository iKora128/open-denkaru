import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  label?: string;
  error?: string;
  glass?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      leftIcon,
      rightIcon,
      label,
      error,
      glass = true,
      disabled,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(!!props.value || !!props.defaultValue);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(!!e.target.value);
      props.onChange?.(e);
    };

    return (
      <div className="relative w-full">
        {/* Floating Label */}
        {label && (
          <motion.label
            className={cn(
              'absolute left-3 transition-all duration-200 pointer-events-none select-none z-10',
              leftIcon && 'left-10',
              (isFocused || hasValue) ? [
                'top-2 text-xs font-medium',
                error ? 'text-medical-error' : 'text-apple-blue',
              ] : [
                'top-1/2 -translate-y-1/2 text-sm',
                'text-system-gray-500 dark:text-system-gray-400',
              ]
            )}
            animate={{
              scale: isFocused || hasValue ? 0.85 : 1,
              y: isFocused || hasValue ? -8 : 0,
            }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {label}
          </motion.label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-system-gray-400 z-10">
              {leftIcon}
            </div>
          )}

          {/* Input Field */}
          <motion.input
            type={type}
            className={cn(
              // Base input styles with Apple-inspired design
              'flex w-full rounded-xl border px-3 py-3 text-sm transition-all duration-200',
              'placeholder:text-system-gray-400 focus-visible:outline-none',
              'disabled:cursor-not-allowed disabled:opacity-50',
              
              // Glass morphism styling
              glass && [
                'glass-input backdrop-blur-xl',
                'bg-white/50 dark:bg-system-gray-900/50',
                'border-white/20 dark:border-white/10',
                !error && 'focus:border-apple-blue focus:ring-2 focus:ring-apple-blue/20',
              ],
              
              // Solid styling
              !glass && [
                'bg-white dark:bg-system-gray-900',
                'border-system-gray-200 dark:border-system-gray-700',
                !error && 'focus:border-apple-blue focus:ring-2 focus:ring-apple-blue/20',
              ],
              
              // Error state
              error && [
                'border-medical-error focus:border-medical-error',
                'focus:ring-2 focus:ring-medical-error/20',
              ],
              
              // Icon spacing
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              
              // Label spacing
              label && 'pt-6 pb-2',
              
              className
            )}
            ref={ref}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            disabled={disabled}
            whileFocus={{ scale: 1.01 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            {...props}
          />

          {/* Right Icon */}
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-system-gray-400 z-10">
              {rightIcon}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 text-xs text-medical-error flex items-center"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Medical-specific input variants
const SearchInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <Input
      ref={ref}
      type="search"
      leftIcon={
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      }
      className={cn('pl-10', className)}
      placeholder="患者を検索..."
      {...props}
    />
  )
);
SearchInput.displayName = 'SearchInput';

const PatientIdInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <Input
      ref={ref}
      type="text"
      leftIcon={
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2H10m0 0V4a2 2 0 011-1h3a2 2 0 011 1v2m0 0V2H11a1 1 0 00-1 1v3"
          />
        </svg>
      }
      className={cn('pl-10 font-mono', className)}
      placeholder="患者番号を入力"
      {...props}
    />
  )
);
PatientIdInput.displayName = 'PatientIdInput';

export { Input, SearchInput, PatientIdInput };