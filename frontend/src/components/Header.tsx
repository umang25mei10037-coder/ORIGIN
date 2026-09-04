import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import AiStatusIndicator from './AiStatusIndicator';
import AboutModal from './AboutModal';

interface NavOption {
  path: string;
  label: string;
  icon: string;
  exact?: boolean;
}

const NAV_OPTIONS: NavOption[] = [
  { path: '/', label: 'Welcome', icon: '🌲', exact: true },
  { path: '/overview', label: 'Overview', icon: '🗺️' },
  { path: '/claims', label: 'Claims', icon: '📋' },
  { path: '/anomalies', label: 'Anomalies', icon: '⚠️' },
  { path: '/priority', label: 'Priority Queue', icon: '⚡' },
  { path: '/early-warning', label: 'Early Warning', icon: '📡' },
  { path: '/simulator', label: 'What-If', icon: '🧪' },
  { path: '/copilot', label: 'FRA Copilot', icon: '✨' },
];

export const Header: React.FC = () => {
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      <header className="header">
        <div className="header-left">
          {/* Logo with integrated subtle forest/mountain backdrop */}
          <NavLink to="/" className="logo-brand-container">
            <div className="logo-mountain-backdrop" aria-hidden="true">
              <svg viewBox="0 0 160 50" preserveAspectRatio="none" className="header-mountain-svg">
                <path
                  d="M0,35 Q 25,15 55,28 T 110,18 T 160,30 L 160,50 L 0,50 Z"
                  fill="#6B9B82"
                  opacity="0.35"
                />
                <path
                  d="M0,40 Q 40,25 80,36 T 160,32 L 160,50 L 0,50 Z"
                  fill="#2D6B4E"
                  opacity="0.45"
                />
                {/* Tiny trees */}
                <path d="M45,40 L49,28 L53,40 Z" fill="#143D2C" opacity="0.6" />
                <path d="M51,41 L54,32 L57,41 Z" fill="#143D2C" opacity="0.6" />
                <path d="M125,38 L128,26 L131,38 Z" fill="#143D2C" opacity="0.6" />
                <circle cx="85" cy="24" r="2" fill="#4ade80" className="header-data-dot" />
              </svg>
            </div>

            <div className="logo-icon">VA</div>
            <div className="logo-text">
              <div className="logo-title-row">
                <h1>VANRA</h1>
                <span className="civic-badge">CIVIC GIS</span>
              </div>
              <p>Visual AI Network for Rights Administration</p>
            </div>
          </NavLink>

          {/* Animated Navigation Options with Sliding Indicator */}
          <nav className="nav-links-animated-container" aria-label="Main Navigation">
            {NAV_OPTIONS.map((item) => {
              const isActive =
                item.path === '/'
                  ? location.pathname === '/' || location.pathname === '/welcome'
                  : item.path === '/overview'
                  ? location.pathname === '/overview' || location.pathname === '/dashboard'
                  : location.pathname.startsWith(item.path);

              return (
                <div key={item.path} className="nav-link-item-wrapper">
                  <NavLink
                    to={item.path}
                    className={`nav-link-v2 ${isActive ? 'active' : ''}`}
                    end={item.exact}
                  >
                    <motion.span
                      className="nav-link-icon"
                      whileHover={{ scale: 1.25, rotate: -8 }}
                      whileTap={{ scale: 0.88 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    >
                      {item.icon}
                    </motion.span>
                    <span className="nav-link-label">{item.label}</span>
                    {isActive && <span className="nav-link-active-dot" />}
                  </NavLink>

                  {/* Smooth sliding background pill and underline for active tab */}
                  {isActive && (
                    <>
                      <motion.div
                        layoutId="nav-active-pill"
                        className="nav-link-active-pill"
                        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                      />
                      <motion.div
                        layoutId="nav-active-bar"
                        className="nav-link-active-bar"
                        transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                      />
                    </>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        <div className="header-right">
          <button
            className="about-nav-btn"
            onClick={() => setIsAboutOpen(true)}
            title="Learn about VANRA architecture & flow"
          >
            About VANRA
          </button>

          <div className="demo-badge" title="Demo system using synthetic data modeled after regional patterns">
            <span className="demo-badge-dot" />
            <span>Synthetic Demo Data</span>
          </div>

          <AiStatusIndicator />
        </div>
      </header>

      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </>
  );
};

export default Header;
