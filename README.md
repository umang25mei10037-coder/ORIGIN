<<<<<<< HEAD


**Made for Origin Hackathon Organised by Data Sicence Club of VIT Bhopal University**

**Team Name: MAVERICK TRIO**

**MUMBER NAMES: UMANG PATEL, VARUN VAISH, MUNNA BABU ANSARI**
# VANRA

### Visual AI Network for Rights Administration
> *"From scattered claims to explainable decisions."*

---

## Overview

**VANRA (Visual AI Network for Rights Administration)** is an AI-powered, geospatial decision-support platform designed to monitor and accelerate implementation of the **Forest Rights Act (FRA), 2006**. 

Rather than replacing human officers or statutory committees, VANRA synthesizes fragmented land records, spatial coordinates, and processing stage histories into a unified civic intelligence dashboard. It highlights where administrative backlogs exist, explains the exact factors driving risk, and prioritizes which cases require field verification first.

---

## Problem Statement

**Problem Statement 7 (PS-7):** *AI-powered Decision Support System for Forest Rights Act (FRA) Monitoring.*

Across millions of Individual (IFR) and Community (CFR) claims:
- Records remain scattered across village Gram Sabhas, Sub-Divisional Committees (SDLC), and district registries.
- Severe processing delays (frequently exceeding 180 days) go unnoticed until disputes escalate.
- Boundary discrepancies between historical forest boundaries and revenue survey cadastres create spatial overlap disputes.
- Authorities lack an explainable decision system to triage which claims need urgent joint field verification.

---

## Solution

VANRA solves this through a six-stage civic intelligence flow:

$$\text{FOREST} \longrightarrow \text{LAND} \longrightarrow \text{CLAIMS} \longrightarrow \text{DATA} \longrightarrow \text{AI} \longrightarrow \text{DECISION}$$

1. **GIS Visualization:** Interactive living map connecting national aggregates with district centroids and parcel coordinates.
2. **Deterministic & ML Anomaly Detection:** Real-time screening for statutory delay thresholds, area discrepancies, and spatial density clusters.
3. **Explainable Risk Scoring:** Transparent 0–100 index broken down into exact factor contributions.
4. **Relational Evidence Graph:** Graph topology linking claims, land parcels, cadastral surveys, and forest ranges.
5. **AI Prioritization & Early Warning:** Dynamically sorted queues showing what to investigate first and predictive bottleneck alerts.
6. **Policy Simulation & Analyst Copilot:** What-If scenario forecasting and natural language analytical Q&A.

---

## Key Features

- **FRA Intelligence Map:** Interactive Leaflet GIS with risk-coded markers, boundary glow transitions, dynamic clustering, and filter layers (*Delayed*, *Mismatches*, *Clusters*, *Critical*).
- **District Intelligence Panel:** District Implementation Health Index (0–100), AI analytical summaries, factor attribution bars, and localized claim distributions.
- **"Why is this District Flagged?" Panel:** Explainable modal featuring ASCII-style progress meters (`████████░░ 78%`), normalized factor breakdowns, and non-judicial administrative interpretation.
- **AI Anomaly Detection Engine:** Hybrid detection classifying *Processing Delays*, *Record Mismatches*, *Spatial Clusters*, *Workflow Bottlenecks*, and *Unusual Parcel Acreage*.
- **Claim Investigation Portfolio:** Detailed dossier with statutory timeline tracking (*Claim Submitted → Field Verification → SDLC Review → District Review → Final Decision*) and duration tracking.
- **Relational Evidence Graph:** Visual graph structure (*CLAIM ── LAND PARCEL ── LAND RECORD*, *DISTRICT ── FOREST ZONE*) with interactive node highlighting and relation insights.
- **AI Priority Queue:** Multi-tier ranked queue with smooth Framer Motion layout reordering, structured reasons bullets, and recommended action boxes.
- **Early Warning System:** Environmental intelligence cards with subtle animated warning rings alerting officials before delay thresholds breach.
- **What-If Decision Simulator:** Sensitivity lab featuring interactive capacity sliders, animated live number projections, and clearance forecasts.
- **FRA Copilot:** Dedicated government analyst assistant providing structured reasoning (*ANALYSIS → RECOMMENDATION → DATA BASIS*) without generative hallucination.

