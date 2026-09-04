import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchPriorityQueue } from '../services/api';
import ClaimDetail from '../components/ClaimDetail';
import BrandedLoader from '../components/BrandedLoader';
import EmptyForestState from '../components/EmptyForestState';

export default function PriorityPage() {
  const [data, setData] = useState<any>({ claim_priorities: [], district_priorities: [] });
  const [loading, setLoading] = useState(true);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [tab, setTab] = useState<'claims' | 'districts'>('claims');
  const [urgencyFilter, setUrgencyFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'risk' | 'delay'>('risk');

  useEffect(() => {
    fetchPriorityQueue().then(d => {
      setData(d);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filteredClaims = useMemo(() => {
    let list = [...(data.claim_priorities || [])];
    if (urgencyFilter !== 'ALL') {
      list = list.filter((c: any) => c.urgency?.toUpperCase() === urgencyFilter);
    }
    if (sortBy === 'risk') {
      list.sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0));
    } else {
      list.sort((a, b) => (b.processing_days || 0) - (a.processing_days || 0));
    }
    return list;
  }, [data.claim_priorities, urgencyFilter, sortBy]);

  if (loading) {
    return <BrandedLoader message="Prioritizing claims and district workflows..." height="60vh" />;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="priority-page-container">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h2>AI Priority Queue</h2>
          <p>What should officials investigate first? Ranked by risk score attribution and anomaly severity.</p>
        </div>
        <div className="header-meta-pill">
          <span>Target Velocity: 20 cases/week</span>
        </div>
      </div>

      <div className="data-disclaimer">
        <span>⚠ Modelled prioritization ranking based on synthetic demo data. Does not constitute official administrative direction.</span>
      </div>

      {/* Tabs & Controls */}
      <div className="priority-controls-bar">
        <div className="tabs">
          <button className={`tab ${tab === 'claims' ? 'active' : ''}`} onClick={() => setTab('claims')}>
            Claim Priorities ({data.claim_priorities?.length || 0})
          </button>
          <button className={`tab ${tab === 'districts' ? 'active' : ''}`} onClick={() => setTab('districts')}>
            District Queues ({data.district_priorities?.length || 0})
          </button>
        </div>

        {tab === 'claims' && (
          <div className="priority-filter-group">
            <div className="filter-pill-selector">
              {['ALL', 'IMMEDIATE', 'HIGH', 'MEDIUM'].map(u => (
                <button
                  key={u}
                  className={`filter-pill ${urgencyFilter === u ? 'active' : ''}`}
                  onClick={() => setUrgencyFilter(u)}
                >
                  {u}
                </button>
              ))}
            </div>

            <select
              className="priority-sort-select"
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
            >
              <option value="risk">Sort by Risk Score</option>
              <option value="delay">Sort by Processing Days</option>
            </select>
          </div>
        )}
      </div>

      {/* Tab 1: Claims List with animated reordering */}
      {tab === 'claims' && (
        <div className="priority-cards-list">
          <AnimatePresence mode="popLayout">
            {filteredClaims.map((item: any, idx: number) => {
              const isImmediate = item.urgency === 'Immediate';
              const isHigh = item.urgency === 'High';
              const urgencyClass = isImmediate ? 'critical' : isHigh ? 'high' : 'medium';

              // Extract structured bullet reasons
              const reasons: string[] = item.reason_summary
                ? item.reason_summary.split(';').map((s: string) => s.trim()).filter(Boolean)
                : ['Severe processing delay exceeding 180 days', 'Land-record cadastral mismatch detected', 'Spatial concentration in sensitive forest buffer'];

              return (
                <motion.div
                  key={item.claim_id}
                  layout
                  className={`priority-card-v2 ${urgencyClass}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.25 }}
                  onClick={() => setSelectedClaimId(item.claim_id)}
                >
                  {/* Left Priority Rank Badge */}
                  <div className="priority-card-rank-col">
                    <span className="rank-label">PRIORITY</span>
                    <span className={`rank-number ${urgencyClass}`}>#{idx + 1}</span>
                    <span className={`urgency-tag ${urgencyClass}`}>{item.urgency || 'HIGH'}</span>
                  </div>

                  {/* Center Content */}
                  <div className="priority-card-main-col">
                    <div className="priority-card-header">
                      <div>
                        <div className="claim-id-title-row">
                          <span className="claim-id-mono">{item.claim_id}</span>
                          <span className="location-crumb">{item.district}, {item.state}</span>
                        </div>
                        <div className="claim-meta-sub">
                          Status: <strong>{item.status}</strong> · Timeline: <strong>{item.processing_days} days</strong> elapsed
                        </div>
                      </div>

                      <div className="priority-score-badge-col">
                        <span className="score-sub-label">RISK SCORE</span>
                        <div className={`score-value ${urgencyClass}`}>
                          {item.risk_score}
                          <span className="score-denominator">/100</span>
                        </div>
                      </div>
                    </div>

                    {/* Reasons list (Section 8) */}
                    <div className="priority-reasons-block">
                      <span className="reasons-label">Contributing Anomaly Reasons:</span>
                      <ul className="reasons-bullet-list">
                        {reasons.map((reason, rIdx) => (
                          <li key={rIdx}>• {reason}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Recommended action (Section 8) */}
                    <div className="priority-action-box">
                      <span className="action-icon">💡</span>
                      <div>
                        <strong>Recommended Action:</strong>{' '}
                        <span>
                          {item.recommendations?.[0] || 'Review land record and joint verification history with Gram Sabha.'}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredClaims.length === 0 && (
            <EmptyForestState
              title="No claims matching selected urgency"
              description="Adjust the urgency filter to view other prioritized claims."
              actionText="Reset Filter"
              onAction={() => setUrgencyFilter('ALL')}
            />
          )}
        </div>
      )}

      {/* Tab 2: Districts Priority List */}
      {tab === 'districts' && (
        <div className="priority-cards-list">
          {data.district_priorities.map((item: any, idx: number) => {
            const isHigh = (item.avg_risk || 0) > 40;
            return (
              <motion.div
                key={item.district}
                className={`priority-card-v2 ${isHigh ? 'high' : 'medium'}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
              >
                <div className="priority-card-rank-col">
                  <span className="rank-label">DISTRICT</span>
                  <span className={`rank-number ${isHigh ? 'high' : 'medium'}`}>#{idx + 1}</span>
                  <span className={`urgency-tag ${isHigh ? 'high' : 'medium'}`}>
                    {isHigh ? 'ATTENTION' : 'MONITOR'}
                  </span>
                </div>

                <div className="priority-card-main-col">
                  <div className="priority-card-header">
                    <div>
                      <div className="claim-id-title-row">
                        <span className="claim-id-mono">{item.district}</span>
                        <span className="location-crumb">{item.state}</span>
                      </div>
                      <div className="claim-meta-sub">
                        Monitored claims: <strong>{item.total_claims}</strong> · High-Risk backlog:{' '}
                        <strong>{item.high_risk_claims}</strong> · Delayed past 180d: <strong>{item.delayed}</strong>
                      </div>
                    </div>

                    <div className="priority-score-badge-col">
                      <span className="score-sub-label">AVG RISK</span>
                      <div className={`score-value ${isHigh ? 'high' : 'medium'}`}>
                        {item.avg_risk}
                        <span className="score-denominator">/100</span>
                      </div>
                    </div>
                  </div>

                  <div className="priority-action-box">
                    <span className="action-icon">💡</span>
                    <div>
                      <strong>Administrative Focus:</strong>{' '}
                      <span>{item.reason_summary || 'Prioritize verification backlog in Sub-Divisional Committee reviews.'}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {selectedClaimId && (
        <ClaimDetail claimId={selectedClaimId} onClose={() => setSelectedClaimId(null)} />
      )}
    </motion.div>
  );
}
