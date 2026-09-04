import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import CountUp from '../components/CountUp';
import { ForestEcosystem } from '../components/ForestEcosystem';
import { fetchOverview } from '../services/api';

interface OverviewMetrics {
  total_claims: number;
  approved: number;
  pending: number;
  delayed: number;
  high_risk: number;
  record_mismatches: number;
}

interface PipelineStep {
  title: string;
  icon: string;
  stageName: string;
  headline: string;
  description: string;
  chips: string[];
  metrics: { key: string; val: string }[];
  codeTag: string;
}

const PIPELINE_STEPS: PipelineStep[] = [
  {
    title: '1. Forest Land',
    icon: '🌲',
    stageName: 'FOREST ECOSYSTEM',
    headline: 'Multi-Spectral Canopy & Forest Boundary Baselines',
    description: 'Autonomous ingestion of satellite canopy indices, reserved forest demarcation boundaries, and eco-sensitive buffer zones.',
    chips: ['Sentinel-2 L2A', 'Global Forest Watch', 'FSI Forest Canopy Map', 'Eco-Buffers'],
    metrics: [
      { key: 'Forest Zone Coverage', val: '18,420 sq. km' },
      { key: 'Canopy Density Filter', val: '> 40% Crown Cover' },
      { key: 'Cadastral Overlay Delay', val: '< 120ms' },
    ],
    codeTag: 'GEO-LAYER: FOREST_CORE_V2',
  },
  {
    title: '2. Cadastral Parcels',
    icon: '🗺️',
    stageName: 'LAND CADASTRAL',
    headline: 'Revenue Village & Sub-District Boundary Alignment',
    description: 'Cross-referencing revenue village cadastre against claimed forest parcels to pinpoint boundary overlap anomalies and disputed survey numbers.',
    chips: ['Revenue Cadastre', 'Khasra / Plot Numbers', 'Boundary Reconciliation', 'Hausdorff Matching'],
    metrics: [
      { key: 'Vector Parcels Indexed', val: '14,890 parcels' },
      { key: 'Area Variance Threshold', val: '± 0.25 Hectares' },
      { key: 'Match Confidence', val: '94.2% verified' },
    ],
    codeTag: 'CADASTRAL: PARCEL_CROSSMATCH',
  },
  {
    title: '3. FRA Claims',
    icon: '📋',
    stageName: 'CLAIMS INGESTION',
    headline: 'Individual & Community Forest Rights (IFR / CFR)',
    description: 'Digitized claim dossiers submitted through Gram Sabha resolutions, documenting historical possession, physical evidence, and boundary claims.',
    chips: ['Gram Sabha Resolutions', 'IFR / CFR / CR Formats', 'Elder Testimony', 'GPS Waypoints'],
    metrics: [
      { key: 'Active Monitored Claims', val: '4,781 dossiers' },
      { key: 'Community Rights (CFR)', val: '1,124 claims' },
      { key: 'Individual Rights (IFR)', val: '3,657 claims' },
    ],
    codeTag: 'INGESTION: STATUTORY_FRA_2006',
  },
  {
    title: '4. Data Synthesis',
    icon: '📊',
    stageName: 'DATA SYNTHESIS',
    headline: 'Inter-Departmental Intelligence Mesh',
    description: 'Harmonizing data from Ministry of Tribal Affairs (MoTA), Forest Department, and State Land Revenue authorities into a single unified telemetry pane.',
    chips: ['MoTA Data Feeds', 'State Revenue Records', 'Joint Forest Committees', 'Audit Trail'],
    metrics: [
      { key: 'Connected Jurisdictions', val: '36 Districts / 5 States' },
      { key: 'Sync Frequency', val: 'Continuous Telemetry' },
      { key: 'Data Completeness', val: '99.1%' },
    ],
    codeTag: 'SYNTHESIS: MULTI_AGENCY_MESH',
  },
  {
    title: '5. Explainable AI',
    icon: '🧠',
    stageName: 'EXPLAINABLE AI',
    headline: 'Risk Attribution, SLA Tracking & Anomaly Detection',
    description: 'Multi-factor risk scoring (0–100) isolating 180-day SLA delays, cadastral mismatches, and spatial clusters with 100% auditable factor breakdowns.',
    chips: ['180-Day SLA Watchdog', 'Spatial Density DBSCAN', 'Topological Mismatch', 'Normalized Weights'],
    metrics: [
      { key: 'High-Risk Claims Flagged', val: '18 high-urgency' },
      { key: 'SLA Overrun Alerts', val: '556 claims > 180d' },
      { key: 'Attribution Explainability', val: '100% White-Box' },
    ],
    codeTag: 'AI-ENGINE: RISK_FACTOR_BREAKDOWN',
  },
  {
    title: '6. Adjudication',
    icon: '⚖️',
    stageName: 'DECISION & TITLE',
    headline: 'Human-in-the-Loop Adjudication & Title Clearance',
    description: 'Equipping Sub-Divisional and District Level Committees with transparent evidence graphs and simulation tools for lawful, equitable title issuance.',
    chips: ['DLC Committee Approval', 'Evidence Graph Dossier', 'Title Deed Registration', 'Audit Log'],
    metrics: [
      { key: 'Approved Titles To Date', val: '297 titles' },
      { key: 'Projected Clearance Boost', val: '+31% via What-If' },
      { key: 'Appellate Challenge Rate', val: '< 1.2%' },
    ],
    codeTag: 'ADJUDICATION: DLC_SANCTION',
  },
];

