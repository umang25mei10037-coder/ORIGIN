"""
VANRA Synthetic FRA Data Generator
===================================
Generates deterministic synthetic Forest Rights Act claim data
for demonstration purposes. Uses a fixed seed for reproducibility.

DISCLAIMER: All data is synthetic/mock. No real government data is used.
"""

import json
import math
import os
import random
import sqlite3
from datetime import datetime, timedelta

import numpy as np

# Fixed seed for deterministic results
SEED = 42
random.seed(SEED)
np.random.seed(SEED)

# ============================================================
# GEOGRAPHIC DATA - Real Indian states and districts
# ============================================================

STATES_DATA = {
    "Madhya Pradesh": {
        "code": "MP",
        "center": [23.47, 77.95],
        "districts": {
            "Mandla": {"center": [22.60, 80.38], "population_tribal_pct": 57.9},
            "Dindori": {"center": [22.95, 81.07], "population_tribal_pct": 64.2},
            "Balaghat": {"center": [21.81, 80.19], "population_tribal_pct": 28.1},
            "Seoni": {"center": [22.08, 79.55], "population_tribal_pct": 29.5},
            "Chhindwara": {"center": [22.06, 78.94], "population_tribal_pct": 35.7},
            "Betul": {"center": [21.91, 77.90], "population_tribal_pct": 42.3},
            "Hoshangabad": {"center": [22.75, 77.73], "population_tribal_pct": 18.4},
            "Shahdol": {"center": [23.30, 81.35], "population_tribal_pct": 44.1},
            "Umaria": {"center": [23.52, 80.83], "population_tribal_pct": 52.6},
            "Anuppur": {"center": [23.10, 81.69], "population_tribal_pct": 47.8},
        }
    },
    "Chhattisgarh": {
        "code": "CG",
        "center": [21.27, 81.87],
        "districts": {
            "Bastar": {"center": [19.10, 81.95], "population_tribal_pct": 66.1},
            "Dantewada": {"center": [18.90, 81.35], "population_tribal_pct": 78.5},
            "Korba": {"center": [22.35, 82.68], "population_tribal_pct": 41.2},
            "Surguja": {"center": [23.11, 83.09], "population_tribal_pct": 56.7},
            "Kanker": {"center": [20.27, 81.49], "population_tribal_pct": 53.6},
            "Jashpur": {"center": [22.89, 84.14], "population_tribal_pct": 63.4},
            "Koriya": {"center": [23.25, 82.59], "population_tribal_pct": 48.2},
            "Rajnandgaon": {"center": [21.10, 81.03], "population_tribal_pct": 31.5},
        }
    },
    "Odisha": {
        "code": "OD",
        "center": [20.94, 84.80],
        "districts": {
            "Koraput": {"center": [18.81, 82.71], "population_tribal_pct": 50.6},
            "Malkangiri": {"center": [18.35, 81.90], "population_tribal_pct": 57.4},
            "Rayagada": {"center": [19.17, 83.42], "population_tribal_pct": 55.8},
            "Kandhamal": {"center": [20.47, 84.24], "population_tribal_pct": 51.5},
            "Mayurbhanj": {"center": [21.94, 86.73], "population_tribal_pct": 56.6},
            "Sundargarh": {"center": [22.12, 84.04], "population_tribal_pct": 50.7},
            "Keonjhar": {"center": [21.63, 85.58], "population_tribal_pct": 44.5},
        }
    },
    "Jharkhand": {
        "code": "JH",
        "center": [23.61, 85.28],
        "districts": {
            "Ranchi": {"center": [23.35, 85.33], "population_tribal_pct": 35.7},
            "Gumla": {"center": [23.04, 84.54], "population_tribal_pct": 68.4},
            "Lohardaga": {"center": [23.44, 84.68], "population_tribal_pct": 56.0},
            "West Singhbhum": {"center": [22.37, 85.84], "population_tribal_pct": 67.3},
            "Dumka": {"center": [24.27, 87.25], "population_tribal_pct": 43.1},
            "Latehar": {"center": [23.74, 84.50], "population_tribal_pct": 45.7},
        }
    },
    "Maharashtra": {
        "code": "MH",
        "center": [19.66, 75.30],
        "districts": {
            "Gadchiroli": {"center": [20.18, 80.00], "population_tribal_pct": 38.7},
            "Nandurbar": {"center": [21.37, 74.24], "population_tribal_pct": 65.0},
            "Nashik": {"center": [20.00, 73.78], "population_tribal_pct": 25.6},
            "Thane": {"center": [19.22, 73.08], "population_tribal_pct": 14.0},
            "Amravati": {"center": [20.93, 77.75], "population_tribal_pct": 13.8},
        }
    }
}

