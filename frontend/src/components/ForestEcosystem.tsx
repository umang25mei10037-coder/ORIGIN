import React from 'react';

interface ForestEcosystemProps {
  variant?: 'banner' | 'card' | 'backdrop' | 'mini' | 'empty' | 'loader';
  height?: number | string;
  className?: string;
  showTrees?: boolean;
  showParticles?: boolean;
  showContours?: boolean;
  showDataNodes?: boolean;
}

export const ForestEcosystem: React.FC<ForestEcosystemProps> = ({
  variant = 'banner',
  height = '100%',
  className = '',
  showTrees = true,
  showParticles = true,
  showContours = true,
  showDataNodes = true,
}) => {
  return (
    <div
      className={`forest-ecosystem-wrapper forest-${variant} ${className}`}
      style={{ height, position: 'relative', overflow: 'hidden', pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <svg
        className="forest-svg"
        viewBox="0 0 1200 320"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <defs>
          {/* Subtle nature gradients */}
          <linearGradient id="sky-soft-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F4F8F4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#E9F2EC" stopOpacity="0.95" />
          </linearGradient>

          <linearGradient id="mountain-back-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#9ABAA8" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#B4CDC0" stopOpacity="0.5" />
          </linearGradient>

          <linearGradient id="mountain-mid-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#67977F" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#87B19D" stopOpacity="0.65" />
          </linearGradient>

          <linearGradient id="mountain-front-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2D6B4E" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#1C4F38" stopOpacity="0.85" />
          </linearGradient>

          <linearGradient id="contour-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1F6B4F" stopOpacity="0.05" />
            <stop offset="50%" stopColor="#3B8266" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#1F6B4F" stopOpacity="0.05" />
          </linearGradient>

          <filter id="gentle-mist" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
          </filter>
        </defs>

        {/* Sky / Base tint */}
        {variant !== 'mini' && (
          <rect width="1200" height="320" fill="url(#sky-soft-gradient)" />
        )}

        {/* Topographic / GIS contour lines */}
        {showContours && (
          <g className="contour-lines" stroke="url(#contour-grad)" fill="none" strokeWidth="1.2" strokeDasharray="4 6">
            <path d="M-50,90 Q 200,60 450,110 T 900,80 T 1250,120" />
            <path d="M-50,130 Q 300,100 600,150 T 1000,120 T 1250,160" />
            <path d="M-50,170 Q 250,150 550,190 T 950,160 T 1250,200" />
          </g>
        )}

        {/* Far Mountains (Slow sway / shift) */}
        <path
          className="mountain-layer layer-far"
          d="M0,180 Q 150,110 320,165 T 650,130 T 980,155 Q 1100,135 1200,170 L1200,320 L0,320 Z"
          fill="url(#mountain-back-grad)"
        />

        {/* Middle Hills (Mid depth) */}
        <path
          className="mountain-layer layer-mid"
          d="M0,210 Q 180,160 380,195 T 760,175 T 1080,190 Q 1150,185 1200,205 L1200,320 L0,320 Z"
          fill="url(#mountain-mid-grad)"
        />

        {/* Gentle Mist / Fog between ridges */}
        <ellipse
          className="forest-mist"
          cx="600"
          cy="200"
          rx="500"
          ry="30"
          fill="#FFFFFF"
          opacity="0.35"
          filter="url(#gentle-mist)"
        />

        {/* Forefront Forest Ridge */}
        <path
          className="mountain-layer layer-near"
          d="M0,245 Q 220,215 440,240 T 880,225 T 1200,248 L1200,320 L0,320 Z"
          fill="url(#mountain-front-grad)"
        />

        {/* Subtle Tree Silhouettes along the hills */}
        {showTrees && (
          <g className="tree-silhouettes" fill="#143D2C" opacity="0.85">
            {/* Cluster 1 - Left */}
            <path d="M90,248 L97,222 L104,248 Z" />
            <path d="M102,248 L108,228 L114,248 Z" />
            <path d="M112,249 L118,220 L124,249 Z" />
            <path d="M122,250 L127,232 L132,250 Z" />

            {/* Cluster 2 - Mid Left */}
            <path d="M280,242 L286,218 L292,242 Z" />
            <path d="M290,243 L297,212 L304,243 Z" />
            <path d="M302,244 L308,224 L314,244 Z" />

            {/* Cluster 3 - Center Ridge */}
            <path d="M520,236 L527,208 L534,236 Z" />
            <path d="M532,236 L538,216 L544,236 Z" />
            <path d="M542,237 L550,205 L558,237 Z" />
            <path d="M556,238 L562,220 L568,238 Z" />

            {/* Cluster 4 - Mid Right */}
            <path d="M780,230 L787,204 L794,230 Z" />
            <path d="M792,231 L800,198 L808,231 Z" />
            <path d="M806,231 L812,212 L818,231 Z" />

            {/* Cluster 5 - Far Right */}
            <path d="M1040,244 L1047,216 L1054,244 Z" />
            <path d="M1052,245 L1059,222 L1066,245 Z" />
            <path d="M1064,246 L1071,210 L1078,246 Z" />
          </g>
        )}

        {/* GIS / AI Data Nodes flowing across the landscape */}
        {showDataNodes && (
          <g className="gis-data-flow">
            {/* Pulsing data nodes */}
            <circle cx="210" cy="185" r="3.5" fill="#4ade80" className="data-node pulse-1" />
            <line x1="210" y1="185" x2="330" y2="160" stroke="#4ade80" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />

            <circle cx="330" cy="160" r="4.5" fill="#38bdf8" className="data-node pulse-2" />
            <line x1="330" y1="160" x2="520" y2="140" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />

            <circle cx="520" cy="140" r="4" fill="#a7f3d0" className="data-node pulse-3" />
            <line x1="520" y1="140" x2="740" y2="165" stroke="#a7f3d0" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />

            <circle cx="740" cy="165" r="4.5" fill="#fbbf24" className="data-node pulse-1" />
            <line x1="740" y1="165" x2="940" y2="150" stroke="#fbbf24" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />

            <circle cx="940" cy="150" r="3.5" fill="#4ade80" className="data-node pulse-2" />
          </g>
        )}

        {/* Small subtle bird silhouettes soaring peacefully */}
        {variant !== 'mini' && (
          <g className="floating-birds" fill="#3D5A47" opacity="0.45">
            <path className="bird-1" d="M380,85 Q 388,78 396,85 Q 404,78 412,85 Q 404,81 396,87 Q 388,81 380,85 Z" />
            <path className="bird-2" d="M420,95 Q 426,89 432,95 Q 438,89 444,95 Q 438,92 432,97 Q 426,92 420,95 Z" />
            <path className="bird-3" d="M720,70 Q 727,64 734,70 Q 741,64 748,70 Q 741,67 734,72 Q 727,67 720,70 Z" />
          </g>
        )}
      </svg>

      {/* Floating particles / soft light embers */}
      {showParticles && (
        <div className="forest-particles-container">
          <span className="forest-leaf leaf-1">🍃</span>
          <span className="forest-leaf leaf-2">🍂</span>
          <span className="forest-particle particle-1" />
          <span className="forest-particle particle-2" />
          <span className="forest-particle particle-3" />
          <span className="forest-particle particle-4" />
        </div>
      )}
    </div>
  );
};

export default ForestEcosystem;
