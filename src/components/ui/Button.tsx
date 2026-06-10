import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex font-medium transition-colors items-center justify-center rounded-sm",
        {
          // Variants matches image: secondary is the Green one, primary is the Gold/Yellow
          'bg-dadi-gold text-dadi-green hover:bg-yellow-500 shadow-md': variant === 'primary',
          'bg-dadi-green text-white hover:bg-dadi-green-dark shadow-md': variant === 'secondary',
          'bg-dadi-red text-white hover:bg-red-600 shadow-md': variant === 'danger',
          'border border-dadi-green text-dadi-green bg-transparent hover:bg-dadi-green hover:text-white': variant === 'outline',
          
          // Sizes
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-6 py-2 text-base': size === 'md',
          'px-8 py-3 text-lg': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
