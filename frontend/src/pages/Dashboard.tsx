import { useEffect, useState, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip as LeafletTooltip, useMap } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import 'leaflet/dist/leaflet.css';
import CountUp from '../components/CountUp';
import WhyFlagged from '../components/WhyFlagged';
import ClaimDetail from '../components/ClaimDetail';
import BrandedLoader from '../components/BrandedLoader';
import DistrictDataTableModal from '../components/DistrictDataTableModal';
import { fetchOverview, fetchDistricts, fetchMapPoints, fetchDistrictDetail } from '../services/api';

// Map zoom controller with smooth flyTo
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2, easeLinearity: 0.25 });
  }, [center, zoom, map]);
  return null;
}

// Map Action Handlers component (Zoom In, Out, Reset)
function MapToolbarActions({ onZoomIn, onZoomOut, onReset }: { onZoomIn: () => void; onZoomOut: () => void; onReset: () => void }) {
  return (
    <div className="map-floating-actions">
      <button className="map-action-btn" onClick={onZoomIn} title="Zoom in">+</button>
      <button className="map-action-btn" onClick={onZoomOut} title="Zoom out">-</button>
      <button className="map-action-btn" onClick={onReset} title="Reset national view">↩</button>
    </div>
  );
}

const RISK_COLORS: Record<string, string> = {
  Critical: '#D9534F',
  High: '#E6A23C',
  Medium: '#4F8FBF',
  Low: '#1F6B4F',
  Minimal: '#9BA5A0',
};

const PIE_COLORS = ['#1F6B4F', '#4F8FBF', '#E6A23C', '#D9534F', '#9BA5A0'];

const STATE_CENTERS: Record<string, { center: [number, number]; zoom: number }> = {
  'ALL': { center: [22.5, 81.0], zoom: 5 },
  'Madhya Pradesh': { center: [23.47, 77.95], zoom: 7 },
  'Maharashtra': { center: [19.66, 75.30], zoom: 7 },
  'Odisha': { center: [20.94, 84.80], zoom: 7 },
  'Chhattisgarh': { center: [21.27, 81.87], zoom: 7 },
  'Jharkhand': { center: [23.61, 85.28], zoom: 7 },
};

const BASEMAP_TILES = {
  osm: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors'
  },
  carto: {
    name: 'Carto Light (Clean)',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO'
  },
  satellite: {
    name: 'Esri Satellite Imagery',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS'
  }
};