FOREST_ZONES = [
    "Reserved Forest", "Protected Forest", "Revenue Forest",
    "Community Forest", "Buffer Zone", "Core Forest Area",
    "Degraded Forest", "Plantation Area"
]

LAND_TYPES = [
    "Agricultural", "Homestead", "Community Resource",
    "Minor Forest Produce", "Grazing Land", "Water Body Adjacent",
    "Shifting Cultivation", "Traditional Settlement"
]

CLAIM_TYPES = ["Individual", "Community"]

WORKFLOW_STAGES = [
    "Filed", "Gram Sabha Verification", "SDLC Review",
    "DLC Review", "Sub-Divisional Review", "Final Decision"
]

STATUS_OPTIONS = ["Approved", "Pending", "Rejected", "Under Review", "Remanded"]

# ============================================================
# HELPER FUNCTIONS
# ============================================================

def jitter_coord(center, radius_km=30):
    """Add realistic jitter to coordinates (approx)."""
    lat_jitter = random.uniform(-radius_km/111, radius_km/111)
    lng_jitter = random.uniform(-radius_km/111, radius_km/111)
    return [
        round(center[0] + lat_jitter, 6),
        round(center[1] + lng_jitter, 6)
    ]

def generate_claim_id(state_code, idx):
    return f"FRA-{state_code}-{idx:04d}"

def random_date(start, end):
    delta = end - start
    random_days = random.randint(0, delta.days)
    return start + timedelta(days=random_days)

# ============================================================
# GENERATE CLAIMS
# ============================================================

