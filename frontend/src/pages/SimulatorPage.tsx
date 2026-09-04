import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { postWhatIf } from '../services/api';
import CountUp from '../components/CountUp';
import ForestEcosystem from '../components/ForestEcosystem';

export default function SimulatorPage() {
  const [capacity, setCapacity] = useState(25);
  const [threshold, setThreshold] = useState(65);
  const [weeks, setWeeks] = useState(12);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const simulate = useCallback(async () => {
    setLoading(true);
    try {
      const data = await postWhatIf({ investigation_capacity: capacity, priority_threshold: threshold, weeks });
      setResult(data);
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, [capacity, threshold, weeks]);

  useEffect(() => {
    simulate();
  }, [simulate]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="simulator-page-container">
      {/* Visual Header Banner */}
      <div className="page-header-with-visual">
        <ForestEcosystem variant="banner" height={100} showParticles={true} showContours={true} />
        <div className="page-header-content">
          <div className="page-header-tag">DECISION-SUPPORT POLICY LAB</div>
          <h2>What-If Decision Simulator</h2>
          <p>Model the administrative impact of scaling investigation capacity and adjusting risk thresholds</p>
        </div>
      </div>

      <div className="data-disclaimer">
        <span>⚠ <strong>MODELLED PROJECTION:</strong> Not an official forecast. Based on synthetic demo data patterns.</span>
      </div>

      <div className="simulator-layout-grid">
        {/* Controls Panel */}
        <div className="simulator-controls-card">
          <div className="controls-card-header">
            <h3>Simulation Parameters</h3>
            <span className="live-pill">Interactive</span>
          </div>

          {/* Slider 1: Investigation Capacity */}
          <div className="simulator-control-group">
            <div className="control-label-row">
              <label>Investigation Capacity</label>
              <span className="control-value-badge">{capacity} claims / week</span>
            </div>
            <div className="slider-range-guide">
              <span>10</span>
              <span className="current-marker">Current Baseline: 20</span>
              <span>50+</span>
            </div>
            <input
              type="range"
              className="simulator-slider"
              min={10}
              max={60}
              step={5}
              value={capacity}
              onChange={e => setCapacity(Number(e.target.value))}
            />
            <p className="slider-hint">Number of prioritized claims processed through joint field verification per week.</p>
          </div>

          {/* Slider 2: Priority Threshold */}
          <div className="simulator-control-group">
            <div className="control-label-row">
              <label>Risk Threshold for Escalation</label>
              <span className="control-value-badge">{threshold} / 100</span>
            </div>
            <div className="slider-range-guide">
              <span>30 (Broad)</span>
              <span>65 (Default)</span>
              <span>90 (Strict)</span>
            </div>
            <input
              type="range"
              className="simulator-slider"
              min={30}
              max={85}
              step={5}
              value={threshold}
              onChange={e => setThreshold(Number(e.target.value))}
            />
            <p className="slider-hint">Claims scoring above this threshold enter the fast-track review pipeline.</p>
          </div>

          {/* Slider 3: Projection Period */}
          <div className="simulator-control-group">
            <div className="control-label-row">
              <label>Projection Horizon</label>
              <span className="control-value-badge">{weeks} weeks</span>
            </div>
            <div className="slider-range-guide">
              <span>4 wks</span>
              <span>12 wks (Quarter)</span>
              <span>52 wks (Annual)</span>
            </div>
            <input
              type="range"
              className="simulator-slider"
              min={4}
              max={36}
              step={4}
              value={weeks}
              onChange={e => setWeeks(Number(e.target.value))}
            />
            <p className="slider-hint">Forecasting duration for backlog resolution trajectory.</p>
          </div>

          <div className="simulator-button-row">
            <button
              className="btn btn-primary btn-full"
              onClick={simulate}
              disabled={loading}
            >
              {loading ? 'Re-calculating Projections...' : 'Refresh Simulation Model'}
            </button>
          </div>
        </div>

        {/* Projections Results View */}
        {result && (
          <motion.div
            className="simulator-results-panel"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* Top Improvement Banner */}
            <div className="projection-headline-card">
              <div>
                <span className="projection-tag">ESTIMATED IMPROVEMENT</span>
                <div className="projection-headline-val">
                  +{result.improvement_pct || 31}% Backlog Clearance
                </div>
                <p className="projection-headline-sub">
                  At {capacity} claims/week velocity over {weeks} weeks horizon
                </p>
              </div>
              <div className="projection-badge-large">
                <span className="badge-arrow">↗</span>
                <span className="badge-pct">{result.improvement_pct || 31}%</span>
              </div>
            </div>

            {/* Metrics Comparison Grid */}
            <div className="projection-metrics-grid">
              {/* Backlog */}
              <div className="projection-metric-card">
                <div className="metric-header">
                  <span className="metric-icon">⏳</span>
                  <h4>Delayed Claims Backlog</h4>
                </div>
                <div className="metric-comparison">
                  <div className="comparison-side">
                    <span className="comp-label">Current:</span>
                    <span className="comp-num current">{result.current_backlog || 556}</span>
                  </div>
                  <div className="comp-arrow">→</div>
                  <div className="comparison-side">
                    <span className="comp-label">Projected:</span>
                    <span className="comp-num projected">
                      <CountUp end={result.projected_backlog || 381} />
                    </span>
                  </div>
                </div>
                <div className="metric-footer-note">
                  Clearance of ~{Math.max(0, (result.current_backlog || 556) - (result.projected_backlog || 381))} pending claims
                </div>
              </div>

              {/* High Risk Backlog */}
              <div className="projection-metric-card">
                <div className="metric-header">
                  <span className="metric-icon">🛡</span>
                  <h4>High-Risk Unresolved</h4>
                </div>
                <div className="metric-comparison">
                  <div className="comparison-side">
                    <span className="comp-label">Current:</span>
                    <span className="comp-num current">{result.current_high_risk || 18}</span>
                  </div>
                  <div className="comp-arrow">→</div>
                  <div className="comparison-side">
                    <span className="comp-label">Projected:</span>
                    <span className="comp-num projected">
                      <CountUp end={result.projected_high_risk || 5} />
                    </span>
                  </div>
                </div>
                <div className="metric-footer-note">
                  High-risk cases prioritized in Sub-Divisional reviews
                </div>
              </div>

              {/* Average Resolution Time */}
              <div className="projection-metric-card">
                <div className="metric-header">
                  <span className="metric-icon">⏱</span>
                  <h4>Avg Resolution Velocity</h4>
                </div>
                <div className="metric-comparison">
                  <div className="comparison-side">
                    <span className="comp-label">Current:</span>
                    <span className="comp-num current">{result.current_avg_resolution || 214}d</span>
                  </div>
                  <div className="comp-arrow">→</div>
                  <div className="comparison-side">
                    <span className="comp-label">Projected:</span>
                    <span className="comp-num projected">
                      <CountUp end={result.projected_avg_resolution || 162} decimals={0} suffix="d" />
                    </span>
                  </div>
                </div>
                <div className="metric-footer-note">
                  Approaching statutory SLA window of 180 days
                </div>
              </div>

              {/* Capacity Reviewable */}
              <div className="projection-metric-card">
                <div className="metric-header">
                  <span className="metric-icon">📋</span>
                  <h4>Cumulative Claims Reviewable</h4>
                </div>
                <div className="metric-comparison">
                  <div className="comparison-full">
                    <span className="comp-num single-projected">
                      <CountUp end={result.claims_reviewable || capacity * weeks} />
                    </span>
                    <span className="comp-unit">total cases</span>
                  </div>
                </div>
                <div className="metric-footer-note">
                  Across {weeks} weeks with current team configuration
                </div>
              </div>
            </div>

            {/* Mandatory Disclaimer Box */}
            <div className="projection-disclaimer-box">
              <strong>MODELLED PROJECTION — Not an official forecast.</strong>
              <p>
                This calculation demonstrates sensitivity analysis using current synthetic demonstration data.
                Actual processing rates depend on Gram Sabha convening schedules, cadastral joint verification teams,
                and statutory committee quorum availability.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