export default function Dashboard() {
  const [overview, setOverview] = useState<any>(null);
  const [districts, setDistricts] = useState<any[]>([]);
  const [mapPoints, setMapPoints] = useState<any[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<any>(null);
  const [districtDetail, setDistrictDetail] = useState<any>(null);
  const [showWhyFlagged, setShowWhyFlagged] = useState(false);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([22.5, 81.0]);
  const [mapZoom, setMapZoom] = useState(5);
  const [activeLayer, setActiveLayer] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // New Interactive Map Options
  const [displayMode, setDisplayMode] = useState<'both' | 'districts' | 'claims'>('both');
  const [districtMetric, setDistrictMetric] = useState<'health_score' | 'total_claims' | 'delayed_claims' | 'high_risk_claims' | 'mismatches'>('health_score');
  const [selectedState, setSelectedState] = useState('ALL');
  const [basemapKey, setBasemapKey] = useState<'osm' | 'carto' | 'satellite'>('osm');
  const [isDataTableModalOpen, setIsDataTableModalOpen] = useState(false);
  const [showDistrictLabels, setShowDistrictLabels] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchOverview(),
      fetchDistricts(),
      fetchMapPoints()
    ]).then(([ov, dist, points]) => {
      setOverview(ov);
      setDistricts(dist);
      setMapPoints(points);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleDistrictClick = useCallback(async (distName: string) => {
    try {
      const detail = await fetchDistrictDetail(distName);
      setDistrictDetail(detail);
      setSelectedDistrict(detail);
      setMapCenter([detail.center_lat, detail.center_lng]);
      setMapZoom(9);
    } catch {
      console.error('Failed to load district detail');
    }
  }, []);

  const handleLayerFilter = useCallback(async (layer: string) => {
    setActiveLayer(layer);
    const params: Record<string, string> = {};
    if (layer === 'delayed') params.anomaly_type = 'delayed';
    else if (layer === 'mismatch') params.anomaly_type = 'mismatch';
    else if (layer === 'geographic') params.anomaly_type = 'geographic';
    else if (layer === 'critical') params.risk_level = 'Critical';
    else if (layer === 'high') params.risk_level = 'High';

    const points = await fetchMapPoints(Object.keys(params).length > 0 ? params : undefined);
    setMapPoints(points);
  }, []);

  const resetMap = useCallback(() => {
    setMapCenter([22.5, 81.0]);
    setMapZoom(5);
    setSelectedState('ALL');
    setSelectedDistrict(null);
    setDistrictDetail(null);
    handleLayerFilter('all');
  }, [handleLayerFilter]);

  const handleStateSelect = (stateName: string) => {
    setSelectedState(stateName);
    if (STATE_CENTERS[stateName]) {
      setMapCenter(STATE_CENTERS[stateName].center);
      setMapZoom(STATE_CENTERS[stateName].zoom);
    }
  };

  const filteredSearch = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return districts.filter(d =>
      d.district_name.toLowerCase().includes(q) || d.state_name.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [searchQuery, districts]);

  // Filter districts by selected state
  const visibleDistricts = useMemo(() => {
    if (selectedState === 'ALL') return districts;
    return districts.filter(d => d.state_name === selectedState);
  }, [districts, selectedState]);

  const statusData = useMemo(() => {
    if (!overview?.status_distribution) return [];
    return Object.entries(overview.status_distribution).map(([name, value]) => ({ name, value }));
  }, [overview]);

  // Helper for dynamic district marker styling based on selected metric
  const getDistrictMarkerStyle = useCallback((d: any, isSelected: boolean) => {
    let fillColor = '#1F6B4F';
    let radius = 10;

    if (districtMetric === 'health_score') {
      const h = d.health_score;
      fillColor = h < 50 ? '#D9534F' : h < 65 ? '#E6A23C' : h < 80 ? '#4F8FBF' : '#1F6B4F';
      radius = isSelected ? 18 : Math.max(9, Math.min(22, (d.total_claims || 0) / 6.5));
    } else if (districtMetric === 'total_claims') {
      fillColor = '#3b82f6';
      radius = isSelected ? 20 : Math.max(8, Math.min(26, (d.total_claims || 0) / 5));
    } else if (districtMetric === 'delayed_claims') {
      fillColor = d.delayed_claims > 20 ? '#D9534F' : d.delayed_claims > 8 ? '#E6A23C' : '#4F8FBF';
      radius = isSelected ? 20 : Math.max(8, Math.min(24, (d.delayed_claims || 0) * 1.3));
    } else if (districtMetric === 'high_risk_claims') {
      fillColor = d.high_risk_claims > 3 ? '#D9534F' : d.high_risk_claims > 0 ? '#E6A23C' : '#10b981';
      radius = isSelected ? 20 : Math.max(8, Math.min(24, (d.high_risk_claims || 0) * 4 + 7));
    } else if (districtMetric === 'mismatches') {
      fillColor = d.mismatches > 15 ? '#8b5cf6' : d.mismatches > 5 ? '#a855f7' : '#6366f1';
      radius = isSelected ? 20 : Math.max(8, Math.min(24, (d.mismatches || 0) * 1.5));
    }

    return { fillColor, radius };
  }, [districtMetric]);

  if (loading) {
    return <BrandedLoader message="VANRA: AI is analysing FRA patterns..." height="70vh" />;
  }

  return (
    <div className="dashboard-container">
      {/* Top Banner Notice */}
      <div className="data-disclaimer">
        <span>⚠ <strong>DEMO MODE:</strong> AI-powered Decision Support System for Forest Rights Act (FRA) Monitoring. Synthetic demonstration data.</span>
      </div>

      {/* KPI Cards (Section 5) */}
      {overview && (
        <div className="kpi-grid">
          {/* Total Claims */}
          <motion.div
            className="kpi-card"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
            whileHover={{ y: -3 }}
          >
            <div className="kpi-top">
              <div className="kpi-label">TOTAL CLAIMS</div>
              <div className="kpi-icon-badge">📁</div>
            </div>
            <CountUp end={overview.total_claims} className="kpi-value" />
            <div className="kpi-sub">{overview.states_count} states · {overview.districts_count} monitored districts</div>
            <div className="kpi-trend neutral">
              <span>+4.2% total volume</span>
              <span className="trend-disclaimer">Modelled demo indicator</span>
            </div>
          </motion.div>

          {/* Approved */}
          <motion.div
            className="kpi-card"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            whileHover={{ y: -3 }}
          >
            <div className="kpi-top">
              <div className="kpi-label">TITLES APPROVED</div>
              <div className="kpi-icon-badge approved">🌲</div>
            </div>
            <CountUp end={overview.approved} className="kpi-value primary" />
            <div className="kpi-sub">
              {overview.total_claims > 0 ? ((overview.approved / overview.total_claims) * 100).toFixed(1) : 0}% aggregate grant rate
            </div>
            <div className="kpi-trend positive">
              <span>+6.8% resolution</span>
              <span className="trend-disclaimer">Modelled demo indicator</span>
            </div>
          </motion.div>

          {/* Under Review */}
          <motion.div
            className="kpi-card"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -3 }}
          >
            <div className="kpi-top">
              <div className="kpi-label">UNDER REVIEW</div>
              <div className="kpi-icon-badge review">⚙</div>
            </div>
            <CountUp end={overview.under_review} className="kpi-value blue" />
            <div className="kpi-sub">Active committee workflow stages</div>
            <div className="kpi-trend neutral">
              <span>Stable queue velocity</span>
              <span className="trend-disclaimer">Modelled demo indicator</span>
            </div>
          </motion.div>

          {/* Delayed */}
          <motion.div
            className="kpi-card"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            whileHover={{ y: -3 }}
          >
            <div className="kpi-top">
              <div className="kpi-label">DELAYED CLAIMS</div>
              <div className="kpi-icon-badge delayed">⏳</div>
            </div>
            <CountUp end={overview.delayed} className="kpi-value warning" />
            <div className="kpi-sub">&gt;180 days past SLA threshold</div>
            <div className="kpi-trend warning">
              <span>+14.5% delay rate</span>
              <span className="trend-disclaimer">Modelled demo indicator</span>
            </div>
          </motion.div>

          {/* High Risk */}
          <motion.div
            className="kpi-card"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -3 }}
          >
            <div className="kpi-top">
              <div className="kpi-label">HIGH RISK & CRITICAL</div>
              <div className="kpi-icon-badge critical">🛡</div>
            </div>
            <CountUp end={overview.high_risk} className="kpi-value critical" />
            <div className="kpi-sub">Requires priority administrative review</div>
            <div className="kpi-trend critical">
              <span>+12% this period</span>
              <span className="trend-disclaimer">Modelled demo indicator</span>
            </div>
          </motion.div>

          {/* Record Mismatches */}
          <motion.div
            className="kpi-card"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            whileHover={{ y: -3 }}
          >
            <div className="kpi-top">
              <div className="kpi-label">RECORD MISMATCHES</div>
              <div className="kpi-icon-badge mismatch">📋</div>
            </div>
            <CountUp end={overview.record_mismatches} className="kpi-value warning" />
            <div className="kpi-sub">Cadastral & survey boundary variances</div>
            <div className="kpi-trend warning">
              <span>+8.3% discrepancy</span>
              <span className="trend-disclaimer">Modelled demo indicator</span>
            </div>
          </motion.div>
        </div>
      )}

      {/* Map Interactive Options Header Bar */}
      <div className="map-options-bar">
        {/* Left: View Mode Options */}
        <div className="map-options-group">
          <span className="options-group-title">Map Mode:</span>
          <div className="mode-toggle-pills">
            <button
              className={`mode-pill ${displayMode === 'both' ? 'active' : ''}`}
              onClick={() => setDisplayMode('both')}
              title="Show both district centroids & granular claim points"
            >
              🗺️ Comprehensive
            </button>
            <button
              className={`mode-pill ${displayMode === 'districts' ? 'active' : ''}`}
              onClick={() => setDisplayMode('districts')}
              title="Focus on district-wise aggregates and health ratings"
            >
              🏛️ District-Wise Data
            </button>
            <button
              className={`mode-pill ${displayMode === 'claims' ? 'active' : ''}`}
              onClick={() => setDisplayMode('claims')}
              title="Focus on granular coordinate-level claims"
            >
              📍 Claim Points
            </button>
          </div>
        </div>

        {/* Center: District Metric Dimension Selector */}
        <div className="map-options-group">
          <span className="options-group-title">District Metric:</span>
          <select
            className="map-metric-select"
            value={districtMetric}
            onChange={(e) => setDistrictMetric(e.target.value as any)}
            title="Choose which district-wise metric scales and colors the map circles"
          >
            <option value="health_score">Health Index (0-100)</option>
            <option value="total_claims">Claim Volume (Total)</option>
            <option value="delayed_claims">Delayed Claims (&gt;180d)</option>
            <option value="high_risk_claims">High-Risk Backlog</option>
            <option value="mismatches">Cadastral Mismatches</option>
          </select>
        </div>

        {/* Center-Right: State Quick Zoom Selector */}
        <div className="map-options-group">
          <span className="options-group-title">State:</span>
          <select
            className="map-metric-select"
            value={selectedState}
            onChange={(e) => handleStateSelect(e.target.value)}
            title="Zoom directly to a specific state"
          >
            <option value="ALL">All States (5)</option>
            <option value="Madhya Pradesh">Madhya Pradesh (MP)</option>
            <option value="Maharashtra">Maharashtra (MH)</option>
            <option value="Odisha">Odisha (OD)</option>
            <option value="Chhattisgarh">Chhattisgarh (CG)</option>
            <option value="Jharkhand">Jharkhand (JH)</option>
          </select>
        </div>

        {/* Basemap Switcher */}
        <div className="map-options-group">
          <span className="options-group-title">Basemap:</span>
          <select
            className="map-metric-select"
            value={basemapKey}
            onChange={(e) => setBasemapKey(e.target.value as any)}
            title="Change map tile provider"
          >
            <option value="osm">Standard Street</option>
            <option value="carto">Carto Light (Clean)</option>
            <option value="satellite">Satellite Imagery</option>
          </select>
        </div>

        {/* Right Action: Open District Data Matrix Modal */}
        <div className="map-options-group" style={{ marginLeft: 'auto' }}>
          <button
            className="btn-open-matrix"
            onClick={() => setIsDataTableModalOpen(true)}
            title="Open comprehensive 36-district table with search and sorting"
          >
            📊 District Data Table ({districts.length}) ↗
          </button>
        </div>
      </div>

      {/* Map + Intelligence Section */}
      <div className="map-section">
        <div className="map-container">
          {/* Map Layer Controls (Left Drawer/Pill) */}
          <div className="map-controls">
            <div className="map-controls-title">GIS Layers & Filters</div>
            <div className="map-controls-grid">
              {[
                { key: 'all', label: '● All Claims' },
                { key: 'critical', label: '🔴 Critical' },
                { key: 'high', label: '🟠 High Risk' },
                { key: 'delayed', label: '⏳ Delayed (>180d)' },
                { key: 'mismatch', label: '📋 Mismatches' },
                { key: 'geographic', label: '📍 Spatial Clusters' },
              ].map(l => (
                <button
                  key={l.key}
                  className={`map-control-btn ${activeLayer === l.key ? 'active' : ''}`}
                  onClick={() => handleLayerFilter(l.key)}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {selectedDistrict && (
              <button className="map-control-btn reset-btn" onClick={resetMap}>
                ↩ Reset National View
              </button>
            )}

            <div className="map-toggle-labels">
              <label>
                <input
                  type="checkbox"
                  checked={showDistrictLabels}
                  onChange={e => setShowDistrictLabels(e.target.checked)}
                />
                <span>Show District Badges</span>
              </label>
            </div>
          </div>

          {/* Search Box */}
          <div className="map-search">
            <input
              type="text"
              placeholder="Search district or state (e.g. Mandla, Gadchiroli)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {filteredSearch.length > 0 && (
              <div className="map-search-results">
                {filteredSearch.map(d => (
                  <div
                    key={d.district_name}
                    className="map-search-item"
                    onClick={() => {
                      handleDistrictClick(d.district_name);
                      setSearchQuery('');
                    }}
                  >
                    <div>
                      <strong>{d.district_name}</strong>, {d.state_name}
                    </div>
                    <span className={`risk-badge ${d.district_risk_level?.toLowerCase()}`}>
                      Health {d.health_score}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dynamic Legend based on Metric */}
          <div className="map-legend">
            <div className="legend-title">
              {districtMetric === 'health_score' && 'Health Score Index'}
              {districtMetric === 'total_claims' && 'Claims Density Scale'}
              {districtMetric === 'delayed_claims' && 'Delayed Backlog Severity'}
              {districtMetric === 'high_risk_claims' && 'High Risk Count'}
              {districtMetric === 'mismatches' && 'Record Discrepancies'}
            </div>
            {districtMetric === 'health_score' ? (
              Object.entries(RISK_COLORS).map(([level, color]) => (
                <div key={level} className="legend-item">
                  <div className="legend-dot" style={{ background: color }} />
                  <span>{level}</span>
                </div>
              ))
            ) : districtMetric === 'total_claims' ? (
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                <div>● Small: &lt;100 claims</div>
                <div>● Medium: 100-200 claims</div>
                <div>● Large: &gt;200 claims</div>
              </div>
            ) : (
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                <div>🔴 Elevated (&gt;15 cases)</div>
                <div>🟠 Moderate (5-15 cases)</div>
                <div>🔵 Low (&lt;5 cases)</div>
              </div>
            )}
          </div>

          {/* Floating Map Zoom Actions */}
          <MapToolbarActions
            onZoomIn={() => setMapZoom(z => Math.min(14, z + 1))}
            onZoomOut={() => setMapZoom(z => Math.max(4, z - 1))}
            onReset={resetMap}
          />

          {/* Interactive Leaflet Map */}
          <div className="map-wrapper">
            <MapContainer
              center={[22.5, 81.0]}
              zoom={5}
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
              preferCanvas={true}
            >
              <TileLayer
                attribution={BASEMAP_TILES[basemapKey].attribution}
                url={BASEMAP_TILES[basemapKey].url}
              />
              <MapController center={mapCenter} zoom={mapZoom} />

              {/* District Center Markers with Boundary Glow & Dynamic Sizing */}
              {(displayMode === 'both' || displayMode === 'districts') &&
                visibleDistricts.map(d => {
                  const isSelected = selectedDistrict?.district_name === d.district_name;
                  const { fillColor, radius } = getDistrictMarkerStyle(d, isSelected);

                  return (
                    <div key={d.district_name}>
                      {/* Selected Boundary Glow Circle */}
                      {isSelected && (
                        <CircleMarker
                          center={[d.center_lat, d.center_lng]}
                          radius={radius + 12}
                          pathOptions={{
                            fillColor: fillColor,
                            fillOpacity: 0.18,
                            color: fillColor,
                            weight: 2,
                            dashArray: '4 4',
                          }}
                        />
                      )}

                      <CircleMarker
                        center={[d.center_lat, d.center_lng]}
                        radius={radius}
                        pathOptions={{
                          fillColor: fillColor,
                          fillOpacity: isSelected ? 0.9 : 0.65,
                          color: isSelected ? '#FFFFFF' : fillColor,
                          weight: isSelected ? 3 : 1.5,
                        }}
                        eventHandlers={{
                          click: () => handleDistrictClick(d.district_name),
                        }}
                      >
                        {/* Interactive Rich Hover Tooltip */}
                        {showDistrictLabels && (
                          <LeafletTooltip
                            direction="top"
                            offset={[0, -radius]}
                            opacity={0.96}
                            permanent={false}
                          >
                            <div className="district-hover-tooltip">
                              <div className="tooltip-header">
                                <strong>{d.district_name}</strong>
                                <span className="tooltip-state">{d.state_name}</span>
                              </div>
                              <div className="tooltip-grid">
                                <div>Health: <strong>{d.health_score}/100</strong></div>
                                <div>Claims: <strong>{d.total_claims}</strong></div>
                                <div>Delayed: <strong style={{ color: '#D9534F' }}>{d.delayed_claims}</strong></div>
                                <div>High Risk: <strong style={{ color: '#D9534F' }}>{d.high_risk_claims}</strong></div>
                              </div>
                              <div className="tooltip-footer">Click to inspect district intelligence</div>
                            </div>
                          </LeafletTooltip>
                        )}

                        <Popup>
                          <div style={{ minWidth: 200, padding: 4 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div>
                                <h4 style={{ margin: '0 0 2px 0', fontSize: 14, color: '#164A38' }}>{d.district_name}</h4>
                                <span style={{ fontSize: 12, color: '#6B746F' }}>{d.state_name}</span>
                              </div>
                              <span
                                className="health-badge-pill"
                                style={{ background: `${fillColor}18`, color: fillColor, borderColor: `${fillColor}40`, fontSize: 10 }}
                              >
                                {d.health_score}/100
                              </span>
                            </div>
                            <hr style={{ margin: '6px 0', border: 'none', borderTop: '1px solid #EEF0EA' }} />
                            <div style={{ fontSize: 12, lineHeight: 1.5 }}>
                              <div>Total Claims: <strong>{d.total_claims}</strong></div>
                              <div>Approved Titles: <strong style={{ color: 'var(--primary)' }}>{d.approved_claims}</strong></div>
                              <div>Delayed Claims: <strong style={{ color: '#D9534F' }}>{d.delayed_claims}</strong></div>
                              <div>Record Mismatches: <strong style={{ color: '#b47214' }}>{d.mismatches}</strong></div>
                              <div>High Risk Backlog: <strong style={{ color: '#D9534F' }}>{d.high_risk_claims}</strong></div>
                            </div>
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ marginTop: 8, width: '100%' }}
                              onClick={() => handleDistrictClick(d.district_name)}
                            >
                              Open District Intelligence
                            </button>
                          </div>
                        </Popup>
                      </CircleMarker>
                    </div>
                  );
                })}

              {/* Individual Claim Markers */}
              {(displayMode === 'both' || displayMode === 'claims') &&
                mapPoints.map(p => {
                  const isCriticalOrHigh = p.risk_score >= 70;
                  return (
                    <CircleMarker
                      key={p.claim_id}
                      center={[p.latitude, p.longitude]}
                      radius={p.risk_score >= 80 ? 5.5 : p.risk_score >= 60 ? 4 : 2.5}
                      pathOptions={{
                        fillColor: RISK_COLORS[p.risk_level] || '#9BA5A0',
                        fillOpacity: isCriticalOrHigh ? 0.9 : 0.5,
                        color: isCriticalOrHigh ? '#FFFFFF' : RISK_COLORS[p.risk_level] || '#9BA5A0',
                        weight: isCriticalOrHigh ? 1.5 : 0.8,
                      }}
                      eventHandlers={{
                        click: () => setSelectedClaimId(p.claim_id),
                      }}
                    >
                      <Popup>
                        <div style={{ minWidth: 160, padding: 4 }}>
                          <div style={{ fontWeight: 700, color: '#164A38' }}>{p.claim_id}</div>
                          <div style={{ fontSize: 12, color: '#6B746F' }}>{p.district}, {p.state}</div>
                          <div style={{ fontSize: 12, margin: '4px 0' }}>
                            Risk Score: <strong style={{ color: RISK_COLORS[p.risk_level] }}>{p.risk_score}/100 ({p.risk_level})</strong>
                          </div>
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ marginTop: 6, width: '100%' }}
                            onClick={() => setSelectedClaimId(p.claim_id)}
                          >
                            Investigate Portfolio
                          </button>
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                })}
            </MapContainer>
          </div>
        </div>

        {/* Intelligence Right Panel */}
        <div className="intel-panel">
          <AnimatePresence mode="wait">
            {districtDetail ? (
              <motion.div
                key={districtDetail.district_name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                {/* District Header */}
                <div className="intel-header">
                  <div>
                    <span className="intel-state-tag">{districtDetail.state_name}</span>
                    <h3>{districtDetail.district_name}</h3>
                  </div>
                  <button className="intel-close-btn" onClick={resetMap} title="Reset view">✕</button>
                </div>

                {/* Implementation Health Index */}
                <div className="intel-section">
                  <div className="intel-section-title">FRA Implementation Health Index</div>
                  <div className="health-score">
                    <div
                      className={`health-circle ${
                        districtDetail.health_score < 50
                          ? 'critical'
                          : districtDetail.health_score < 65
                          ? 'high'
                          : districtDetail.health_score < 80
                          ? 'medium'
                          : 'low'
                      }`}
                    >
                      <CountUp end={districtDetail.health_score} />
                    </div>
                    <div className="health-info">
                      <h4>/ 100 Index</h4>
                      <p>
                        Status:{' '}
                        <strong
                          style={{
                            color:
                              districtDetail.health_score < 50
                                ? 'var(--critical)'
                                : districtDetail.health_score < 65
                                ? 'var(--warning)'
                                : 'var(--primary)',
                          }}
                        >
                          {districtDetail.district_risk_level || 'Requires Attention'}
                        </strong>
                      </p>
                    </div>
                  </div>
                </div>

                {/* AI Analysis Quote */}
                <div className="intel-section ai-summary-quote">
                  <div className="ai-summary-label">
                    <span className="sparkle">✨</span> AI DISTRICT INTELLIGENCE
                  </div>
                  <p className="ai-summary-text">
                    "Elevated risk in <strong>{districtDetail.district_name}</strong> is primarily driven by processing delays past the 180-day threshold, land-record discrepancies, and concentrated claim activity in non-cadastral forest tracts."
                  </p>
                  <button
                    className="btn btn-primary btn-full"
                    style={{ marginTop: 8 }}
                    onClick={() => setShowWhyFlagged(true)}
                  >
                    Why is this district flagged? ↗
                  </button>
                </div>

                {/* Contributing Risk Factors */}
                <div className="intel-section">
                  <div className="intel-section-title">Factor Attribution</div>
                  {districtDetail.factors &&
                    Object.entries(districtDetail.factors).map(([key, val]) => (
                      <div className="factor-bar" key={key}>
                        <div className="factor-bar-header">
                          <span className="factor-bar-label">
                            {key.replace(/_/g, ' ').replace(/^\w/, (c: string) => c.toUpperCase())}
                          </span>
                          <span className="factor-bar-value">{val as number}%</span>
                        </div>
                        <div className="factor-bar-track">
                          <div
                            className={`factor-bar-fill ${
                              (val as number) > 70 ? 'critical' : (val as number) > 40 ? 'warning' : 'good'
                            }`}
                            style={{ width: `${val as number}%` }}
                          />
                        </div>
                      </div>
                    ))}
                </div>

                {/* Statistics Grid */}
                <div className="intel-section">
                  <div className="intel-section-title">District Claim Metrics</div>
                  <div className="stat-grid">
                    <div className="stat-item">
                      <div className="stat-item-value">{districtDetail.stats?.total || 0}</div>
                      <div className="stat-item-label">Total Claims</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-item-value" style={{ color: 'var(--primary)' }}>
                        {districtDetail.stats?.approved || 0}
                      </div>
                      <div className="stat-item-label">Approved</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-item-value" style={{ color: 'var(--map-blue)' }}>
                        {(districtDetail.stats?.pending || 0) + (districtDetail.stats?.under_review || 0)}
                      </div>
                      <div className="stat-item-label">Under Review</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-item-value" style={{ color: 'var(--warning)' }}>
                        {districtDetail.stats?.delayed || 0}
                      </div>
                      <div className="stat-item-label">Delayed</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-item-value" style={{ color: 'var(--critical)' }}>
                        {districtDetail.stats?.high_risk || 0}
                      </div>
                      <div className="stat-item-label">High Risk</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-item-value" style={{ color: 'var(--warning)' }}>
                        {districtDetail.stats?.mismatches || 0}
                      </div>
                      <div className="stat-item-label">Mismatches</div>
                    </div>
                  </div>
                </div>

                {/* Status & Processing Distribution */}
                <div className="intel-section">
                  <div className="intel-section-title">Processing Timeline Distribution</div>
                  <div className="chart-container" style={{ height: 160 }}>
                    <ResponsiveContainer>
                      <BarChart data={Object.entries(districtDetail.processing_distribution || {}).map(([name, value]) => ({ name, value }))}>
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#1F6B4F" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Top Risk Claims List */}
                <div className="intel-section">
                  <div className="intel-section-title">Top Priority Claims in District</div>
                  {districtDetail.top_risk_claims?.slice(0, 5).map((c: any) => (
                    <div
                      key={c.claim_id}
                      className="district-claim-item"
                      onClick={() => setSelectedClaimId(c.claim_id)}
                    >
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700 }}>{c.claim_id}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                          {c.status} · {c.committee_stage}
                        </div>
                      </div>
                      <span className={`risk-badge ${c.risk_level?.toLowerCase()}`}>
                        Risk {c.risk_score}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="national-overview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="intel-header">
                  <div>
                    <span className="intel-state-tag">National Decision Support</span>
                    <h3>FRA Geographic Intelligence</h3>
                  </div>
                </div>

                <div className="intel-section">
                  <div className="intel-section-title">National Claim Status Distribution</div>
                  {overview && (
                    <>
                      <div className="chart-container" style={{ height: 170 }}>
                        <ResponsiveContainer>
                          <PieChart>
                            <Pie
                              data={statusData}
                              cx="50%"
                              cy="50%"
                              outerRadius={68}
                              innerRadius={38}
                              dataKey="value"
                              paddingAngle={2}
                            >
                              {statusData.map((_, i) => (
                                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
                        {statusData.map((d, i) => (
                          <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: PIE_COLORS[i % PIE_COLORS.length] }} />
                            {d.name}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="intel-section">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div className="intel-section-title" style={{ margin: 0 }}>Districts Requiring Attention</div>
                    <button
                      className="btn-view-all-districts"
                      onClick={() => setIsDataTableModalOpen(true)}
                    >
                      View All 36 ↗
                    </button>
                  </div>
                  {districts
                    .slice()
                    .sort((a, b) => (b.avg_risk_score || 0) - (a.avg_risk_score || 0))
                    .slice(0, 7)
                    .map(d => (
                      <div
                        key={d.district_name}
                        className="district-claim-item"
                        onClick={() => handleDistrictClick(d.district_name)}
                      >
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700 }}>{d.district_name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                            {d.state_name} · {d.total_claims} claims ({d.delayed_claims} delayed)
                          </div>
                        </div>
                        <span className={`risk-badge ${d.district_risk_level?.toLowerCase()}`}>
                          Index {d.health_score}
                        </span>
                      </div>
                    ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* District-Wise Data Table Matrix Modal */}
      <DistrictDataTableModal
        isOpen={isDataTableModalOpen}
        onClose={() => setIsDataTableModalOpen(false)}
        districts={districts}
        onSelectDistrict={handleDistrictClick}
      />

      {/* Modals */}
      {showWhyFlagged && districtDetail && (
        <WhyFlagged district={districtDetail} onClose={() => setShowWhyFlagged(false)} />
      )}
      {selectedClaimId && (
        <ClaimDetail claimId={selectedClaimId} onClose={() => setSelectedClaimId(null)} />
      )}
    </div>
  );
}
