export function VelocityLogo({ size = 32, showName = false, className = '' }: { size?: number; showName?: boolean; className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Simple V shape with motion lines */}
        <defs>
          <linearGradient id="vGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9333ea" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
        
        {/* V shape */}
        <path
          d="M 20 20 L 50 80 L 80 20"
          stroke="url(#vGradient)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* Motion lines */}
        <line x1="10" y1="35" x2="5" y2="35" stroke="url(#vGradient)" strokeWidth="4" strokeLinecap="round" />
        <line x1="15" y1="50" x2="8" y2="50" stroke="url(#vGradient)" strokeWidth="4" strokeLinecap="round" />
        <line x1="20" y1="65" x2="12" y2="65" stroke="url(#vGradient)" strokeWidth="4" strokeLinecap="round" />
      </svg>
      {showName && (
        <span className="font-bold text-xl bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent">
          Velocity
        </span>
      )}
    </div>
  );
}