---

## Technology Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite 6 / 8
- **Mapping & GIS:** Leaflet 1.9 & React-Leaflet
- **Data Visualization:** Recharts
- **Animations:** Framer Motion (page transitions, layout reordering)
- **Styling:** Custom Vanilla CSS design system with subtle nature/forest ecosystem micro-animations (`index.css` & `polish.css`)

### Backend
- **Framework:** FastAPI (Python 3.11)
- **Server:** Uvicorn ASGI
- **Data Serialization:** Pydantic models

### Analytical Store & Machine Learning
- **Database:** SQLite relational engine (`data/vanra.db`)
- **Machine Learning:** `scikit-learn` Isolation Forest for unsupervised outlier detection
- **Rule Engine:** Deterministic statutory business rules

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER (React 18)                  │
│  Leaflet GIS • Framer Motion • Recharts • Forest Ecosystem  │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP REST (JSON)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   API GATEWAY (FastAPI)                     │
│    /api/overview   /api/districts   /api/claims   /api/what-if│
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
┌──────────────────────────────┐    ┌─────────────────────────┐
│     ML / DECISION ENGINE     │    │      DATABASE LAYER     │
│  • Deterministic SLA Rules   │    │  SQLite (data/vanra.db) │
│  • Isolation Forest (sklearn)│◄───┤  • 4,781 synthetic claims│
│  • Explainability Synthesizer│    │  • 36 district records  │
└──────────────────────────────┘    └─────────────────────────┘
```

---

## Data Notice

> **IMPORTANT:** This application is a prototype decision-support tool. All **4,781 claim records, applicant files, and parcel coordinates are synthetic demonstration data** modeled after regional aggregate statistics published by the Ministry of Tribal Affairs (MoTA). **This is NOT official government data** and does not expose private citizen personally identifiable information (PII).

---

## Anomaly Detection Methodology

VANRA uses a hybrid detection framework combining deterministic statutory thresholds with statistical anomaly detection:

1. **Processing Delay (32% Weight):** Claims exceeding the statutory 180-day SLA window without formal resolution.
2. **Land Record Mismatch (27% Weight):** Variance between Gram Sabha claimed acreage and recorded revenue cadastral survey.
3. **Geographic Cluster (19% Weight):** Abnormal spatial density of high-risk claims clustered along sensitive reserve forest tracts.
4. **Area Anomaly (12% Weight):** Claim parcel size deviating significantly from village distribution or statutory ceilings.
5. **Workflow Bottleneck (10% Weight):** Prolonged queue stagnation at the Sub-Divisional Committee (SDLC) stage.

---

## Explainable Risk Score (0–100)

Every claim and district is assigned a score from **0 (Lowest Risk / Optimal Health)** to **100 (Highest Risk / Urgent Review)**:
- **0–35 (Minimal / Low Risk):** Routine processing within standard timelines.
- **36–64 (Medium Risk):** Approaching review threshold or minor cadastre variance.
- **65–79 (High Risk):** Exceeds 180 days or exhibits confirmed cadastral discrepancy.
- **80–100 (Critical Attention):** Multi-factor compound failure requiring joint field verification.

---

## Role of AI & LLMs

- **What AI Does in VANRA:** AI detects statistical outliers (Isolation Forest), correlates spatial coordinates, and synthesizes factor attribution.
- **What LLM Does:** Generates clear, non-technical natural language summaries and answers analyst queries in FRA Copilot.
- **What LLM DOES NOT Do:** The LLM is **NOT** the primary anomaly detector, **NOT** an automated title adjudicator, and **NOT** a replacement for statutory committees.

---

## Installation

### Prerequisites
- Node.js 18+ and `npm`
- Python 3.10 or 3.11 with `pip`

### Step 1: Clone and Set Up Backend
```bash
# Navigate to workspace
cd "d:/ORIGIN HACKATHON"