interface PersonaData {
  id: string;
  name: string;
  icon: string;
  title: string;
  description: string;
  priorities: string[];
  kpis: { label: string; val: string }[];
  actionLabel: string;
  actionRoute: string;
}

const PERSONAS: PersonaData[] = [
  {
    id: 'dm',
    name: 'District Collector / DM',
    icon: '🏛️',
    title: 'Executive Administration & Inter-Departmental Oversight',
    description: 'Monitors overall district-level backlog velocity, inter-departmental consensus (Forest vs Revenue), and statutory 180-day SLA compliance across sub-divisions.',
    priorities: [
      'Pinpoint sub-divisional committees (SDLC) with severe backlog delays',
      'Resolve disputed inter-departmental boundary mismatches before final review',
      'Simulate staffing impacts to accelerate monthly title clearance velocity'
    ],
    kpis: [
      { label: 'Pending District Queue', val: '4,258' },
      { label: 'SLA Overdue Claims', val: '556' },
      { label: 'Average Resolution Time', val: '194d' },
      { label: 'Projected Clearance', val: '+31%' }
    ],
    actionLabel: 'Open Executive GIS Overview',
    actionRoute: '/overview'
  },
  {
    id: 'dfo',
    name: 'Divisional Forest Officer',
    icon: '🌲',
    title: 'Ecological Integrity & Boundary Ground-Truthing',
    description: 'Ensures claimed boundaries harmonize with reserved forest zones, sanctuary buffers, and legitimate community forest resource (CFR) protections.',
    priorities: [
      'Examine spatial clusters near protected wildlife corridors and sanctuaries',
      'Verify 446 boundary discrepancies against GPS satellite survey data',
      'Ensure Gram Sabha rights co-exist harmoniously with working plans'
    ],
    kpis: [
      { label: 'Flagged Mismatches', val: '446' },
      { label: 'Forest Clusters', val: '12 active' },
      { label: 'Spatial Verification', val: '92%' },
      { label: 'CFR Portfolios', val: '1,124' }
    ],
    actionLabel: 'Inspect Boundary Anomalies',
    actionRoute: '/anomalies'
  },
  {
    id: 'two',
    name: 'Tribal Welfare Officer',
    icon: '🤝',
    title: 'Rights Advocacy & Vulnerable Community Protection',
    description: 'Guarantees equitable rights recognition for Particularly Vulnerable Tribal Groups (PVTGs) and safeguards claimants against improper administrative rejections.',
    priorities: [
      'Review claims delayed past 180 days with no formal objection filed',
      'Verify physical possession evidence for traditional forest dwellers',
      'Accelerate Community Forest Resource (CFR) rights adjudication'
    ],
    kpis: [
      { label: 'PVTG Claims Monitored', val: '1,280' },
      { label: 'Titles Approved', val: '297' },
      { label: 'Rejection Appeal Rate', val: '< 2%' },
      { label: 'Fairness Index', val: '99.4%' }
    ],
    actionLabel: 'View Priority Queue',
    actionRoute: '/priority'
  },
  {
    id: 'sdlc',
    name: 'SDLC & Gram Sabha Verifier',
    icon: '👥',
    title: 'Field Investigation & Evidence Graph Transparency',
    description: 'Conducts ground inspection, verifies Gram Sabha evidence, and cross-references village land maps with elder testimonies and survey landmarks.',
    priorities: [
      'Inspect 5-stage statutory timelines for every flagged claim',
      'Explore topological relational Evidence Graphs for contested parcels',
      'Use FRA Copilot for instant precedent guidance and statutory queries'
    ],
    kpis: [
      { label: 'Field Verifications', val: '3,890' },
      { label: 'Gram Sabhas Active', val: '420' },
      { label: 'Evidence Density', val: 'High' },
      { label: 'Copilot Queries', val: 'Instant' }
    ],
    actionLabel: 'Ask FRA Decision Copilot',
    actionRoute: '/copilot'
  }
];

