import React from 'react';
import { APP_CONFIG } from '../config/appConfig';

interface FooterProps {
  onOpenAbout?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAbout }) => {
  return (
    <footer className="vanra-footer">
      {/* Mountain & Forest Silhouette Ribbon */}
      <div className="footer-landscape" aria-hidden="true">
        <svg
          viewBox="0 0 1400 120"
          preserveAspectRatio="none"
          className="footer-svg"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="footer-mountain-back" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1B4231" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#11291F" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="footer-mountain-front" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#255943" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0B1E16" stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* Far hills */}
          <path
            d="M0,60 Q 200,20 450,50 T 900,30 T 1400,55 L 1400,120 L 0,120 Z"
            fill="url(#footer-mountain-back)"
          />

          {/* Near hills */}
          <path
            d="M0,75 Q 300,45 650,70 T 1200,50 T 1400,72 L 1400,120 L 0,120 Z"
            fill="url(#footer-mountain-front)"
          />

          {/* Stylized trees */}
          <g fill="#0E2319">
            <path d="M120,78 L126,58 L132,78 Z" />
            <path d="M130,80 L135,62 L140,80 Z" />
            <path d="M360,72 L366,50 L372,72 Z" />
            <path d="M370,74 L375,56 L380,74 Z" />
            <path d="M720,70 L726,48 L732,70 Z" />
            <path d="M730,72 L736,54 L742,72 Z" />
            <path d="M1080,68 L1086,46 L1092,68 Z" />
            <path d="M1090,70 L1096,52 L1102,70 Z" />
            <path d="M1250,74 L1256,52 L1262,74 Z" />
          </g>

          {/* Animated data pulse dots along ridge */}
          <circle cx="280" cy="55" r="3" fill="#4ade80" opacity="0.8" className="footer-pulse" />
          <circle cx="650" cy="68" r="3.5" fill="#38bdf8" opacity="0.8" className="footer-pulse-delay" />
          <circle cx="1020" cy="52" r="3" fill="#a7f3d0" opacity="0.8" className="footer-pulse" />
        </svg>
      </div>

      {/* Footer Content */}
      <div className="footer-inner">
        <div className="footer-grid">
          {/* Brand & Purpose */}
          <div className="footer-col brand-col">
            <div className="footer-logo">
              <div className="footer-logo-badge">VA</div>
              <div>
                <h3>{APP_CONFIG.appName}</h3>
                <p className="footer-logo-sub">{APP_CONFIG.fullName}</p>
              </div>
            </div>
            <p className="footer-desc">
              AI-powered decision support for Forest Rights Act (FRA) implementation,
              transparent anomaly detection, and spatial grievance monitoring.
            </p>
            <div className="footer-affiliation">
              <span className="footer-pill">Problem Statement 7</span>
              <span className="footer-pill">Civic Tech Intelligence</span>
              {onOpenAbout && (
                <button className="footer-about-btn" onClick={onOpenAbout}>
                  About Platform ↗
                </button>
              )}
            </div>
          </div>

          {/* Team / Developer Information */}
          <div className="footer-col">
            <h4>DEVELOPER / TEAM</h4>
            <div className="team-info-box">
              <p className="team-name"><strong>{APP_CONFIG.team.name}</strong></p>
              <p className="team-desc">{APP_CONFIG.team.description}</p>
              <p className="team-affiliation">{APP_CONFIG.team.affiliation} · {APP_CONFIG.team.year}</p>
              <div className="team-links-row" style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <a
                  href={APP_CONFIG.team.linkedin}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="footer-social-link"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 11,
                    color: '#72db9e',
                    textDecoration: 'none',
                    background: 'rgba(255,255,255,0.08)',
                    padding: '3px 8px',
                    borderRadius: 6,
                    border: '1px solid rgba(255,255,255,0.12)'
                  }}
                >
                  <span>🔗</span> LinkedIn Profile
                </a>
                <a
                  href={APP_CONFIG.team.github}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="footer-social-link"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 11,
                    color: '#a7f3d0',
                    textDecoration: 'none',
                    background: 'rgba(255,255,255,0.08)',
                    padding: '3px 8px',
                    borderRadius: 6,
                    border: '1px solid rgba(255,255,255,0.12)'
                  }}
                >
                  <span>💻</span> GitHub ID
                </a>
              </div>
            </div>
          </div>

          {/* Technology Stack */}
          <div className="footer-col">
            <h4>TECHNOLOGY STACK</h4>
            <ul className="footer-tech-list">
              <li>React 18 & TypeScript</li>
              <li>FastAPI & Python 3.11</li>
              <li>Leaflet & React-Leaflet (GIS)</li>
              <li>Scikit-learn & Isolation Forest</li>
              <li>Recharts & Framer Motion</li>
              <li>SQLite Analytical Store</li>
            </ul>
          </div>

          {/* Data Transparency & Disclaimer */}
          <div className="footer-col">
            <h4>DATA TRANSPARENCY</h4>
            <div className="footer-data-notice">
              <p><strong>Demonstration Dataset:</strong></p>
              <p>
                Modeled across <strong>{APP_CONFIG.dataSummary.districtsCount} districts</strong> and{' '}
                <strong>{APP_CONFIG.dataSummary.statesCount} states</strong> ({APP_CONFIG.dataSummary.totalSyntheticClaims.toLocaleString()} synthetic records).
              </p>
              <div className="footer-warning-box">
                ⚠ <strong>Notice:</strong> Synthetic mock data designed for demonstration and decision-support research. Does not replace statutory land authority decisions.
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="footer-bottom-bar">
          <p>© 2026 {APP_CONFIG.appName} · Visual AI Network for Rights Administration. Built for demonstration and decision-support research.</p>
          <div className="footer-bottom-links">
            <span>FOREST</span>
            <span>→</span>
            <span>LAND</span>
            <span>→</span>
            <span>CLAIMS</span>
            <span>→</span>
            <span>DATA</span>
            <span>→</span>
            <span>AI</span>
            <span>→</span>
            <span>DECISION</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