def generate_data():
    claims = []
    land_parcels = []
    land_records = []
    workflow_events = []
    
    claim_idx = 0
    
    # Date range
    start_date = datetime(2024, 1, 1)
    end_date = datetime(2026, 6, 30)
    
    # ---- HERO ANOMALIES (guaranteed for demo) ----
    hero_claims = []
    
    for state_name, state_info in STATES_DATA.items():
        state_code = state_info["code"]
        districts = state_info["districts"]
        
        for dist_name, dist_info in districts.items():
            # Number of claims per district: proportional to tribal population %
            tribal_pct = dist_info["population_tribal_pct"]
            base_count = int(60 + tribal_pct * 1.5 + random.randint(-15, 25))
            base_count = max(40, min(base_count, 220))
            
            for i in range(base_count):
                claim_idx += 1
                claim_id = generate_claim_id(state_code, claim_idx)
                coords = jitter_coord(dist_info["center"], radius_km=25)
                
                claim_date = random_date(start_date, end_date)
                claim_type = random.choices(CLAIM_TYPES, weights=[0.75, 0.25])[0]
                land_type = random.choice(LAND_TYPES)
                forest_zone = random.choice(FOREST_ZONES)
                
                # Generate area data
                if claim_type == "Individual":
                    claimed_area = round(random.uniform(0.5, 5.0), 2)
                else:
                    claimed_area = round(random.uniform(2.0, 25.0), 2)
                
                # Recorded area: mostly close, but some natural mismatches
                if random.random() < 0.07:  # 7% significant mismatch
                    area_ratio = random.choice([random.uniform(0.3, 0.6), random.uniform(1.5, 2.5)])
                elif random.random() < 0.12:
                    area_ratio = random.uniform(0.7, 0.85) if random.random() < 0.5 else random.uniform(1.15, 1.4)
                else:
                    area_ratio = random.uniform(0.88, 1.12)
                recorded_area = round(claimed_area * area_ratio, 2)
                
                # Processing time - wider distribution for natural anomalies
                if random.random() < 0.08:  # 8% chance of very long processing
                    processing_days = int(random.uniform(180, 350))
                elif random.random() < 0.15:
                    processing_days = int(random.uniform(120, 200))
                else:
                    processing_days = int(random.gauss(85, 40))
                processing_days = max(15, processing_days)
                
                verification_days = int(random.gauss(25, 12))
                verification_days = max(5, verification_days)
                
                # Workflow stage
                stage_idx = random.choices(
                    range(len(WORKFLOW_STAGES)),
                    weights=[5, 15, 25, 30, 15, 10]
                )[0]
                committee_stage = WORKFLOW_STAGES[stage_idx]
                
                # Status
                if committee_stage == "Final Decision":
                    status = random.choices(
                        ["Approved", "Rejected", "Remanded"],
                        weights=[60, 25, 15]
                    )[0]
                elif stage_idx >= 3:
                    status = random.choices(
                        ["Under Review", "Pending"],
                        weights=[60, 40]
                    )[0]
                else:
                    status = "Pending"
                
                verification_date = claim_date + timedelta(days=verification_days)
                
                if status == "Approved":
                    approval_days = processing_days
                    approval_date = claim_date + timedelta(days=approval_days)
                else:
                    approval_days = None
                    approval_date = None
                
                record_status = random.choices(
                    ["Verified", "Pending Verification", "Discrepancy Found"],
                    weights=[65, 25, 10]
                )[0]
                
                # Initialize anomaly flags
                delay_flag = 0
                record_mismatch_flag = 0
                area_anomaly_flag = 0
                geographic_anomaly_flag = 0
                workflow_anomaly_flag = 0
                anomaly_reasons = []
                
                # Check natural anomalies
                if processing_days > 180:
                    delay_flag = 1
                    anomaly_reasons.append("Processing delay exceeds 180 days")
                
                area_diff_pct = abs(claimed_area - recorded_area) / max(recorded_area, 0.1) * 100
                if area_diff_pct > 30:
                    record_mismatch_flag = 1
                    anomaly_reasons.append(f"Area mismatch: {area_diff_pct:.0f}%")
                
                claims.append({
                    "claim_id": claim_id,
                    "state": state_name,
                    "district": dist_name,
                    "latitude": coords[0],
                    "longitude": coords[1],
                    "claim_date": claim_date.strftime("%Y-%m-%d"),
                    "verification_date": verification_date.strftime("%Y-%m-%d"),
                    "committee_stage": committee_stage,
                    "approval_date": approval_date.strftime("%Y-%m-%d") if approval_date else None,
                    "status": status,
                    "claimed_area": claimed_area,
                    "recorded_area": recorded_area,
                    "land_type": land_type,
                    "processing_days": processing_days,
                    "verification_days": verification_days,
                    "approval_days": approval_days,
                    "record_status": record_status,
                    "forest_zone": forest_zone,
                    "claim_type": claim_type,
                    "risk_score": 0,  # calculated later
                    "risk_level": "Low",
                    "delay_flag": delay_flag,
                    "record_mismatch_flag": record_mismatch_flag,
                    "area_anomaly_flag": area_anomaly_flag,
                    "geographic_anomaly_flag": geographic_anomaly_flag,
                    "workflow_anomaly_flag": workflow_anomaly_flag,
                    "anomaly_reasons": json.dumps(anomaly_reasons),
                })
                
                # Land parcel
                parcel_id = f"LP-{state_code}-{claim_idx:04d}"
                land_parcels.append({
                    "parcel_id": parcel_id,
                    "claim_id": claim_id,
                    "district": dist_name,
                    "state": state_name,
                    "survey_number": f"SN-{random.randint(100,999)}/{random.randint(1,50)}",
                    "area_hectares": recorded_area,
                    "land_type": land_type,
                    "forest_zone": forest_zone,
                    "latitude": coords[0],
                    "longitude": coords[1],
                })
                
                # Land record
                record_id = f"LR-{state_code}-{claim_idx:04d}"
                land_records.append({
                    "record_id": record_id,
                    "parcel_id": parcel_id,
                    "claim_id": claim_id,
                    "recorded_area": recorded_area,
                    "claimed_area": claimed_area,
                    "record_status": record_status,
                    "last_updated": random_date(
                        datetime(2023, 1, 1), datetime(2026, 3, 1)
                    ).strftime("%Y-%m-%d"),
                    "discrepancy_pct": round(area_diff_pct, 1),
                })
                
                # Workflow events
                current_date = claim_date
                for si in range(stage_idx + 1):
                    stage_duration = random.randint(5, 40)
                    event_date = current_date + timedelta(days=stage_duration)
                    workflow_events.append({
                        "event_id": f"WF-{claim_id}-{si}",
                        "claim_id": claim_id,
                        "stage": WORKFLOW_STAGES[si],
                        "stage_index": si,
                        "start_date": current_date.strftime("%Y-%m-%d"),
                        "end_date": event_date.strftime("%Y-%m-%d") if si < stage_idx else None,
                        "duration_days": stage_duration if si < stage_idx else None,
                        "status": "Completed" if si < stage_idx else "Active",
                    })
                    current_date = event_date
    
    # ============================================================
    # INJECT HERO ANOMALIES FOR GUARANTEED DEMO
    # ============================================================
    
    # Hero 1: Severe delay claim in Mandla
    hero_delay_idx = None
    for i, c in enumerate(claims):
        if c["district"] == "Mandla" and c["status"] == "Under Review":
            hero_delay_idx = i
            break
    if hero_delay_idx is not None:
        claims[hero_delay_idx]["processing_days"] = 327
        claims[hero_delay_idx]["delay_flag"] = 1
        claims[hero_delay_idx]["committee_stage"] = "DLC Review"
        reasons = json.loads(claims[hero_delay_idx]["anomaly_reasons"])
        if "Processing delay exceeds 180 days" not in reasons:
            reasons.append("Processing delay exceeds 180 days")
        reasons.append("Exceptionally high processing time: 327 days")
        claims[hero_delay_idx]["anomaly_reasons"] = json.dumps(reasons)
    
    # Hero 2: Severe land mismatch in Dindori
    hero_mismatch_idx = None
    for i, c in enumerate(claims):
        if c["district"] == "Dindori" and i != hero_delay_idx:
            hero_mismatch_idx = i
            break
    if hero_mismatch_idx is not None:
        claims[hero_mismatch_idx]["claimed_area"] = 4.9
        claims[hero_mismatch_idx]["recorded_area"] = 1.8
        claims[hero_mismatch_idx]["record_mismatch_flag"] = 1
        claims[hero_mismatch_idx]["record_status"] = "Discrepancy Found"
        # Update land record too
        lr_idx = hero_mismatch_idx
        if lr_idx < len(land_records):
            land_records[lr_idx]["claimed_area"] = 4.9
            land_records[lr_idx]["recorded_area"] = 1.8
            land_records[lr_idx]["discrepancy_pct"] = 172.2
            land_records[lr_idx]["record_status"] = "Discrepancy Found"
        reasons = ["Land record mismatch: 172%", "Claimed area 4.9 ha vs recorded 1.8 ha"]
        claims[hero_mismatch_idx]["anomaly_reasons"] = json.dumps(reasons)
    
    # Hero 3: Unusual area claim in Bastar
    hero_area_idx = None
    for i, c in enumerate(claims):
        if c["district"] == "Bastar" and c["claim_type"] == "Individual" and i not in [hero_delay_idx, hero_mismatch_idx]:
            hero_area_idx = i
            break
    if hero_area_idx is not None:
        claims[hero_area_idx]["claimed_area"] = 12.5
        claims[hero_area_idx]["recorded_area"] = 2.1
        claims[hero_area_idx]["area_anomaly_flag"] = 1
        claims[hero_area_idx]["record_mismatch_flag"] = 1
        reasons = ["Unusually large individual claim: 12.5 ha", "Area mismatch: 495%"]
        claims[hero_area_idx]["anomaly_reasons"] = json.dumps(reasons)
    
    # Hero 4: Geographic cluster in Korba (7 claims close together with issues)
    cluster_indices = []
    for i, c in enumerate(claims):
        if c["district"] == "Korba" and i not in [hero_delay_idx, hero_mismatch_idx, hero_area_idx]:
            cluster_indices.append(i)
        if len(cluster_indices) >= 7:
            break
    
    cluster_center = [22.35, 82.68]
    for j, ci in enumerate(cluster_indices):
        # Very tight geographic cluster
        claims[ci]["latitude"] = round(cluster_center[0] + random.uniform(-0.02, 0.02), 6)
        claims[ci]["longitude"] = round(cluster_center[1] + random.uniform(-0.02, 0.02), 6)
        claims[ci]["geographic_anomaly_flag"] = 1
        claims[ci]["processing_days"] = random.randint(140, 220)
        claims[ci]["delay_flag"] = 1 if claims[ci]["processing_days"] > 180 else 0
        reasons = json.loads(claims[ci]["anomaly_reasons"])
        reasons.append(f"Part of geographic anomaly cluster ({len(cluster_indices)} claims)")
        claims[ci]["anomaly_reasons"] = json.dumps(reasons)
    
    # Hero 5: Workflow bottleneck in Gumla - many stuck at SDLC Review
    bottleneck_count = 0
    for i, c in enumerate(claims):
        if c["district"] == "Gumla" and i not in [hero_delay_idx, hero_mismatch_idx, hero_area_idx] + cluster_indices:
            if bottleneck_count < 35:
                claims[i]["committee_stage"] = "SDLC Review"
                claims[i]["status"] = "Pending"
                claims[i]["workflow_anomaly_flag"] = 1
                reasons = json.loads(claims[i]["anomaly_reasons"])
                reasons.append("Workflow bottleneck: stuck at SDLC Review stage")
                claims[i]["anomaly_reasons"] = json.dumps(reasons)
                bottleneck_count += 1
    
    # Hero 6: Combined high-risk hero claim in Mandla - THE DEMO HERO
    hero_combined_idx = None
    for i, c in enumerate(claims):
        if c["district"] == "Mandla" and i not in [hero_delay_idx, hero_mismatch_idx, hero_area_idx] + cluster_indices:
            hero_combined_idx = i
            break
    if hero_combined_idx is not None:
        claims[hero_combined_idx]["claim_id"] = f"FRA-MP-2038"
        claims[hero_combined_idx]["processing_days"] = 214
        claims[hero_combined_idx]["claimed_area"] = 4.9
        claims[hero_combined_idx]["recorded_area"] = 1.8
        claims[hero_combined_idx]["delay_flag"] = 1
        claims[hero_combined_idx]["record_mismatch_flag"] = 1
        claims[hero_combined_idx]["area_anomaly_flag"] = 1
        claims[hero_combined_idx]["geographic_anomaly_flag"] = 1
        claims[hero_combined_idx]["workflow_anomaly_flag"] = 1
        claims[hero_combined_idx]["committee_stage"] = "DLC Review"
        claims[hero_combined_idx]["status"] = "Under Review"
        claims[hero_combined_idx]["record_status"] = "Discrepancy Found"
        claims[hero_combined_idx]["claim_date"] = "2025-11-12"
        claims[hero_combined_idx]["verification_date"] = "2025-11-30"
        reasons = [
            "Processing delay: 214 days (threshold: 180)",
            "Land record mismatch: 172% (claimed 4.9 ha vs recorded 1.8 ha)",
            "Unusually large area for individual claim type",
            "Located within geographic anomaly cluster",
            "Workflow bottleneck at DLC Review stage"
        ]
        claims[hero_combined_idx]["anomaly_reasons"] = json.dumps(reasons)
        
        # Update corresponding land record
        if hero_combined_idx < len(land_records):
            land_records[hero_combined_idx]["claimed_area"] = 4.9
            land_records[hero_combined_idx]["recorded_area"] = 1.8
            land_records[hero_combined_idx]["discrepancy_pct"] = 172.2
            land_records[hero_combined_idx]["record_status"] = "Discrepancy Found"
    
    # ============================================================
    # COMPUTE RISK SCORES
    # ============================================================
    
    for c in claims:
        score = 0
        
        # Delay factor (0-25)
        if c["processing_days"] > 180:
            score += min(25, 15 + int((c["processing_days"] - 180) / 15))
        elif c["processing_days"] > 120:
            score += min(18, 5 + int((c["processing_days"] - 120) / 8))
        elif c["processing_days"] > 90:
            score += int((c["processing_days"] - 90) / 8)
        
        # Record integrity (0-25)
        area_diff = abs(c["claimed_area"] - c["recorded_area"]) / max(c["recorded_area"], 0.1) * 100
        if area_diff > 100:
            score += 25
        elif area_diff > 50:
            score += 20
        elif area_diff > 30:
            score += 15
        elif area_diff > 15:
            score += 10
        elif area_diff > 8:
            score += 5
        
        # Area anomaly (0-15)
        if c["claim_type"] == "Individual" and c["claimed_area"] > 4:
            score += min(15, int(c["claimed_area"] * 2))
        elif c["claim_type"] == "Community" and c["claimed_area"] > 18:
            score += min(15, int((c["claimed_area"] - 15)))
        
        # Geographic anomaly (0-15)
        if c["geographic_anomaly_flag"]:
            score += 13
        
        # Workflow anomaly (0-20)
        if c["workflow_anomaly_flag"]:
            score += 17
        if c["committee_stage"] in ["SDLC Review", "DLC Review"] and c["processing_days"] > 100:
            score += 8
        
        # Bonus: multiple flags compound
        flag_count = c["delay_flag"] + c["record_mismatch_flag"] + c["area_anomaly_flag"] + c["geographic_anomaly_flag"] + c["workflow_anomaly_flag"]
        if flag_count >= 3:
            score += 10
        elif flag_count >= 2:
            score += 5
        
        score = min(100, max(0, score))
        c["risk_score"] = score
        
        if score >= 75:
            c["risk_level"] = "Critical"
        elif score >= 55:
            c["risk_level"] = "High"
        elif score >= 35:
            c["risk_level"] = "Medium"
        elif score >= 15:
            c["risk_level"] = "Low"
        else:
            c["risk_level"] = "Minimal"

    
    # Make sure hero claim has high score
    if hero_combined_idx is not None:
        claims[hero_combined_idx]["risk_score"] = 94
        claims[hero_combined_idx]["risk_level"] = "Critical"
    
    return claims, land_parcels, land_records, workflow_events


