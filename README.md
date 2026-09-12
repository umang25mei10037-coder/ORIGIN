# 🌲 VANRA

### Visual AI Network for Rights Administration

<p align="center">

**From scattered claims to explainable decisions.**

An AI-powered geospatial decision-support platform for monitoring and accelerating the implementation of the **Forest Rights Act (FRA), 2006**.

<br/>

[![Built for Hackathon](https://img.shields.io/badge/Built%20For-Origin%20Hackathon-111827?style=for-the-badge)](#)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge\&logo=react\&logoColor=white)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge\&logo=typescript\&logoColor=white)](#)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?style=for-the-badge\&logo=fastapi\&logoColor=white)](#)
[![Scikit Learn](https://img.shields.io/badge/ML-Scikit--Learn-F7931E?style=for-the-badge\&logo=scikit-learn\&logoColor=white)](#)
[![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?style=for-the-badge\&logo=sqlite\&logoColor=white)](#)

</p>

---

## 🏆 Origin Hackathon

**Organised by:** Data Science Club, VIT Bhopal University

### 👥 Team — MAVERICK TRIO

| Member                | Role                    |
| --------------------- | ----------------------- |
| **Umang Patel**       | Product & Development   |
| **Varun Vaish**       | Development & Analytics |
| **Munna Babu Ansari** | Development & Research  |

---

# 🎯 The Problem

The implementation of the **Forest Rights Act (FRA), 2006** involves large volumes of Individual Forest Rights (IFR) and Community Forest Rights (CFR) claims.

But critical information is often distributed across multiple administrative layers.

### Existing challenges

```text
Village Records
      ↓
Gram Sabha
      ↓
SDLC
      ↓
District Registry
      ↓
Forest / Revenue Records
```

This creates several problems:

* 📂 Fragmented records
* ⏳ Long processing delays
* 🗺️ Boundary and cadastral discrepancies
* 📊 Limited district-level visibility
* 🚨 Difficult prioritisation of high-risk claims
* 🔍 Lack of explainable analytical signals

The result?

> **Officials can see the backlog — but often cannot immediately see WHY it exists, WHERE it is concentrated, or WHAT should be investigated first.**

---

# 💡 Our Solution — VANRA

**VANRA** transforms fragmented administrative information into a unified **civic intelligence system**.

Instead of replacing statutory authorities, VANRA acts as a **decision-support layer** that helps officials:

```text
WHERE?
   ↓
WHAT?
   ↓
WHY?
   ↓
HOW URGENT?
   ↓
WHAT SHOULD I DO?
```

### VANRA Intelligence Pipeline

```text
FOREST
   ↓
LAND
   ↓
CLAIMS
   ↓
DATA
   ↓
AI
   ↓
DECISION
```

---

# 🚀 Core Capabilities

### 🗺️ 1. FRA Intelligence Map

Interactive GIS dashboard built using Leaflet.

**Capabilities:**

* District-level visualization
* Claim-level spatial points
* Risk-coded markers
* Dynamic clustering
* Spatial anomaly layers
* Delayed claim filtering
* Record mismatch detection
* Critical-area highlighting

---

### 🏛️ 2. District Intelligence

Every monitored district receives an interpretable health score.

```text
District Health
━━━━━━━━━━━━━━━━━━━━━━
████████████████░░░░ 78
```

The dashboard provides:

* District Health Index
* Claim distribution
* Risk factors
* AI-generated analytical summary
* Factor attribution
* Priority claims

---

### 🔍 3. Explainable Risk Engine

VANRA doesn't simply say:

> ❌ "This district is risky."

It explains **why**.

Example:

```text
WHY IS THIS DISTRICT FLAGGED?

Processing Delay       ████████████████ 32%
Record Mismatch        █████████████    27%
Spatial Cluster        █████████        19%
Area Anomaly           █████            12%
Workflow Bottleneck    ████             10%
```

This makes the system easier to audit and understand.

---

### 🤖 4. Hybrid AI Anomaly Detection

VANRA combines:

**Deterministic Rules + Machine Learning**

```text
                 ┌───────────────┐
                 │  Claim Data   │
                 └───────┬───────┘
                         ↓
              ┌────────────────────┐
              │ Deterministic Rules│
              └─────────┬──────────┘
                        │
                        +
              ┌─────────▼──────────┐
              │ Isolation Forest   │
              │      ML Model      │
              └─────────┬──────────┘
                        ↓
              ┌────────────────────┐
              │ Explainable Signal │
              └─────────┬──────────┘
                        ↓
                 Risk Prioritisation
```

---

### 📋 5. Claim Investigation Portfolio

Each claim can be explored through a structured investigation dossier.

```text
CLAIM SUBMITTED
       ↓
FIELD VERIFICATION
       ↓
SDLC REVIEW
       ↓
DISTRICT REVIEW
       ↓
FINAL DECISION
```

The system tracks:

* Processing stage
* Duration
* Delay status
* Parcel information
* Risk score
* Evidence relationships
* Recommended action

---

### 🕸️ 6. Relational Evidence Graph

VANRA connects related administrative entities.

```text
             ┌──────────────┐
             │    CLAIM     │
             └──────┬───────┘
                    │
             ┌──────▼───────┐
             │ LAND PARCEL  │
             └──────┬───────┘
                    │
             ┌──────▼───────┐
             │ LAND RECORD  │
             └──────────────┘

DISTRICT ─────── FOREST ZONE
```

This provides a more contextual view of each claim.

---

### ⚡ 7. AI Priority Queue

Automatically ranks cases according to urgency.

```text
🔴 CRITICAL
   ↓
🟠 HIGH
   ↓
🟡 MEDIUM
   ↓
🟢 LOW
```

Each recommendation includes the underlying reasons instead of presenting an unexplained score.

---

### 🚨 8. Early Warning System

VANRA attempts to identify emerging bottlenecks **before they become severe backlogs**.

Signals include:

* Increasing processing duration
* Growing queue sizes
* Approaching statutory thresholds
* Spatial concentration
* Workflow stagnation

---

### 🎛️ 9. What-If Simulator

Officials can experiment with operational capacity.

Example:

```text
Current Capacity
20 claims / week

          ↓

Increase Capacity
45 claims / week

          ↓

Projected Clearance
██████████████████░░

          ↓

Estimated Backlog Reduction
↑
```

This helps evaluate operational scenarios before implementation.

---

### 💬 10. FRA Copilot

A structured analytical assistant for government analysts.

Instead of producing ungrounded answers, the Copilot follows:

```text
ANALYSIS
   ↓
RECOMMENDATION
   ↓
DATA BASIS
```

Example query:

> **"Why is Mandla high risk?"**

The system explains the contributing factors using application data.

---

# 🧠 Risk Scoring

Each claim and district receives a score from:

### `0 → 100`

|      Score | Classification | Meaning                         |
| ---------: | -------------- | ------------------------------- |
|   **0–35** | 🟢 Low         | Routine processing              |
|  **36–64** | 🟡 Medium      | Approaching review threshold    |
|  **65–79** | 🟠 High        | Significant delay / discrepancy |
| **80–100** | 🔴 Critical    | Multi-factor urgent review      |

---

# 📊 Anomaly Detection Framework

VANRA currently uses five major signals:

| Signal                  |  Weight |
| ----------------------- | ------: |
| ⏳ Processing Delay      | **32%** |
| 📑 Land Record Mismatch | **27%** |
| 🗺️ Geographic Cluster  | **19%** |
| 📐 Area Anomaly         | **12%** |
| 🔄 Workflow Bottleneck  | **10%** |

### Processing Delay

Claims exceeding the configured processing threshold are flagged for review.

### Land Record Mismatch

Compares claimed acreage against relevant cadastral/revenue records.

### Geographic Cluster

Identifies unusual concentrations of high-risk claims.

### Area Anomaly

Detects parcels whose area significantly differs from the surrounding distribution.

### Workflow Bottleneck

Identifies claims experiencing prolonged stagnation at specific administrative stages.

---

# 🏗️ System Architecture

```text
┌─────────────────────────────────────────────────────────┐
│                    VANRA FRONTEND                       │
│                                                         │
│ React 18 • TypeScript • Leaflet • Recharts             │
│ Framer Motion • Custom CSS Design System               │
└───────────────────────┬─────────────────────────────────┘
                        │
                        │ REST / JSON
                        ▼
┌─────────────────────────────────────────────────────────┐
│                    FASTAPI BACKEND                      │
│                                                         │
│ Overview • Districts • Claims • Priority • Simulator   │
│ Early Warning • Evidence • FRA Copilot                 │
└───────────────────────┬─────────────────────────────────┘
                        │
             ┌──────────┴──────────┐
             ▼                     ▼
┌──────────────────────┐  ┌────────────────────────────┐
│   AI / RULE ENGINE   │  │       DATABASE             │
│                      │  │                            │
│ SLA Rules            │  │ SQLite                     │
│ Isolation Forest     │◄─┤ Synthetic Claims           │
│ Explainability       │  │ District Records           │
└──────────────────────┘  └────────────────────────────┘
```

---

# 🛠️ Technology Stack

## Frontend

| Technology        | Purpose               |
| ----------------- | --------------------- |
| **React 18**      | UI framework          |
| **TypeScript**    | Type-safe development |
| **Vite**          | Build tooling         |
| **Leaflet**       | GIS mapping           |
| **React-Leaflet** | React map integration |
| **Recharts**      | Data visualisation    |
| **Framer Motion** | Animations            |
| **Vanilla CSS**   | Design system         |

## Backend

| Technology      | Purpose         |
| --------------- | --------------- |
| **Python 3.11** | Backend runtime |
| **FastAPI**     | REST API        |
| **Uvicorn**     | ASGI server     |
| **Pydantic**    | Data validation |

## AI / Data

| Technology              | Purpose                        |
| ----------------------- | ------------------------------ |
| **scikit-learn**        | Machine learning               |
| **Isolation Forest**    | Unsupervised anomaly detection |
| **SQLite**              | Relational analytical database |
| **Deterministic Rules** | Statutory/business logic       |

---

# 📦 Dataset

> ⚠️ **Important Data Notice**

VANRA is a **prototype**.

The application currently uses:

* **4,781 synthetic claim records**
* Synthetic applicant information
* Synthetic parcel coordinates
* **36 district records**

The data is designed for **demonstration and hackathon purposes** and is modelled around publicly available regional patterns.

### This data is:

❌ Not official government registry data
❌ Not production NIC data
❌ Not private citizen data
❌ Not intended for real-world title adjudication

---

# 🤖 Role of AI

VANRA deliberately separates **AI assistance** from statutory decision-making.

### AI DOES

✅ Detect statistical outliers
✅ Identify unusual spatial patterns
✅ Correlate risk factors
✅ Generate analytical summaries
✅ Prioritise cases
✅ Support what-if analysis

### AI DOES NOT

❌ Approve land titles
❌ Reject claims
❌ Replace Gram Sabhas
❌ Replace SDLC/DLC authorities
❌ Make legally binding decisions

> **Human officers remain responsible for statutory decisions and field verification.**

---

# ⚙️ Installation

## Prerequisites

Make sure you have:

* Node.js **18+**
* npm
* Python **3.10+**
* pip

---

## 1️⃣ Clone Repository

```bash
git clone https://github.com/umang25mei10037-coder/ORIGIN.git

cd ORIGIN
```

---

## 2️⃣ Backend Setup

```bash
pip install -r backend/requirements.txt
```

Start FastAPI:

```bash
python backend/main.py
```

Backend:

```text
http://localhost:8000
```

Swagger API documentation:

```text
http://localhost:8000/docs
```

---

## 3️⃣ Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# 🔐 Environment Variables

Create your `.env` file:

```bash
cp .env.example .env
```

| Variable        | Default                 | Purpose                  |
| --------------- | ----------------------- | ------------------------ |
| `BACKEND_HOST`  | `0.0.0.0`               | Backend host             |
| `BACKEND_PORT`  | `8000`                  | Backend port             |
| `VITE_API_URL`  | `http://localhost:8000` | API base URL             |
| `DATABASE_PATH` | `./data/vanra.db`       | SQLite database          |
| `LLM_API_KEY`   | Optional                | External LLM integration |

---

# 📁 Project Structure

```text
ORIGIN/
│
├── README.md
├── .env.example
│
├── data/
│   └── vanra.db
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── AI_METHODOLOGY.md
│   ├── DATA_DICTIONARY.md
│   ├── DATA_SOURCES.md
│   ├── DEMO_SCRIPT.md
│   └── SECURITY_AND_ETHICS.md
│
├── backend/
│   ├── main.py
│   ├── generate_data.py
│   └── requirements.txt
│
└── frontend/
    ├── index.html
    ├── package.json
    │
    └── src/
        ├── App.tsx
        ├── index.css
        │
        ├── config/
        │   └── appConfig.ts
        │
        ├── styles/
        │   └── polish.css
        │
        ├── components/
        │   ├── Header.tsx
        │   ├── Footer.tsx
        │   ├── AiStatusIndicator.tsx
        │   ├── AboutModal.tsx
        │   ├── ForestEcosystem.tsx
        │   ├── BrandedLoader.tsx
        │   ├── EmptyForestState.tsx
        │   ├── WhyFlagged.tsx
        │   ├── ClaimDetail.tsx
        │   └── CountUp.tsx
        │
        ├── pages/
        │   ├── Dashboard.tsx
        │   ├── ClaimsPage.tsx
        │   ├── AnomaliesPage.tsx
        │   ├── PriorityPage.tsx
        │   ├── EarlyWarningPage.tsx
        │   ├── SimulatorPage.tsx
        │   └── CopilotPage.tsx
        │
        └── services/
            └── api.ts
```

---

# 🔌 API Endpoints

| Method | Endpoint                 | Purpose               |
| ------ | ------------------------ | --------------------- |
| `GET`  | `/api/overview`          | National overview     |
| `GET`  | `/api/districts`         | District intelligence |
| `GET`  | `/api/districts/{name}`  | District details      |
| `GET`  | `/api/claims/map/points` | GIS claim points      |
| `GET`  | `/api/claims`            | Claims registry       |
| `GET`  | `/api/claims/{id}`       | Claim investigation   |
| `GET`  | `/api/evidence/{id}`     | Evidence graph        |
| `GET`  | `/api/priority`          | Priority queue        |
| `GET`  | `/api/early-warning`     | Early warnings        |
| `POST` | `/api/what-if`           | Scenario simulation   |
| `POST` | `/api/copilot`           | FRA Copilot           |

---

# 🎬 Hackathon Demo Flow

For a **3–5 minute presentation**, follow this sequence:

### 01 — Dashboard

Start with the national intelligence dashboard.

Show:

* KPI cards
* Living GIS map
* Risk distribution
* AI scan

### 02 — District Intelligence

Select **Mandla**.

Demonstrate:

* Map zoom
* District health score
* Claim distribution
* Risk factors

### 03 — Explainability

Open:

> **"Why is this district flagged?"**

Show the weighted factor breakdown.

### 04 — Claim Investigation

Open a priority claim such as:

```text
FRA-MP-00482
```

Show:

* Statutory timeline
* Processing duration
* Claim information
* Evidence Graph

### 05 — Priority Queue

Open the AI Priority Queue.

Show how claims are ranked according to urgency.

### 06 — Early Warning

Demonstrate emerging processing bottlenecks.

### 07 — What-If Simulator

Increase operational capacity.

Example:

```text
20 claims/week
       ↓
45 claims/week
```

Show the projected backlog clearance.

### 08 — FRA Copilot

Ask:

> **"Why is Mandla high risk?"**

Show:

```text
ANALYSIS
↓
RECOMMENDATION
↓
DATA BASIS
```

### 09 — Closing

Finish with the central idea:

> **VANRA doesn't replace the decision-maker.
> It helps the decision-maker know where to look first — and why.**

---

# 🔮 Future Scope

### 🏛️ Government Data Integration

Connect with official state revenue and forest-rights systems.

### 🛰️ Satellite Intelligence

Integrate Sentinel-2 / Landsat imagery for temporal land-use analysis.

### 📱 Field Officer Application

Build an offline-first mobile application for:

* GPS polygon mapping
* Field verification
* Evidence capture
* Ground-truth synchronisation

### 🌐 Multilingual Governance

Support:

* Hindi
* Gondi
* Santhali
* Regional languages

### 🔐 Role-Based Access

Introduce permission levels for:

```text
State Officials
      ↓
District Authorities
      ↓
SDLC Officers
      ↓
Field Officers
```

---

# ⚠️ Limitations

VANRA is currently a prototype and has several limitations:

* Synthetic demonstration dataset
* No direct integration with government registries
* Model outputs are decision-support signals
* Spatial outputs require ground verification
* What-if projections assume simplified operational conditions
* AI outputs should not be interpreted as legal decisions

---

# 🌍 Why VANRA Matters

Traditional dashboards answer:

> **"What is happening?"**

VANRA aims to answer:

> **"What is happening, why is it happening, where should we investigate, and what should we do next?"**

That shift — from **visualisation to actionable intelligence** — is the core of VANRA.

---

# 👨‍💻 Team

## MAVERICK TRIO

**Origin Hackathon 2026**

**Data Science Club — VIT Bhopal University**

### Umang Patel

🔗 LinkedIn: https://www.linkedin.com/in/umang-patel-bb7720363/

### GitHub

🔗 https://github.com/umang25mei10037-coder

---

# 🗺️ Map Attribution

Map visualisation uses OpenStreetMap data.

© OpenStreetMap contributors

---

# 📜 License & Credits

Built for **Origin Hackathon 2026** organised by the **Data Science Club, VIT Bhopal University**.

**Problem Statement:**
PS-7 — AI-powered Decision Support System for Forest Rights Act Monitoring.

---

<p align="center">

### 🌲 VANRA

**Visual AI Network for Rights Administration**

*"From scattered claims to explainable decisions."*

<br/>

**Built with data • AI • GIS • and human-centred governance**

</p>
