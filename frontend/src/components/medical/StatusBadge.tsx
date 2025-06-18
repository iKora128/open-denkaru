import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const statusBadgeVariants = cva(
  'inline-flex items-center rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      status: {
        success: 'bg-medical-success/10 text-medical-success border border-medical-success/20',
        warning: 'bg-medical-warning/10 text-medical-warning border border-medical-warning/20',
        error: 'bg-medical-error/10 text-medical-error border border-medical-error/20',
        info: 'bg-apple-blue/10 text-apple-blue border border-apple-blue/20',
        normal: 'bg-apple-green/10 text-apple-green border border-apple-green/20',
        inactive: 'bg-system-gray-100 text-system-gray-600 border border-system-gray-200',
      },
      size: {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-2 text-base',
      },
    },
    defaultVariants: {
      status: 'info',
      size: 'md',
    },
  }
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {
  children: React.ReactNode;
}

export function StatusBadge({
  className,
  status,
  size,
  children,
  ...props
}: StatusBadgeProps) {
  return (
    <div
      className={cn(statusBadgeVariants({ status, size }), className)}
      {...props}
    >
      {children}
    </div>
  );
}