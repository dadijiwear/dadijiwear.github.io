import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

export function LoadingSpinner({ size = 24, className }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Loader2 size={size} className="animate-spin text-dadi-green dark:text-dadi-gold" />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-100 flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-dadi-green/20 border-t-dadi-green rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-serif font-bold text-dadi-green text-xl">D</span>
        </div>
      </div>
      <p className="font-serif text-dadi-green-dark dark:text-dadi-gold animate-pulse tracking-widest uppercase text-xs">
        Crafting Love...
      </p>
    </div>
  );
}
