# Real Estate Trust & Safety Platform — Phased Implementation Plan

## Overview & Strategic Vision
Transforming the platform into **Nigeria's First Trust, Verification & Anti-Fraud Real Estate Infrastructure**, powered by **Property Title Checks, Document/ID Uploads, CAC Corporate Verification, and Community Fraud Alerts** (without requiring NIN or BVN).

---

## 🛡️ New Verification Framework (No NIN / BVN Required)

The platform will verify users and properties using practical, high-trust alternative mechanisms:

1. **For Agents, Landlords & Professionals:**
   - **Government ID Upload:** International Passport, Driver's License, or Voter's Card (uploaded image reviewed by admin / OCR).
   - **CAC Business Registration:** RC / BN Number & Certificate upload for real estate companies, agencies, and developers.
   - **Contact Verification:** Phone Number (SMS / WhatsApp OTP) + Verified Email.
   - **Professional Body Accreditation (Optional):** NIESV, ESVARBON, REDAN, or NBA (for property lawyers).
   - **Office Address / Utility Bill:** Physical proof of presence.

2. **For Properties (Property Passport):**
   - **Title & Document Upload:** Registered Survey Plan, Certificate of Occupancy (C of O), Governor's Consent, Excision Gazette, or Deed of Assignment.
   - **Legal Document Status:** Marked as `Not Verified`, `Documents Submitted`, or `Legal Search Verified`.
   - **Location & Beacon Check:** Geolocation GPS coordinates and site verification.
   - **Community Fraud Shield:** User reporting & auto-moderation threshold.

---

## 📅 Roadmap Overview

```
Phase 1: Foundation (ID/CAC Verification Badges & Property Passport UI)
   │
   ▼
Phase 2: Trust & Fraud Prevention ("Know Before You Pay" & Reporting)
   │
   ▼
Phase 3: Decision Intelligence (Compare Properties & Investment Scoring)
   │
   ▼
Phase 4: Advanced Media & Conversational AI (Virtual Tours & AI Property Assistant)
   │
   ▼
Phase 5: Financial Security (Milestone Escrow & Payment Partnership)
```

---

## 🏗️ Phase 1: Trust Foundation (ID/CAC Badges & Property Passport)
**Objective:** Establish instant credibility with document-verified badges and digital property passports.

### 1.1 User & Professional Verification Badges ✅
- **Verification Levels:**
  - `Level 1 — Contact Verified`: Phone OTP + Email verified.
  - `Level 2 — ID Document Verified`: Driver's License / International Passport / Voter's Card submitted & approved.
  - `Level 3 — Corporate Verified`: CAC Certificate & Business registration verified (for Agencies/Developers).
- **Backend (`apps/accounts`, `apps/kyc`):**
  - Replace direct NIN/BVN API calls with document upload workflow (upload ID card image, document type, admin approval status).
  - Update user serializers to output: `is_verified` (Boolean), `verification_level` (`unverified`, `contact_verified`, `id_verified`, `cac_verified`), and `badge_label`.
- **Frontend (`src/components/shared`, `src/components/agent`):**
  - Display verified pill badges with tooltips (e.g., *"Government ID Verified"* or *"CAC Registered Agency"*).
  - Embed badges in Realtor Cards, Landlord Profiles, and Property Detail headers.

### 1.2 Property Verification System 🏠
- **Backend (`apps/properties`):**
  - Update `PropertyDocument` status flags (`not_verified`, `documents_submitted`, `legal_search_verified`).
  - Add document count and verification level to `PropertyListingSerializer`.
- **Frontend (`src/components/property`):**
  - Add verification status badges on listing cards:
    - 🟢 `Legal Search Verified`
    - 🟡 `Documents Submitted`
    - ⚪ `Unverified Listing`
  - Add a dedicated **"Verified Only"** filter switch on `PropertiesPage.jsx`.

### 1.3 The Property Passport Component 🛡️
- **Frontend (`src/components/property/PropertyPassport.jsx`):**
  - A digital trust passport displayed on `PropertyDetailPage.jsx`:
    - 🏠 Property Title & Category
    - 📍 GPS Geolocation Confirmation
    - 👤 Seller/Agent Status (ID / CAC Verified)
    - 📄 Legal Documents Submitted (C of O, Survey Plan, Deed, Gazette)
    - 📅 Last Availability Check Date
    - 🚨 Fraud Report Count (e.g., "0 Active Reports")
    - ⭐ Trust Score (0–100)

