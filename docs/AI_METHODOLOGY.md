# VANRA AI & Risk Methodology
**Visual AI Network for Rights Administration**
*Explainable Decision Support for Forest Rights Act (FRA) Monitoring*

---

## 1. Core Philosophy: Decision Support, Not Legal Adjudication

The Forest Rights Act (2006) vests statutory adjudication powers solely in constitutionally recognized authorities: the Gram Sabha, the Sub-Divisional Level Committee (SDLC), and the District Level Committee (DLC).

VANRA is explicitly designed as a **Decision Support System (DSS)**. It **never**:
- Adjudicates legal land titles.
- Automatically rejects or approves claims.
- Presents algorithmic outputs as judicial determinations.

Instead, VANRA answers three practical administrative questions:
1. **WHERE** are processing bottlenecks or boundary discrepancies concentrated?
2. **WHY** did the algorithm flag a specific claim or district?
3. **WHAT ACTION** should field verification teams take first?

---

## 2. Hybrid Anomaly Detection Architecture

VANRA avoids brittle "black box" deep learning models in favor of a robust **hybrid architecture** combining deterministic statutory rules with unsupervised anomaly detection.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        HYBRID ANOMALY PIPELINE                         │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
                    ▼                                ▼
     ┌─────────────────────────────┐  ┌─────────────────────────────┐
     │  DETERMINISTIC RULE ENGINE  │  │  ISOLATION FOREST (ML)      │
     │  • Processing SLA (>180d)   │  │  • Scikit-learn estimator   │
     │  • Cadastral survey delta   │  │  • Multidimensional vectors │
     │  • Spatial buffer clusters  │  │  • Unsupervised outlier     │
     │  • Workflow stage dwell     │  │    probability scoring      │
     └──────────────┬──────────────┘  └──────────────┬──────────────┘
                    │                                │
                    └────────────────┬───────────────┘
                                     ▼
                     ┌───────────────────────────────┐
                     │ COMPOSITE RISK INDEX (0–100)  │
                     │  • Normalized Factor Weights  │
                     │  • Explainable Breakdown      │
                     └───────────────┬───────────────┘
                                     ▼
                     ┌───────────────────────────────┐
                     │ EXPLAINABILITY SYNTHESIS      │
                     │  • Factor Attribution Bars    │
                     │  • Structured Copilot Context │
                     │  • Recommended Next Steps     │
                     └───────────────────────────────┘
```

---

## 3. Contributing Factor Breakdown & Score Formulation

Each claim is assigned an aggregate risk index between **0 and 100**:

$$\text{Risk Score} = \min\left(100, \sum_{i=1}^n w_i \cdot f_i\right)$$

Where $f_i$ represents the normalized severity of each indicator, weighted as follows:

| Factor | Weight ($w_i$) | Detection Mechanism | Statutory Basis |
| :--- | :---: | :--- | :--- |
| **Processing Delay** | 32% | Time elapsed since Gram Sabha submission exceeding 180 days. | FRA Rule 12A guidelines specify time-bound resolution. |
| **Record Mismatch** | 27% | Discrepancy between Gram Sabha claimed acreage and revenue cadastre. | Cadastral maps and forest demarcation records variance. |
| **Geographic Cluster** | 19% | Spatial density of high-risk filings clustered in sensitive forest buffers. | Spatial outlier analysis via coordinate bounding. |
| **Area Anomaly** | 12% | Claim parcel size exceeding 4.0 hectares or deviating from village median. | Section 4(6) statutory ceiling (maximum 4 hectares). |
| **Workflow Bottleneck** | 10% | Prolonged stagnation at SDLC or DLC review stage without movement. | Administrative queue dwell time analysis. |

---

## 4. Role of Large Language Models (LLM)

In VANRA, **Large Language Models (LLMs) are NEVER used as primary anomaly detectors or legal evaluators.**

LLMs and natural language components are restricted to:
1. **Structuring Natural Language Explanations:** Translating factor scores into clear, non-technical prose for district collectors.
2. **Contextual Copilot Q&A:** Answering administrative queries (e.g., *"Why is Mandla flagged?"*) using deterministic application data as strict grounding.
3. **Action Recommendation Synthesis:** Formulating standard operating procedures (e.g., *"Schedule joint GPS resurvey with Gram Sabha FRC"*).

---

## 5. Strict Civic Language Guidelines

To prevent misinterpretation by administrative officials or judiciary stakeholders, all user interfaces adhere to strict semantic safeguards:

| Disallowed Phrasing (Judicial / Conclusive) | Permitted Phrasing (Administrative Guidance) |
| :--- | :--- |
| ❌ *"Fraudulent claim detected"* | ✔ *"Record mismatch requiring field verification"* |
| ❌ *"Illegal forest encroachment"* | ✔ *"Potential spatial anomaly within forest boundary"* |
| ❌ *"Claim must be rejected"* | ✔ *"Recommended review by Sub-Divisional Committee"* |
| ❌ *"AI concludes legal non-compliance"* | ✔ *"Model detected parameters exceeding statistical baseline"* |
