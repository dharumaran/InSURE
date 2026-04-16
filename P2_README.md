<!--
████████████████████████████████████████████████████████████████████████████████
  ShieldRide — README v2.0  |  Guidewire DEVTrails 2026  |  Phase 2 Submission
  Team: Recaptcha  |  Persona: Grocery/Q-Commerce (Zepto · Blinkit . Swiggy Instamart)
████████████████████████████████████████████████████████████████████████████████
-->

<div align="center">

<img src="https://img.shields.io/badge/Guidewire-DEVTrails%202026-0057B8?style=for-the-badge" alt="Guidewire DEVTrails 2026"/>
<img src="https://img.shields.io/badge/Phase-2%20%7C%20Scale-22c55e?style=for-the-badge" alt="Phase 2"/>
<img src="https://img.shields.io/badge/Persona-Q--Commerce%20%7C%20Zepto%20·%20Blinkit-f97316?style=for-the-badge" alt="Persona"/>


```
 ____  _   _ ___ _____ _     ____  ____  ___ ____  _____
/ ___|| | | |_ _| ____| |   |  _ \|  _ \|_ _|  _ \| ____|
\___ \| |_| || ||  _| | |   | | | | |_) || || | | |  _|
 ___) |  _  || || |___| |___| |_| |  _ < | || |_| | |___
|____/|_| |_|___|_____|_____|____/|_| \_\___|____/|_____|
```

### **Real-Time Parametric Income Protection for India's 10-Minute Delivery Workforce**
*When the storm hits, your income shouldn't stop.*

<br/>

| | |
|:---:|:---:|
| **7.7 million** gig workers in India with zero income safety net | **₹4,000–₹6,000** average monthly income loss during disruptions |
| **< 5 minutes** from trigger detection to UPI credit | **₹20-₹50/week** — less than a single delivery tip |

