# JAXIS StatLab

## Overview
JAXIS StatLab is a comprehensive, multi-role SaaS platform designed to manage end-to-end statistical workflows. It connects clients, statisticians, Quality Assurance (QA) leads, finance officers, administrators, and executive oversight into a single, cohesive, and secure system.

## The Flow (How It Works)
The platform ensures quality and accountability by following a strict 9-stage operational workflow:

1. **Intake (Triage):** Client research requests are evaluated and either approved or rejected.
2. **Quotation:** Accurate pricing is generated based on the scope of work.
3. **Payment:** Secure verification of upfront payments or downpayments.
4. **Assignment:** Projects are intelligently routed to appropriate statisticians and Senior QA leads.
5. **Analysis Workspace:** Statisticians process the data using specialized analytical notebooks.
6. **QA Review:** Senior QA leads perform rigorous statistical audits and error classification. No project is released without approval.
7. **Deliverables:** Final files are released to the client, strictly gated by final payment clearance.
8. **Revisions:** Any requested scope changes or revisions are tracked and handled.
9. **Archive & Payout:** Projects are archived, and revenue shares are automatically calculated and disbursed.

## Recent System Enhancements & Completed Modules
- **DefenseLab Oral Defense Simulation (Module 13)**: End-to-end rehearsal scheduling, 12-hour cancellation rule enforcement, Google Meet integration, cloud recording vault, and penalty governance.
- **Messenger-Style High-Performance Chat (Module 09)**: Instant 0ms cache-first preload, optimistic message dispatch, background delta syncing, communication firewall anti-evasion, and canonical orbital loading states.
- **Staff Attendance & Duty Governance (Module 18)**: Topbar live timeclock widget, 14-hour anti-runaway shift safety auto-close, automated meal break deductions, and Segregation of Duties shift correction approval workflows.
- **Corporate Payroll & Itemized Payslips (Module 19)**: CEO executive compensation rate matrix, bespoke PhD consultant overrides, semi-monthly batch calculation engine, self-service e-wallet/bank settlement profiles, 1-click treasury disbursements, and official QR-stamped payslip vouchers.
- **Unified Design & Typography Harmonization**: Standardized `<KpiCard />` metrics, canonical `<PageHeader />` with fast SPA breadcrumb routing, and Philippine Peso (`<Peso />`) optical weight harmonization.
- **Cinematic Landing Page (`apps/web`)**: GSAP scroll-triggered hero animations, pixel transitions, research sector dashboard, solutions, and pricing.

## Monorepo Architecture
This project uses Turborepo to manage multiple applications and packages:
- `apps/web`: Public-facing Landing Page & Marketing Site (Next.js SSR/SSG).
- `apps/app`: SaaS Application Workspace for all 7 internal and external Roles (Next.js App Router).
- `packages/ui`: Shared Enterprise Design System Component Library (`@repo/ui`).

## Getting Started

To build and run all applications locally:

```bash
# Install dependencies
npm install

# Run the development servers
npx turbo dev
```

- The Landing Page (`web`) will be available at [http://localhost:3000](http://localhost:3000)
- The SaaS Workspace (`app`) will be available at [http://localhost:3001](http://localhost:3001)