---

## 🚨 Phase 2: Safety & Fraud Prevention Infrastructure
**Objective:** Protect buyers from scams, fake listings, and duplicate advertisements.

### 2.1 "Know Before You Pay" Checklist 🔍
- **Frontend (`src/components/property/KnowBeforeYouPayModal.jsx`):**
  - Safety modal appearing before a buyer contacts an agent, schedules an inspection, or pays.
  - Instant checklist:
    - ✅ Seller ID / CAC verified
    - ✅ Survey Plan / Title Document submitted
    - ⚠️ Physical inspection pending
    - ℹ️ Escrow protection active

### 2.2 Property & Agent Fraud Reporting System 🚨
- **Backend (`apps/properties`):**
  - Create `PropertyReport` / `AgentReport` model (`reason`, `evidence_url`, `description`, `reporter`, `status`).
  - Auto-moderation thresholds:
    - 3+ unique reports $\rightarrow$ listing automatically tagged with **"Under Review"** warning flag.
    - 5+ unique reports $\rightarrow$ temporary unlisting pending admin review.
- **Frontend (`src/components/property/ReportListingModal.jsx`):**
  - Accessible report button on all listing and profile pages.

---

## ⚖️ Phase 3: Decision Intelligence (Comparison & Scoring)
**Objective:** Empower buyers to make informed, data-driven real estate decisions.

### 3.1 Compare Properties Tool ⚖️
- **Frontend (`src/components/property/PropertyCompareTray.jsx` & `PropertyCompareModal.jsx`):**
  - Sticky drawer at screen bottom (select 2–4 listings).
  - Side-by-side comparison table:
    - Price & Price per sqm / plot
    - Document status (C of O vs Survey vs Deed)
    - Amenities & Infrastructure (Water, Light, Security, Access Roads)
    - Property Passport Trust Score
    - Seller / Agent Verification Level

### 3.2 Property Investment Score 📊
- **Backend (`apps/properties/services/scoring.py`):**
  - Algorithmic calculation (0–100) based on:
    - Title strength (C of O = +35, Gazette = +25, Survey = +15)
    - Price variance against local LGA median price
    - Seller / Agent verification status
    - Infrastructure & accessibility features
- **Frontend:**
  - Clean visual gauge on property detail with standard legal disclaimer (*"Automated estimate, not financial advice"*).

### 3.3 Agent / Professional Reputation Score ⭐
- Score (0–100) computed from:
  - ID / CAC verification status
  - Completed platform deals / inspections
  - Response rate and turnaround time
  - Client reviews & ratings
  - Zero fraud report record

---

## 🤖 Phase 4: Rich Media & Conversational AI
**Objective:** Deliver an engaging, modern discovery experience.

### 4.1 Virtual Property Tours 🎥
- Multi-asset media viewer:
  - High-res photo gallery
  - Video tour embed (Cloudinary / YouTube / Vimeo)
  - 360° interactive panorama viewer
  - Interactive / downloadable Floor Plans & Survey schematics

### 4.2 AI Property Assistant 🤖
- **Backend (`apps/properties/views_ai.py`):**
  - Natural language search endpoint using database search vectors + structured filters.
  - Matches budget and location (e.g., *"Find me properties around Asaba under ₦15M with Survey Plan"*).
- **Frontend (`src/components/ai/AIAssistantWidget.jsx`):**
  - Interactive chat widget on landing and search pages.

---

## 🔐 Phase 5: Secure Financial Infrastructure (Escrow & Wallets)
**Objective:** Safe milestone-based payments and deposits without holding direct banking custody.

### 5.1 Licensed Escrow / Payment Partner Integration
- Integrate with licensed payment solution provider (e.g., Paystack Virtual Accounts / Flutterwave / Bank Trustee partner).

### 5.2 Milestone Escrow Workflow (`apps/escrows`)
1. **Initiation:** Buyer locks inspection fee or property deposit into escrow.
2. **Acceptance:** Seller accepts terms; funds held securely.
3. **Verification:** Physical inspection and document validation marked complete.
4. **Approval:** Buyer approves release after confirmation.
5. **Disbursement:** Automated release of funds with platform commission deducted.
