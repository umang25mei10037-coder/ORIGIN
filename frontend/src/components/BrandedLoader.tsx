import React from 'react';
import ForestEcosystem from './ForestEcosystem';

interface BrandedLoaderProps {
  message?: string;
  subMessage?: string;
  height?: string | number;
}

export const BrandedLoader: React.FC<BrandedLoaderProps> = ({
  message = 'VANRA: AI is analysing FRA patterns...',
  subMessage = 'Correlating geospatial claims, processing timelines & land discrepancy signals',
  height = '50vh',
}) => {
  return (
    <div className="branded-loader-container" style={{ height }}>
      <div className="branded-loader-card">
        {/* Subtle mountain & trees background */}
        <div className="branded-loader-forest">
          <ForestEcosystem variant="loader" height={160} showParticles={true} showDataNodes={true} />
        </div>

        {/* AI Laser Scanning Line */}
        <div className="ai-scanning-beam" />

        {/* Content */}
        <div className="branded-loader-content">
          <div className="branded-loader-logo">
            <span className="logo-badge">VA</span>
            <span className="logo-title">VANRA INTELLIGENCE</span>
          </div>

          <div className="branded-loader-status">
            <span className="status-ping" />
            <h3 className="branded-loader-heading">{message}</h3>
          </div>

          <p className="branded-loader-sub">{subMessage}</p>

          <div className="branded-loader-progress-track">
            <div className="branded-loader-progress-bar" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandedLoader;