# Install backend dependencies
pip install -r backend/requirements.txt
```

### Step 2: Set Up Frontend
```bash
# Navigate to frontend
cd frontend

# Install frontend packages
npm install
```

---

## Running the Project

### Start FastAPI Backend
```bash
# From repository root
python backend/main.py
# Backend runs at http://localhost:8000 (Swagger docs at http://localhost:8000/docs)
```

### Start Vite Frontend
```bash
# In frontend directory
npm run dev
# Frontend runs at http://localhost:5173
```

---

## Environment Variables

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `BACKEND_HOST` | `0.0.0.0` | Host interface for FastAPI server |
| `BACKEND_PORT` | `8000` | Port for FastAPI server |
| `VITE_API_URL` | `http://localhost:8000` | Base URL used by React frontend to reach REST API |
| `DATABASE_PATH` | `./data/vanra.db` | Local file path to SQLite analytical database |
| `LLM_API_KEY` | *(Optional)* | Optional external API key; deterministic fallback active |

---

## Project Structure

```
d:/ORIGIN HACKATHON/
├── .env.example                  # Environment configuration template
├── README.md                     # Comprehensive project guide
├── data/
│   └── vanra.db                  # Pre-seeded SQLite database (4,781 claims)
├── docs/
│   ├── ARCHITECTURE.md           # Deep dive into system design & data flow
│   ├── AI_METHODOLOGY.md         # Anomaly detection & explainability formulation
│   ├── DATA_DICTIONARY.md        # Database schema & field documentation
│   ├── DATA_SOURCES.md           # External GIS provenance & licensing
│   ├── DEMO_SCRIPT.md            # 3–5 minute presentation sequence
│   └── SECURITY_AND_ETHICS.md    # Ethical AI principles & governance safeguards
├── backend/
│   ├── main.py                   # FastAPI server, REST API endpoints & Copilot
│   ├── generate_data.py          # Synthetic dataset generator
│   └── requirements.txt          # Python dependencies
└── frontend/
    ├── index.html                # Application root with Inter typography
    ├── package.json              # Frontend scripts & dependencies
    └── src/
        ├── App.tsx               # Route transitions & layout wrapper
        ├── index.css             # Core styling & design tokens
        ├── config/
        │   └── appConfig.ts      # Centralized metadata & team information
        ├── styles/
        │   └── polish.css        # Forest ecosystem animations & civic UI polish
        ├── components/
        │   ├── Header.tsx        # Top navigation with mountain visual & AI status
        │   ├── Footer.tsx        # Dark forest green footer with metadata
        │   ├── AiStatusIndicator.tsx # Animated scanning pipeline modal
        │   ├── AboutModal.tsx    # Problem, solution, and decision flow modal
        │   ├── ForestEcosystem.tsx # Reusable SVG mountain & particle animation
        │   ├── BrandedLoader.tsx # Branded mountain loading state
        │   ├── EmptyForestState.tsx # Meaningful empty state component
        │   ├── WhyFlagged.tsx    # Explainable factor breakdown modal
        │   ├── ClaimDetail.tsx   # Dossier, statutory timeline & Evidence Graph
        │   └── CountUp.tsx       # Smooth number animation utility
        ├── pages/
        │   ├── Dashboard.tsx     # Living map, KPI cards & district intelligence
        │   ├── ClaimsPage.tsx    # Filterable claims audit registry
        │   ├── AnomaliesPage.tsx # Anomaly distribution & signal explorer
        │   ├── PriorityPage.tsx  # AI Priority Queue with animated reordering
        │   ├── EarlyWarningPage.tsx # Predictive threshold signal cards
        │   ├── SimulatorPage.tsx # What-If decision sensitivity lab
        │   └── CopilotPage.tsx   # Structured civic analyst assistant
        └── services/
            └── api.ts            # REST API client
```

---

