import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchEarlyWarnings } from '../services/api';
import BrandedLoader from '../components/BrandedLoader';
import EmptyForestState from '../components/EmptyForestState';
import ForestEcosystem from '../components/ForestEcosystem';

export default function EarlyWarningPage() {
  const [data, setData] = useState<any>({ warnings: [], disclaimer: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEarlyWarnings().then(d => {
      setData(d);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <BrandedLoader message="Evaluating predictive threshold signals..." height="60vh" />;
  }

  const severityOrder: Record<string, number> = { alert: 0, warning: 1, caution: 2 };
  const sorted = [...(data.warnings || [])].sort((a, b) =>
    (severityOrder[a.severity] ?? 3) - (severityOrder[b.severity] ?? 3)
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="early-warning-container">
      {/* Visual Header */}
      <div className="page-header-with-visual">
        <ForestEcosystem variant="banner" height={100} showParticles={true} showContours={true} />
        <div className="page-header-content">
          <div className="page-header-tag">ENVIRONMENTAL & CIVIC INTELLIGENCE</div>
          <h2>Early Warning System</h2>
          <p>Detecting administrative bottlenecks and land boundary divergence before escalation</p>
        </div>
      </div>

      <div className="data-disclaimer">
        <span>⚠ Modelled early warning signals based on synthetic demo data patterns. Not an official statutory forecast.</span>
      </div>

      {/* Warning Cards Grid */}
      <div className="warning-cards-grid">
        {sorted.map((w, idx) => {
          const isAlert = w.severity === 'alert';
          const isWarning = w.severity === 'warning';
          const severityClass = isAlert ? 'alert' : isWarning ? 'warning' : 'caution';
          const severityLabel = isAlert ? 'CRITICAL ALERT' : isWarning ? 'ELEVATED WARNING' : 'OBSERVATION';

          return (
            <motion.div
              key={w.id || idx}
              className={`warning-intel-card ${severityClass}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
            >
              {/* Top Banner with Subtle Animated Warning Ring */}
              <div className="warning-card-top-bar">
                <div className="warning-ring-wrapper">
                  <div className={`warning-pulse-ring ${severityClass}`} />
                  <div className={`warning-core-dot ${severityClass}`}>
                    {isAlert ? '⚠' : isWarning ? '⚡' : 'ℹ'}
                  </div>
                  <div>
                    <span className="warning-severity-badge">{severityLabel}</span>
                    <h3 className="warning-title-text">{w.title}</h3>
                  </div>
                </div>

                <span className="warning-metric-pill">{w.metric}</span>
              </div>

              {/* Card Meta Row */}
              <div className="warning-meta-row">
                <div className="warning-meta-item">
                  <span className="meta-label">District:</span>
                  <span className="meta-value">{w.district || 'Mandla'}</span>
                </div>
                <div className="warning-meta-item">
                  <span className="meta-label">Signal Category:</span>
                  <span className="meta-value">Processing velocity & record variance</span>
                </div>
                <div className="warning-meta-item">
                  <span className="meta-label">Trend Velocity:</span>
                  <span className="meta-value trend">{w.trend || '+18% 30-day'}</span>
                </div>
              </div>

              {/* Signal Explanation */}
              <p className="warning-detail-paragraph">{w.detail}</p>

              {/* Recommended Action (Section 11) */}
              <div className="warning-action-box">
                <span className="action-lamp">💡</span>
                <div>
                  <strong>Recommended Action:</strong>{' '}
                  <span>{w.recommendation}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {sorted.length === 0 && (
        <EmptyForestState
          title="No threshold warnings detected"
          description="All monitored districts and committee stages are operating within baseline parameters."
        />
      )}
    </motion.div>
  );
}
