import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { APP_CONFIG } from '../config/appConfig';
import ForestEcosystem from './ForestEcosystem';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="about-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          className="about-modal-content"
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
        >
          {/* Visual Header Banner */}
          <div className="about-modal-banner">
            <ForestEcosystem variant="banner" height={130} />
            <div className="about-modal-banner-content">
              <h2>{APP_CONFIG.appName}</h2>
              <p>{APP_CONFIG.fullName}</p>
              <span className="about-tagline">{APP_CONFIG.tagline}</span>
            </div>
            <button className="about-close-btn" onClick={onClose}>✕</button>
          </div>

          <div className="about-modal-body">
            {/* Core Decision Flow */}
            <div className="about-flow-section">
              <h4 className="about-section-heading">Core Decision-Support Workflow</h4>
              <div className="about-flow-steps">
                <div className="flow-step-box">
                  <span className="step-tag">1. WHERE</span>
                  <p>GIS Intelligence Map & District Health Scores</p>
                </div>
                <div className="flow-arrow">→</div>
                <div className="flow-step-box">
                  <span className="step-tag">2. WHAT</span>
                  <p>Multimodal Claim Records & Satellite Land Layer</p>
                </div>
                <div className="flow-arrow">→</div>
                <div className="flow-step-box">
                  <span className="step-tag">3. WHY</span>
                  <p>Factor Contributions & Evidence Graph</p>
                </div>
                <div className="flow-arrow">→</div>
                <div className="flow-step-box">
                  <span className="step-tag">4. HOW URGENT</span>
                  <p>AI Priority Queue & Early Warning Signals</p>
                </div>
                <div className="flow-arrow">→</div>
                <div className="flow-step-box">
                  <span className="step-tag">5. WHAT TO DO?</span>
                  <p>Simulator Projections & Recommended Actions</p>
                </div>
              </div>
            </div>

            {/* Problem & Solution */}
            <div className="about-grid">
              <div className="about-card">
                <div className="about-card-badge problem">The Challenge</div>
                <h3>Fragmented FRA Implementation Data</h3>
                <p>
                  Forest Rights Act (FRA) implementation data is historically fragmented across paper claims,
                  sub-divisional committees, and land revenue registries. Administrative bottlenecks, 
                  processing delays over 180 days, and geographic boundary discrepancies frequently go undetected
                  until disputes escalate.
                </p>
              </div>

              <div className="about-card">
                <div className="about-card-badge solution">The Solution</div>
                <h3>Explainable Civic Intelligence</h3>
                <p>
                  VANRA synthesizes geospatial coordinates, processing stage histories, and claim records
                  into an actionable AI decision-support dashboard. By combining deterministic business rules
                  with Isolation Forest anomaly detection, officials receive transparent rationale for every flagged item.
                </p>
              </div>
            </div>

            {/* Principles & Safeguards */}
            <div className="about-safeguards-box">
              <h4>🏛 Government & Civic Tech Design Principles</h4>
              <ul>
                <li><strong>Decision Support, Not Legal Conclusion:</strong> VANRA never adjudicates or rejects claims. It highlights administrative delays and records mismatches for human officer review.</li>
                <li><strong>Transparent Risk Attribution:</strong> Every risk score (0–100) breaks down into exact contributing factors (processing time, area delta, geographic cluster).</li>
                <li><strong>Privacy & Ethics First:</strong> All records shown in this build are synthetic demo samples modeled after regional patterns, ensuring zero personally identifiable data exposure.</li>
              </ul>
            </div>

            {/* Project & Team Info */}
            <div className="about-meta-row">
              <div>
                <strong>Problem Statement:</strong> {APP_CONFIG.problemStatement}
              </div>
              <div>
                <strong>Developed by:</strong> {APP_CONFIG.team.name} ({APP_CONFIG.team.description}) · {APP_CONFIG.team.affiliation}
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
                <a
                  href={APP_CONFIG.team.linkedin}
                  target="_blank"
                  rel="noreferrer noopener"
                  style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'underline', fontSize: 11 }}
                >
                  🔗 LinkedIn Profile
                </a>
                <a
                  href={APP_CONFIG.team.github}
                  target="_blank"
                  rel="noreferrer noopener"
                  style={{ color: 'var(--primary-dark)', fontWeight: 600, textDecoration: 'underline', fontSize: 11 }}
                >
                  💻 GitHub ID
                </a>
              </div>
              <div>
                <strong>Stack:</strong> {APP_CONFIG.technologies.join(' • ')}
              </div>
            </div>
          </div>

          <div className="about-modal-footer">
            <span className="demo-notice">⚠ Synthetic Demonstration Dataset — For Research & Evaluation</span>
            <button className="btn btn-primary" onClick={onClose}>Explore Platform</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AboutModal;
