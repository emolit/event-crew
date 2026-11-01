# Email Contact Form Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore a modern contact form on both public pages and deliver validated applications to `eventcrew@bk.ru` over authenticated Mail SMTP.

**Architecture:** Keep the existing schema, honeypot, origin check, payload limit, and rate limiter. Replace Telegram delivery in the API with a dedicated Nodemailer adapter configured only from server environment variables. Reinsert the existing form before the footer, redesign it in the site's graphite/yellow visual language, and update all application CTAs to `#contact`.

**Tech Stack:** Next.js 16, React 19, TypeScript, Nodemailer 10, Zod, Vitest, Testing Library, Mail SMTP over TLS

## Global Constraints

- Never store or log the SMTP application password in Git, tests, responses, or application logs.
- Use `smtp.mail.ru:465` with TLS and the full `@bk.ru` address as SMTP login.
- Send applications only by email; the contact API must not require Telegram configuration.
- Render one form on `/` and one form on `/personnel`, both with `id="contact"`.
- Preserve current validation, honeypot, same-origin protection, 16 KiB limit, and rate limiting.

---

### Task 1: Email delivery and contact API

**Files:**
- Create: `lib/email.ts`
- Create: `tests/lib/email.test.ts`
- Modify: `app/api/contact/route.ts`
- Modify: `tests/api/contact-route.test.ts`
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] Write failing tests for TLS transport configuration, recipient/sender, readable text and escaped HTML, missing configuration, delivery failure, and successful API response.
- [ ] Run the focused tests and confirm failures refer to missing email delivery.
- [ ] Add Nodemailer and implement `sendApplicationEmail` plus the email-only API path.
- [ ] Run focused tests and commit.

### Task 2: Restore form placement and CTA routing

**Files:**
- Create: `db/migrations/003_restore_contact_form_cta.sql`
- Modify: `app/page.tsx`
- Modify: `app/personnel/page.tsx`
- Modify: `components/Header.tsx`
- Modify: `components/PersonnelGrid.tsx`
- Modify: `tests/app/page.test.tsx`
- Modify: `tests/app/personnel-page.test.tsx`
- Modify: `tests/components/header.test.tsx`
- Modify: `tests/lib/db-migrations.test.ts`

- [ ] Write failing tests proving both forms render before their footers, CTAs target `#contact`, and migration 3 updates the default hero CTA.
- [ ] Run focused tests and confirm failures.
- [ ] Add the form to both pages, update links, add the idempotent data migration, then run focused tests and commit.

### Task 3: Modern presentation and deployment documentation

**Files:**
- Modify: `components/ContactForm.tsx`
- Modify: `tests/components/contact-form.test.tsx`
- Modify: `.env.example`
- Modify: `README.md`
- Modify: `docs/admin-operations.md`

- [ ] Write failing presentation tests for the graphite panel, accent treatment, responsive form card, and accessible success/error states.
- [ ] Redesign the form without changing its field behavior.
- [ ] Document SMTP environment variables without credentials.
- [ ] Run the full test suite, typecheck, lint, and production build; commit.
