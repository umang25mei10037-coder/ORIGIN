# VANRA Hackathon Demo Script
**Visual AI Network for Rights Administration**
*3 to 5-Minute Award-Winning Final Presentation Walkthrough*

---

## 🕒 Pitch Overview & Narrative Arc

**Core Narrative:**
$$\text{SCATTERED DATA} \longrightarrow \text{GIS VISIBILITY} \longrightarrow \text{AI DETECTION} \longrightarrow \text{EXPLAINABLE RISK} \longrightarrow \text{PRIORITIZATION} \longrightarrow \text{DECISION SUPPORT}$$

> *"Respected judges, the Forest Rights Act is one of India's most transformative pieces of social legislation. However, implementation data is fragmented across paper files, sub-divisional committees, and land revenue registries. Officials are drowning in claims without knowing where to look first. VANRA does not replace the legal decision — it provides the visual and analytical intelligence to understand WHERE problems exist, WHY they were flagged, and WHAT to investigate first."*

---

## 🎬 Step-by-Step Demo Flow (3–5 Minutes)

### Minute 1: The National Picture & The Living GIS Map
1. **Landing on the Overview Screen (`/`):**
   - Point out the **Header & Forest Visual Identity**: Subtle mountain silhouettes with flowing data nodes, conveying environmental intelligence without cartoonish clutter.
   - Show the **AI Intelligence Active** status indicator in the top right. Click **"Run Scan"** to show real-time correlation across 36 districts.
   - Highlight the **KPI Cards**: Note the smooth CountUp animations and the explicit label: *"Modelled demo indicator"*.
   - Point out the **Living Map**: Show animated claim points colored by risk score (Green = Minimal, Amber = High, Coral = Critical). Filter by **"⏳ Delayed (>180d)"** and **"📋 Mismatches"** to show instant GIS reactivity.

### Minute 2: District Drilldown & "Why is this District Flagged?"
2. **Select High-Risk District ("Mandla"):**
   - Click the **Mandla** marker on the map or search in the district bar.
   - Note the smooth camera flyTo zoom, the animated boundary highlight ring, and the sliding right Intelligence Panel.
   - Review Mandla's **Implementation Health Index (42 / 100)** and AI summary quote: *"Elevated risk is primarily driven by processing delays past 180 days..."*
3. **Open "Why is this district flagged?":**
   - Click the button to reveal the explainable attribution modal.
   - Show the exact contributing factors breakdown:
     - ⏳ Processing Delay (32%)
     - 📋 Record Mismatch (27%)
     - 📍 Geographic Cluster (19%)
     - 📐 Area Anomaly (12%)
     - ⚙ Workflow Bottleneck (10%)
   - Show the AI Interpretation box using strictly qualified civic language.

### Minute 3: Deep Investigation & The Evidence Graph
4. **Open a Priority Claim (`FRA-MP-00482`):**
   - Click to open the Claim Investigation Portfolio modal.
   - Switch to the **Investigation Timeline** tab: Show the 5 statutory FRA stages (*Claim Submitted → Field Verification → SDLC Review → District Review → Final Decision*) with exact days elapsed and the **⚠ Delayed (>180d)** marker.
   - Switch to the **Evidence Graph** tab: Show the relational graph (*CLAIM ── LAND PARCEL ── LAND RECORD*, *DISTRICT ── FOREST ZONE*). Click on the **LAND RECORD** node to see connected lines highlight and unrelated nodes dim, revealing survey discrepancies.

### Minute 4: Operational Decision Support (Priority, Early Warning, What-If)
5. **Navigate to Priority Queue (`/priority`):**
   - Show the ranked list of claims. Toggle the urgency filters (**IMMEDIATE**, **HIGH**) and show the smooth Framer Motion card reordering.
   - Highlight the structured reasons bullet points and the **"Recommended Action"** box.
6. **Navigate to Early Warning (`/early-warning`):**
   - Show environmental intelligence cards with **subtle animated warning rings** (no flashing red screens).
7. **Navigate to What-If Simulator (`/simulator`):**
   - Drag the **Investigation Capacity Slider** from 20 to 45 claims/week.
   - Watch the numbers animate live: show the **+31% Backlog Clearance** projection.
   - Note the clear disclaimer: *"MODELLED PROJECTION — Not an official forecast."*

### Minute 5: FRA Copilot & Conclusion
8. **Navigate to FRA Copilot (`/copilot`):**
   - Click the suggested pill: *"Why is Mandla high risk?"*
   - Show the **structured reasoning format**:
     - **1. ANALYSIS:** Bulleted evidence factors.
     - **2. RECOMMENDATION:** Prioritize verification with Sub-Divisional Committee.
     - **3. DATA BASIS:** 4,781 claims · 36 districts · 5 states.
9. **Closing Statement:**
   - Open the **About VANRA** modal from the header to show the complete core flow:
     `WHERE → WHAT → WHY → HOW URGENT → WHAT SHOULD I DO?`
   - Finish on the dark forest green footer: *"Built by Team VANRA for Problem Statement 7."*

---

## 💡 Top Judge Questions & Winning Responses

**Q1: "Does your AI make legal decisions to grant or reject land rights?"**
> *A: "Never. Under the Forest Rights Act, only the Gram Sabha and statutory committees possess legal authority. VANRA is strictly a decision-support and prioritization system that highlights administrative delays and record mismatches for human officers to inspect."*

**Q2: "Is this trained on real citizen land data?"**
> *A: "No. All 4,781 records are synthetic demonstration data modeled after public statistical aggregates published by the Ministry of Tribal Affairs. This ensures complete privacy while demonstrating real-world utility."*

**Q3: "How does the system perform if internet connection is lost?"**
> *A: "The entire system is self-contained. The analytical decision engine, SQLite database, and deterministic Copilot logic run locally on the server without mandatory external cloud dependencies."*
