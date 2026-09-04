import { motion, AnimatePresence } from 'framer-motion';
import ForestEcosystem from './ForestEcosystem';

interface FactorItem {
  icon: string;
  name: string;
  weight: number;
  description: string;
}

interface WhyFlaggedProps {
  district: {
    district_name: string;
    state_name: string;
    health_score: number;
    district_risk_level: string;
    factors?: Record<string, number>;
    why_flagged?: Array<{
      order: number;
      title: string;
      detail: string;
      metric: string;
      severity: string;
    }>;
  };
  onClose: () => void;
}

const FACTOR_ICONS: Record<string, string> = {
  processing_delay: '⏳',
  delay: '⏳',
  record_mismatch: '📋',
  mismatch: '📋',
  geographic_cluster: '📍',
  cluster: '📍',
  area_anomaly: '📐',
  unusual_area: '📐',
  workflow_bottleneck: '⚙',
  bottleneck: '⚙',
};

export default function WhyFlagged({ district, onClose }: WhyFlaggedProps) {
  const riskScore = district.health_score ?? 72;
  const isHighRisk = riskScore > 65;
  const isCritical = riskScore > 80;

  // Normalized contributing factors breakdown
  const factorsList: FactorItem[] = district.factors
    ? Object.entries(district.factors).map(([key, val]) => {
        const factorKey = key.toLowerCase();
        const icon = Object.entries(FACTOR_ICONS).find(([k]) => factorKey.includes(k))?.[1] || '⚙';
        return {
          icon,
          name: key.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase()),
          weight: Math.round(val),
          description: getFactorDescription(key, Math.round(val)),
        };
      })
    : [
        { icon: '⏳', name: 'Processing Delay', weight: 32, description: 'Claims exceeding 180-day review period without resolution.' },
        { icon: '📋', name: 'Record Mismatch', weight: 27, description: 'Discrepancy between revenue survey area and claims register.' },
        { icon: '📍', name: 'Geographic Cluster', weight: 19, description: 'High spatial concentration in non-scheduled forest boundary.' },
        { icon: '📐', name: 'Area Anomaly', weight: 12, description: 'Claim parcel size deviates significantly from local median.' },
        { icon: '⚙', name: 'Workflow Bottleneck', weight: 10, description: 'SDLC review queue backlog exceeds normal velocity.' },
      ];

  // Helper text for factor description
  function getFactorDescription(name: string, val: number): string {
    const lower = name.toLowerCase();
    if (lower.includes('delay')) return `${val}% weight from claims exceeding statutory processing velocity`;
    if (lower.includes('mismatch')) return `${val}% weight from survey & cadastre record variances`;
    if (lower.includes('cluster')) return `${val}% weight from spatial density outside historical bounds`;
    if (lower.includes('area')) return `${val}% weight from claim acreage variance exceeding normal tier`;
    return `${val}% weight from committee stage transition velocity`;
  }

  // Visual ASCII-like representation of progress bar
  const totalBlocks = 10;
  const filledBlocks = Math.round((riskScore / 100) * totalBlocks);
  const progressBarText = '█'.repeat(Math.min(filledBlocks, totalBlocks)) + '░'.repeat(Math.max(0, totalBlocks - filledBlocks));

  return (
    <AnimatePresence>
      <motion.div
        className="why-flagged-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          className="why-flagged-modal"
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
        >
          {/* Visual Header Banner */}
          <div className="why-flagged-banner">
            <ForestEcosystem variant="banner" height={100} showParticles={false} />
            <div className="why-flagged-banner-overlay">
              <div className="why-flagged-banner-text">
                <span className="why-badge">EXPLAINABLE AI RISK ATTRIBUTION</span>
                <h2>Why is {district.district_name} Flagged?</h2>
                <p>{district.state_name} · Health / Risk Score Analysis</p>
              </div>
              <button className="why-close-btn" onClick={onClose} aria-label="Close modal">✕</button>
            </div>
          </div>

          <div className="why-flagged-body">
            {/* Top Risk Score Meter */}
            <div className="why-score-card">
              <div className="why-score-header">
                <div>
                  <span className="why-score-label">AGGREGATE RISK INDEX</span>
                  <div className="why-score-value-row">
                    <span className={`why-score-number ${isCritical ? 'critical' : isHighRisk ? 'warning' : 'good'}`}>
                      {riskScore}
                    </span>
                    <span className="why-score-max">/ 100</span>
                    <span className={`why-score-tag ${isCritical ? 'critical' : isHighRisk ? 'warning' : 'good'}`}>
                      {district.district_risk_level || (isCritical ? 'Critical Attention' : 'Requires Review')}
                    </span>
                  </div>
                </div>
                <div className="why-progress-visual">
                  <div className="why-progress-bar-ascii">{progressBarText} {riskScore}%</div>
                  <div className="why-progress-bar-bg">
                    <motion.div
                      className={`why-progress-bar-fill ${isCritical ? 'critical' : isHighRisk ? 'warning' : 'good'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${riskScore}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contributing Factors Breakdown */}
            <div className="why-factors-section">
              <h4 className="why-section-title">
                <span>Contributing Factors Breakdown</span>
                <span className="why-subtitle">Normalized feature weights from decision model</span>
              </h4>

              <div className="why-factors-list">
                {factorsList.map((factor, idx) => (
                  <motion.div
                    key={idx}
                    className="why-factor-row"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08, duration: 0.3 }}
                  >
                    <div className="why-factor-icon-box">{factor.icon}</div>
                    <div className="why-factor-info">
                      <div className="why-factor-heading">
                        <span className="why-factor-name">{factor.name}</span>
                        <span className="why-factor-percent">{factor.weight}%</span>
                      </div>
                      <div className="why-factor-track">
                        <motion.div
                          className={`why-factor-meter ${factor.weight >= 30 ? 'critical' : factor.weight >= 20 ? 'warning' : 'normal'}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, factor.weight * 2.2)}%` }}
                          transition={{ delay: 0.1 + idx * 0.08, duration: 0.5 }}
                        />
                      </div>
                      <p className="why-factor-desc">{factor.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* AI Interpretation Box with strictly qualified civic wording */}
            <div className="why-ai-interpretation-box">
              <div className="ai-interpretation-header">
                <span className="ai-spark-icon">✨</span>
                <h4>AI MODEL INTERPRETATION & CIVIC CONTEXT</h4>
              </div>
              <p className="ai-interpretation-quote">
                "Multiple algorithmic indicators suggest that <strong>{district.district_name}</strong> requires closer administrative review. 
                Elevated risk is primarily driven by accumulated processing delays past statutory SLA windows and land-record discrepancies between cadastral surveys and Gram Sabha filings.
                No adverse legal conclusion is made; this signal is intended to guide priority inspection by field officers."
              </p>
              <div className="ai-language-disclaimer">
                <span>Model Confidence: 94.2%</span>
                <span>•</span>
                <span>Signal Basis: Synthetic Demonstration Patterns</span>
                <span>•</span>
                <span>Recommended: Administrative Verification</span>
              </div>
            </div>

            {/* Additional Flag Items if present */}
            {district.why_flagged && district.why_flagged.length > 0 && (
              <div className="why-flags-detail-section">
                <h4 className="why-section-title">Detected Signal Details</h4>
                <div className="why-flags-grid">
                  {district.why_flagged.map((flag, idx) => (
                    <div key={idx} className="why-flag-card">
                      <div className="why-flag-header">
                        <span className="why-flag-num">0{idx + 1}</span>
                        <h5>{flag.title}</h5>
                      </div>
                      <p>{flag.detail}</p>
                      <span className="why-flag-metric-tag">{flag.metric}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="why-flagged-footer">
            <span className="why-footer-note">
              VANRA Decision Engine · Model outputs guide prioritization and do not replace legal adjudication.
            </span>
            <div className="why-footer-buttons">
              <button className="btn btn-secondary btn-sm" onClick={onClose}>Close</button>
              <button className="btn btn-primary btn-sm" onClick={onClose}>Explore Claims</button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