# ============================================================
# CREATE DATABASE
# ============================================================

def create_database(db_path):
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    
    if os.path.exists(db_path):
        os.remove(db_path)
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # States table
    cursor.execute("""
        CREATE TABLE states (
            state_name TEXT PRIMARY KEY,
            state_code TEXT UNIQUE,
            center_lat REAL,
            center_lng REAL
        )
    """)
    
    # Districts table
    cursor.execute("""
        CREATE TABLE districts (
            district_name TEXT,
            state_name TEXT,
            center_lat REAL,
            center_lng REAL,
            population_tribal_pct REAL,
            PRIMARY KEY (district_name, state_name),
            FOREIGN KEY (state_name) REFERENCES states(state_name)
        )
    """)
    
    # Claims table
    cursor.execute("""
        CREATE TABLE claims (
            claim_id TEXT PRIMARY KEY,
            state TEXT,
            district TEXT,
            latitude REAL,
            longitude REAL,
            claim_date TEXT,
            verification_date TEXT,
            committee_stage TEXT,
            approval_date TEXT,
            status TEXT,
            claimed_area REAL,
            recorded_area REAL,
            land_type TEXT,
            processing_days INTEGER,
            verification_days INTEGER,
            approval_days INTEGER,
            record_status TEXT,
            forest_zone TEXT,
            claim_type TEXT,
            risk_score INTEGER,
            risk_level TEXT,
            delay_flag INTEGER,
            record_mismatch_flag INTEGER,
            area_anomaly_flag INTEGER,
            geographic_anomaly_flag INTEGER,
            workflow_anomaly_flag INTEGER,
            anomaly_reasons TEXT,
            FOREIGN KEY (state) REFERENCES states(state_name)
        )
    """)
    
    # Land parcels
    cursor.execute("""
        CREATE TABLE land_parcels (
            parcel_id TEXT PRIMARY KEY,
            claim_id TEXT,
            district TEXT,
            state TEXT,
            survey_number TEXT,
            area_hectares REAL,
            land_type TEXT,
            forest_zone TEXT,
            latitude REAL,
            longitude REAL,
            FOREIGN KEY (claim_id) REFERENCES claims(claim_id)
        )
    """)
    
    # Land records
    cursor.execute("""
        CREATE TABLE land_records (
            record_id TEXT PRIMARY KEY,
            parcel_id TEXT,
            claim_id TEXT,
            recorded_area REAL,
            claimed_area REAL,
            record_status TEXT,
            last_updated TEXT,
            discrepancy_pct REAL,
            FOREIGN KEY (parcel_id) REFERENCES land_parcels(parcel_id),
            FOREIGN KEY (claim_id) REFERENCES claims(claim_id)
        )
    """)
    
    # Workflow events
    cursor.execute("""
        CREATE TABLE workflow_events (
            event_id TEXT PRIMARY KEY,
            claim_id TEXT,
            stage TEXT,
            stage_index INTEGER,
            start_date TEXT,
            end_date TEXT,
            duration_days INTEGER,
            status TEXT,
            FOREIGN KEY (claim_id) REFERENCES claims(claim_id)
        )
    """)
    
    # Anomalies (computed)
    cursor.execute("""
        CREATE TABLE anomalies (
            anomaly_id INTEGER PRIMARY KEY AUTOINCREMENT,
            claim_id TEXT,
            district TEXT,
            state TEXT,
            anomaly_type TEXT,
            severity TEXT,
            description TEXT,
            risk_contribution INTEGER,
            detected_at TEXT,
            FOREIGN KEY (claim_id) REFERENCES claims(claim_id)
        )
    """)
    
    return conn


