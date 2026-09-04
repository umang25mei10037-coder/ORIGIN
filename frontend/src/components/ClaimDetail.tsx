import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { fetchClaimDetail, fetchEvidence } from '../services/api';
import ForestEcosystem from './ForestEcosystem';

interface ClaimDetailProps {
  claimId: string;
  onClose: () => void;
}

interface EvidenceNode {
  id: string;
  label: string;
  type: string;
  category: 'claim' | 'parcel' | 'record' | 'district' | 'forest' | 'workflow';
  x: number;
  y: number;
  data: Record<string, any>;
  connections: string[];
}

export default function ClaimDetail({ claimId, onClose }: ClaimDetailProps) {
  const [claim, setClaim] = useState<any>(null);
  const [evidence, setEvidence] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'evidence' | 'ai'>('overview');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('claim');

  useEffect(() => {
    Promise.all([
      fetchClaimDetail(claimId),
      fetchEvidence(claimId)
    ]).then(([claimData, evidenceData]) => {
      setClaim(claimData);
      setEvidence(evidenceData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [claimId]);

  if (loading) {
    return (
      <div className="claim-detail-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="claim-detail-modal" style={{ padding: '60px', textAlign: 'center' }}>
          <div className="loading-spinner" />
          <p style={{ marginTop: 12, color: 'var(--text-secondary)' }}>Loading claim investigation details...</p>
        </div>
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="claim-detail-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="claim-detail-modal" style={{ padding: '60px', textAlign: 'center' }}>
          <p>Claim not found.</p>
          <button className="btn btn-secondary" onClick={onClose} style={{ marginTop: 16 }}>Close</button>
        </div>
      </div>
    );
  }

  const riskColor = claim.risk_level === 'Critical' ? 'critical' : claim.risk_level === 'High' ? 'high' : claim.risk_level === 'Medium' ? 'medium' : 'low';
  const anomalyReasons: string[] = claim.anomaly_reasons ? (Array.isArray(claim.anomaly_reasons) ? claim.anomaly_reasons : JSON.parse(claim.anomaly_reasons)) : [];

  // Structured timeline stages matching the statutory FRA workflow
  const statutoryWorkflowStages = [
    { name: 'Claim Submitted', defaultDays: 14, committee: 'Gram Sabha FRC' },
    { name: 'Field Verification', defaultDays: 45, committee: 'Joint Forest Verification' },
    { name: 'SDLC Review', defaultDays: 90, committee: 'Sub-Divisional Committee' },
    { name: 'District Review', defaultDays: 60, committee: 'District Level Committee' },
    { name: 'Final Decision', defaultDays: 15, committee: 'Title Conveyance & Registry' }
  ];

  const currentStageIndex = claim.status === 'Approved' ? 5 :
    claim.committee_stage === 'DLC Review' || claim.committee_stage === 'District Review' ? 3 :
    claim.committee_stage === 'SDLC Review' ? 2 :
    claim.committee_stage === 'Verification' || claim.committee_stage === 'Field Verification' ? 1 : 0;

  // Graph nodes layout for Evidence Graph (Section 10)
  const graphNodes: EvidenceNode[] = [
    {
      id: 'record',
      label: 'LAND RECORD',
      type: 'Cadastral Record',
      category: 'record',
      x: 380,
      y: 50,
      connections: ['parcel'],
      data: {
        'Record Status': claim.record_status || 'Verified',
        'Cadastral Survey': 'Sheet No. 42B',
        'Registered Area': `${claim.recorded_area || claim.claimed_area} ha`,
        'Discrepancy Detected': claim.record_status === 'Discrepancy Found' ? 'Area Mismatch +1.8 ha' : 'None',
      }
    },
    {
      id: 'claim',
      label: `CLAIM: ${claim.claim_id}`,
      type: `${claim.claim_type} FRA Claim`,
      category: 'claim',
      x: 120,
      y: 150,
      connections: ['parcel', 'district', 'workflow'],
      data: {
        'Claim ID': claim.claim_id,
        'Risk Score': `${claim.risk_score} / 100 (${claim.risk_level})`,
        'Claimed Area': `${claim.claimed_area} ha`,
        'Processing Time': `${claim.processing_days} days`,
        'Status': claim.status,
      }
    },
    {
      id: 'parcel',
      label: 'LAND PARCEL',
      type: `${claim.land_type || 'Forest Land'}`,
      category: 'parcel',
      x: 380,
      y: 150,
      connections: ['record', 'claim', 'forest'],
      data: {
        'Survey Number': 'Plot #114/2',
        'Coordinates': `${claim.latitude?.toFixed(4)}, ${claim.longitude?.toFixed(4)}`,
        'Forest Overlap': 'Schedule V Boundary',
        'Area Delta': claim.recorded_area ? `${(claim.claimed_area - claim.recorded_area).toFixed(2)} ha variance` : 'Within margin',
      }
    },
    {
      id: 'district',
      label: `DISTRICT: ${claim.district}`,
      type: `${claim.state} Administrative Unit`,
      category: 'district',
      x: 120,
      y: 270,
      connections: ['claim', 'forest'],
      data: {
        'District': claim.district,
        'State': claim.state,
        'Cluster Density': claim.anomaly_reasons?.includes('cluster') ? 'High Anomaly Cluster' : 'Normal',
        'Processing Velocity': 'Below regional median',
      }
    },
    {
      id: 'forest',
      label: 'FOREST ZONE',
      type: claim.forest_zone || 'Protected Reserve',
      category: 'forest',
      x: 380,
      y: 270,
      connections: ['district', 'parcel'],
      data: {
        'Zone Classification': claim.forest_zone || 'Reserve Forest',
        'Gram Sabha Jurisdiction': 'Empowered Boundary',
        'Conservation Status': 'Category Tier-2',
      }
    },
    {
      id: 'workflow',
      label: 'WORKFLOW STAGE',
      type: claim.committee_stage || 'SDLC Review',
      category: 'workflow',
      x: 120,
      y: 390,
      connections: ['claim'],
      data: {
        'Current Stage': claim.committee_stage,
        'Days in Current Queue': `${Math.min(claim.processing_days, 110)} days`,
        'Threshold Status': claim.processing_days > 180 ? 'CRITICAL DELAY (>180d)' : 'Active',
      }
    }
  ];

  const selectedNode = graphNodes.find(n => n.id === selectedNodeId) || graphNodes[0];

  return (
    <AnimatePresence>
      <motion.div
        className="claim-detail-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          className="claim-detail-modal"
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.98 }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
        >
          {/* Header Banner */}
          <div className="claim-detail-header-banner">
            <ForestEcosystem variant="mini" height={80} showParticles={false} showContours={false} />
            <div className="claim-detail-header-inner">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="claim-id-badge">{claim.claim_id}</span>
                  <span className={`risk-badge ${riskColor}`}>Risk Index: {claim.risk_score} / 100</span>
                  <span className="claim-type-pill">{claim.claim_type}</span>
                </div>
                <h2 style={{ fontSize: 18, marginTop: 4, color: 'var(--primary-dark)' }}>
                  FRA Claim Investigation & Evidence Portfolio
                </h2>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {claim.district}, {claim.state} · Committee Stage: <strong>{claim.committee_stage}</strong> · Status: <strong>{claim.status}</strong>
                </p>
              </div>
              <button className="close-btn" onClick={onClose} aria-label="Close modal">✕</button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="tabs" style={{ padding: '0 24px', borderBottom: '1px solid var(--border-light)' }}>
            <button className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
              Overview & Risk
            </button>
            <button className={`tab ${activeTab === 'timeline' ? 'active' : ''}`} onClick={() => setActiveTab('timeline')}>
              Investigation Timeline
            </button>
            <button className={`tab ${activeTab === 'evidence' ? 'active' : ''}`} onClick={() => setActiveTab('evidence')}>
              Evidence Graph
            </button>
            <button className={`tab ${activeTab === 'ai' ? 'active' : ''}`} onClick={() => setActiveTab('ai')}>
              AI Decision Support
            </button>
          </div>

          <div className="claim-detail-body">
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                <div className="claim-info-grid">
                  <div className="claim-info-item">
                    <label>Claim ID</label>
                    <span style={{ fontWeight: 700 }}>{claim.claim_id}</span>
                  </div>
                  <div className="claim-info-item">
                    <label>Claim Status</label>
                    <span>{claim.status}</span>
                  </div>
                  <div className="claim-info-item">
                    <label>Committee Stage</label>
                    <span>{claim.committee_stage}</span>
                  </div>
                  <div className="claim-info-item">
                    <label>Claimed Area</label>
                    <span>{claim.claimed_area} ha</span>
                  </div>
                  <div className="claim-info-item">
                    <label>Recorded / Cadastral Area</label>
                    <span style={{ color: claim.recorded_area && Math.abs(claim.claimed_area - claim.recorded_area) > 0.5 ? 'var(--critical)' : 'inherit' }}>
                      {claim.recorded_area ? `${claim.recorded_area} ha` : 'Pending Cadastre'}
                    </span>
                  </div>
                  <div className="claim-info-item">
                    <label>Processing Elapsed</label>
                    <span style={{ color: claim.processing_days > 180 ? 'var(--critical)' : 'inherit', fontWeight: 600 }}>
                      {claim.processing_days} days {claim.processing_days > 180 && '⚠ (>180d delay)'}
                    </span>
                  </div>
                  <div className="claim-info-item">
                    <label>Land Classification</label>
                    <span>{claim.land_type || 'Community Forest Resource'}</span>
                  </div>
                  <div className="claim-info-item">
                    <label>Forest Zone</label>
                    <span>{claim.forest_zone || 'Protected Range #4'}</span>
                  </div>
                  <div className="claim-info-item">
                    <label>Claim Date</label>
                    <span>{claim.claim_date}</span>
                  </div>
                  <div className="claim-info-item">
                    <label>Verification Date</label>
                    <span>{claim.verification_date || 'Awaiting Joint Verification'}</span>
                  </div>
                  <div className="claim-info-item">
                    <label>Record Status</label>
                    <span style={{ color: claim.record_status === 'Discrepancy Found' ? 'var(--critical)' : 'var(--primary)', fontWeight: 600 }}>
                      {claim.record_status || 'Verified'}
                    </span>
                  </div>
                  <div className="claim-info-item">
                    <label>Coordinates</label>
                    <span style={{ fontSize: 12, fontFamily: 'monospace' }}>
                      {claim.latitude?.toFixed(4)}°N, {claim.longitude?.toFixed(4)}°E
                    </span>
                  </div>
                </div>

                {/* Risk Score Breakdown */}
                {claim.risk_factors && claim.risk_factors.length > 0 && (
                  <div style={{ marginTop: 20, padding: 18, background: 'var(--white)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                      <div>
                        <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary-dark)' }}>Risk Score Attribution</h4>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Normalized score components calculated by model</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 28, fontWeight: 800, color: claim.risk_score >= 80 ? 'var(--critical)' : claim.risk_score >= 60 ? 'var(--warning)' : 'var(--primary)' }}>
                          {claim.risk_score}
                        </span>
                        <span style={{ fontSize: 14, color: 'var(--text-tertiary)' }}> / 100</span>
                      </div>
                    </div>

                    {claim.risk_factors.map((f: any, i: number) => (
                      <motion.div
                        key={i}
                        className="risk-factor-row"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                      >
                        <span className="risk-factor-name">{f.factor}</span>
                        <span className="risk-factor-score">+{f.contribution} pts</span>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Anomaly Badges */}
                {anomalyReasons.length > 0 && (
                  <div style={{ marginTop: 16, padding: 16, background: 'var(--critical-light)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(217,83,79,0.2)' }}>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--critical)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>⚠</span> Detected Anomaly Flags Requiring Verification
                    </h4>
                    {anomalyReasons.map((r, i) => (
                      <p key={i} style={{ fontSize: 12, color: 'var(--text-primary)', marginBottom: 6, lineHeight: 1.4 }}>
                        • {r}
                      </p>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 2: INVESTIGATION TIMELINE (Section 9) */}
            {activeTab === 'timeline' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                <div style={{ marginBottom: 16 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--primary-dark)' }}>
                    Statutory FRA Claim Investigation Timeline
                  </h4>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    Visual stage progression with duration tracking and delay threshold monitoring.
                  </p>
                </div>

                <div className="timeline-flow-container">
                  {statutoryWorkflowStages.map((stage, idx) => {
                    const isCompleted = idx < currentStageIndex;
                    const isCurrent = idx === currentStageIndex;
                    const isPending = idx > currentStageIndex;
                    const isDelayed = (isCurrent || isCompleted) && (claim.processing_days > 180 && idx >= 2);

                    const durationDays = isCompleted ? stage.defaultDays : isCurrent ? claim.processing_days : 0;

                    return (
                      <motion.div
                        key={idx}
                        className={`statutory-timeline-node ${isCompleted ? 'completed' : isCurrent ? 'current' : 'pending'} ${isDelayed ? 'delayed' : ''}`}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.12 }}
                      >
                        <div className="timeline-marker">
                          {isCompleted ? '✓' : isDelayed ? '⚠' : isCurrent ? '●' : '○'}
                        </div>

                        <div className="timeline-card">
                          <div className="timeline-card-header">
                            <h5>{stage.name}</h5>
                            <span className="stage-committee-tag">{stage.committee}</span>
                          </div>

                          <div className="timeline-card-body">
                            <div className="timeline-duration-badge">
                              {isCompleted && `✓ Completed in ${durationDays} days`}
                              {isCurrent && `● Active Stage: ${durationDays} days elapsed`}
                              {isPending && `○ Scheduled queue`}
                            </div>
                            {isDelayed && (
                              <div className="timeline-delay-alert">
                                ⚠ Processing exceeds standard timeline threshold (&gt;180 days total)
                              </div>
                            )}
                          </div>
                        </div>

                        {idx < statutoryWorkflowStages.length - 1 && (
                          <div className={`timeline-connector-line ${isCompleted ? 'filled' : ''}`} />
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* TAB 3: EVIDENCE GRAPH (Section 10) */}
            {activeTab === 'evidence' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--primary-dark)' }}>
                        Relational Evidence Graph
                      </h4>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        Visualizing: <em>Why did the AI flag this claim?</em> Click any node to inspect relationships.
                      </p>
                    </div>
                    <div className="evidence-node-legend">
                      <span className="legend-chip active">Selected</span>
                      <span className="legend-chip connected">Connected</span>
                      <span className="legend-chip dimmed">Unrelated</span>
                    </div>
                  </div>
                </div>

                <div className="evidence-graph-layout">
                  {/* Visual Node Diagram */}
                  <div className="evidence-canvas">
                    <svg className="evidence-connections-svg" viewBox="0 0 540 450">
                      <defs>
                        <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                          <path d="M 0 0 L 10 5 L 0 10 z" fill="#87B19D" />
                        </marker>
                      </defs>

                      {/* Connection lines */}
                      {/* LAND RECORD to LAND PARCEL */}
                      <line
                        x1="380" y1="80" x2="380" y2="120"
                        className={`graph-link ${selectedNode.connections.includes('record') || selectedNode.id === 'record' ? 'highlighted' : 'dimmed'}`}
                      />
                      {/* CLAIM to LAND PARCEL */}
                      <line
                        x1="220" y1="150" x2="300" y2="150"
                        className={`graph-link ${selectedNode.connections.includes('parcel') || selectedNode.id === 'claim' ? 'highlighted' : 'dimmed'}`}
                      />
                      {/* CLAIM to DISTRICT */}
                      <line
                        x1="120" y1="185" x2="120" y2="240"
                        className={`graph-link ${selectedNode.connections.includes('district') || selectedNode.id === 'claim' ? 'highlighted' : 'dimmed'}`}
                      />
                      {/* DISTRICT to FOREST ZONE */}
                      <line
                        x1="220" y1="270" x2="300" y2="270"
                        className={`graph-link ${selectedNode.connections.includes('forest') || selectedNode.id === 'district' ? 'highlighted' : 'dimmed'}`}
                      />
                      {/* LAND PARCEL to FOREST ZONE */}
                      <line
                        x1="380" y1="185" x2="380" y2="240"
                        className={`graph-link ${selectedNode.connections.includes('forest') || selectedNode.id === 'parcel' ? 'highlighted' : 'dimmed'}`}
                      />
                      {/* CLAIM to WORKFLOW STAGE */}
                      <line
                        x1="120" y1="305" x2="120" y2="360"
                        className={`graph-link ${selectedNode.connections.includes('workflow') || selectedNode.id === 'claim' ? 'highlighted' : 'dimmed'}`}
                      />
                    </svg>

                    {/* Nodes positioned in relational structure */}
                    {graphNodes.map((node) => {
                      const isSelected = selectedNode.id === node.id;
                      const isConnected = selectedNode.connections.includes(node.id) || node.connections.includes(selectedNode.id);
                      const stateClass = isSelected ? 'selected' : isConnected ? 'connected' : 'unrelated';

                      return (
                        <div
                          key={node.id}
                          className={`evidence-node-item ${stateClass}`}
                          style={{ left: node.x - 75, top: node.y - 25 }}
                          onClick={() => setSelectedNodeId(node.id)}
                        >
                          <div className="node-category">{node.type}</div>
                          <div className="node-label">{node.label}</div>
                          {isSelected && <div className="node-pulse-ring" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Side Details Panel */}
                  <div className="evidence-detail-panel">
                    <div className="detail-panel-header">
                      <span className="detail-tag">{selectedNode.type}</span>
                      <h4>{selectedNode.label}</h4>
                    </div>

                    <div className="detail-panel-attributes">
                      {Object.entries(selectedNode.data).map(([key, val]) => (
                        <div key={key} className="detail-attr-row">
                          <span className="attr-key">{key}:</span>
                          <span className="attr-val">{val}</span>
                        </div>
                      ))}
                    </div>

                    <div className="detail-panel-ai-insight">
                      <strong>AI Relationship Insight:</strong>
                      <p>
                        {selectedNode.id === 'claim' && 'Root entity evaluated by the risk model. Flagged due to processing time and discrepancy flags.'}
                        {selectedNode.id === 'record' && 'Cadastral records indicate survey discrepancies against Gram Sabha claim boundaries.'}
                        {selectedNode.id === 'parcel' && 'Parcel geometry intersects with reserved forest tracts, requiring field officer ground-truthing.'}
                        {selectedNode.id === 'district' && 'District exhibits higher than average backlog density in the current quarter.'}
                        {selectedNode.id === 'forest' && 'Forest zone classification requires Gram Sabha consent under Section 3(1)(i).'}
                        {selectedNode.id === 'workflow' && 'Prolonged retention at SDLC stage exceeds standard processing velocity threshold.'}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 4: AI DECISION SUPPORT */}
            {activeTab === 'ai' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                <div className="ai-assessment">
                  <div className="ai-assessment-header">
                    <div>
                      <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary-dark)' }}>
                        AI Decision Support Summary
                      </h4>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        Synthesized evaluation for administrative review
                      </p>
                    </div>
                    <span className="ai-confidence">
                      Model Confidence: {claim.ai_assessment?.confidence || '92.4%'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 12, margin: '14px 0' }}>
                    <span className={`risk-badge ${riskColor}`}>Assessment: {claim.ai_assessment?.risk_level || claim.risk_level} Priority</span>
                    <span className="risk-badge" style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)' }}>
                      Rule & Isolation Forest Match
                    </span>
                  </div>

                  <h5 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, letterSpacing: 0.5 }}>
                    CONTRIBUTING EVIDENCE FACTORS
                  </h5>
                  <ul className="ai-evidence-list">
                    {(claim.ai_assessment?.evidence || [
                      `Processing elapsed: ${claim.processing_days} days (threshold: 180 days)`,
                      `Cadastral record status: ${claim.record_status || 'Under review'}`,
                      `Claim spatial coordinates within ${claim.district} cluster`,
                      `Area evaluation: ${claim.claimed_area} ha against local distribution`,
                    ]).map((e: string, i: number) => (
                      <motion.li key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08 }}>
                        {e}
                      </motion.li>
                    ))}
                  </ul>

                  <div className="ai-recommendations" style={{ marginTop: 16 }}>
                    <h5 style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary-dark)', marginBottom: 8 }}>
                      Recommended Administrative Actions
                    </h5>
                    {(claim.ai_assessment?.recommendations || [
                      'Schedule expedited Joint Forest Verification with Gram Sabha FRC',
                      'Reconcile revenue cadastre survey with GPS polygon coordinates',
                      'Escalate pending SDLC review to avoid breach of processing guidelines',
                    ]).map((r: string, i: number) => (
                      <p key={i} style={{ fontSize: 12, marginBottom: 4 }}>• {r}</p>
                    ))}
                  </div>

                  <p className="ai-disclaimer" style={{ marginTop: 20 }}>
                    {claim.ai_assessment?.disclaimer ||
                      'VANRA is a prototype decision-support system. It assists monitoring and prioritization and does not replace statutory authorities or legal decision-making.'}
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
