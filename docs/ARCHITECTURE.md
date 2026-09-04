# VANRA Architecture Documentation
**Visual AI Network for Rights Administration**
*PS-7: AI-powered Decision Support System for Forest Rights Act (FRA) Monitoring*

---

## 1. High-Level Architecture

VANRA is organized as a decoupled, modern civic-tech intelligence platform designed for high performance, explainability, and responsive GIS exploration.

```
┌──────────────────────────────────────────────────────────────────────────┐
│                             CLIENT LAYER                                 │
│  React 18 • TypeScript • Vite • Leaflet GIS • Recharts • Framer Motion  │
│                                                                          │
│  [Overview GIS]  [Claims Explorer]  [Anomalies]  [Priority Queue]       │
│  [Early Warning] [What-If Simulator] [FRA Copilot] [Evidence Graph]      │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │ JSON / HTTP REST
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                           API GATEWAY / BACKEND                          │
│                   FastAPI (Python 3.11) • Uvicorn                        │
│                                                                          │
│  /api/overview            /api/districts            /api/claims          │
│  /api/claims/map/points   /api/evidence/{id}        /api/priority        │
│  /api/early-warning       /api/what-if              /api/copilot         │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
           ┌─────────────────────────┴─────────────────────────┐
           ▼                                                   ▼
┌──────────────────────────────────────┐    ┌──────────────────────────────┐
│       ANALYTICAL DECISION ENGINE     │    │       DATABASE LAYER         │
│  • Deterministic SLA & Area Rules   │    │  SQLite (vanra.db)           │
│  • Scikit-learn Isolation Forest     │◄───┤  • 4,781 synthetic claims   │
│  • Factor Risk Attribution (0–100)   │    │  • 36 district health scores │
│  • Sensitivity Projection Engine     │    │  • Audit timeline logs       │
└──────────────────────────────────────┘    └──────────────────────────────┘
```

---

## 2. Component Breakdown

### Frontend (Client Layer)
- **Framework:** React 18 with TypeScript, bundled using Vite.
- **Geospatial Visualization:** Leaflet and `react-leaflet` with OpenStreetMap tile rendering. Uses canvas rendering for map points to ensure fluid 60fps pan and zoom across 5,000+ coordinates.
- **Micro-Animations & Transitions:** Framer Motion for staggered page transitions (200–250ms), layout reordering in the Priority Queue, and smooth drawer/modal reveals.
- **Design System:** Vanilla CSS with custom tokens in `index.css` and `polish.css`. Styled according to modern government/civic standards (Inter typography, nature-inspired palette, subtle forest/mountain silhouettes, zero cyberpunk/neon aesthetics).
- **Configuration:** Centralized team, metadata, and data summary config in `frontend/src/config/appConfig.ts`.

### Backend & API Services (FastAPI)
- **Framework:** FastAPI with asynchronous request handlers.
- **Routing Modules:**
  - `GET /api/overview`: National KPI summary, approval ratios, delay indices, risk distributions.
  - `GET /api/districts`: District summary list with composite health scores and coordinates.
  - `GET /api/districts/{name}`: District-specific drilldown with 5-factor breakdown, processing curves, and priority claims.
  - `GET /api/claims/map/points`: Lightweight spatial coordinates and risk ratings for GIS visualization.
  - `GET /api/claims`: Searchable, filterable audit registry with pagination.
  - `GET /api/claims/{id}`: Detailed claim dossier including workflow duration and anomaly reasons.
  - `GET /api/evidence/{id}`: Graph topology nodes and edges linking Claim → Land Parcel → Land Record → District → Forest Zone.
  - `GET /api/priority`: Multi-factor prioritized rankings for claims and administrative districts.
  - `GET /api/early-warning`: Predictive threshold signals for backlog growth and area variances.
  - `POST /api/what-if`: Interactive simulation evaluating capacity increases and backlog clearance.
  - `POST /api/copilot`: Structured query analyst synthesizing decision-support findings.

### Machine Learning & Risk Engine
- **Deterministic Business Rule Engine:**
  - Evaluates statutory 180-day processing thresholds.
  - Detects parcel area discrepancies between Gram Sabha submissions and cadastral records.
  - Identifies multi-claim spatial clustering in non-cadastral forest tracts.
- **Unsupervised Anomaly Detection:**
  - `scikit-learn` Isolation Forest trained on multidimensional claim features (claimed acreage, elapsed timeline, committee stage duration, survey status).
- **Composite Risk Scoring (0–100):**
  - Synthesizes rule contributions and outlier probability into an explainable index.
  - Strictly presents findings as administrative decision support rather than legal conclusions.

### Data Storage (SQLite)
- Relational schema in `data/vanra.db` indexing:
  - `claims`: Core claim registry, demographics, coordinates, stage, dates, and risk scores.
  - `districts`: District geospatial centers, state mapping, and aggregate metrics.
  - `anomalies`: Flagged signals with severity ratings and contributing point weights.
  - `timeline_events`: Historical workflow transitions with duration tracking per committee.

---

## 3. Data Flow: From Scattered Claims to Explainable Decisions

1. **Ingestion & Indexing:** Multimodal claim filings and cadastral records are mapped into structured relational tables.
2. **Deterministic & ML Analysis:** Each claim is scored against SLA thresholds, area distributions, and spatial density.
3. **GIS Aggregation:** Coordinates and health scores are projected onto the interactive national map.
4. **Explainable Attribution:** When an official queries why a district or claim is flagged, the engine returns exact contributing percentages (Processing Delay, Record Mismatch, Cluster Density).
5. **Actionable Prioritization:** The Priority Queue and Early Warning system guide officers where to focus field inspections first.