def seed_database(conn, claims, land_parcels, land_records, workflow_events):
    cursor = conn.cursor()
    
    # Insert states
    for state_name, info in STATES_DATA.items():
        cursor.execute(
            "INSERT INTO states VALUES (?, ?, ?, ?)",
            (state_name, info["code"], info["center"][0], info["center"][1])
        )
    
    # Insert districts
    for state_name, info in STATES_DATA.items():
        for dist_name, dist_info in info["districts"].items():
            cursor.execute(
                "INSERT INTO districts VALUES (?, ?, ?, ?, ?)",
                (dist_name, state_name, dist_info["center"][0], dist_info["center"][1], dist_info["population_tribal_pct"])
            )
    
    # Insert claims
    for c in claims:
        cursor.execute("""
            INSERT INTO claims VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?
            )
        """, (
            c["claim_id"], c["state"], c["district"],
            c["latitude"], c["longitude"],
            c["claim_date"], c["verification_date"],
            c["committee_stage"], c["approval_date"],
            c["status"], c["claimed_area"], c["recorded_area"],
            c["land_type"], c["processing_days"],
            c["verification_days"], c["approval_days"],
            c["record_status"], c["forest_zone"],
            c["claim_type"], c["risk_score"], c["risk_level"],
            c["delay_flag"], c["record_mismatch_flag"],
            c["area_anomaly_flag"], c["geographic_anomaly_flag"],
            c["workflow_anomaly_flag"], c["anomaly_reasons"]
        ))
    
    # Insert land parcels
    for p in land_parcels:
        cursor.execute("""
            INSERT INTO land_parcels VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            p["parcel_id"], p["claim_id"], p["district"], p["state"],
            p["survey_number"], p["area_hectares"], p["land_type"],
            p["forest_zone"], p["latitude"], p["longitude"]
        ))
    
    # Insert land records
    for r in land_records:
        cursor.execute("""
            INSERT INTO land_records VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            r["record_id"], r["parcel_id"], r["claim_id"],
            r["recorded_area"], r["claimed_area"],
            r["record_status"], r["last_updated"], r["discrepancy_pct"]
        ))
    
    # Insert workflow events
    for w in workflow_events:
        cursor.execute("""
            INSERT INTO workflow_events VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            w["event_id"], w["claim_id"], w["stage"], w["stage_index"],
            w["start_date"], w["end_date"], w["duration_days"], w["status"]
        ))
    
    # Generate anomaly entries from claims
    anomaly_id = 0
    for c in claims:
        if c["delay_flag"]:
            anomaly_id += 1
            cursor.execute("""
                INSERT INTO anomalies (claim_id, district, state, anomaly_type, severity, description, risk_contribution, detected_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                c["claim_id"], c["district"], c["state"], "DELAY",
                "High" if c["processing_days"] > 250 else "Medium",
                f"Processing time: {c['processing_days']} days (threshold: 180)",
                min(25, int((c["processing_days"] - 90) / 10)),
                datetime.now().strftime("%Y-%m-%d")
            ))
        
        if c["record_mismatch_flag"]:
            anomaly_id += 1
            diff_pct = abs(c["claimed_area"] - c["recorded_area"]) / max(c["recorded_area"], 0.1) * 100
            cursor.execute("""
                INSERT INTO anomalies (claim_id, district, state, anomaly_type, severity, description, risk_contribution, detected_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                c["claim_id"], c["district"], c["state"], "RECORD_MISMATCH",
                "Critical" if diff_pct > 100 else "High",
                f"Area discrepancy: {diff_pct:.0f}% (claimed {c['claimed_area']} ha vs recorded {c['recorded_area']} ha)",
                min(25, int(diff_pct / 5)),
                datetime.now().strftime("%Y-%m-%d")
            ))
        
        if c["geographic_anomaly_flag"]:
            anomaly_id += 1
            cursor.execute("""
                INSERT INTO anomalies (claim_id, district, state, anomaly_type, severity, description, risk_contribution, detected_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                c["claim_id"], c["district"], c["state"], "GEOGRAPHIC_CLUSTER",
                "High", "Part of geographic anomaly cluster",
                12, datetime.now().strftime("%Y-%m-%d")
            ))
        
        if c["workflow_anomaly_flag"]:
            anomaly_id += 1
            cursor.execute("""
                INSERT INTO anomalies (claim_id, district, state, anomaly_type, severity, description, risk_contribution, detected_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                c["claim_id"], c["district"], c["state"], "WORKFLOW_BOTTLENECK",
                "Medium", f"Workflow bottleneck at {c['committee_stage']}",
                15, datetime.now().strftime("%Y-%m-%d")
            ))
        
        if c["area_anomaly_flag"]:
            anomaly_id += 1
            cursor.execute("""
                INSERT INTO anomalies (claim_id, district, state, anomaly_type, severity, description, risk_contribution, detected_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                c["claim_id"], c["district"], c["state"], "UNUSUAL_AREA",
                "High", f"Unusually large claim: {c['claimed_area']} ha",
                min(15, int(c["claimed_area"] * 1.5)),
                datetime.now().strftime("%Y-%m-%d")
            ))
    
    conn.commit()
    
    # Print statistics
    cursor.execute("SELECT COUNT(*) FROM claims")
    total_claims = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM claims WHERE risk_level='Critical'")
    critical = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM claims WHERE risk_level='High'")
    high = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM anomalies")
    total_anomalies = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(DISTINCT district) FROM claims")
    dist_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(DISTINCT state) FROM claims")
    state_count = cursor.fetchone()[0]
    
    print(f"\n{'='*50}")
    print(f"VANRA Database Seeded Successfully")
    print(f"{'='*50}")
    print(f"States:          {state_count}")
    print(f"Districts:       {dist_count}")
    print(f"Total Claims:    {total_claims}")
    print(f"Critical Risk:   {critical}")
    print(f"High Risk:       {high}")
    print(f"Anomalies:       {total_anomalies}")
    print(f"Database:        {db_path}")
    print(f"{'='*50}\n")


if __name__ == "__main__":
    db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "vanra.db")
    
    print("Generating synthetic FRA data...")
    claims, parcels, records, events = generate_data()
    
    print(f"Generated {len(claims)} claims")
    print("Creating database...")
    
    conn = create_database(db_path)
    seed_database(conn, claims, parcels, records, events)
    conn.close()
    
    print("Done! Database ready at:", db_path)
