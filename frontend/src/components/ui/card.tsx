import * as React from 'react';
// import { motion } from 'framer-motion'; // Removed for performance
import { cn } from '@/lib/utils';

interface CardProps {
  className?: string;
  children?: React.ReactNode;
  hover?: boolean;
  glass?: boolean;
  elevated?: boolean;
  onClick?: () => void;
  [key: string]: any;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = false, glass = true, elevated = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
      // Base card styles with Apple-inspired design
      'rounded-2xl border transition-all duration-75',
      
      // Glass morphism effect
      glass && [
        'glass-card backdrop-blur-xl',
        'bg-white/70 dark:bg-system-gray-900/70',
        'border-white/20 dark:border-white/10',
        'shadow-glass hover:shadow-glass-lg',
      ],
      
      // Elevated card without glass effect
      !glass && [
        'bg-white dark:bg-system-gray-900',
        'border-system-gray-200 dark:border-system-gray-700',
        'shadow-lg hover:shadow-xl',
      ],
      
      // Extra elevation for important cards
      elevated && 'shadow-glass-lg hover:shadow-glass-xl',
      
      // Interactive hover effects
      hover && 'cursor-pointer hover:border-apple-blue/20',
      
      className
    )}
    {...props}
  />
));
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex flex-col space-y-1.5 p-6 pb-4',
      // Clean separator line
      'border-b border-system-gray-100 dark:border-system-gray-800',
      className
    )}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      // Apple-inspired typography
      'text-xl font-semibold leading-tight tracking-tight',
      'text-system-gray-900 dark:text-white',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      'text-sm text-system-gray-600 dark:text-system-gray-400',
      'leading-relaxed',
      className
    )}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn('p-6 pt-4', className)} 
    {...props} 
  />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center p-6 pt-4',
      // Clean separator line
      'border-t border-system-gray-100 dark:border-system-gray-800',
      className
    )}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

// Medical-specific card variants
const PatientCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    patient?: {
      name: string;
      age: number;
      status?: 'normal' | 'warning' | 'critical';
      lastVisit?: string;
    };
  }
>(({ className, patient, children, ...props }, ref) => (
  <Card
    ref={ref}
    hover
    className={cn(
      'patient-card relative overflow-hidden',
      // Status indicator line
      patient?.status === 'critical' && 'border-l-4 border-l-medical-error',
      patient?.status === 'warning' && 'border-l-4 border-l-medical-warning',
      patient?.status === 'normal' && 'border-l-4 border-l-medical-success',
      className
    )}
    {...props}
  >
    {children}
    
    {/* Elegant background pattern */}
    <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
      <div className="w-full h-full bg-gradient-to-br from-apple-blue to-apple-purple rounded-full blur-2xl" />
    </div>
  </Card>
));
PatientCard.displayName = 'PatientCard';

const VitalCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value: string | number;
    label: string;
    unit?: string;
    status?: 'normal' | 'warning' | 'critical';
    trend?: 'up' | 'down' | 'stable';
  }
>(({ className, value, label, unit, status = 'normal', trend, ...props }, ref) => (
  <Card
    ref={ref}
    glass
    className={cn(
      'vitals-display text-center relative overflow-hidden',
      // Status-based styling
      status === 'critical' && 'ring-2 ring-medical-error/20',
      status === 'warning' && 'ring-2 ring-medical-warning/20',
      status === 'normal' && 'ring-2 ring-medical-success/20',
      className
    )}
    {...props}
  >
    <CardContent className="pb-6">
      <div
        className={cn(
          'vitals-value text-4xl font-bold mb-2',
          status === 'critical' && 'text-medical-error',
          status === 'warning' && 'text-medical-warning',
          status === 'normal' && 'text-medical-success'
        )}
      >
        {value}
        {unit && <span className="text-lg ml-1 opacity-70">{unit}</span>}
      </div>
      
      <div className="vitals-label text-sm text-system-gray-600 dark:text-system-gray-400">
        {label}
      </div>
      
      {/* Trend indicator */}
      {trend && (
        <div
          className={cn(
            'mt-2 inline-flex items-center text-xs',
            trend === 'up' && 'text-medical-success',
            trend === 'down' && 'text-medical-error',
            trend === 'stable' && 'text-system-gray-500'
          )}
        >
          {trend === 'up' && '↗'}
          {trend === 'down' && '↘'}
          {trend === 'stable' && '→'}
        </div>
      )}
    </CardContent>
    
    {/* Subtle background gradient */}
    <div className="absolute inset-0 -z-10 opacity-10">
      <div className={cn(
        'w-full h-full',
        status === 'critical' && 'bg-gradient-to-br from-medical-error/20 to-transparent',
        status === 'warning' && 'bg-gradient-to-br from-medical-warning/20 to-transparent',
        status === 'normal' && 'bg-gradient-to-br from-medical-success/20 to-transparent'
      )} />
    </div>
  </Card>
));
VitalCard.displayName = 'VitalCard';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  PatientCard,
  VitalCard,
};