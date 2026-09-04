"""
VANRA Backend - FastAPI Application
====================================
Visual AI Network for Rights Administration

Demo system using synthetic/mock FRA data for demonstration purposes.
"""

import json
import math
import os
import sqlite3
from typing import Optional, List
from datetime import datetime

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ============================================================
# APP SETUP
# ============================================================

app = FastAPI(
    title="VANRA API",
    description="Visual AI Network for Rights Administration - API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "vanra.db")


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


# ============================================================
# SCHEMAS
# ============================================================

class WhatIfRequest(BaseModel):
    investigation_capacity: int = 20
    priority_threshold: int = 60
    weeks: int = 12

class CopilotRequest(BaseModel):
    query: str

class WhatIfResponse(BaseModel):
    current_backlog: int
    projected_backlog: int
    current_high_risk: int
    projected_high_risk: int
    current_avg_resolution: float
    projected_avg_resolution: float
    capacity: int
    weeks: int
    claims_reviewable: int
    improvement_pct: float


# ============================================================
# OVERVIEW ENDPOINT
# ============================================================

@app.get("/api/overview")
def get_overview():
    conn = get_db()
    cur = conn.cursor()
    
    cur.execute("SELECT COUNT(*) FROM claims")
    total = cur.fetchone()[0]
    
    cur.execute("SELECT COUNT(*) FROM claims WHERE status='Approved'")
    approved = cur.fetchone()[0]
    
    cur.execute("SELECT COUNT(*) FROM claims WHERE status IN ('Pending', 'Under Review')")
    under_review = cur.fetchone()[0]
    
    cur.execute("SELECT COUNT(*) FROM claims WHERE delay_flag=1")
    delayed = cur.fetchone()[0]
    
    cur.execute("SELECT COUNT(*) FROM claims WHERE risk_level IN ('Critical', 'High')")
    high_risk = cur.fetchone()[0]
    
    cur.execute("SELECT COUNT(*) FROM claims WHERE record_mismatch_flag=1")
    mismatches = cur.fetchone()[0]
    
    cur.execute("SELECT COUNT(*) FROM claims WHERE status='Rejected'")
    rejected = cur.fetchone()[0]
    
    cur.execute("SELECT AVG(processing_days) FROM claims")
    avg_processing = round(cur.fetchone()[0] or 0, 1)
    
    cur.execute("SELECT AVG(risk_score) FROM claims")
    avg_risk = round(cur.fetchone()[0] or 0, 1)
    
    cur.execute("SELECT COUNT(DISTINCT state) FROM claims")
    states = cur.fetchone()[0]
    
    cur.execute("SELECT COUNT(DISTINCT district) FROM claims")
    districts = cur.fetchone()[0]
    
    # Status distribution
    cur.execute("SELECT status, COUNT(*) as count FROM claims GROUP BY status")
    status_dist = {row["status"]: row["count"] for row in cur.fetchall()}
    
    # Risk distribution
    cur.execute("SELECT risk_level, COUNT(*) as count FROM claims GROUP BY risk_level")
    risk_dist = {row["risk_level"]: row["count"] for row in cur.fetchall()}
    
    # Anomaly type distribution
    cur.execute("SELECT anomaly_type, COUNT(*) as count FROM anomalies GROUP BY anomaly_type")
    anomaly_dist = {row["anomaly_type"]: row["count"] for row in cur.fetchall()}
    
    conn.close()
    
    return {
        "total_claims": total,
        "approved": approved,
        "under_review": under_review,
        "delayed": delayed,
        "high_risk": high_risk,
        "record_mismatches": mismatches,
        "rejected": rejected,
        "avg_processing_days": avg_processing,
        "avg_risk_score": avg_risk,
        "states_count": states,
        "districts_count": districts,
        "status_distribution": status_dist,
        "risk_distribution": risk_dist,
        "anomaly_distribution": anomaly_dist,
    }


# ============================================================
# STATES
# ============================================================

@app.get("/api/states")
def get_states():
    conn = get_db()
    cur = conn.cursor()
    
    cur.execute("""
        SELECT s.state_name, s.state_code, s.center_lat, s.center_lng,
               COUNT(c.claim_id) as total_claims,
               SUM(CASE WHEN c.risk_level IN ('Critical', 'High') THEN 1 ELSE 0 END) as high_risk_claims,
               AVG(c.risk_score) as avg_risk_score,
               SUM(CASE WHEN c.delay_flag=1 THEN 1 ELSE 0 END) as delayed_claims,
               SUM(CASE WHEN c.status='Approved' THEN 1 ELSE 0 END) as approved_claims
        FROM states s
        LEFT JOIN claims c ON s.state_name = c.state
        GROUP BY s.state_name
    """)
    
    states = []
    for row in cur.fetchall():
        states.append(dict(row))
    
    conn.close()
    return states


# ============================================================
# DISTRICTS
# ============================================================

@app.get("/api/districts")
def get_districts():
    conn = get_db()
    cur = conn.cursor()
    
    cur.execute("""
        SELECT d.district_name, d.state_name, d.center_lat, d.center_lng, d.population_tribal_pct,
               COUNT(c.claim_id) as total_claims,
               SUM(CASE WHEN c.risk_level IN ('Critical', 'High') THEN 1 ELSE 0 END) as high_risk_claims,
               AVG(c.risk_score) as avg_risk_score,
               SUM(CASE WHEN c.delay_flag=1 THEN 1 ELSE 0 END) as delayed_claims,
               SUM(CASE WHEN c.status='Approved' THEN 1 ELSE 0 END) as approved_claims,
               SUM(CASE WHEN c.status='Pending' OR c.status='Under Review' THEN 1 ELSE 0 END) as pending_claims,
               SUM(CASE WHEN c.record_mismatch_flag=1 THEN 1 ELSE 0 END) as mismatch_claims,
               AVG(c.processing_days) as avg_processing_days,
               SUM(CASE WHEN c.workflow_anomaly_flag=1 THEN 1 ELSE 0 END) as workflow_anomalies
        FROM districts d
        LEFT JOIN claims c ON d.district_name = c.district AND d.state_name = c.state
        GROUP BY d.district_name, d.state_name
    """)
    
    districts = []
    for row in cur.fetchall():
        d = dict(row)
        # Calculate district health score (inverse of risk)
        avg_risk = d.get("avg_risk_score") or 0
        total = d.get("total_claims") or 1
        high_risk_ratio = (d.get("high_risk_claims") or 0) / total
        delayed_ratio = (d.get("delayed_claims") or 0) / total
        mismatch_ratio = (d.get("mismatch_claims") or 0) / total
        
        health = 100
        health -= min(30, avg_risk * 0.4)
        health -= min(25, high_risk_ratio * 60)
        health -= min(25, delayed_ratio * 50)
        health -= min(20, mismatch_ratio * 50)
        d["health_score"] = max(0, min(100, round(health)))
        
        # Risk level for district
        if d["health_score"] < 50:
            d["district_risk_level"] = "Critical"
        elif d["health_score"] < 65:
            d["district_risk_level"] = "High"
        elif d["health_score"] < 80:
            d["district_risk_level"] = "Medium"
        else:
            d["district_risk_level"] = "Low"
        
        districts.append(d)
    
    conn.close()
    return districts


@app.get("/api/districts/{district_name}")
def get_district_detail(district_name: str):
    conn = get_db()
    cur = conn.cursor()
    
    cur.execute("""
        SELECT d.district_name, d.state_name, d.center_lat, d.center_lng, d.population_tribal_pct
        FROM districts d WHERE d.district_name = ?
    """, (district_name,))
    
    dist = cur.fetchone()
    if not dist:
        conn.close()
        raise HTTPException(status_code=404, detail="District not found")
    
    result = dict(dist)
    
    # Claim stats
    cur.execute("""
        SELECT COUNT(*) as total,
               SUM(CASE WHEN status='Approved' THEN 1 ELSE 0 END) as approved,
               SUM(CASE WHEN status='Pending' THEN 1 ELSE 0 END) as pending,
               SUM(CASE WHEN status='Under Review' THEN 1 ELSE 0 END) as under_review,
               SUM(CASE WHEN status='Rejected' THEN 1 ELSE 0 END) as rejected,
               SUM(CASE WHEN status='Remanded' THEN 1 ELSE 0 END) as remanded,
               SUM(CASE WHEN delay_flag=1 THEN 1 ELSE 0 END) as delayed,
               SUM(CASE WHEN risk_level IN ('Critical','High') THEN 1 ELSE 0 END) as high_risk,
               SUM(CASE WHEN record_mismatch_flag=1 THEN 1 ELSE 0 END) as mismatches,
               AVG(processing_days) as avg_processing_days,
               AVG(risk_score) as avg_risk_score,
               MAX(risk_score) as max_risk_score
        FROM claims WHERE district = ?
    """, (district_name,))
    
    stats = dict(cur.fetchone())
    result["stats"] = stats
    
    # Status distribution
    cur.execute("SELECT status, COUNT(*) as count FROM claims WHERE district=? GROUP BY status", (district_name,))
    result["status_distribution"] = {r["status"]: r["count"] for r in cur.fetchall()}
    
    # Risk distribution
    cur.execute("SELECT risk_level, COUNT(*) as count FROM claims WHERE district=? GROUP BY risk_level", (district_name,))
    result["risk_distribution"] = {r["risk_level"]: r["count"] for r in cur.fetchall()}
    
    # Committee stage distribution
    cur.execute("SELECT committee_stage, COUNT(*) as count FROM claims WHERE district=? GROUP BY committee_stage ORDER BY count DESC", (district_name,))
    result["stage_distribution"] = {r["committee_stage"]: r["count"] for r in cur.fetchall()}
    
    # Processing time distribution (buckets)
    cur.execute("SELECT processing_days FROM claims WHERE district=?", (district_name,))
    proc_days = [r["processing_days"] for r in cur.fetchall()]
    buckets = {"0-30": 0, "31-60": 0, "61-90": 0, "91-120": 0, "121-180": 0, "180+": 0}
    for pd in proc_days:
        if pd <= 30: buckets["0-30"] += 1
        elif pd <= 60: buckets["31-60"] += 1
        elif pd <= 90: buckets["61-90"] += 1
        elif pd <= 120: buckets["91-120"] += 1
        elif pd <= 180: buckets["121-180"] += 1
        else: buckets["180+"] += 1
    result["processing_distribution"] = buckets
    
    # Anomaly breakdown
    cur.execute("""
        SELECT anomaly_type, COUNT(*) as count, AVG(risk_contribution) as avg_contribution
        FROM anomalies WHERE district=?
        GROUP BY anomaly_type
    """, (district_name,))
    result["anomaly_breakdown"] = [dict(r) for r in cur.fetchall()]
    
    # Monthly trend (by claim_date)
    cur.execute("""
        SELECT substr(claim_date, 1, 7) as month, COUNT(*) as claims,
               AVG(risk_score) as avg_risk
        FROM claims WHERE district=?
        GROUP BY month ORDER BY month
    """, (district_name,))
    result["monthly_trend"] = [dict(r) for r in cur.fetchall()]
    
    # Calculate health score and factors
    total = stats["total"] or 1
    avg_processing = stats["avg_processing_days"] or 0
    avg_risk = stats["avg_risk_score"] or 0
    delayed_ratio = (stats["delayed"] or 0) / total
    mismatch_ratio = (stats["mismatches"] or 0) / total
    high_risk_ratio = (stats["high_risk"] or 0) / total
    
    # Factor scores (0-100, higher is worse)
    processing_factor = min(100, (avg_processing / 180) * 100)
    record_factor = min(100, mismatch_ratio * 400)
    backlog_factor = min(100, ((stats["pending"] or 0) + (stats["under_review"] or 0)) / total * 150)
    pattern_factor = min(100, high_risk_ratio * 300)
    
    health = 100
    health -= min(30, avg_risk * 0.4)
    health -= min(25, high_risk_ratio * 60)
    health -= min(25, delayed_ratio * 50)
    health -= min(20, mismatch_ratio * 50)
    
    result["health_score"] = max(0, min(100, round(health)))
    result["factors"] = {
        "processing": round(processing_factor),
        "record_integrity": round(record_factor),
        "backlog": round(backlog_factor),
        "claim_pattern": round(pattern_factor),
    }
    
    if result["health_score"] < 50:
        result["district_risk_level"] = "Critical"
    elif result["health_score"] < 65:
        result["district_risk_level"] = "High"
    elif result["health_score"] < 80:
        result["district_risk_level"] = "Medium"
    else:
        result["district_risk_level"] = "Low"
    
    # Why flagged reasons
    why_reasons = []
    if avg_processing > 100:
        why_reasons.append({
            "order": 1,
            "title": "Processing delays are elevated",
            "detail": f"Average processing time is {avg_processing:.0f} days, exceeding the 90-day target.",
            "metric": f"{avg_processing:.0f} days avg",
            "severity": "high" if avg_processing > 140 else "medium"
        })
    if mismatch_ratio > 0.05:
        why_reasons.append({
            "order": 2,
            "title": "Land record mismatch rate is above peer districts",
            "detail": f"{mismatch_ratio*100:.1f}% of claims have land record discrepancies.",
            "metric": f"{mismatch_ratio*100:.1f}% mismatch rate",
            "severity": "high" if mismatch_ratio > 0.15 else "medium"
        })
    if high_risk_ratio > 0.1:
        why_reasons.append({
            "order": 3,
            "title": "High-risk claim concentration is significant",
            "detail": f"{stats['high_risk']} claims ({high_risk_ratio*100:.1f}%) are rated high-risk or critical.",
            "metric": f"{stats['high_risk']} high-risk claims",
            "severity": "high" if high_risk_ratio > 0.2 else "medium"
        })
    
    # Check for geographic cluster
    cur.execute("SELECT COUNT(*) FROM claims WHERE district=? AND geographic_anomaly_flag=1", (district_name,))
    geo_anomalies = cur.fetchone()[0]
    if geo_anomalies > 3:
        why_reasons.append({
            "order": 4,
            "title": "Geographic anomaly cluster detected",
            "detail": f"{geo_anomalies} claims form a suspicious geographic cluster.",
            "metric": f"{geo_anomalies} clustered claims",
            "severity": "high"
        })
    
    # Check workflow bottleneck
    cur.execute("SELECT committee_stage, COUNT(*) as cnt FROM claims WHERE district=? AND workflow_anomaly_flag=1 GROUP BY committee_stage ORDER BY cnt DESC LIMIT 1", (district_name,))
    wf = cur.fetchone()
    if wf and wf["cnt"] > 5:
        why_reasons.append({
            "order": 5,
            "title": f"Workflow bottleneck at {wf['committee_stage']}",
            "detail": f"{wf['cnt']} claims are stuck at the {wf['committee_stage']} stage.",
            "metric": f"{wf['cnt']} claims bottlenecked",
            "severity": "medium"
        })
    
    if delayed_ratio > 0.1:
        why_reasons.append({
            "order": 6,
            "title": "Delayed claims exceed monitoring threshold",
            "detail": f"{stats['delayed']} claims ({delayed_ratio*100:.1f}%) have exceeded the processing deadline.",
            "metric": f"{stats['delayed']} delayed claims",
            "severity": "high" if delayed_ratio > 0.2 else "medium"
        })
    
    result["why_flagged"] = sorted(why_reasons, key=lambda x: x["order"])
    
    # Top risk claims in district
    cur.execute("""
        SELECT claim_id, risk_score, risk_level, status, processing_days, claimed_area, recorded_area,
               committee_stage, anomaly_reasons, claim_type
        FROM claims WHERE district=? ORDER BY risk_score DESC LIMIT 10
    """, (district_name,))
    result["top_risk_claims"] = [dict(r) for r in cur.fetchall()]
    
    conn.close()
    return result


# ============================================================
# CLAIMS
# ============================================================

@app.get("/api/claims")
def get_claims(
    state: Optional[str] = None,
    district: Optional[str] = None,
    status: Optional[str] = None,
    risk_level: Optional[str] = None,
    min_risk: Optional[int] = None,
    delay_flag: Optional[int] = None,
    mismatch_flag: Optional[int] = None,
    limit: int = Query(default=500, le=5000),
    offset: int = 0,
    sort_by: str = "risk_score",
    sort_order: str = "desc"
):
    conn = get_db()
    cur = conn.cursor()
    
    query = "SELECT * FROM claims WHERE 1=1"
    params = []
    
    if state:
        query += " AND state = ?"
        params.append(state)
    if district:
        query += " AND district = ?"
        params.append(district)
    if status:
        query += " AND status = ?"
        params.append(status)
    if risk_level:
        query += " AND risk_level = ?"
        params.append(risk_level)
    if min_risk is not None:
        query += " AND risk_score >= ?"
        params.append(min_risk)
    if delay_flag is not None:
        query += " AND delay_flag = ?"
        params.append(delay_flag)
    if mismatch_flag is not None:
        query += " AND record_mismatch_flag = ?"
        params.append(mismatch_flag)
    
    # Count
    count_query = query.replace("SELECT *", "SELECT COUNT(*)")
    cur.execute(count_query, params)
    total_count = cur.fetchone()[0]
    
    allowed_sort = ["risk_score", "processing_days", "claimed_area", "claim_date"]
    if sort_by not in allowed_sort:
        sort_by = "risk_score"
    order = "DESC" if sort_order.lower() == "desc" else "ASC"
    
    query += f" ORDER BY {sort_by} {order} LIMIT ? OFFSET ?"
    params.extend([limit, offset])
    
    cur.execute(query, params)
    claims = [dict(r) for r in cur.fetchall()]
    
    conn.close()
    return {
        "claims": claims,
        "total": total_count,
        "limit": limit,
        "offset": offset
    }


@app.get("/api/claims/{claim_id}")
def get_claim_detail(claim_id: str):
    conn = get_db()
    cur = conn.cursor()
    
    cur.execute("SELECT * FROM claims WHERE claim_id = ?", (claim_id,))
    claim = cur.fetchone()
    if not claim:
        conn.close()
        raise HTTPException(status_code=404, detail="Claim not found")
    
    result = dict(claim)
    
    # Land parcel
    cur.execute("SELECT * FROM land_parcels WHERE claim_id = ?", (claim_id,))
    parcel = cur.fetchone()
    result["land_parcel"] = dict(parcel) if parcel else None
    
    # Land record
    cur.execute("SELECT * FROM land_records WHERE claim_id = ?", (claim_id,))
    record = cur.fetchone()
    result["land_record"] = dict(record) if record else None
    
    # Workflow events (timeline)
    cur.execute("SELECT * FROM workflow_events WHERE claim_id = ? ORDER BY stage_index", (claim_id,))
    result["workflow_timeline"] = [dict(r) for r in cur.fetchall()]
    
    # Anomalies for this claim
    cur.execute("SELECT * FROM anomalies WHERE claim_id = ?", (claim_id,))
    result["anomalies"] = [dict(r) for r in cur.fetchall()]
    
    # Risk breakdown
    c = result
    risk_factors = []
    
    if c["delay_flag"]:
        contribution = min(25, int((c["processing_days"] - 90) / 10))
        risk_factors.append({
            "factor": "Processing Delay",
            "contribution": contribution,
            "detail": f"Processing time: {c['processing_days']} days",
            "max_score": 25
        })
    
    if c["record_mismatch_flag"]:
        diff_pct = abs(c["claimed_area"] - c["recorded_area"]) / max(c["recorded_area"], 0.1) * 100
        contribution = min(25, int(diff_pct / 5))
        risk_factors.append({
            "factor": "Land Record Mismatch",
            "contribution": contribution,
            "detail": f"Area discrepancy: {diff_pct:.0f}%",
            "max_score": 25
        })
    
    if c["area_anomaly_flag"]:
        contribution = min(15, int(c["claimed_area"] * 1.5))
        risk_factors.append({
            "factor": "Unusual Area",
            "contribution": contribution,
            "detail": f"Claimed area: {c['claimed_area']} ha",
            "max_score": 15
        })
    
    if c["geographic_anomaly_flag"]:
        risk_factors.append({
            "factor": "Geographic Cluster",
            "contribution": 12,
            "detail": "Part of a geographic anomaly cluster",
            "max_score": 15
        })
    
    if c["workflow_anomaly_flag"]:
        risk_factors.append({
            "factor": "Workflow Bottleneck",
            "contribution": 15,
            "detail": f"Bottleneck at {c['committee_stage']}",
            "max_score": 20
        })
    
    result["risk_factors"] = risk_factors
    
    # AI assessment
    anomaly_reasons = json.loads(c["anomaly_reasons"]) if c["anomaly_reasons"] else []
    confidence = min(0.99, 0.5 + c["risk_score"] / 200)
    
    recommendations = []
    if c["record_mismatch_flag"]:
        recommendations.append("Verify land record accuracy and conduct field survey")
    if c["delay_flag"]:
        recommendations.append("Review processing history and identify bottleneck causes")
    if c["geographic_anomaly_flag"]:
        recommendations.append("Investigate geographic cluster for coordinated filing patterns")
    if c["workflow_anomaly_flag"]:
        recommendations.append("Assess committee workload and resource allocation")
    if c["area_anomaly_flag"]:
        recommendations.append("Validate claimed area through independent measurement")
    if not recommendations:
        recommendations.append("No immediate action required - continue standard monitoring")
    
    result["ai_assessment"] = {
        "risk_level": c["risk_level"],
        "confidence": round(confidence, 2),
        "evidence": anomaly_reasons,
        "recommendations": recommendations,
        "disclaimer": "AI-assisted assessment based on synthetic demo data. Does not constitute official determination."
    }
    
    conn.close()
    return result


# ============================================================
# CLAIMS MAP DATA (lightweight for map rendering)
# ============================================================

@app.get("/api/claims/map/points")
def get_map_claims(
    state: Optional[str] = None,
    district: Optional[str] = None,
    risk_level: Optional[str] = None,
    anomaly_type: Optional[str] = None,
):
    conn = get_db()
    cur = conn.cursor()
    
    query = """
        SELECT claim_id, latitude, longitude, risk_score, risk_level, 
               status, district, state, delay_flag, record_mismatch_flag,
               geographic_anomaly_flag, processing_days, claimed_area, claim_type
        FROM claims WHERE 1=1
    """
    params = []
    
    if state:
        query += " AND state = ?"
        params.append(state)
    if district:
        query += " AND district = ?"
        params.append(district)
    if risk_level:
        query += " AND risk_level = ?"
        params.append(risk_level)
    if anomaly_type == "delayed":
        query += " AND delay_flag = 1"
    elif anomaly_type == "mismatch":
        query += " AND record_mismatch_flag = 1"
    elif anomaly_type == "geographic":
        query += " AND geographic_anomaly_flag = 1"
    elif anomaly_type == "workflow":
        query += " AND workflow_anomaly_flag = 1"
    
    cur.execute(query, params)
    points = [dict(r) for r in cur.fetchall()]
    
    conn.close()
    return points


# ============================================================
# ANOMALIES
# ============================================================

@app.get("/api/anomalies")
def get_anomalies(
    anomaly_type: Optional[str] = None,
    district: Optional[str] = None,
    severity: Optional[str] = None,
    limit: int = 100
):
    conn = get_db()
    cur = conn.cursor()
    
    query = "SELECT * FROM anomalies WHERE 1=1"
    params = []
    
    if anomaly_type:
        query += " AND anomaly_type = ?"
        params.append(anomaly_type)
    if district:
        query += " AND district = ?"
        params.append(district)
    if severity:
        query += " AND severity = ?"
        params.append(severity)
    
    query += " ORDER BY risk_contribution DESC LIMIT ?"
    params.append(limit)
    
    cur.execute(query, params)
    anomalies = [dict(r) for r in cur.fetchall()]
    
    # Summary
    cur.execute("SELECT anomaly_type, COUNT(*) as count FROM anomalies GROUP BY anomaly_type")
    summary = {r["anomaly_type"]: r["count"] for r in cur.fetchall()}
    
    conn.close()
    return {"anomalies": anomalies, "summary": summary}


# ============================================================
# PRIORITY QUEUE
# ============================================================

@app.get("/api/priority-queue")
def get_priority_queue(limit: int = 20):
    conn = get_db()
    cur = conn.cursor()
    
    # Top risk claims
    cur.execute("""
        SELECT claim_id, state, district, risk_score, risk_level, status, 
               processing_days, claimed_area, recorded_area, committee_stage,
               anomaly_reasons, claim_type, delay_flag, record_mismatch_flag,
               area_anomaly_flag, geographic_anomaly_flag, workflow_anomaly_flag
        FROM claims
        WHERE risk_score >= 40
        ORDER BY risk_score DESC
        LIMIT ?
    """, (limit,))
    
    items = []
    for row in cur.fetchall():
        c = dict(row)
        anomaly_reasons = json.loads(c["anomaly_reasons"]) if c["anomaly_reasons"] else []
        
        # Generate recommendation
        recommendations = []
        if c["record_mismatch_flag"]:
            recommendations.append("Verify land record and review area measurement")
        if c["delay_flag"]:
            recommendations.append("Review processing history and expedite review")
        if c["geographic_anomaly_flag"]:
            recommendations.append("Investigate geographic cluster pattern")
        if c["workflow_anomaly_flag"]:
            recommendations.append("Assess committee-stage bottleneck")
        if c["area_anomaly_flag"]:
            recommendations.append("Validate claimed area through field survey")
        
        reason_summary = " + ".join([
            r.split(":")[0] if ":" in r else r for r in anomaly_reasons[:3]
        ]) if anomaly_reasons else "Elevated risk score"
        
        items.append({
            **c,
            "reason_summary": reason_summary,
            "recommendations": recommendations,
            "urgency": "Immediate" if c["risk_score"] >= 80 else "High" if c["risk_score"] >= 60 else "Medium"
        })
    
    # Top risk districts
    cur.execute("""
        SELECT district, state, AVG(risk_score) as avg_risk, 
               COUNT(*) as total_claims,
               SUM(CASE WHEN risk_level IN ('Critical','High') THEN 1 ELSE 0 END) as high_risk_claims,
               SUM(CASE WHEN delay_flag=1 THEN 1 ELSE 0 END) as delayed
        FROM claims
        GROUP BY district, state
        HAVING avg_risk > 25
        ORDER BY avg_risk DESC
        LIMIT 10
    """)
    
    district_items = []
    for row in cur.fetchall():
        d = dict(row)
        d["avg_risk"] = round(d["avg_risk"], 1)
        reasons = []
        if d["delayed"] > 5:
            reasons.append(f"{d['delayed']} delayed claims")
        if d["high_risk_claims"] > 3:
            reasons.append(f"{d['high_risk_claims']} high-risk claims")
        d["reason_summary"] = " + ".join(reasons) if reasons else "Elevated average risk"
        district_items.append(d)
    
    conn.close()
    return {
        "claim_priorities": items,
        "district_priorities": district_items,
    }


# ============================================================
# EVIDENCE GRAPH
# ============================================================

@app.get("/api/evidence/{claim_id}")
def get_evidence_graph(claim_id: str):
    conn = get_db()
    cur = conn.cursor()
    
    # Claim
    cur.execute("SELECT * FROM claims WHERE claim_id = ?", (claim_id,))
    claim = cur.fetchone()
    if not claim:
        conn.close()
        raise HTTPException(status_code=404, detail="Claim not found")
    claim = dict(claim)
    
    # Land parcel
    cur.execute("SELECT * FROM land_parcels WHERE claim_id = ?", (claim_id,))
    parcel = cur.fetchone()
    parcel = dict(parcel) if parcel else None
    
    # Land record
    cur.execute("SELECT * FROM land_records WHERE claim_id = ?", (claim_id,))
    record = cur.fetchone()
    record = dict(record) if record else None
    
    # District info
    cur.execute("SELECT * FROM districts WHERE district_name = ? AND state_name = ?", 
                (claim["district"], claim["state"]))
    district = cur.fetchone()
    district = dict(district) if district else None
    
    # Workflow
    cur.execute("SELECT * FROM workflow_events WHERE claim_id = ? ORDER BY stage_index", (claim_id,))
    workflow = [dict(r) for r in cur.fetchall()]
    
    # Build graph nodes and edges
    nodes = []
    edges = []
    
    # Claim node
    nodes.append({
        "id": claim["claim_id"],
        "type": "claim",
        "label": claim["claim_id"],
        "data": {
            "status": claim["status"],
            "risk_score": claim["risk_score"],
            "risk_level": claim["risk_level"],
            "claim_type": claim["claim_type"],
            "claimed_area": claim["claimed_area"],
            "processing_days": claim["processing_days"],
        }
    })
    
    # Parcel node
    if parcel:
        nodes.append({
            "id": parcel["parcel_id"],
            "type": "land_parcel",
            "label": parcel["parcel_id"],
            "data": {
                "survey_number": parcel["survey_number"],
                "area_hectares": parcel["area_hectares"],
                "land_type": parcel["land_type"],
                "forest_zone": parcel["forest_zone"],
            }
        })
        edges.append({"from": claim["claim_id"], "to": parcel["parcel_id"], "label": "claims"})
    
    # Record node
    if record:
        nodes.append({
            "id": record["record_id"],
            "type": "land_record",
            "label": record["record_id"],
            "data": {
                "recorded_area": record["recorded_area"],
                "claimed_area": record["claimed_area"],
                "discrepancy_pct": record["discrepancy_pct"],
                "record_status": record["record_status"],
                "last_updated": record["last_updated"],
            }
        })
        if parcel:
            edges.append({"from": parcel["parcel_id"], "to": record["record_id"], "label": "has_record"})
    
    # District node
    if district:
        nodes.append({
            "id": f"DIST-{claim['district']}",
            "type": "district",
            "label": claim["district"],
            "data": {
                "state": claim["state"],
                "tribal_pct": district["population_tribal_pct"],
            }
        })
        edges.append({"from": claim["claim_id"], "to": f"DIST-{claim['district']}", "label": "located_in"})
    
    # Forest zone node
    nodes.append({
        "id": f"FZ-{claim['forest_zone']}",
        "type": "forest_zone",
        "label": claim["forest_zone"],
        "data": {
            "zone_type": claim["forest_zone"],
        }
    })
    edges.append({"from": claim["claim_id"], "to": f"FZ-{claim['forest_zone']}", "label": "within"})
    
    # Workflow stage node
    current_stage = claim["committee_stage"]
    nodes.append({
        "id": f"WF-{current_stage}",
        "type": "workflow_stage",
        "label": current_stage,
        "data": {
            "status": "Active",
            "stage": current_stage,
        }
    })
    edges.append({"from": claim["claim_id"], "to": f"WF-{current_stage}", "label": "at_stage"})
    
    conn.close()
    
    return {
        "claim_id": claim_id,
        "nodes": nodes,
        "edges": edges,
        "workflow_timeline": workflow,
    }


# ============================================================
# EARLY WARNING
# ============================================================

@app.get("/api/early-warning")
def get_early_warnings():
    conn = get_db()
    cur = conn.cursor()
    
    warnings = []
    
    # Claims approaching delay threshold
    cur.execute("""
        SELECT COUNT(*) as count FROM claims 
        WHERE processing_days BETWEEN 150 AND 180 AND delay_flag = 0
    """)
    approaching = cur.fetchone()["count"]
    if approaching > 0:
        warnings.append({
            "id": "ew-1",
            "type": "approaching_delay",
            "severity": "warning",
            "title": f"{approaching} claims approaching delay threshold",
            "detail": f"{approaching} claims have processing times between 150-180 days and are approaching the monitoring threshold.",
            "metric": f"{approaching} claims",
            "trend": "increasing",
            "recommendation": "Prioritize review of these claims to prevent threshold breach."
        })
    
    # Rising mismatch concentration
    cur.execute("""
        SELECT district, state, COUNT(*) as count 
        FROM claims WHERE record_mismatch_flag=1 
        GROUP BY district HAVING count > 5 
        ORDER BY count DESC LIMIT 3
    """)
    for row in cur.fetchall():
        warnings.append({
            "id": f"ew-mm-{row['district']}",
            "type": "mismatch_concentration",
            "severity": "warning",
            "title": f"Record mismatch concentration in {row['district']}",
            "detail": f"{row['count']} claims in {row['district']}, {row['state']} have land record discrepancies.",
            "metric": f"{row['count']} mismatches",
            "trend": "elevated",
            "recommendation": f"Conduct record audit in {row['district']} district."
        })
    
    # Workflow bottleneck rising
    cur.execute("""
        SELECT committee_stage, COUNT(*) as count 
        FROM claims WHERE status IN ('Pending', 'Under Review')
        GROUP BY committee_stage 
        HAVING count > 100
        ORDER BY count DESC
    """)
    for row in cur.fetchall():
        warnings.append({
            "id": f"ew-wf-{row['committee_stage'][:4]}",
            "type": "workflow_bottleneck",
            "severity": "caution",
            "title": f"Backlog at {row['committee_stage']} stage is rising",
            "detail": f"{row['count']} claims are currently pending at the {row['committee_stage']} stage.",
            "metric": f"{row['count']} claims pending",
            "trend": "increasing",
            "recommendation": f"Review resource allocation for {row['committee_stage']} committees."
        })
    
    # Geographic clusters
    cur.execute("""
        SELECT district, state, COUNT(*) as count
        FROM claims WHERE geographic_anomaly_flag=1
        GROUP BY district HAVING count >= 5
        ORDER BY count DESC
    """)
    for row in cur.fetchall():
        warnings.append({
            "id": f"ew-geo-{row['district']}",
            "type": "geographic_cluster",
            "severity": "alert",
            "title": f"Cluster anomaly detected: {row['count']} claims in {row['district']}",
            "detail": f"A geographic cluster of {row['count']} anomalous claims detected in {row['district']}, {row['state']}.",
            "metric": f"{row['count']} clustered claims",
            "trend": "stable",
            "recommendation": "Investigate potential coordinated filing pattern."
        })
    
    # High-risk unresolved
    cur.execute("""
        SELECT COUNT(*) as count FROM claims 
        WHERE risk_score >= 70 AND status NOT IN ('Approved', 'Rejected')
    """)
    hr = cur.fetchone()["count"]
    if hr > 10:
        warnings.append({
            "id": "ew-hr",
            "type": "high_risk_unresolved",
            "severity": "alert",
            "title": f"{hr} high-risk claims remain unresolved",
            "detail": f"{hr} claims with risk scores above 70 are still pending resolution.",
            "metric": f"{hr} unresolved",
            "trend": "increasing",
            "recommendation": "Accelerate review of high-priority cases."
        })
    
    conn.close()
    
    return {
        "warnings": warnings,
        "disclaimer": "Modelled early warning based on synthetic demo data."
    }


# ============================================================
# WHAT-IF SIMULATOR
# ============================================================

@app.post("/api/what-if")
def simulate_what_if(req: WhatIfRequest):
    conn = get_db()
    cur = conn.cursor()
    
    # Current state
    cur.execute("SELECT COUNT(*) FROM claims WHERE status IN ('Pending', 'Under Review')")
    current_backlog = cur.fetchone()[0]
    
    cur.execute("SELECT COUNT(*) FROM claims WHERE risk_score >= ? AND status NOT IN ('Approved', 'Rejected')", 
                (req.priority_threshold,))
    current_high_risk = cur.fetchone()[0]
    
    cur.execute("SELECT AVG(processing_days) FROM claims WHERE status NOT IN ('Approved', 'Rejected')")
    current_avg_resolution = round(cur.fetchone()[0] or 0, 1)
    
    conn.close()
    
    # Simulate
    total_reviewable = req.investigation_capacity * req.weeks
    
    # Projected backlog
    projected_backlog = max(0, current_backlog - total_reviewable)
    
    # High-risk claims addressed first
    high_risk_resolved = min(current_high_risk, int(total_reviewable * 0.6))
    projected_high_risk = max(0, current_high_risk - high_risk_resolved)
    
    # Average resolution improvement
    efficiency_factor = min(0.4, (req.investigation_capacity - 20) / 100)
    projected_avg_resolution = round(max(30, current_avg_resolution * (1 - efficiency_factor)), 1)
    
    improvement_pct = round((1 - projected_backlog / max(current_backlog, 1)) * 100, 1)
    
    return WhatIfResponse(
        current_backlog=current_backlog,
        projected_backlog=projected_backlog,
        current_high_risk=current_high_risk,
        projected_high_risk=projected_high_risk,
        current_avg_resolution=current_avg_resolution,
        projected_avg_resolution=projected_avg_resolution,
        capacity=req.investigation_capacity,
        weeks=req.weeks,
        claims_reviewable=total_reviewable,
        improvement_pct=improvement_pct,
    )


# ============================================================
# FRA COPILOT (Deterministic fallback)
# ============================================================

@app.post("/api/copilot")
def copilot_query(req: CopilotRequest):
    conn = get_db()
    cur = conn.cursor()
    query_lower = req.query.lower().strip()
    
    response = {
        "query": req.query,
        "answer": "",
        "data": None,
        "references": [],
        "disclaimer": "AI-assisted response based on synthetic demo data.",
        "type": "text"
    }
    
    # Pattern matching for common queries
    if any(kw in query_lower for kw in ["immediate attention", "need attention", "urgent", "priority", "critical"]):
        cur.execute("""
            SELECT district, state, AVG(risk_score) as avg_risk,
                   COUNT(*) as total,
                   SUM(CASE WHEN risk_level IN ('Critical','High') THEN 1 ELSE 0 END) as high_risk
            FROM claims 
            GROUP BY district, state
            HAVING avg_risk > 30
            ORDER BY avg_risk DESC LIMIT 5
        """)
        districts = [dict(r) for r in cur.fetchall()]
        
        answer = f"{len(districts)} districts currently require priority attention based on their risk profiles:\n\n"
        refs = []
        for i, d in enumerate(districts):
            d["avg_risk"] = round(d["avg_risk"], 1)
            answer += f"**{i+1}. {d['district']}** ({d['state']}) — Average risk: {d['avg_risk']}, High-risk claims: {d['high_risk']}/{d['total']}\n"
            refs.append({"type": "district", "id": d["district"], "name": d["district"], "state": d["state"]})
        
        response["answer"] = answer
        response["data"] = districts
        response["references"] = refs
        response["type"] = "district_list"
    
    elif any(kw in query_lower for kw in ["why", "flagged", "risk"]) and any(d.lower() in query_lower for d in _get_all_districts(cur)):
        # Find which district
        dist_name = None
        for d in _get_all_districts(cur):
            if d.lower() in query_lower:
                dist_name = d
                break
        
        if dist_name:
            cur.execute("""
                SELECT AVG(risk_score) as avg_risk, COUNT(*) as total,
                       SUM(CASE WHEN delay_flag=1 THEN 1 ELSE 0 END) as delayed,
                       SUM(CASE WHEN record_mismatch_flag=1 THEN 1 ELSE 0 END) as mismatches,
                       SUM(CASE WHEN risk_level IN ('Critical','High') THEN 1 ELSE 0 END) as high_risk,
                       AVG(processing_days) as avg_processing
                FROM claims WHERE district=?
            """, (dist_name,))
            stats = dict(cur.fetchone())
            
            answer = f"**{dist_name}** has an average risk score of {round(stats['avg_risk'], 1)}/100.\n\n"
            answer += "**Key risk factors:**\n"
            if stats["delayed"] > 0:
                answer += f"- **{stats['delayed']} delayed claims** with average processing time of {round(stats['avg_processing'])} days\n"
            if stats["mismatches"] > 0:
                answer += f"- **{stats['mismatches']} land record mismatches** requiring verification\n"
            if stats["high_risk"] > 0:
                answer += f"- **{stats['high_risk']} high-risk claims** out of {stats['total']} total\n"
            
            response["answer"] = answer
            response["references"] = [{"type": "district", "id": dist_name, "name": dist_name}]
            response["type"] = "district_analysis"
    
    elif any(kw in query_lower for kw in ["delayed", "delay", "180 days", "slow"]):
        cur.execute("""
            SELECT claim_id, district, state, processing_days, risk_score, risk_level, status
            FROM claims WHERE delay_flag=1 ORDER BY processing_days DESC LIMIT 10
        """)
        delayed = [dict(r) for r in cur.fetchall()]
        
        cur.execute("SELECT COUNT(*) FROM claims WHERE delay_flag=1")
        total_delayed = cur.fetchone()[0]
        
        answer = f"**{total_delayed} claims** have processing times exceeding 180 days. Top delayed claims:\n\n"
        refs = []
        for i, c in enumerate(delayed):
            answer += f"**{i+1}. {c['claim_id']}** ({c['district']}, {c['state']}) — {c['processing_days']} days, Risk: {c['risk_score']}\n"
            refs.append({"type": "claim", "id": c["claim_id"], "name": c["claim_id"]})
        
        response["answer"] = answer
        response["data"] = delayed
        response["references"] = refs
        response["type"] = "claim_list"
    
    elif any(kw in query_lower for kw in ["mismatch", "record", "discrepancy", "land record"]):
        cur.execute("""
            SELECT claim_id, district, state, claimed_area, recorded_area, risk_score
            FROM claims WHERE record_mismatch_flag=1 
            ORDER BY ABS(claimed_area - recorded_area) DESC LIMIT 10
        """)
        mismatches = [dict(r) for r in cur.fetchall()]
        
        cur.execute("SELECT COUNT(*) FROM claims WHERE record_mismatch_flag=1")
        total = cur.fetchone()[0]
        
        answer = f"**{total} claims** have significant land record mismatches. Largest discrepancies:\n\n"
        refs = []
        for i, c in enumerate(mismatches):
            diff_pct = round(abs(c["claimed_area"] - c["recorded_area"]) / max(c["recorded_area"], 0.1) * 100)
            answer += f"**{i+1}. {c['claim_id']}** — Claimed: {c['claimed_area']} ha, Recorded: {c['recorded_area']} ha ({diff_pct}% discrepancy)\n"
            refs.append({"type": "claim", "id": c["claim_id"], "name": c["claim_id"]})
        
        response["answer"] = answer
        response["data"] = mismatches
        response["references"] = refs
        response["type"] = "claim_list"
    
    elif any(kw in query_lower for kw in ["investigate first", "what should", "priority", "prioritize"]):
        cur.execute("""
            SELECT claim_id, district, state, risk_score, risk_level, anomaly_reasons, processing_days
            FROM claims ORDER BY risk_score DESC LIMIT 5
        """)
        top = [dict(r) for r in cur.fetchall()]
        
        answer = "Based on current risk assessment, the top investigation priorities are:\n\n"
        refs = []
        for i, c in enumerate(top):
            reasons = json.loads(c["anomaly_reasons"]) if c["anomaly_reasons"] else []
            reason_text = reasons[0] if reasons else "Elevated risk score"
            answer += f"**#{i+1} {c['claim_id']}** (Risk: {c['risk_score']}/100, {c['risk_level']})\n"
            answer += f"   {c['district']}, {c['state']} — {reason_text}\n\n"
            refs.append({"type": "claim", "id": c["claim_id"], "name": c["claim_id"]})
        
        response["answer"] = answer
        response["data"] = top
        response["references"] = refs
        response["type"] = "priority_list"
    
    elif any(kw in query_lower for kw in ["cluster", "geographic", "spatial"]):
        cur.execute("""
            SELECT district, state, COUNT(*) as count
            FROM claims WHERE geographic_anomaly_flag=1
            GROUP BY district ORDER BY count DESC
        """)
        clusters = [dict(r) for r in cur.fetchall()]
        
        cur.execute("SELECT COUNT(*) FROM claims WHERE geographic_anomaly_flag=1")
        total = cur.fetchone()[0]
        
        answer = f"**{total} claims** are part of geographic anomaly clusters.\n\n"
        if clusters:
            answer += "Cluster concentrations:\n"
            for c in clusters:
                answer += f"- **{c['district']}** ({c['state']}): {c['count']} clustered claims\n"
        
        response["answer"] = answer
        response["data"] = clusters
        response["type"] = "cluster_analysis"
    
    elif any(kw in query_lower for kw in ["overview", "summary", "status", "how many", "total"]):
        cur.execute("SELECT COUNT(*) FROM claims")
        total = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM claims WHERE status='Approved'")
        approved = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM claims WHERE status IN ('Pending','Under Review')")
        pending = cur.fetchone()[0]
        cur.execute("SELECT COUNT(*) FROM claims WHERE risk_level IN ('Critical','High')")
        high_risk = cur.fetchone()[0]
        cur.execute("SELECT COUNT(DISTINCT district) FROM claims")
        districts = cur.fetchone()[0]
        
        answer = f"**FRA Implementation Overview:**\n\n"
        answer += f"- **{total}** total claims across **{districts}** districts\n"
        answer += f"- **{approved}** approved ({round(approved/total*100, 1)}%)\n"
        answer += f"- **{pending}** pending review\n"
        answer += f"- **{high_risk}** flagged as high-risk or critical\n"
        
        response["answer"] = answer
        response["type"] = "overview"
    
    else:
        # Default response
        response["answer"] = (
            "I can help you with FRA monitoring queries. Try asking:\n\n"
            "- **\"Which districts need immediate attention?\"**\n"
            "- **\"Show claims delayed more than 180 days\"**\n"
            "- **\"Which claims have land record mismatches?\"**\n"
            "- **\"What should we investigate first?\"**\n"
            "- **\"Where are anomaly clusters concentrated?\"**\n"
            "- **\"Why is [district name] high risk?\"**\n"
            "- **\"Give me an overview of the FRA status\"**\n"
        )
        response["type"] = "suggestions"
    
    conn.close()
    return response


def _get_all_districts(cursor):
    cursor.execute("SELECT DISTINCT district_name FROM districts")
    return [r["district_name"] for r in cursor.fetchall()]


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/api/health")
def health_check():
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM claims")
        count = cur.fetchone()[0]
        conn.close()
        return {"status": "healthy", "claims_count": count, "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
