import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchClaims } from '../services/api';
import ClaimDetail from '../components/ClaimDetail';
import BrandedLoader from '../components/BrandedLoader';
import EmptyForestState from '../components/EmptyForestState';

export default function ClaimsPage() {
  const [data, setData] = useState<any>({ claims: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    risk_level: '',
    sort_by: 'risk_score',
    sort_order: 'desc',
    limit: 100,
    offset: 0,
  });

  useEffect(() => {
    setLoading(true);
    const params: Record<string, unknown> = { ...filters };
    if (!params.status) delete params.status;
    if (!params.risk_level) delete params.risk_level;
    fetchClaims(params)
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filters]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="claims-page-container">
      <div className="page-header">
        <div className="page-header-text">
          <h2>Claims Explorer & Audit Registry</h2>
          <p>Inspect, filter, and audit individual and community forest rights claims across monitored districts</p>
        </div>
        <div className="header-meta-pill">
          <span>{data.total.toLocaleString()} total claims indexed</span>
        </div>
      </div>

      <div className="data-disclaimer">
        <span>⚠ Demo system using synthetic/mock FRA data modeled for decision-support evaluation.</span>
      </div>

      {/* Filter Bar */}
      <div className="section-card filter-card" style={{ padding: '16px 20px', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              value={filters.status}
              onChange={e => setFilters(f => ({ ...f, status: e.target.value, offset: 0 }))}
              className="claims-select"
            >
              <option value="">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Under Review">Under Review</option>
              <option value="Rejected">Rejected</option>
              <option value="Remanded">Remanded</option>
            </select>

            <select
              value={filters.risk_level}
              onChange={e => setFilters(f => ({ ...f, risk_level: e.target.value, offset: 0 }))}
              className="claims-select"
            >
              <option value="">All Risk Levels</option>
              <option value="Critical">Critical Risk</option>
              <option value="High">High Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="Low">Low Risk</option>
              <option value="Minimal">Minimal Risk</option>
            </select>

            <select
              value={filters.sort_by}
              onChange={e => setFilters(f => ({ ...f, sort_by: e.target.value }))}
              className="claims-select"
            >
              <option value="risk_score">Sort by Risk Score</option>
              <option value="processing_days">Sort by Processing Days</option>
              <option value="claimed_area">Sort by Claimed Area</option>
              <option value="claim_date">Sort by Submission Date</option>
            </select>
          </div>

          <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
            Showing <strong>{data.claims?.length || 0}</strong> of <strong>{data.total}</strong> records
          </span>
        </div>
      </div>

      {/* Claims Table */}
      <div className="section-card table-wrapper-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <BrandedLoader message="Querying claims audit registry..." height="45vh" />
        ) : data.claims?.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Claim ID</th>
                  <th>District / State</th>
                  <th>Status</th>
                  <th>Type</th>
                  <th>Claimed Area</th>
                  <th>Elapsed Days</th>
                  <th>Current Stage</th>
                  <th>Risk Score</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.claims.map((c: any) => {
                  const isDelayed = c.processing_days > 180;
                  const riskLower = c.risk_level?.toLowerCase() || 'low';
                  return (
                    <tr
                      key={c.claim_id}
                      onClick={() => setSelectedClaimId(c.claim_id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <span className="claim-id-cell">{c.claim_id}</span>
                      </td>
                      <td>
                        <strong>{c.district}</strong>, <span style={{ color: 'var(--text-secondary)' }}>{c.state}</span>
                      </td>
                      <td>
                        <span className={`status-pill ${c.status.toLowerCase().replace(/\s+/g, '-')}`}>
                          {c.status}
                        </span>
                      </td>
                      <td>{c.claim_type}</td>
                      <td>{c.claimed_area} ha</td>
                      <td>
                        <span style={{ color: isDelayed ? 'var(--critical)' : 'inherit', fontWeight: isDelayed ? 600 : 400 }}>
                          {c.processing_days}d {isDelayed && '⚠'}
                        </span>
                      </td>
                      <td>{c.committee_stage}</td>
                      <td>
                        <span className={`risk-badge ${riskLower}`}>
                          {c.risk_score} · {c.risk_level}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedClaimId(c.claim_id);
                          }}
                        >
                          Investigate
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyForestState
            title="No claims matching filters"
            description="Try selecting a different status or risk level."
            actionText="Reset Filters"
            onAction={() => setFilters({ status: '', risk_level: '', sort_by: 'risk_score', sort_order: 'desc', limit: 100, offset: 0 })}
          />
        )}
      </div>

      {selectedClaimId && (
        <ClaimDetail claimId={selectedClaimId} onClose={() => setSelectedClaimId(null)} />
      )}
    </motion.div>
  );
}
