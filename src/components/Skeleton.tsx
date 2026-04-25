import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'pill';
}

export function Skeleton({ className = '', variant = 'rectangular' }: SkeletonProps) {
  const variantClasses = {
    rectangular: 'rounded-2xl',
    circular: 'rounded-full',
    pill: 'rounded-full',
  };

  return (
    <div className={`relative overflow-hidden bg-white/5 ${variantClasses[variant]} ${className}`}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent shadow-2xl"
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: 'linear',
        }}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}

export function RideCardSkeleton() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-5 mb-4 shadow-lg backdrop-blur-md">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="w-24 h-4" variant="pill" />
        <Skeleton className="w-16 h-4" variant="pill" />
      </div>
      <Skeleton className="w-3/4 h-7 mb-2" />
      <Skeleton className="w-1/2 h-4 mb-5" />
      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <Skeleton className="w-20 h-4" variant="pill" />
        <Skeleton className="w-24 h-8" variant="pill" />
      </div>
    </div>
  );
}
