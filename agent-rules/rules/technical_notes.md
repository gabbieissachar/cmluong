Architecture & Tooling

Layer

Choice

Notes

**Frontend**

Next.js 14 (App Router) + TypeScript

React server components, built‑in i18n

**Styling**

Tailwind CSS + shadcn/ui

Fast theming, accessible components

**State Management**

Zustand

Lightweight store

**Backend API**

Next.js Route Handlers + TRPC

End‑to‑end type‑safe calls

**Database**

Supabase Postgres

Managed Postgres with row-level security; real-time triggers

**Auth**

Clerk

Multi-provider auth (email, social, Magic Link); role tags: leader, accountant, staff

**PDF Payslips**

React‑PDF

Generates server‑side PDFs

**Bank Export**

Server util that maps payroll → MBBank CSV

**Containerisation**

Docker Compose

One container for app, one for DB

**AI Coding Tools**

ChatGPT Codex, Trae

Reads `/docs`, obeys System Prompts

---

## /docs/FrontendGuidelines.md

1.  **Design System**

    - Primary palette: Kindergarden green #26A65B, accent yellow #F5C518.
    - Typography: Inter (base 16px) – scale up to 32px for headers.
    - Component radius: `rounded-2xl`; shadow subtle.

2.  **Layout**

    - Mobile-first flex layouts; max-width 1280 px on desktop.
    - Navbar: sticky top with role-based menu.
    - Bottom-sheet modals on mobile for forms.

3.  **i18n**

    - Use `next-intl`; default `vi`, fallback `en`.
    - All strings in `/messages/*.json`.

4.  **Accessibility**

    - WCAG AA; focus rings, ARIA labels on all icon buttons.

5.  **Code Style**

    - ESLint + Prettier (Airbnb/TypeScript).
    - Functional components; hooks over classes.

---

## /docs/BackendStructure.md

### API Endpoints (TRPC‑style)

Method

Route

Roles

Purpose

`GET`

`/api/cycle/:month`

Accountant, Leader

Fetch payroll cycle summary

`POST`

`/api/cycle/import-timesheet`

Accountant

Upload CSV & generate draft

`POST`

`/api/cycle/:id/submit`

Accountant

Mark cycle ready for approval

`POST`

`/api/cycle/:id/approve`

Leader

Approve cycle

`GET`

`/api/cycle/:id/export-bank-csv`

Leader

Download MBBank file

`GET`

`/api/payslip/:id`

Staff

Download PDF

### Auth & Security

- JWT stored in HttpOnly cookie.
- RBAC middleware at route level.
- Audit trail table records every mutation.

### Integrations (Future)

- Government tax XML upload API.
- VNPay for parent invoicing (v2).

---

## /docs/SystemPrompts.md – AI Assistant Rules

```
You are "KDGPayroll‑Bot", a senior full‑stack TypeScript engineer.
Read all Markdown docs in the /docs folder before coding.
Always:
  • Ask for missing business logic or env variables.
  • Generate code inside src/ with proper file paths.
  • Follow ESLint & Prettier rules.
  • Write Vietnamese UI text via i18n messages only.
Never:
  • Hard‑code money constants (take from .env or DB).
  • Push changes directly to protected branch without PR.

When uncertain: respond with a clarifying question instead of guessing.

```