export const WelcomePage: React.FC = () => {
  const navigate = useNavigate();

  // Overview metrics state
  const [metrics, setMetrics] = useState<OverviewMetrics>({
    total_claims: 4781,
    approved: 297,
    pending: 4258,
    delayed: 556,
    high_risk: 18,
    record_mismatches: 446,
  });

  // Pipeline interactive step
  const [activeStep, setActiveStep] = useState(0);
  const [autoPlayPipeline, setAutoPlayPipeline] = useState(false);

  // Persona role state
  const [activePersonaId, setActivePersonaId] = useState('dm');
  const activePersona = PERSONAS.find(p => p.id === activePersonaId) || PERSONAS[0];

  // Live Query demo state
  const [activeDemoPrompt, setActiveDemoPrompt] = useState(0);

  const DEMO_PROMPTS = [
    {
      query: 'Which districts need immediate administrative intervention?',
      analysis: 'Mandla (Madhya Pradesh) and Gadchiroli (Maharashtra) exhibit high composite risk indices (>72/100). Mandla has 14 claims delayed beyond 180 days with concurrent cadastral boundary variance.',
      recommendation: 'Deploy joint Sub-Divisional Committee (SDLC) field reconciliation missions to Mandla before next DLC assembly.',
      basis: '4,781 synthetic claims · 36 districts · 5 states'
    },
    {
      query: 'Why is Mandla flagged as High Risk in the GIS view?',
      analysis: 'Weighted risk decomposition shows: 32% processing SLA delay (avg 214 days), 27% cadastral record mismatch, and 19% geographic clustering in non-demarcated forest fringes.',
      recommendation: 'Convene joint Forest-Revenue resurvey to validate Khasra boundary parcels #104-118.',
      basis: 'Mandla District Profile · 14 delayed dossiers · 8 boundary flags'
    },
    {
      query: 'What happens if we increase SDLC review capacity from 25 to 40 claims/week?',
      analysis: 'Simulated throughput increases by 60%. Projected 12-week backlog drops from 432 to 298 claims (-31.0%), reducing average claim resolution time by 32 days.',
      recommendation: 'Reallocate 2 field survey officers to top bottleneck sub-divisions to achieve statutory clearance target.',
      basis: 'VANRA Markov-chain capacity simulation model'
    }
  ];

  // Fetch overview data on mount
  useEffect(() => {
    fetchOverview()
      .then(data => {
        if (data) {
          setMetrics({
            total_claims: data.total_claims || 4781,
            approved: data.approved || 297,
            pending: data.under_review || data.pending || 4258,
            delayed: data.delayed || 556,
            high_risk: data.high_risk || 18,
            record_mismatches: data.record_mismatches || 446,
          });
        }
      })
      .catch(() => {
        // Safe demo fallback already set
      });
  }, []);

  // Pipeline auto-play interval
  useEffect(() => {
    if (!autoPlayPipeline) return;
    const timer = setInterval(() => {
      setActiveStep(prev => (prev + 1) % PIPELINE_STEPS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [autoPlayPipeline]);

  const currentStep = PIPELINE_STEPS[activeStep];

  return (
    <div className="welcome-page-root">
      {/* Background Forest Ecosystem Canvas */}
      <div className="welcome-hero-backdrop">
        <ForestEcosystem variant="banner" height={440} showContours={true} showDataNodes={true} />
      </div>

      <div className="welcome-container">
        {/* ------------------------------------------------------------------
            1. HERO SECTION
            ------------------------------------------------------------------ */}
        <section className="welcome-hero">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="welcome-status-chip">
              <span className="pulse-dot" />
              <span>PS-7 Civic Intelligence Suite · Live Geospatial Telemetry Active</span>
            </div>
          </motion.div>

          <motion.div
            className="welcome-title-row"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h1 className="welcome-hero-title">
              VANRA <span className="brand-gradient">Decision Suite</span>
            </h1>
            <p className="welcome-hero-tagline">
              From Scattered Claims to Explainable Decisions
            </p>
          </motion.div>

          <motion.p
            className="welcome-hero-desc"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            An AI-powered Decision Support System for Forest Rights Act (FRA) Monitoring.
            Seamlessly integrating satellite canopy GIS, cadastral revenue maps, and transparent
            algorithmic attribution to protect tribal livelihoods and accelerate lawful governance.
          </motion.p>

          <motion.div
            className="welcome-hero-actions"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link to="/overview" className="welcome-btn-primary">
              <span>🗺️</span> Enter Live GIS Dashboard
            </Link>

            <Link to="/copilot" className="welcome-btn-secondary">
              <span>✨</span> Ask FRA Copilot
            </Link>

            <Link to="/simulator" className="welcome-btn-secondary">
              <span>🧪</span> What-If Policy Simulator
            </Link>

            <button
              className="welcome-btn-ghost"
              onClick={() => {
                const el = document.getElementById('pipeline-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <span>⚙️</span> Explore Decision Lifecycle ↓
            </button>
          </motion.div>
        </section>

        {/* ------------------------------------------------------------------
            2. LIVE TELEMETRY BAR
            ------------------------------------------------------------------ */}
        <motion.div
          className="welcome-telemetry-strip"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <div className="telemetry-item">
            <div className="telemetry-value-wrap">
              <CountUp end={metrics.total_claims} className="telemetry-num" />
            </div>
            <span className="telemetry-label">Monitored Claims</span>
            <span className="telemetry-sub">36 Forest Districts</span>
          </div>

          <div className="telemetry-item">
            <div className="telemetry-value-wrap">
              <CountUp end={metrics.approved} className="telemetry-num primary" />
            </div>
            <span className="telemetry-label">Titles Approved</span>
            <span className="telemetry-sub">Gram Sabha Certified</span>
          </div>

          <div className="telemetry-item">
            <div className="telemetry-value-wrap">
              <CountUp end={metrics.pending} className="telemetry-num blue" />
            </div>
            <span className="telemetry-label">Under Active Review</span>
            <span className="telemetry-sub">SDLC / DLC Pipelines</span>
          </div>

          <div className="telemetry-item">
            <div className="telemetry-value-wrap">
              <CountUp end={metrics.delayed} className="telemetry-num warning" />
            </div>
            <span className="telemetry-label">SLA Delay Warnings</span>
            <span className="telemetry-sub">&gt; 180 Statutory Days</span>
          </div>

          <div className="telemetry-item">
            <div className="telemetry-value-wrap">
              <CountUp end={metrics.record_mismatches} className="telemetry-num critical" />
            </div>
            <span className="telemetry-label">Boundary Discrepancies</span>
            <span className="telemetry-sub">Cadastral Mismatch</span>
          </div>

          <div className="telemetry-item">
            <div className="telemetry-value-wrap">
              <span className="telemetry-num primary">98.4%</span>
            </div>
            <span className="telemetry-label">AI Explainability</span>
            <span className="telemetry-sub">White-Box Attribution</span>
          </div>
        </motion.div>

        {/* ------------------------------------------------------------------
            3. INTERACTIVE DECISION LIFECYCLE (FOREST -> LAND -> CLAIMS -> DATA -> AI -> DECISION)
            ------------------------------------------------------------------ */}
        <section id="pipeline-section" className="welcome-section">
          <div className="section-header">
            <div className="section-header-title-group">
              <span className="section-tag">Interactive Architecture</span>
              <h2 className="section-title">The VANRA Decision Lifecycle</h2>
              <p className="section-subtitle">
                How satellite imagery, revenue cadastre, and statutory claim evidence converge into transparent decisions.
              </p>
            </div>

            <button
              className="welcome-btn-ghost"
              style={{ fontSize: 12, padding: '6px 14px' }}
              onClick={() => setAutoPlayPipeline(!autoPlayPipeline)}
            >
              {autoPlayPipeline ? '⏸ Pause Auto-Tour' : '▶ Auto-Play Tour'}
            </button>
          </div>

          <div className="pipeline-interactive-box">
            {/* 6 Step Interactive Stepper Track */}
            <div className="pipeline-stepper-track">
              {PIPELINE_STEPS.map((step, idx) => {
                const isActive = activeStep === idx;
                return (
                  <div
                    key={idx}
                    className={`pipeline-step-node ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      setActiveStep(idx);
                      setAutoPlayPipeline(false);
                    }}
                  >
                    <span className="step-node-number">0{idx + 1}</span>
                    <span className="step-node-icon">{step.icon}</span>
                    <span className="step-node-label">{step.title}</span>
                  </div>
                );
              })}
            </div>

            {/* Active Step Explainer Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                className="pipeline-active-detail-card"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.25 }}
              >
                <div className="detail-card-left">
                  <span className="detail-code-badge">{currentStep.codeTag}</span>
                  <h4>
                    <span>{currentStep.icon}</span> {currentStep.headline}
                  </h4>
                  <p>{currentStep.description}</p>
                  <div className="detail-chips-row">
                    {currentStep.chips.map((chip, cIdx) => (
                      <span key={cIdx} className="detail-meta-chip">
                        ✓ {chip}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="detail-card-right">
                  <span className="detail-code-badge">ACTIVE TELEMETRY ATTRIBUTES</span>
                  {currentStep.metrics.map((m, mIdx) => (
                    <div key={mIdx} className="detail-stat-row">
                      <span className="detail-stat-key">{m.key}</span>
                      <span className="detail-stat-val">{m.val}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* ------------------------------------------------------------------
            4. INTERACTIVE PERSONA ROLE SWITCHER
            ------------------------------------------------------------------ */}
        <section className="welcome-section">
          <div className="section-header">
            <div className="section-header-title-group">
              <span className="section-tag">Role-Based Intelligence</span>
              <h2 className="section-title">Tailored for Administrative Stakeholders</h2>
              <p className="section-subtitle">
                Select your office to explore prioritized workflows and decision-support views.
              </p>
            </div>
          </div>

          <div className="persona-switcher-box">
            {/* Persona Tabs Header */}
            <div className="persona-tabs-header">
              {PERSONAS.map(p => (
                <button
                  key={p.id}
                  className={`persona-tab-btn ${activePersonaId === p.id ? 'active' : ''}`}
                  onClick={() => setActivePersonaId(p.id)}
                >
                  <span>{p.icon}</span>
                  <span>{p.name}</span>
                </button>
              ))}
            </div>

            {/* Persona Content Grid */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activePersonaId}
                className="persona-content-grid"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {/* Left: Role description and focus priorities */}
                <div className="persona-card-focus">
                  <h4>
                    <span>{activePersona.icon}</span> {activePersona.title}
                  </h4>
                  <p>{activePersona.description}</p>

                  <h5 style={{ fontSize: 12, textTransform: 'uppercase', color: '#1B5E43', marginBottom: 8 }}>
                    Recommended Office Priorities:
                  </h5>
                  <ul className="persona-priorities-list">
                    {activePersona.priorities.map((item, idx) => (
                      <li key={idx} className="persona-priority-item">
                        <span className="bullet-check">✦</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right: Key metrics & Launch CTA */}
                <div className="persona-card-metrics">
                  <div>
                    <h4>Key Telemetry at a Glance</h4>
                    <div className="persona-kpi-row">
                      {activePersona.kpis.map((kpi, kIdx) => (
                        <div key={kIdx} className="persona-mini-kpi">
                          <span className="val">{kpi.val}</span>
                          <span className="lbl">{kpi.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Link to={activePersona.actionRoute} className="persona-launch-btn">
                    <span>{activePersona.actionLabel}</span>
                    <span>→</span>
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* ------------------------------------------------------------------
            5. CORE SUITE PILLARS (INTERACTIVE CARDS)
            ------------------------------------------------------------------ */}
        <section className="welcome-section">
          <div className="section-header">
            <div className="section-header-title-group">
              <span className="section-tag">Platform Modules</span>
              <h2 className="section-title">The VANRA Intelligence Suite</h2>
              <p className="section-subtitle">
                Seven interconnected tools designed for transparent, accountable forest rights monitoring.
              </p>
            </div>
          </div>

          <div className="suite-pillars-grid">
            {/* Card 1: GIS Overview */}
            <div className="suite-card">
              <div className="suite-card-top">
                <div className="suite-card-badge-row">
                  <div className="suite-card-icon-wrap">🗺️</div>
                  <span className="suite-card-status-badge">Living Map</span>
                </div>
                <h3>Geospatial Overview</h3>
                <p>
                  Dynamic multi-layer GIS with district choropleths, risk filters, smooth camera flight animations, and sub-district health indices.
                </p>
              </div>
              <div className="suite-card-bottom">
                <span className="suite-card-feature-tag">36 Districts · 5 States</span>
                <Link to="/overview" className="suite-card-action-link">
                  Open Map →
                </Link>
              </div>
            </div>

            {/* Card 2: Claims Lifecycle */}
            <div className="suite-card">
              <div className="suite-card-top">
                <div className="suite-card-badge-row">
                  <div className="suite-card-icon-wrap">📋</div>
                  <span className="suite-card-status-badge">Statutory Flow</span>
                </div>
                <h3>Claims Investigation</h3>
                <p>
                  Comprehensive claim records featuring 5-stage statutory lifecycle tracking, elapsed days per committee, and field evidence attachments.
                </p>
              </div>
              <div className="suite-card-bottom">
                <span className="suite-card-feature-tag">4,781 Claims Database</span>
                <Link to="/claims" className="suite-card-action-link">
                  View Claims →
                </Link>
              </div>
            </div>

            {/* Card 3: Evidence Graph & Anomalies */}
            <div className="suite-card">
              <div className="suite-card-top">
                <div className="suite-card-badge-row">
                  <div className="suite-card-icon-wrap">⚠️</div>
                  <span className="suite-card-status-badge">Explainable AI</span>
                </div>
                <h3>Anomalies &amp; Evidence</h3>
                <p>
                  Relational topological evidence graph answering <em>"Why did the AI flag this claim?"</em> with parcel boundaries and forest zone overlays.
                </p>
              </div>
              <div className="suite-card-bottom">
                <span className="suite-card-feature-tag">100% Auditable</span>
                <Link to="/anomalies" className="suite-card-action-link">
                  Inspect Graph →
                </Link>
              </div>
            </div>

            {/* Card 4: Priority Queue */}
            <div className="suite-card">
              <div className="suite-card-top">
                <div className="suite-card-badge-row">
                  <div className="suite-card-icon-wrap">⚡</div>
                  <span className="suite-card-status-badge">SLA Optimization</span>
                </div>
                <h3>AI Priority Queue</h3>
                <p>
                  Rank-ordered review queue grouping dossiers by urgency, SLA violation hazard, and specific recommended administrative actions.
                </p>
              </div>
              <div className="suite-card-bottom">
                <span className="suite-card-feature-tag">18 Critical Claims</span>
                <Link to="/priority" className="suite-card-action-link">
                  Review Queue →
                </Link>
              </div>
            </div>

            {/* Card 5: What-If Simulator */}
            <div className="suite-card">
              <div className="suite-card-top">
                <div className="suite-card-badge-row">
                  <div className="suite-card-icon-wrap">🧪</div>
                  <span className="suite-card-status-badge">Policy Simulation</span>
                </div>
                <h3>What-If Simulator</h3>
                <p>
                  Adjust investigation capacity and priority thresholds to model backlog clearance velocity and turnaround reductions in real time.
                </p>
              </div>
              <div className="suite-card-bottom">
                <span className="suite-card-feature-tag">Markov Modelled</span>
                <Link to="/simulator" className="suite-card-action-link">
                  Run Simulation →
                </Link>
              </div>
            </div>

            {/* Card 6: FRA Copilot */}
            <div className="suite-card">
              <div className="suite-card-top">
                <div className="suite-card-badge-row">
                  <div className="suite-card-icon-wrap">✨</div>
                  <span className="suite-card-status-badge">Civic Analyst</span>
                </div>
                <h3>FRA Decision Copilot</h3>
                <p>
                  Government decision-support assistant delivering 3-part structured reasoning: Analysis, Actionable Recommendation, and Underlying Data Basis.
                </p>
              </div>
              <div className="suite-card-bottom">
                <span className="suite-card-feature-tag">Always Active</span>
                <Link to="/copilot" className="suite-card-action-link">
                  Chat Analyst →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------
            6. EMBEDDED LIVE AI INQUIRY DEMO BOX
            ------------------------------------------------------------------ */}
        <section className="welcome-section">
          <div className="welcome-demo-inquiry-box">
            <div className="demo-inquiry-header">
              <h3>
                <span>✨</span> Instant Civic AI Inquiry Preview
              </h3>
              <p>
                Click a sample inquiry below to preview how VANRA synthesizes multi-agency geospatial and SLA data into actionable governance intelligence.
              </p>
            </div>

            <div className="demo-prompt-pills-row">
              {DEMO_PROMPTS.map((p, pIdx) => (
                <button
                  key={pIdx}
                  className={`demo-prompt-pill ${activeDemoPrompt === pIdx ? 'active' : ''}`}
                  onClick={() => setActiveDemoPrompt(pIdx)}
                >
                  {p.query}
                </button>
              ))}
            </div>

            <div className="demo-answer-container">
              <div className="demo-answer-row">
                <span className="demo-answer-label">1. ANALYSIS &amp; PATTERN CORRELATION</span>
                <p className="demo-answer-text">{DEMO_PROMPTS[activeDemoPrompt].analysis}</p>
              </div>

              <div className="demo-answer-row">
                <span className="demo-answer-label">2. ADMINISTRATIVE RECOMMENDATION</span>
                <p className="demo-answer-text">{DEMO_PROMPTS[activeDemoPrompt].recommendation}</p>
              </div>

              <div className="demo-answer-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <span style={{ fontSize: 11, color: '#a7f3d0' }}>
                  📊 Basis: {DEMO_PROMPTS[activeDemoPrompt].basis}
                </span>

                <Link
                  to="/copilot"
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: '#ffffff',
                    textDecoration: 'none',
                    background: 'rgba(255,255,255,0.15)',
                    padding: '4px 12px',
                    borderRadius: 8
                  }}
                >
                  Ask full inquiry in FRA Copilot →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------
            7. CIVIC TRUST & STATUTORY SAFEGUARDS
            ------------------------------------------------------------------ */}
        <section className="welcome-section" style={{ marginBottom: 0 }}>
          <div className="section-header" style={{ marginBottom: 12 }}>
            <div className="section-header-title-group">
              <span className="section-tag">Governance &amp; Trust</span>
              <h2 className="section-title" style={{ fontSize: 20 }}>
                Constitutional &amp; Ethical Safeguards
              </h2>
            </div>
          </div>

          <div className="civic-trust-strip">
            <div className="trust-item-card">
              <span className="icon">🛡️</span>
              <h5>Human-in-the-Loop</h5>
              <p>AI generates decision-support recommendations only; final authority rests exclusively with statutory committees.</p>
            </div>

            <div className="trust-item-card">
              <span className="icon">📜</span>
              <h5>FRA 2006 Alignment</h5>
              <p>Workflows strictly follow the 5-stage statutory framework prescribed by the Forest Rights Act of 2006.</p>
            </div>

            <div className="trust-item-card">
              <span className="icon">🔒</span>
              <h5>Tribal Data Sovereignty</h5>
              <p>Claimant personal identities (PII) are strictly anonymized across all public analysis layers.</p>
            </div>

            <div className="trust-item-card">
              <span className="icon">⚖️</span>
              <h5>White-Box Transparency</h5>
              <p>Zero black-box decisions. Every risk score is decomposable into mathematical factor weights.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default WelcomePage;
