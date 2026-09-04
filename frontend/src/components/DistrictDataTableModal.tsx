import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DistrictItem {
  district_name: string;
  state_name: string;
  center_lat: number;
  center_lng: number;
  total_claims: number;
  approved_claims: number;
  pending_claims: number;
  delayed_claims: number;
  high_risk_claims: number;
  mismatches: number;
  health_score: number;
  district_risk_level: string;
  avg_risk_score?: number;
}

interface DistrictDataTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  districts: DistrictItem[];
  onSelectDistrict: (districtName: string) => void;
}

type SortField = 'district_name' | 'state_name' | 'health_score' | 'total_claims' | 'approved_claims' | 'delayed_claims' | 'high_risk_claims' | 'mismatches';

export const DistrictDataTableModal: React.FC<DistrictDataTableModalProps> = ({
  isOpen,
  onClose,
  districts,
  onSelectDistrict,
}) => {
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [sortField, setSortField] = useState<SortField>('health_score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const states = useMemo(() => {
    const s = new Set<string>();
    districts.forEach(d => s.add(d.state_name));
    return Array.from(s).sort();
  }, [districts]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(o => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder(field === 'health_score' ? 'asc' : 'desc');
    }
  };

  const filteredDistricts = useMemo(() => {
    return districts
      .filter(d => {
        const matchesSearch =
          d.district_name.toLowerCase().includes(search.toLowerCase()) ||
          d.state_name.toLowerCase().includes(search.toLowerCase());
        const matchesState = stateFilter === 'ALL' || d.state_name === stateFilter;
        const matchesRisk = riskFilter === 'ALL' || d.district_risk_level === riskFilter;
        return matchesSearch && matchesState && matchesRisk;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (typeof valA === 'string') {
          valA = (valA as string).toLowerCase();
          valB = (valB as string).toLowerCase();
        }
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [districts, search, stateFilter, riskFilter, sortField, sortOrder]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="district-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          className="district-modal-card"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
        >
          {/* Header */}
          <div className="district-modal-header">
            <div className="district-modal-title">
              <span className="district-icon-badge">🏛️</span>
              <div>
                <h3>District-Wise Data Matrix ({districts.length} Districts)</h3>
                <p>Comparative FRA implementation analytics across 5 states</p>
              </div>
            </div>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>

          {/* Filter Toolbar */}
          <div className="district-modal-toolbar">
            <div className="district-search-box">
              <input
                type="text"
                placeholder="Search district or state..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <select
              value={stateFilter}
              onChange={e => setStateFilter(e.target.value)}
              className="district-select-filter"
            >
              <option value="ALL">All States ({states.length})</option>
              {states.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <select
              value={riskFilter}
              onChange={e => setRiskFilter(e.target.value)}
              className="district-select-filter"
            >
              <option value="ALL">All Risk Tiers</option>
              <option value="Critical">Critical Attention</option>
              <option value="High">High Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="Low">Low / Healthy</option>
            </select>

            <span className="district-results-count">
              Showing <strong>{filteredDistricts.length}</strong> of {districts.length} districts
            </span>
          </div>

          {/* Data Table */}
          <div className="district-table-container">
            <table className="district-data-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('district_name')} className="sortable-th">
                    District {sortField === 'district_name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th onClick={() => handleSort('state_name')} className="sortable-th">
                    State {sortField === 'state_name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th onClick={() => handleSort('health_score')} className="sortable-th text-center">
                    Health Index {sortField === 'health_score' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th onClick={() => handleSort('total_claims')} className="sortable-th text-right">
                    Total Claims {sortField === 'total_claims' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th onClick={() => handleSort('approved_claims')} className="sortable-th text-right">
                    Approved {sortField === 'approved_claims' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th onClick={() => handleSort('delayed_claims')} className="sortable-th text-right">
                    Delayed (&gt;180d) {sortField === 'delayed_claims' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th onClick={() => handleSort('high_risk_claims')} className="sortable-th text-right">
                    High Risk {sortField === 'high_risk_claims' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th onClick={() => handleSort('mismatches')} className="sortable-th text-right">
                    Mismatches {sortField === 'mismatches' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th className="text-center">Map Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredDistricts.map(d => {
                  const health = d.health_score;
                  const healthColor = health < 50 ? '#D9534F' : health < 65 ? '#E6A23C' : health < 80 ? '#4F8FBF' : '#1F6B4F';
                  const approvalPct = d.total_claims > 0 ? ((d.approved_claims / d.total_claims) * 100).toFixed(1) : '0';

                  return (
                    <tr
                      key={d.district_name}
                      onClick={() => {
                        onSelectDistrict(d.district_name);
                        onClose();
                      }}
                      className="district-table-row"
                    >
                      <td>
                        <strong className="district-cell-name">{d.district_name}</strong>
                      </td>
                      <td>
                        <span className="state-cell-tag">{d.state_name}</span>
                      </td>
                      <td className="text-center">
                        <div className="health-score-cell">
                          <span
                            className="health-badge-pill"
                            style={{ background: `${healthColor}18`, color: healthColor, borderColor: `${healthColor}40` }}
                          >
                            {d.health_score} / 100
                          </span>
                        </div>
                      </td>
                      <td className="text-right font-medium">{d.total_claims}</td>
                      <td className="text-right" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                        {d.approved_claims} <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>({approvalPct}%)</span>
                      </td>
                      <td className="text-right" style={{ color: d.delayed_claims > 15 ? 'var(--critical)' : 'inherit', fontWeight: d.delayed_claims > 15 ? 600 : 400 }}>
                        {d.delayed_claims}
                      </td>
                      <td className="text-right">
                        {d.high_risk_claims > 0 ? (
                          <span className="risk-mini-chip critical">
                            {d.high_risk_claims}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-tertiary)' }}>0</span>
                        )}
                      </td>
                      <td className="text-right" style={{ color: d.mismatches > 10 ? '#b47214' : 'inherit' }}>
                        {d.mismatches}
                      </td>
                      <td className="text-center">
                        <button
                          className="btn-locate-map"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectDistrict(d.district_name);
                            onClose();
                          }}
                        >
                          📍 View on Map
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="district-modal-footer">
            <span className="footer-disclaimer">
              ⚠ Synthetic demonstration figures modeled after Ministry of Tribal Affairs monthly progress reports.
            </span>
            <button className="btn btn-secondary btn-sm" onClick={onClose}>Close Matrix</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DistrictDataTableModal;