> *"India's gig workforce is projected to reach **23.5 million by 2030** — yet 0% have parametric income insurance."*
> — [NITI Aayog, India's Booming Gig and Platform Economy, 2022](https://www.niti.gov.in/sites/default/files/2022-06/Gig-Economy-June2022.pdf)

</div>

---

## 📋 Table of Contents

| # | Section |
|---|---------|
| 1 | [🔄 What Changed from Phase 1](#-what-changed-from-phase-1) |
| 2 | [🎯 The Problem We're Solving](#-the-problem-were-solving) |
| 3 | [👤 Persona Deep-Dive — Rajan](#-persona-deep-dive--rajan-the-zepto-rider) |
| 4 | [🌩️ Five Parametric Triggers](#️-five-parametric-triggers) |
| 5 | [⚙️ How ShieldRide Works](#️-how-shieldride-works--end-to-end-workflow) |
| 6 | [💰 The Financial Model](#-the-financial-model) |
| 7 | [🤖 AI Architecture — Phase 2 Approach](#-ai-architecture--phase-2-approach) |
| 8 | [🛡️ Fraud Defense](#️-fraud-defense) |
| 9 | [🏗️ System Architecture & Tech Stack](#️-system-architecture--tech-stack) |
| 10 | [📊 Business Viability](#-business-viability) |
| 11 | [🖥️ Application Pages](#️-application-pages) |
| 12 | [🗺️ Development Roadmap](#️-development-roadmap) |

---

## 🔄 What Changed from Phase 1

Phase 2 is a significant evolution from the Phase 1 seed submission. This section documents every architectural decision that changed, why it changed, and what replaced it. Transparency here is intentional — judges should be able to see exactly what we learned and how we adapted.

---

### 1. AI Architecture — XGBoost + Isolation Forest → Claude LLM

**Phase 1 design:**
Phase 1's README specified a 3-model ML ensemble for risk scoring, trigger probability, and fraud detection:

| Model | Algorithm | Purpose |
|-------|-----------|---------|
| Risk Scorer | XGBoost (n_estimators=100) | Weekly R_w computation |
| Trigger Probability | XGBoost classifier | Trigger likelihood forecasting |
| Fraud Detector | Isolation Forest | Anomaly detection on 18 behavioral features |

This was the correct *production-scale* design. For a platform with tens of thousands of workers and years of historical payout data, XGBoost on tabular features is the right call.

**Why it changed for Phase 2:**
The core problem is data. XGBoost and Isolation Forest require substantial labeled training data to perform meaningfully. At Phase 2 with a demo dataset (one worker, three payouts, four weeks of income history), training these models would produce meaningless outputs — or worse, confidently wrong outputs that would fail in front of judges.

More critically, the ML models are **invisible to judges** in a 5-minute demo. A model that returns `R_w = 0.374` silently tells a judge nothing. The intellectual rigor of the architecture is entirely hidden.

**What replaced it:**
A two-layer approach that preserves the mathematical integrity of Phase 1 while making the reasoning visible:

```
Layer 1 — TypeScript Math Engines (unchanged formulas, new runtime)
  premium-engine.ts   →  P_w = P_base × (1 + α × R_w)  [pure TS, deterministic]
  fraud-engine.ts     →  F_w = 0.40·B + 0.35·G + 0.25·L  [pure TS, deterministic]
  car-monitor.ts      →  CAR = Pool / Expected_Loss  [pure TS, deterministic]
  trigger-engine.ts   →  5 threshold evaluators  [pure TS, deterministic]

Layer 2 — Claude as Explainability Engine (new in Phase 2)
  risk-explainer.ts   →  Claude narrates the R_w computation in plain language
  fraud-explainer.ts  →  Claude explains the F_w decision with B/G/L breakdown
  support-chat.ts     →  Claude answers worker questions with policy context injected
```

**What this means in practice:**
The formulas — P_w, F_w, CAR, α recalibration — are all implemented identically to Phase 1's specification. Every weight, every threshold, every decision gate is preserved. The difference is that Claude now sits on top of these engines and translates their outputs into language a delivery worker or a judge can understand.

The Phase 1 architecture remains the correct Phase 3 production design. When real payout data accumulates at scale, the XGBoost + Isolation Forest layer will be re-introduced on top of the TypeScript engines for pattern learning that goes beyond what deterministic rules can catch.

---

### 2. LLM Choice — Gemini was considered, Claude was chosen

During Phase 2 planning we evaluated three LLM options:

| Option | Considered | Decision |
|--------|-----------|----------|
| Google Gemini 2.5 Flash | Yes | Rejected — strong capability but we wanted a distinct technical stack |
| GPT-4o Mini | Yes | Rejected — no meaningful differentiation for this use case |
| **Anthropic Claude (claude-sonnet-4-20250514)** | Yes | **Selected** — strongest structured reasoning for math explanation, direct API with no extra framework needed |

Claude's ability to reason step-by-step through formulas and produce structured output (JSON for risk breakdowns, plain English for worker-facing explanations) made it the best fit for ShieldRide's explainability-first design philosophy.

No orchestration framework (LangChain, Genkit, etc.) was added. Claude is called via direct `fetch` to the Anthropic API — keeping the dependency surface minimal and the code readable.

---

### 3. Database — PostgreSQL + TimescaleDB + Redis → Supabase (hosted PostgreSQL)

**Phase 1 design:**
Full self-managed stack: PostgreSQL 16 on AWS RDS Multi-AZ, TimescaleDB v2 for time-series sensor data, Redis Cluster v7 for session store and feature cache.

**Why it changed:**
This is a deployment simplification for the hackathon, not an architectural retreat. Supabase runs PostgreSQL 16 under the hood — the same database engine, the same query language, the same schema design. The architectural story is unchanged.

What Supabase replaces:
- AWS RDS Multi-AZ setup (infra provisioning time, cost)
- Separate TimescaleDB instance (time-series queries handled via Supabase partitioning)
- Redis Cluster (Supabase Realtime handles live dashboard updates; session handled via JWT)

The Phase 3 production path is still PostgreSQL + TimescaleDB + Redis on AWS Mumbai ap-south-1. Supabase is the bridge that lets us demonstrate a fully working app without a week of infra setup.

---

### 4. Deployment — AWS EKS + Kubernetes → Vercel

**Phase 1 design:**
AWS Mumbai ap-south-1, 3-AZ Kubernetes EKS, CloudFront CDN, Route53 failover.

**Why it changed:**
Same reasoning as the database change — Vercel lets us ship a working demo. The production architecture remains Kubernetes. Vercel's edge network has Points of Presence in Mumbai and Singapore, so latency to Chennai users is actually competitive with a self-managed deployment at this scale.

---

### 5. Auth — OTP provider clarified to MSG91

Phase 1 mentioned Twilio/MSG91 interchangeably for OTP. Phase 2 standardises on **MSG91** as the primary OTP provider (India-native, better delivery rates for Indian mobile numbers, ₹0.18/SMS). Twilio is retained as the SMS fallback for non-OTP notifications only.

A `OTP_DEV_BYPASS=123456` environment variable is available in development mode so the OTP flow can be demonstrated without consuming SMS credits.

---

### 6. Notification stack — clarified and completed

Phase 1 mentioned FCM and WhatsApp. Phase 2 fully implements:
- **Firebase FCM** — push notifications (primary, via Capacitor.js PWA wrapper)
- **Twilio SMS** — fallback for users without push enabled
- **WhatsApp Business API** — mock in Phase 2, real integration Phase 3
- Notification format: `"₹520 credited. Stay safe, Rajan 🛡️"`

---

### 7. What did NOT change

The following are identical between Phase 1 and Phase 2. These are the core IP:

- All five parametric trigger definitions and thresholds
- Premium formula: `P_w = P_base × (1 + α × R_w)`
- All six risk score weights (R=0.25, O=0.20, H=0.15, C=0.15, A=0.10, S=0.15)
- α self-calibration formula
- Fraud score formula: `F_w = 0.40·B + 0.35·G + 0.25·L`
- All four fraud decision gates
- CAR formula and four threshold levels
- Soft-fail guarantee (claims held, never silently rejected)
- Trigger 5 (demand collapse via EMA) — still the only such trigger in the market
- Rajan Kumar as the central persona (Chennai, Zepto, 14 weeks tenure)
- Payout timeline target: < 5 minutes end-to-end

---

## 🎯 The Problem We're Solving

India's quick-commerce sector (Zepto, Blinkit, Swiggy Instamart) has created **~800,000–1,000,000 active delivery partners** [[Economic Times, 2023](https://economictimes.indiatimes.com/)] who work in one of the most exposure-heavy environments imaginable — on two wheels, outdoors, in all conditions, 8–12 hours per day.

```
┌─────────────────────────────────────────────────────────────────┐
│  A Zepto rider earns ₹18–25 per delivery × 25–40 deliveries/day │
│  = ₹450–₹1,000/day gross  |  ₹3,150–₹7,000/week               │
│                                                                   │
│  ONE heavy rain day = ZERO deliveries = ₹0 earned               │
│  Chennai gets 38 heavy-rain days/year on average                 │
│  → 38 lost income days/year, zero protection                     │
└─────────────────────────────────────────────────────────────────┘
```

| Existing Option | Why It Fails for Gig Workers |
|----------------|------------------------------|
| Traditional health insurance | Excludes income loss; annual premium misaligned with weekly earnings |
| ESIC / state schemes | Requires formal employment; gig workers are contractors [[ILO, 2021](https://www.ilo.org/)] |
| Personal savings | Median gig worker savings buffer: **< 2 weeks** [[NCAER, 2022](https://www.ncaer.org/)] |
| Manual insurance claims | Settlement time: **15–45 days** — irrelevant for daily wage workers |
| **ShieldRide parametric** | ✅ Weekly premium · ✅ < 5 min payout · ✅ Zero claims process |

---

## 👤 Persona Deep-Dive — Priyanjali, the Zepto Rider

> *This is not a fictional persona. This is 800,000 people.*

```
Name:       Priyanjali, 26
City:       Chennai, Tamil Nadu
Platform:   Zepto (Grocery / Q-Commerce)
Device:     Redmi Note 11 (3GB RAM, Android 12)
Vehicle:    Electric scooter (Ola S1)
Hours:      7 AM – 10 PM (demand-driven, ~10 active hours)
Earnings:   ₹650–₹900/day on good days | ₹0–₹200 on bad days
Insurance:  None
Savings:    ₹8,000 (≈ 10 days buffer)
Tenure:     14 weeks on Zepto
```

### Rajan's Weekly Income Pattern

```
Mon  ████████████████████  ₹820  ✅ Good day
Tue  █████████████         ₹530  ⚠️  Slow afternoon
Wed  ██                    ₹80   🌧️  Heavy rain, stopped at 11 AM
Thu  ████████████████████  ₹790  ✅ Recovery
Fri  ████████████████████  ₹910  ✅ Weekend eve surge
Sat  █████████████████     ₹680  ⚠️  AQI 280, reduced hours
Sun  █████████████████████ ₹950  ✅ Peak demand day

Week Total: ₹4,760 (vs. expected ₹5,950)
Income loss this week: ₹1,190 (20% shortfall)
ShieldRide covered: ₹520 on Wednesday — rain trigger fired at 14:48
```

### Why PWA over Native App

| Factor | Evidence | Decision |
|--------|----------|----------|
| Device profile | 78% of delivery workers use Android; median RAM = 3GB | PWA over native, lighter footprint |
| App install friction | 47% of gig workers abandon app store downloads [[IAMAI, 2023](https://www.iamai.in/)] | PWA = zero install, share link |
| Offline usage | Delivery zones have patchy 4G | Service worker for offline queue |
| Push notifications | Critical for < 5 min payout alerts | Capacitor.js v5.x wrapper adds FCM |

---

## 🌩️ Five Parametric Triggers

> ShieldRide monitors **5 parametric triggers** in real-time. No claim form. No phone call. No delay.

### Trigger 1 — Heavy Rainfall 🌧️

```
Source:     OpenWeatherMap One Call API 3.0 (rain.1h field)
Backup:     IMD mausam.imd.gov.in
Poll:       Every 15 minutes
Threshold:  > 35 mm/hr sustained > 45 minutes
Scope:      Worker's active pin code (6-digit)
Payout:     80% × daily_baseline

Scenario (Rajan, Wednesday):
  14:30 — OpenWeatherMap reports 42 mm/hr in pin 600001 (Chennai Egmore)
  14:45 — 45-min threshold crossed, trigger confirmed via 2-source validation
  14:47 — F_w = 0.09 (GPS consistent with shelter, clean device fingerprint)
  14:48 — Payout = 80% × ₹650 = ₹520 credited to UPI
  14:50 — FCM push: "₹520 credited. Stay safe, Rajan 🛡️"
  Elapsed: 4 minutes 12 seconds
```

### Trigger 2 — Extreme Heat Index 🌡️

```
Source:     OpenWeatherMap "feels_like" field
Formula:    Rothfusz regression — HI = f(Temperature, Humidity)
            Calibrated to NIOH India occupational heat guidelines
Threshold:  feels_like > 42°C for > 2 hours between 11 AM – 4 PM
Payout:     60% × daily_baseline

Note: >25% delivery productivity loss documented above 42°C
      [ILO Working on a Warmer Planet, 2019, p.34]
```

### Trigger 3 — Hazardous AQI 😷

```
Source:     CPCB real-time API [mock in Phase 2, badge shown in UI]
Scale:      India AQI (0–500)
Threshold:  AQI > 300 ("Hazardous") for > 3 consecutive hours
Payout:     50% × daily_baseline

Context: Delhi AQI exceeded 300 for 47 days in 2023.
         Chennai: 8 days. [CPCB Annual Report 2023]
```

### Trigger 4 — Platform Outage 📴

```
Source:     Simulated platform API (HTTP 5xx / timeout mock)
            Cross-validated with Downdetector.in mock
Threshold:  > 90 minutes non-responsive within any 6-hour window
Payout:     70% × (outage_hours / 10) × daily_baseline

Note: Zepto reported 3 major outages in 2023, each 2–4 hours.
      Estimated per-worker loss per outage: ₹300–₹600.
```

### Trigger 5 — Order Demand Collapse 📉 ★ Industry First

```
Source:     Platform order feed (simulated, EMA smoothing)
Method:     Rolling 2-hour window, Exponential Moving Average
Threshold:  Cancellation rate > 45% of accepted orders
            Sustained > 2 consecutive hours
            Minimum 5 orders (prevents false positives from idle workers)
Payout:     40% × daily_baseline

This is ShieldRide's competitive moat. No other parametric insurance
product covers demand-side income volatility as a trigger event.
Label in UI: "Demand-Volatility Protection — Industry First"
```

---

## ⚙️ How ShieldRide Works — End-to-End Workflow

```
┌─────────────────────────────────────────────────────────────────────────┐
│  PHASE 0: ONBOARDING  (target: < 90 seconds)                           │
│                                                                          │
│  1. Worker opens PWA link (no app store required)                       │
│  2. Phone number → OTP via MSG91                                        │
│  3. Aadhaar eKYC via DigiLocker API mock (consent-based)               │
│  4. Platform selection: Zepto / Blinkit                                 │
│  5. UPI VPA / bank account registration                                 │
│  6. AI Risk Quote generated (see Phase 1 below)                         │
│  7. Weekly premium payment via Razorpay UPI Payout API                 │
│  8. Policy synced to Guidewire PolicyCenter mock                        │
└─────────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  PHASE 1: RISK PROFILING  (runs every Sunday night, 11 PM IST)         │
│                                                                          │
│  TypeScript premium engine computes R_w:                                │
│    R = rainfall_score × 0.25  =  0.205                                 │
│    H = heat_score    × 0.15  =  0.082                                  │
│    A = aqi_score     × 0.10  =  0.030                                  │
│    O = outage_score  × 0.20  =  0.020                                  │
│    C = cancel_score  × 0.15  =  0.037                                  │
│    S = 0.00 (Phase 3 — social disruption, greyed out in UI)            │
│    R_w = 0.374                                                          │
│                                                                          │
│  P_w = ₹75 × (1 + 0.7 × 0.374) = ₹94.65 ≈ ₹95                       │
│                                                                          │
│  Claude explains the result in plain language to the worker.            │
└─────────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  PHASE 2: REAL-TIME MONITORING  (continuous, 24×7)                     │
│                                                                          │
│  • OpenWeatherMap + IMD APIs polled every 15 minutes                   │
│  • Platform activity stream ingested (simulated)                        │
│  • Worker GPS pings every 5 minutes while app is active                │
│  • All signals evaluated by trigger-engine.ts                           │
└─────────────────────────────────────────────────────────────────────────┘
          │
          ▼ (on trigger fire)
┌─────────────────────────────────────────────────────────────────────────┐
│  PHASE 3: TRIGGER → PAYOUT  (target: < 5 minutes)                     │
│                                                                          │
│  T+0s    Signal crosses threshold                                       │
│  T+2s    2-source cross-validation confirmed                            │
│  T+4s    Eligibility: policy active? premium paid? zone match?          │
│  T+10s   Fraud score: F_w = 0.40·B + 0.35·G + 0.25·L computed        │
│  T+15s   Payout amount computed, CAR check passes                       │
│  T+45s   Razorpay UPI Payout API call initiated                         │
│  T+180s  NPCI settlement confirmed (median 2–3 min)                     │
│  T+185s  FCM push + Twilio SMS notification sent                        │
│  TOTAL: ~4 minutes 12 seconds                                           │
└─────────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  PHASE 4: FEEDBACK LOOP  (post-payout)                                 │
│                                                                          │
│  • Payout logged, CAR recalculated                                      │
│  • α updated: α_new = Observed_Loss / (P_base × ΣR_w × N)             │
│  • Worker dashboard updated with coverage history                       │
│  • Guidewire ClaimCenter mock synced                                    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 💰 The Financial Model

### Weekly Premium Formula

```
P_w = P_base × (1 + α × R_w)

Where:
  P_base  = ₹75   (base premium)
  α       = 0.70  (sensitivity coefficient, self-calibrating weekly)
  R_w     = composite risk score ∈ [0, 1]
  Floor   = ₹50/week
  Cap     = ₹120/week

Examples:
  Low risk  (R_w = 0.10):  P_w = ₹75 × 1.07  = ₹80
  Medium    (R_w = 0.40):  P_w = ₹75 × 1.28  = ₹96
  High risk (R_w = 0.80):  P_w = ₹75 × 1.56  = ₹117
  Cap enforced at ₹120 regardless of R_w
```

### Risk Score Weights

| Variable | Symbol | Weight | Justification | Source |
|----------|--------|--------|---------------|--------|
| Rainfall intensity | R | **0.25** | Highest single driver of income loss for Q-commerce riders | [IMD India 2023](https://mausam.imd.gov.in/) |
| Platform outage | O | **0.20** | Direct income loss; 3 major outages in 2023 | Downdetector.in |
| Heat index | H | **0.15** | >25% productivity drop above 42°C | [ILO, 2019, p.34](https://www.ilo.org/) |
| Cancellation rate | C | **0.15** | Demand-side volatility — ShieldRide's unique signal | Internal model |
| AQI severity | A | **0.10** | Strong seasonal impact Oct–Jan | [CPCB 2023](https://cpcb.nic.in/) |
| Social disruption | S | **0.15** | Reserved — Phase 3 (NLP news signal, greyed out in UI) | Extensibility buffer |
| **Total** | | **1.00** | Weights verified to sum to 1.0 | |

### α Self-Calibration

```
α runs every Sunday at 11 PM IST:

  α_new = Observed_Total_Loss_₹ / (P_base × ΣR_w × worker_count)

  Payouts > premiums collected  →  α rises  →  premiums adjust upward next cycle
  Payouts < premiums collected  →  α falls  →  premiums stay competitive

  Starting α = 0.70
  After 4 weeks with seed data: α = 0.71 (self-corrected slightly upward)

This is real actuarial science. Not flat pricing. Not "AI pricing" with a black box.
The formula is shown in the admin panel at all times.
```

### Capital Adequacy Ratio (CAR)

```
CAR = Pool_Capital_₹ / Total_Expected_Loss_₹

  CAR ≥ 1.5        →  Stable. No premium adjustment.        [green]
  CAR 1.2–1.5      →  Monitor. α increase flagged.          [amber]
  CAR < 1.2        →  Alert. +10% next cycle.               [red]
  CAR < 1.0        →  Critical. New policy issuance paused. [red, pulsing]

Demo state (1,000 workers, high-risk week):
  Premium collected:   1,000 × ₹117  =  ₹1,17,000
  Reinsurance buffer:                    ₹50,000
  Pool total:                            ₹1,67,000
  Expected payouts:    280 × ₹520    =  ₹1,45,600
  CAR = 1.15  →  Alert state shown in admin dashboard
```

### Payout Formula Per Trigger

| Trigger | Threshold | Payout |
|---------|-----------|--------|
| Heavy Rainfall | > 35 mm/hr for 45 min | 80% × daily_baseline |
| Extreme Heat | feels_like > 42°C for 2+ hrs (11am–4pm) | 60% × daily_baseline |
| Hazardous AQI | AQI > 300 for 3+ hrs | 50% × daily_baseline |
| Platform Outage | > 90 min in 6hr window | 70% × (outage_hrs/10) × daily_baseline |
| Demand Collapse | cancellation > 45% (2hr EMA, min 5 orders) | 40% × daily_baseline |

`daily_baseline` = rolling 4-week average daily income (₹650 for Rajan)

---

## 🤖 AI Architecture — Phase 2 Approach

### The Phase 1 Design (XGBoost + Isolation Forest)

Phase 1 specified a 3-model ML ensemble:

```
┌──────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ Risk Scorer  │  │ Trigger Prob.    │  │ Fraud Detector   │
│ XGBoost      │  │ XGBoost          │  │ Isolation Forest │
│ 50ms inf.    │  │ 50ms inf.        │  │ 80ms inf.        │
│ 15 features  │  │ 12 features      │  │ 18 features      │
│ Weekly train │  │ Weekly train     │  │ Bi-weekly train  │
└──────────────┘  └──────────────────┘  └──────────────────┘
```

This remains the correct production architecture for Phase 3, when real payout data exists at scale to train these models meaningfully.

### Why Phase 2 Uses a Different Approach

XGBoost and Isolation Forest are supervised and unsupervised ML models respectively. Both require data to function. At Phase 2, training XGBoost on 3 payouts and 28 days of income history for one worker would produce models that overfit to noise. The outputs would be unreliable — and unverifiable by judges.

More importantly: the ML models are **invisible** in a demo. A model returning `0.374` teaches a judge nothing about the sophistication of the system.

### Phase 2 Architecture — Two Layers

```
┌───────────────────────────────────────────────────────────┐
│  LAYER 1 — TypeScript Math Engines  (deterministic)       │
│                                                            │
│  premium-engine.ts   P_w = P_base × (1 + α × R_w)        │
│  fraud-engine.ts     F_w = 0.40·B + 0.35·G + 0.25·L     │
│  car-monitor.ts      CAR = Pool / Expected_Loss            │
│  trigger-engine.ts   5 threshold evaluators               │
│  alpha-calibrator.ts α_new = Loss / (P_base × ΣR_w × N)  │
│                                                            │
│  All formulas are identical to Phase 1 specification.     │
│  All weights, thresholds, and decision gates preserved.   │
└───────────────────────────────────────────────────────────┘
          │  numbers flow up
          ▼
┌───────────────────────────────────────────────────────────┐
│  LAYER 2 — Claude claude-sonnet-4-20250514  (explainability) │
│                                                            │
│  risk-explainer.ts   Narrates R_w + P_w in plain language │
│  fraud-explainer.ts  Explains F_w decision with B/G/L     │
│  support-chat.ts     Worker Q&A with policy context       │
│                                                            │
│  Claude receives computed numbers from Layer 1.           │
│  Claude explains them. It does not compute them.          │
│  The math is always deterministic. The explanation is AI. │
└───────────────────────────────────────────────────────────┘
```

### Three Claude Flows

**Flow 1 — Risk Score Explainer**

Called during onboarding (Step 3) and whenever a worker refreshes their risk score.

Input (from TypeScript engine):
```json
{
  "R_w": 0.374,
  "P_w": 95,
  "components": {
    "rainfall": { "score": 0.82, "weight": 0.25, "contribution": 0.205 },
    "heat":     { "score": 0.55, "weight": 0.15, "contribution": 0.082 },
    "aqi":      { "score": 0.30, "weight": 0.10, "contribution": 0.030 },
    "outage":   { "score": 0.10, "weight": 0.20, "contribution": 0.020 },
    "cancel":   { "score": 0.25, "weight": 0.15, "contribution": 0.037 }
  },
  "city": "Chennai",
  "week": "monsoon season"
}
```

Claude output example:
> "Your premium this week is ₹95. Chennai has a 78% chance of heavy rain Wednesday to Thursday — rainfall risk alone adds ₹19 to your premium. The formula: ₹75 × (1 + 0.7 × 0.374) = ₹95. If the week stays dry, next week's premium will drop."

**Flow 2 — Fraud Decision Explainer**

Called after fraud engine computes F_w. Shown in the claims detail view.

Input (from TypeScript engine):
```json
{
  "F_w": 0.09,
  "B": 0.08,
  "G": 0.11,
  "L": 0.05,
  "decision": "AUTO_APPROVED",
  "flags": []
}
```

Claude output example:
> "Your claim was auto-approved. Behavioral score 0.08 — your activity pattern matches a normal rain shelter stop. Geo score 0.11 — GPS shows you stationary near your usual zone, consistent with weather. Linkage score 0.05 — unique device, no shared account flags. F_w = (0.40×0.08) + (0.35×0.11) + (0.25×0.05) = 0.09. Well below the 0.30 threshold."

**Flow 3 — Worker Support Chat**

Persistent chat on `/chat`. Policy state injected as context on every message.

Pre-loaded quick questions:
- "Why did I get ₹520 today?"
- "What triggers my payout?"
- "Is my premium going up next week?"
- "How is my fraud score calculated?"
- "What is my CAR status?"

### API Call Pattern

```typescript
// Used identically in all three flows
const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    system: systemPrompt,         // flow-specific context
    messages: [{ role: "user", content: userPrompt }]
  })
})
```

No LangChain. No Genkit. No orchestration framework. Direct API call — readable, debuggable, minimal dependencies.

### Phase 3 Path Back to ML

When ShieldRide reaches real production scale, the ML layer re-enters on top of the existing architecture:

```
Phase 3 addition (not replacing Phase 2, extending it):
  XGBoost Risk Scorer     → learns non-linear patterns from 10,000+ real payouts
  Isolation Forest        → detects fraud patterns invisible to rule-based B/G/L
  LSTM Behavioral Model   → replaces z-score with sequence modeling on 30d activity

  Claude role narrows: continues as explainability layer, now explaining
  XGBoost SHAP values instead of TypeScript formula outputs.
```

---

## 🛡️ Fraud Defense

### The Three-Signal Fraud Score

```
F_w = w₁·B + w₂·G + w₃·L    (all scores ∈ [0, 1], higher = more suspicious)

w₁ = 0.40  (Behavioral — most diagnostic)
w₂ = 0.35  (Geo-spatial — second most diagnostic)
w₃ = 0.25  (Linkage — catches coordinated fraud rings)
Sum = 1.00  ✅
```

**B — Behavioral Anomaly Score**
- Z-score deviation: `|current_activity - μ_30d| / σ_30d`
- Sudden income drop without a correlated external trigger event
- Inactivity-to-trigger timing suspicion score

**G — Geo-Spatial Inconsistency Score**
- GPS speed > 120 km/hr → flag
- Static GPS despite "active delivery" status
- Location vs weather cell mismatch
- Cell tower triangulation cross-check

**L — Linkage / Identity Risk Score**
- Shared device fingerprint (deviceID collision rate)
- Shared UPI VPA across multiple accounts
- Synchronized trigger claims in same geo-cluster
- > 3 shared-device connections → fraud ring flag

### Decision Matrix

| F_w Score | Action | SLA | Worker Experience |
|-----------|--------|-----|-------------------|
| **< 0.30** | ✅ Instant payout | < 5 min | Silent — payout credited |
| **0.30 – 0.50** | ✅ Payout + silent logging | < 5 min | Silent — flagged for review |
| **0.50 – 0.80** | ⏳ Delayed — re-validate | < 30 min | "Verifying your claim, hold tight" |
| **> 0.80** | 🚫 Blocked + manual review | < 2 hrs | "We need to verify this manually" |

### Soft-Fail Guarantee

> Claims are **HELD**, never silently rejected. Every F_w > 0.80 case goes to manual review within 2 hours.

This protects genuine workers during extreme weather when GPS signals naturally degrade. Heavy rain causes poor GPS accuracy. ShieldRide does not penalize workers for signal conditions caused by the very event that triggered their payout.

---

## 🏗️ System Architecture & Tech Stack

### Architecture Overview

```
  ┌────────────────────────────────────────────────────────┐
  │               EXTERNAL DATA SOURCES                    │
  │  OpenWeatherMap One Call API 3.0  |  IMD (backup)      │
  │  CPCB AQI (mock)  |  Platform API (simulated)          │
  └──────────────────────────┬─────────────────────────────┘
                             │ poll every 15 min
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │              CLIENT LAYER (PWA + Capacitor.js)         │
  │  Worker PWA (Next.js 15)    Admin Dashboard (Next.js)  │
  └──────────────┬──────────────────────────┬──────────────┘
                 │ HTTPS / TLS 1.3          │
                 ▼                          ▼
  ┌────────────────────────────────────────────────────────┐
  │        API GATEWAY  (Kong OSS v3)                      │
  │   JWT auth · Rate limit 200 req/min · TLS termination  │
  └──────────────────────┬─────────────────────────────────┘
                         │
     ┌───────────────────┼───────────────────┐
     ▼                   ▼                   ▼
  ┌──────────┐     ┌──────────────┐    ┌──────────────┐
  │Onboarding│     │Policy Service│    │Trigger Monitor│
  │ Service  │     │(premium-     │    │(trigger-      │
  │MSG91 OTP │     │ engine.ts)   │    │ engine.ts)    │
  │DigiLocker│     │CAR monitor   │    │OWM + IMD poll │
  └──────────┘     └──────────────┘    └──────────────┘
                         │
                         ▼
  ┌────────────────────────────────────────────────────────┐
  │              AI LAYER  (Claude API)                    │
  │  risk-explainer.ts  ·  fraud-explainer.ts              │
  │  support-chat.ts                                       │
  │  claude-sonnet-4-20250514 via direct fetch             │
  └──────────────────────┬─────────────────────────────────┘
                         │
     ┌───────────────────┼───────────────────┐
     ▼                   ▼                   ▼
  ┌──────────┐     ┌──────────────┐    ┌──────────────┐
  │ Fraud    │     │  Payout      │    │ Notification  │
  │ Engine   │     │  Service     │    │ Service       │
  │fraud-    │     │Razorpay UPI  │    │FCM (primary)  │
  │engine.ts │     │Payout API    │    │Twilio SMS     │
  └──────────┘     └──────────────┘    └──────────────┘
                         │
  ┌────────────────────────────────────────────────────────┐
  │                    DATA LAYER                          │
  │  Supabase (PostgreSQL 16)  ·  Redis TTL cache          │
  │  Policies · Workers · Payouts · Audit · Triggers       │
  └────────────────────────────────────────────────────────┘
                         │
  ┌────────────────────────────────────────────────────────┐
  │            GUIDEWIRE INTEGRATION (mock)                │
  │  PolicyCenter sync  ·  ClaimCenter sync                │
  │  GW-SR-XXXXXX policy numbers  ·  CLM-SR-XXXXXX claims  │
  └────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| **Frontend** | Next.js + React + TypeScript | Next.js 15, React 19 | App Router |
| **Styling** | Tailwind CSS + ShadCN UI | Tailwind 3.4 | Slate/blue, no glassmorphism |
| **Mobile** | Capacitor.js | v5.x | PWA wrapper, FCM push without Play Store |
| **AI** | Anthropic Claude | claude-sonnet-4-20250514 | Direct fetch, explainability layer |
| **Auth** | JWT + MSG91 OTP | — | Phone-number based, gig worker UX |
| **Weather** | OpenWeatherMap One Call API 3.0 | — | Primary; IMD as backup |
| **Payments** | Razorpay UPI Payout API | Sandbox | NPCI settlement, < 3 min |
| **Database** | Supabase (PostgreSQL 16) | — | Hosted Postgres; TimescaleDB in Phase 3 |
| **Cache** | Redis | v7.x | Session store, TTL 30 min |
| **API Gateway** | Kong OSS | v3.x | 200 req/min, JWT plugin |
| **Notifications** | Firebase FCM + Twilio SMS | — | Push primary, SMS fallback |
| **Guidewire** | PolicyCenter + ClaimCenter | Mock | Realistic response shapes |
| **Charts** | Recharts | — | Income timeline, CAR gauge, radar |
| **Deployment** | Vercel | — | Web + API + admin |
| **CI/CD** | GitHub Actions | — | Build → test → deploy on PR merge |

### SLA Targets

| Metric | Target |
|--------|--------|
| Payout credit time | **< 5 minutes** (demo: 4m12s) |
| Trigger detection lag | **< 15 minutes** |
| API p99 latency | **< 80ms** |
| Onboarding time | **< 90 seconds** |
| Fraud review SLA | **< 2 hours** (F_w > 0.80) |
| Uptime target | **99.9%** |

---

## 📊 Business Viability

### Unit Economics (per 1,000 active workers)

```
REVENUE (weekly)
  Average premium (blended):   ₹90
  Active workers:               1,000
  Weekly premium pool:          ₹90,000

COSTS (weekly, high disruption)
  Trigger activation rate:      ~22% of workers
  Average payout per worker:    ₹480
  Total expected payouts:       220 × ₹480 = ₹1,05,600

SEED POOL & REINSURANCE
  Seed capital buffer:          ₹5,00,000
  CAR at launch:                ₹5,00,000 / ₹1,05,600 = 4.73  ✅ Healthy
  CAR steady-state target:      ≥ 1.5

BREAK-EVEN
  Premium per worker:           ₹90
  Expected cost per worker:     0.22 × ₹480 = ₹105.60
  Gap:                          ₹15.60/worker/week
  Resolution: α self-calibrates. After 4 weeks,
  α adjusts premium to ~₹106 at current trigger rate.
  System self-corrects without manual actuarial intervention.
```

### 3-Year Market Projection

| Year | Q-Commerce Riders (India) | ShieldRide Target (2%) | Weekly Revenue |
|------|--------------------------|------------------------|----------------|
| 2024 | ~900,000 | 18,000 workers | ₹1.62 Cr/week |
| 2025 | ~1,200,000 | 24,000 workers | ₹2.16 Cr/week |
| 2026 | ~1,500,000 | 30,000 workers | ₹2.70 Cr/week |

---

## 🖥️ Application Pages

| Page | Route | Description |
|------|-------|-------------|
| **Landing** | `/` | Hero with Rajan's income chart, 5 trigger cards, live stats ticker |
| **Onboarding** | `/onboarding` | 4-step: OTP → Profile → AI Risk Quote → Policy Activation |
| **Dashboard** | `/dashboard` | Income timeline, risk gauge, live trigger monitor, payout history |
| **Claims** | `/claims` | Payout pipeline, T+0–T+185s timeline, fraud score per claim |
| **Live Triggers** | `/disruptions` | Real-time threshold bars for Chennai, animated at 80% threshold |
| **Policy** | `/policy` | Premium formula visualizer, CAR gauge, α history, risk radar |
| **Admin** | `/admin` | Portfolio, fraud queue, trigger audit log, α recalibration panel |
| **AI Chat** | `/chat` | Claude support chat with worker context injected |

---

## 🗺️ Development Roadmap

### Phase 1 — Seed ✅ (Submitted)
- ✅ Core financial model specified (P_w, F_w, CAR, α)
- ✅ Five parametric triggers defined with scientific thresholds
- ✅ Fraud architecture specified (B + G + L three-signal model)
- ✅ System architecture designed (Kafka, K8s, XGBoost, TimescaleDB)
- ✅ Rajan persona developed with quantified income data
- ✅ Full README with cited sources

### Phase 2 — Sprout ✅ (This submission)
- ✅ Full working Next.js 15 application (9 pages)
- ✅ TypeScript math engines (premium, fraud, CAR, trigger, α calibrator)
- ✅ Claude AI explainability layer (3 flows)
- ✅ OpenWeatherMap One Call API 3.0 live integration
- ✅ Supabase PostgreSQL database with Rajan's seed data
- ✅ Razorpay UPI Payout API sandbox
- ✅ Guidewire PolicyCenter + ClaimCenter mock sync
- ✅ Payout timeline animation (T+0s to T+185s)
- ✅ Live trigger threshold bars with pulse animation
- ✅ CAR gauge with real-time color shift
- ✅ Admin panel with α recalibration
- ✅ Mobile-responsive PWA at 375px

---

## 💻 Getting Started

### Prerequisites
- Node.js 18+
- Supabase project (free tier)
- Anthropic API key
- OpenWeatherMap API key (One Call API 3.0)

### Environment Setup

Create `.env.local` in the project root:

```env
# AI
ANTHROPIC_API_KEY=sk-ant-...

# Weather
OPENWEATHERMAP_API_KEY=...

# Database
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Auth
MSG91_AUTH_KEY=...
MSG91_TEMPLATE_ID=...
OTP_DEV_BYPASS=123456

# Payments
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...

# Notifications
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
NEXT_PUBLIC_FIREBASE_CONFIG={"apiKey":"..."}
FIREBASE_FCM_SERVER_KEY=...

# Guidewire (mock)
GUIDEWIRE_MOCK=true

# Admin
ADMIN_PASSWORD=shieldride2026
```

### Run Locally

```bash
npm install
npm run dev
# Open http://localhost:3000
# Admin: http://localhost:3000/admin  (password: shieldride2026)
# OTP dev bypass: enter any phone, use code 123456
```

---

<div align="center">

*Built with ❤️ for the 7.7 million gig workers of India who keep our groceries moving in 10 minutes — rain or shine.*

**ShieldRide** · Guidewire DEVTrails 2026 · Phase 2 · Team Recaptcha

`Persona: Q-Commerce (Zepto · Blinkit)` · `Coverage: Income Loss Only` · `Premium: Weekly`

</div>
