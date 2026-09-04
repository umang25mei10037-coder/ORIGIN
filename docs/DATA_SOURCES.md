# VANRA Data Sources & GIS Attribution
**Visual AI Network for Rights Administration**
*Autonomous Resource Management & GIS Provenance*

---

## 1. Geospatial & Basemap Resources

VANRA incorporates public open-access GIS mapping layers designed to run reliably both online and with offline fallbacks:

| Resource | Source / Provider | License / Terms | Usage in VANRA | Fallback Mechanism |
| :--- | :--- | :--- | :--- | :--- |
| **Basemap Tiles** | OpenStreetMap (OSM) via tile.openstreetmap.org | Open Data Commons Open Database License (ODbL) | Regional terrain and geographic background rendering | Local SVG terrain backdrops and canvas vector markers |
| **District Centroids** | Derived from Natural Earth & Census of India administrative boundaries | Public Domain / CC0 | Map auto-centering and zoom targeting upon district selection | Fixed coordinate array cached in SQLite `districts` table |
| **Forest Cover Layers** | Stylized SVG contours modeled after Forest Survey of India (FSI) zone classifications | Demonstration Reference | Visualizing forest boundary overlaps in Evidence Graph | Client-side procedural SVG landscape generator |

---

## 2. Demonstration Dataset Provenance

### Status: Synthetic Demonstration Data
> **IMPORTANT:** All 4,781 claim records, applicant files, and specific parcel boundary numbers in this project are **synthetic mock data**. They do not represent active citizen records or official confidential government documents.

### Demographic & Statistical Realism
The synthetic dataset generator (`backend/generate_data.py`) was parameterized using aggregated, publicly available statistical figures published in monthly Forest Rights Act (FRA) implementation summaries by the Ministry of Tribal Affairs (MoTA), Government of India:
- **Monitored States:** Madhya Pradesh, Maharashtra, Odisha, Chhattisgarh, Jharkhand.
- **Key Monitored Districts:** Mandla, Dindori, Balaghat, Gadchiroli, Nandurbar, Koraput, Mayurbhanj, Bastar, Surguja, Ranchi, and others (36 total).
- **Claim Types:** Individual Forest Rights (IFR) ~80%, Community Forest Rights (CFR / CR) ~20%.
- **SLA Baseline:** 180 calendar days statutory processing guideline (Rule 12A).

---

## 3. Autonomous Resource Management Strategy

As required by the autonomous build guidelines:
1. **Self-Contained Database:** The SQLite database `data/vanra.db` contains all required district records, claim coordinates, and pre-computed factor breakdowns.
2. **Resilient GIS Rendering:** Map points render on HTML5 Canvas via Leaflet, bypassing bulky external GeoJSON downloads that may fail during offline university hackathon judging.
3. **No Hard External LLM Dependencies:** Natural language analysis and Copilot responses run against local deterministic rules and SQLite queries, ensuring full functionality with or without internet connectivity.
