import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SCAN_STEPS = [
  'Scanning claim patterns across 36 districts...',
  'Checking processing timelines against 180-day SLA...',
  'Comparing forest boundary & land parcel records...',
  'Detecting spatial & geographic cluster anomalies...',
  'Synthesizing explainable risk scoring weights...'
];

export const AiStatusIndicator: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const startAnalysis = () => {
    setIsScanning(true);
    setIsComplete(false);
    setCurrentStepIndex(0);
    setShowModal(true);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < SCAN_STEPS.length) {
        setCurrentStepIndex(step);
      } else {
        clearInterval(interval);
        setIsScanning(false);
        setIsComplete(true);
        setTimeout(() => {
          // keep modal or close softly
        }, 1500);
      }
    }, 320);
  };

  return (
    <>
      <div
        className="ai-status-wrapper"
        onClick={startAnalysis}
        title="Click to trigger AI pattern scan"
        style={{ cursor: 'pointer' }}
      >
        <div className="ai-status">
          <span className={`ai-status-dot ${isScanning ? 'pulse-fast' : 'pulse'}`} />
          <span className="ai-status-label">
            {isScanning ? 'AI Scanning...' : isComplete ? 'AI Verified' : 'AI Intelligence Active'}
          </span>
          <span className="ai-trigger-badge">Run Scan</span>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            className="ai-scan-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              className="ai-scan-modal"
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
            >
              <div className="ai-scan-header">
                <div className="ai-scan-title">
                  <span className="ai-chip-icon">⚙</span>
                  <div>
                    <h4>VANRA AI Decision Engine</h4>
                    <p>Real-time deterministic rules & Isolation Forest model</p>
                  </div>
                </div>
                <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
              </div>

              <div className="ai-scan-body">
                <div className="ai-scan-pipeline">
                  {SCAN_STEPS.map((stepText, idx) => {
                    const isDone = isComplete || idx < currentStepIndex;
                    const isCurrent = isScanning && idx === currentStepIndex;
                    return (
                      <div
                        key={idx}
                        className={`scan-step-item ${isDone ? 'done' : isCurrent ? 'active' : 'pending'}`}
                      >
                        <div className="scan-step-indicator">
                          {isDone ? '✓' : isCurrent ? '●' : '○'}
                        </div>
                        <div className="scan-step-text">{stepText}</div>
                        {isCurrent && <div className="scan-step-loader" />}
                      </div>
                    );
                  })}
                </div>

                <div className="ai-scan-progress-bar">
                  <div
                    className="ai-scan-progress-fill"
                    style={{
                      width: isComplete
                        ? '100%'
                        : `${((currentStepIndex + 1) / SCAN_STEPS.length) * 100}%`
                    }}
                  />
                </div>

                <div className="ai-scan-footer-status">
                  {isComplete ? (
                    <div className="status-complete">
                      <span className="check-icon">✓</span>
                      <span><strong>Analysis Complete:</strong> 4,781 claims indexed, 18 high-risk clusters monitored.</span>
                    </div>
                  ) : (
                    <div className="status-running">
                      <span className="scan-beam" />
                      <span>Scanning claims, spatial coordinates & timeline thresholds...</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="ai-scan-actions">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowModal(false)}
                >
                  Dismiss
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={startAnalysis}
                  disabled={isScanning}
                >
                  {isScanning ? 'Processing...' : 'Run New Scan'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AiStatusIndicator;
