"use client";

interface CodeIllustrationProps {
  type: 'collaboration' | 'coding' | 'security' | 'ai' | 'empty' | 'login' | 'signup' | 'demo' | 'programming' | 'team' | 'rocket' | 'video' | 'code-review';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'w-24 h-24',
  md: 'w-32 h-32',
  lg: 'w-48 h-48',
  xl: 'w-64 h-64',
};

export function CodeIllustration({ type, className = '', size = 'md' }: CodeIllustrationProps) {
  const sizeClass = sizeClasses[size];

  // Vector SVG illustrations based on type
  const renderVector = () => {
    switch (type) {
      case 'collaboration':
        return (
          <svg viewBox="0 0 128 128" className={sizeClass}>
            <defs>
              <linearGradient id="collabGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00d4ff" />
                <stop offset="100%" stopColor="#9333ea" />
              </linearGradient>
            </defs>
            <circle cx="40" cy="50" r="18" fill="url(#collabGrad)" opacity="0.8">
              <animate attributeName="r" values="18;20;18" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="88" cy="50" r="18" fill="url(#collabGrad)" opacity="0.8">
              <animate attributeName="r" values="18;20;18" dur="2s" begin="0.5s" repeatCount="indefinite" />
            </circle>
            <line x1="58" y1="50" x2="70" y2="50" stroke="#00d4ff" strokeWidth="2" opacity="0.6" />
          </svg>
        );
      
      case 'coding':
        return (
          <svg viewBox="0 0 128 128" className={sizeClass}>
            <defs>
              <linearGradient id="codeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff1493" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#9333ea" stopOpacity="0.6" />
              </linearGradient>
            </defs>
            <rect x="20" y="20" width="88" height="88" rx="6" fill="url(#codeGrad)" opacity="0.8" />
            <rect x="30" y="35" width="50" height="5" rx="2" fill="#ffffff" opacity="0.9" />
            <rect x="30" y="50" width="40" height="5" rx="2" fill="#ffffff" opacity="0.7" />
            <rect x="30" y="65" width="55" height="5" rx="2" fill="#ffffff" opacity="0.9" />
            <polygon points="108,20 120,32 120,108 108,88" fill="url(#codeGrad)" opacity="0.5" />
          </svg>
        );
      
      case 'security':
        return (
          <svg viewBox="0 0 128 128" className={sizeClass}>
            <defs>
              <linearGradient id="securityGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff1493" />
                <stop offset="100%" stopColor="#ff0000" />
              </linearGradient>
            </defs>
            <g transform="translate(40, 30)">
              <path d="M 24 10 L 10 20 L 10 40 Q 10 50 24 60 Q 38 50 38 40 L 38 20 Z" 
                fill="url(#securityGrad)" opacity="0.8" />
              <circle cx="24" cy="35" r="8" fill="#ffffff" opacity="0.9" />
              <path d="M 20 35 L 22 37 L 28 31" stroke="#ff0000" strokeWidth="2" fill="none" />
            </g>
          </svg>
        );
      
      case 'ai':
        return (
          <svg viewBox="0 0 128 128" className={sizeClass}>
            <defs>
              <linearGradient id="aiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9333ea" />
                <stop offset="100%" stopColor="#ff1493" />
              </linearGradient>
            </defs>
            <g transform="translate(30, 25)">
              <ellipse cx="34" cy="30" rx="25" ry="20" fill="url(#aiGrad)" opacity="0.8" />
              <circle cx="30" cy="35" r="3" fill="#00d4ff" opacity="0.8">
                <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle cx="38" cy="35" r="3" fill="#00d4ff" opacity="0.8">
                <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" begin="0.5s" repeatCount="indefinite" />
              </circle>
            </g>
          </svg>
        );
      
      default:
        return (
          <svg viewBox="0 0 128 128" className={sizeClass}>
            <circle cx="64" cy="64" r="30" fill="#9333ea" opacity="0.6" />
          </svg>
        );
    }
  };

  return (
    <div className={`opacity-90 hover:opacity-100 transition-opacity duration-300 ${className}`}>
      {renderVector()}
    </div>
  );
}