## API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/overview` | National summary statistics, approval rates, and delay distributions |
| `GET` | `/api/districts` | List of 36 monitored districts with health scores and coordinates |
| `GET` | `/api/districts/{name}` | In-depth factor breakdown and top risk claims for a district |
| `GET` | `/api/claims/map/points` | Lightweight geospatial points for GIS rendering with layer filters |
| `GET` | `/api/claims` | Paginated and filterable claims list |
| `GET` | `/api/claims/{id}` | Complete claim investigation portfolio |
| `GET` | `/api/evidence/{id}` | Relational graph nodes and edges for claim |
| `GET` | `/api/priority` | Ordered queue of claims and districts requiring immediate review |
| `GET` | `/api/early-warning` | Active threshold warnings and backlog growth signals |
| `POST` | `/api/what-if` | Simulation endpoint projecting backlog clearance from capacity inputs |
| `POST` | `/api/copilot` | Natural language analytical Q&A grounded in application data |

---

## 3–5 Minute Hackathon Demo Flow

1. **Overview (`/`):** View national living map, modern KPI cards with CountUp animation, and click *"Run Scan"* on the AI indicator.
2. **District Selection:** Click **Mandla** on the map; watch camera flyTo zoom, boundary glow highlight, and side intelligence panel slide in.
3. **"Why is this district flagged?":** Click to show the explainable factor breakdown (Processing Delay 32%, Record Mismatch 27%) and qualified AI context.
4. **Claim Investigation (`ClaimDetail`):** Open top priority claim `FRA-MP-00482`. Show the **5-stage statutory timeline** and switch to the **Evidence Graph** to inspect relational connections.
5. **Priority Queue (`/priority`):** Demonstrate ranked claims and switch urgency filters to show smooth Framer Motion layout reordering.
6. **Early Warning (`/early-warning`):** Show environmental intelligence cards with subtle animated warning rings.
7. **What-If Simulator (`/simulator`):** Move capacity slider from 20 to 45 claims/week and watch animated clearance projections live.
8. **FRA Copilot (`/copilot`):** Query *"Why is Mandla high risk?"* to reveal structured reasoning (*ANALYSIS → RECOMMENDATION → DATA BASIS*).
9. **About & Footer:** Open About modal to review the core flow: `WHERE → WHAT → WHY → HOW URGENT → WHAT SHOULD I DO?`.

---

## Limitations

- **Synthetic Data:** The system operates on synthetic demonstration data modeled after regional patterns, not live production NIC registries.
- **Not a Judicial Determinator:** Algorithmic outputs are non-binding decision-support signals and cannot reject or approve land titles.
- **Human-in-the-Loop:** All flagged discrepancies require field verification by joint Forest & Revenue survey officers.
- **Modelled Projections:** What-If scenario forecasts are illustrative sensitivity calculations based on constant velocity assumptions.

---

## Future Scope

1. **Official NIC / State Portal Integration:** Direct API ingestion from state revenue management portals and Bhuvan GIS servers.
2. **Satellite Imagery & Temporal Monitoring:** Automated change-detection via Sentinel-2 and Landsat imagery to verify historical forest land occupation prior to December 13, 2005.
3. **Field Officer Mobile App:** Offline-capable GPS polygon mapping application allowing Gram Sabha FRCs to sync ground-truth verification data.
4. **Multilingual Interface:** Support for Hindi, Gondi, Santhali, and regional languages for accessible village-level engagement.
5. **Role-Based Access Control (RBAC):** Strict permissions distinguishing State Collectors, SDLC officers, and Gram Sabha members.

---

## License & Credits

- **Built by:** Maverick Trio (Student of VIT Bhopal)
- **Affiliation:** Data Science Club of VIT Bhopal · Origin Hackathon 2026
- **LinkedIn:** [Umang Patel](https://www.linkedin.com/in/umang-patel-bb7720363/)
- **GitHub:** [GitHub Profile / Organization](https://github.com/umang25mei10037-coder)
- **Problem Statement:** PS-7 (AI-powered Decision Support System for Forest Rights Act Monitoring)
- **Map Data:** © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors
=======
# ORIGIN
>>>>>>> 68851175929a176011130919f1672237c6fd099e
