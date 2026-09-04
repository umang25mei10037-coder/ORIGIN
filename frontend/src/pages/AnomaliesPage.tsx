import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { fetchAnomalies } from '../services/api';
import ClaimDetail from '../components/ClaimDetail';
import BrandedLoader from '../components/BrandedLoader';
import EmptyForestState from '../components/EmptyForestState';

const TYPE_COLORS: Record<string, string> = {
  DELAY: '#E6A23C',
  RECORD_MISMATCH: '#D9534F',
  GEOGRAPHIC_CLUSTER: '#4F8FBF',
  WORKFLOW_BOTTLENECK: '#8B5CF6',
  UNUSUAL_AREA: '#EC4899',
};

export default function AnomaliesPage() {
  const [data, setData] = useState<any>({ anomalies: [], summary: {} });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (filter) params.anomaly_type = filter;
    fetchAnomalies(params)
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filter]);

  const summaryData = Object.entries(data.summary || {}).map(([name, value]) => ({
    name: name.replace(/_/g, ' '),
    value,
    fullName: name,
  }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="anomalies-page-container">
      <div className="page-header">
        <div className="page-header-text">
          <h2>Anomaly Detection Engine</h2>
          <p>Deterministic business rules + Isolation Forest anomaly detection flags across claim stages</p>
        </div>
        <div className="header-meta-pill">
          <span>{data.anomalies?.length || 0} anomaly occurrences</span>
        </div>
      </div>

      <div className="data-disclaimer">
        <span>⚠ Algorithmic detection based on synthetic demo data. Flags indicate cases for review, not legal infractions.</span>
      </div>

      {/* Summary Chart */}
      <div className="section-card" style={{ marginBottom: 20 }}>
        <div className="section-card-header">
          <div>
            <h3>Anomaly Category Distribution</h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Relative frequencies of detected administrative signals</p>
          </div>
        </div>
        <div style={{ height: 220 }}>
          <ResponsiveContainer>
            <BarChart data={summaryData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={140} />
              <Tooltip />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {summaryData.map((d) => (
                  <Cell key={d.fullName} fill={TYPE_COLORS[d.fullName] || '#6B746F'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filter + List */}
      <div className="section-card" style={{ padding: 20 }}>
        <div className="anomaly-filter-tabs">
          <button
            className={`btn ${filter === '' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setFilter('')}
          >
            All Anomalies
          </button>
          {Object.keys(TYPE_COLORS).map(t => (
            <button
              key={t}
              className={`btn ${filter === t ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setFilter(t)}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: TYPE_COLORS[t],
                  marginRight: 6,
                }}
              />
              {t.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {loading ? (
          <BrandedLoader message="Indexing anomaly vectors and outliers..." height="40vh" />
        ) : data.anomalies?.length > 0 ? (
          <div className="anomalies-list-grid">
            {data.anomalies.map((a: any, i: number) => {
              const borderCol = TYPE_COLORS[a.anomaly_type] || '#6B746F';
              const isHigh = a.severity === 'high' || a.severity === 'High';
              return (
                <motion.div
                  key={a.anomaly_id || i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.02, 0.4) }}
                  className="anomaly-card-item"
                  style={{ borderLeftColor: borderCol }}
                  onClick={() => setSelectedClaimId(a.claim_id)}
                >
                  <div className="anomaly-card-left">
                    <div className="anomaly-header-row">
                      <span className="anomaly-claim-id">{a.claim_id}</span>
                      <span className="anomaly-type-pill" style={{ color: borderCol, background: `${borderCol}18` }}>
                        {a.anomaly_type.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="anomaly-desc-text">
                      <strong>{a.district}</strong>, {a.state} — {a.description}
                    </p>
                  </div>

                  <div className="anomaly-card-right">
                    <span className={`risk-badge ${isHigh ? 'critical' : 'warning'}`}>
                      {a.severity}
                    </span>
                    <span className="anomaly-contribution-badge">
                      +{a.risk_contribution} pts
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <EmptyForestState
            title="No anomalies in this category"
            description="All monitored claims are within standard statistical tolerance for this feature."
            actionText="View All"
            onAction={() => setFilter('')}
          />
        )}
      </div>

      {selectedClaimId && (
        <ClaimDetail claimId={selectedClaimId} onClose={() => setSelectedClaimId(null)} />
      )}
    </motion.div>
  );
}
