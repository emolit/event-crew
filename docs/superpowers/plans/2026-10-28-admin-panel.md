# EVENT CREW Admin Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a secure `/admin` area that lets the owner manage projects, galleries, personnel, prices, homepage content/background, footer content, and an ordered client list without code changes or redeployment.

**Architecture:** Keep the admin inside the existing Next.js application. Store mutable content, users, sessions, and audit snapshots in SQLite under a persistent VPS data directory; store processed WebP uploads alongside it and expose them through a controlled media route. Public server components read through typed repositories and invalidate tagged caches after each successful admin mutation.

**Tech Stack:** Next.js 16.3.1, React 19, TypeScript 6, SQLite via `better-sqlite3`, Zod, Node `crypto.scrypt`, Sharp, dnd-kit, Vitest/Testing Library, systemd/Nginx on Ubuntu.

**Spec:** `docs/superpowers/specs/2026-10-28-admin-panel-design.md`

## Global Constraints

- The first release has one administrator but user/session schema must support future users and roles.
- Saving publishes immediately; there are no drafts or approval workflow.
- Mutable data and uploads live outside the Git checkout, under `EVENT_CREW_DATA_DIR` (`/var/lib/event-crew` in production).
- Accept only JPEG, PNG, and WebP uploads, maximum 12 MiB; decode and rewrite every accepted image as WebP.
- Admin UI copy is Russian and follows the approved dark EVENT CREW layout with yellow accents.
- Deletions are recoverable for 30 days; backup retention is 30 successful daily backups.
- Public content present before migration must remain visually and semantically equivalent after migration.
- Every mutation requires a valid owner session, same-origin request, validation, transaction, audit entry, and cache invalidation.

## Review Focus

- A file with a permitted extension but invalid or hostile bytes must be rejected before it reaches permanent storage; Task 4 pins this with decoder-based upload tests.
- A failed database write after a staged upload must leave the old record intact and remove the orphan file; Tasks 4, 6, and 7 pin rollback behavior.
- Direct calls to actions and media/admin routes without a valid session must return unauthorized and make no change; Tasks 2 and 5 pin this boundary.
- Reorder requests with duplicates, missing IDs, or IDs from another entity must be rejected atomically; Tasks 6, 7, and 8 pin ordering invariants.
- Restore must not silently succeed when a referenced media file is unavailable; Task 9 pins a visible restore error and unchanged current state.

---

## Planned File Structure

- `lib/admin/config.ts` — validated data directory and session settings.
- `lib/db/client.ts`, `lib/db/migrate.ts`, `db/migrations/*.sql` — SQLite lifecycle and schema.
- `lib/auth/*`, `scripts/create-admin.ts` — password hashing, sessions, owner provisioning.
- `lib/content/types.ts`, `lib/content/repository.ts`, `lib/content/seed.ts` — typed content access and initial import.
- `lib/media/store.ts`, `app/media/[id]/route.ts` — safe upload processing and delivery.
- `lib/audit/repository.ts` — append-only history and restoration orchestration.
- `app/admin/**` and `components/admin/**` — protected UI and server actions.
- Existing public components become prop-driven; `app/page.tsx` and `app/personnel/page.tsx` load runtime content.
- `scripts/backup.ts`, `deploy/systemd/*`, `docs/admin-operations.md` — VPS backup, recovery, and rollout.

### Task 1: Persistent SQLite foundation

**Files:**
- Modify: `package.json`
- Modify: `.env.example`
- Create: `lib/admin/config.ts`
- Create: `lib/db/client.ts`
- Create: `lib/db/migrate.ts`
- Create: `db/migrations/001_admin_content.sql`
- Test: `tests/lib/admin-config.test.ts`
- Test: `tests/lib/db-migrations.test.ts`

**Interfaces:**
- Produces: `AdminConfig`, `getAdminConfig(env?: NodeJS.ProcessEnv): AdminConfig`, `openDatabase(config?: AdminConfig): Database`, `runMigrations(db: Database): void`, `closeDatabaseForTests(): void`.
- Schema produces tables `schema_migrations`, `users`, `sessions`, `projects`, `project_images`, `personnel`, `site_content`, `footer_content`, `clients`, `media_assets`, and `audit_log` with foreign keys, unique `sort_order` per collection, and soft-delete timestamps.

- [ ] **Step 1: Add failing configuration and migration tests** asserting local defaults, required production path, directory creation with restricted permissions, idempotent migrations, foreign keys enabled, and all required tables/indexes.
- [ ] **Step 2: Run `npm.cmd run test:run -- tests/lib/admin-config.test.ts tests/lib/db-migrations.test.ts`** and verify failure because the modules do not exist.
- [ ] **Step 3: Add `better-sqlite3`, `sharp`, `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, `tsx`, and `@types/better-sqlite3`; add `EVENT_CREW_DATA_DIR` and `SESSION_SECRET` placeholders to `.env.example`.
- [ ] **Step 4: Implement config, singleton connection, WAL/foreign-key pragmas, and ordered SQL migration runner** with explicit production refusal when the data directory or a 32-byte session secret is missing.
- [ ] **Step 5: Run the focused tests, `npm.cmd run typecheck`, and `npm.cmd run lint`**; expect all to pass.
- [ ] **Step 6: Commit** with `feat: add persistent sqlite foundation`.

### Task 2: Owner authentication and session enforcement

**Files:**
- Create: `lib/auth/password.ts`
- Create: `lib/auth/session.ts`
- Create: `lib/auth/guard.ts`
- Create: `lib/auth/rate-limit.ts`
- Create: `scripts/create-admin.ts`
- Create: `app/admin/login/page.tsx`
- Create: `app/admin/login/actions.ts`
- Create: `app/admin/logout/route.ts`
- Test: `tests/lib/auth.test.ts`
- Test: `tests/app/admin-login.test.tsx`

**Interfaces:**
- Produces: `hashPassword(password: string): Promise<string>`, `verifyPassword(password: string, encoded: string): Promise<boolean>`, `createSession(userId: number): Promise<string>`, `getSessionUser(): Promise<AuthUser | null>`, `requireAdmin(): Promise<AuthUser>`, `loginAction(_: LoginState, formData: FormData): Promise<LoginState>`.
- Cookie contract: `eventcrew_admin`, opaque 32-byte token, 12-hour expiry, `HttpOnly`, `Secure` in production, `SameSite=Lax`, `Path=/`.

- [ ] **Step 1: Write failing auth tests** for scrypt verification, malformed hash rejection, hashed token persistence, expiry/revocation, generic invalid-credential response, login throttling, secure cookie flags, and unauthorized guard behavior.
- [ ] **Step 2: Run `npm.cmd run test:run -- tests/lib/auth.test.ts tests/app/admin-login.test.tsx`** and verify the missing-module failures.
- [ ] **Step 3: Implement password and session repositories plus `requireAdmin()`**; use constant-shape credential checks and store only token hashes.
- [ ] **Step 4: Implement the interactive `npm run admin:create` CLI** using hidden stdin input, confirmation, minimum 12 characters, and upsert refusal unless `--reset` is explicitly supplied; never accept a password argument.
- [ ] **Step 5: Implement login/logout UI and actions** with same-origin verification, rate limiting, Russian errors, and redirect to `/admin` after success.
- [ ] **Step 6: Run focused tests, typecheck, and lint**; expect all to pass.
- [ ] **Step 7: Commit** with `feat: add secure owner authentication`.

### Task 3: Typed content repository and idempotent initial import

**Files:**
- Create: `lib/content/types.ts`
- Create: `lib/content/repository.ts`
- Create: `lib/content/seed.ts`
- Modify: `data/projects.ts`
- Modify: `data/services.ts`
- Modify: `data/site.ts`
- Test: `tests/lib/content-repository.test.ts`
- Modify: `tests/data/content.test.ts`

**Interfaces:**
- Produces: `getPublicContent(): Promise<PublicContent>`, `listProjects(options?: { includeDeleted?: boolean }): Promise<ProjectRecord[]>`, `listPersonnel(...)`, `getHomepage()`, `getFooter()`, `listClients(...)`, and `seedCurrentContent(db: Database): void`.
- `PublicContent` contains `{ homepage, footer, clients, projects, personnel }`; project records preserve `size: "standard" | "wide" | "tall"` and ordered image arrays.

- [ ] **Step 1: Write failing repository tests** for ordered reads, hidden/deleted exclusion, project-image order, active client order, and an idempotent seed that preserves every current title, price, role, URL, and asset path without duplication.
- [ ] **Step 2: Run the focused tests** and verify failure before repository implementation.
- [ ] **Step 3: Implement typed row mappers and read repositories** using prepared statements only.
- [ ] **Step 4: Implement an idempotent seed marker and import current static data** including TRACE, the hero background, promotion copy, all five projects, eight personnel entries, and current contacts.
- [ ] **Step 5: Run focused tests plus the existing 92-test suite**; expect no content regressions.
- [ ] **Step 6: Commit** with `feat: add mutable content repository and seed`.

### Task 4: Safe persistent media storage

**Files:**
- Create: `lib/media/types.ts`
- Create: `lib/media/store.ts`
- Create: `app/media/[id]/route.ts`
- Test: `tests/lib/media-store.test.ts`
- Test: `tests/app/media-route.test.ts`

**Interfaces:**
- Produces: `storeImage(input: Buffer, profile: "project" | "personnel" | "hero" | "client", originalName: string): Promise<MediaAsset>`, `discardMedia(id: string): Promise<void>`, `getMediaAsset(id: string): MediaAsset | null`, `mediaUrl(id: string): string`.
- Profile output: project/hero maximum 2400 px, personnel/client maximum 1600 px; preserve alpha for personnel/client; always auto-rotate and encode WebP.

- [ ] **Step 1: Write failing tests** for JPEG/PNG/WebP acceptance, 12 MiB rejection, invalid bytes with a `.jpg` name, SVG rejection, EXIF rotation, alpha preservation, dimension limits, UUID filenames, and cleanup after a simulated DB failure.
- [ ] **Step 2: Run the media tests** and verify failure because storage is absent.
- [ ] **Step 3: Implement staging, Sharp decoding, profile transforms, atomic rename, media metadata insert, and compensating cleanup**; never join paths from user input.
- [ ] **Step 4: Implement authenticated/private handling for staged assets and public immutable responses for active assets** with ETag, content type, and traversal-safe ID parsing.
- [ ] **Step 5: Run media tests, typecheck, lint, and build**; expect all to pass.
- [ ] **Step 6: Commit** with `feat: add safe persistent media storage`.

### Task 5: Protected admin shell and overview

**Files:**
- Create: `app/admin/layout.tsx`
- Create: `app/admin/page.tsx`
- Create: `components/admin/AdminShell.tsx`
- Create: `components/admin/AdminNav.tsx`
- Create: `components/admin/StatusNotice.tsx`
- Create: `components/admin/ConfirmDialog.tsx`
- Create: `lib/admin/action-result.ts`
- Test: `tests/app/admin-shell.test.tsx`
- Test: `tests/lib/admin-authorization.test.ts`

**Interfaces:**
- Produces: `ActionResult<T> = { ok: true; data: T } | { ok: false; fieldErrors?: Record<string,string>; message: string }`, reusable shell/navigation/dialog components, and overview queries for counts and recent changes.

- [ ] **Step 1: Write failing tests** for redirecting anonymous page access, blocking direct unauthenticated mutation calls, rendering approved navigation, mobile menu accessibility, overview counts, and logout.
- [ ] **Step 2: Run focused tests** and verify expected failures.
- [ ] **Step 3: Implement the protected server layout and approved dark/yellow responsive shell** without changing public-site styles.
- [ ] **Step 4: Implement overview cards and recent audit entries** with an external link to the public site.
- [ ] **Step 5: Run focused tests, accessibility assertions, typecheck, and lint**; expect all to pass.
- [ ] **Step 6: Commit** with `feat: add protected admin dashboard`.

### Task 6: Project CRUD, gallery, and ordering

**Files:**
- Create: `lib/admin/project-schema.ts`
- Create: `lib/content/project-service.ts`
- Create: `app/admin/projects/page.tsx`
- Create: `app/admin/projects/new/page.tsx`
- Create: `app/admin/projects/[id]/page.tsx`
- Create: `app/admin/projects/actions.ts`
- Create: `components/admin/ProjectForm.tsx`
- Create: `components/admin/ProjectGalleryEditor.tsx`
- Create: `components/admin/SortableList.tsx`
- Test: `tests/lib/project-service.test.ts`
- Test: `tests/app/admin-projects.test.tsx`

**Interfaces:**
- Produces: `createProject(input: ProjectInput, actorId: number)`, `updateProject(id: number, input: ProjectInput, actorId: number)`, `softDeleteProject(id: number, actorId: number)`, `reorderProjects(ids: number[], actorId: number)`, `reorderProjectImages(projectId: number, ids: number[], actorId: number)`.

- [ ] **Step 1: Write failing service tests** for create/edit/delete, stable unique slug generation, roles, mosaic size, cover-as-first-image, transaction rollback, and atomic rejection of duplicate/missing/cross-project reorder IDs.
- [ ] **Step 2: Run service tests** and verify failure before implementation.
- [ ] **Step 3: Implement Zod schemas and transactional project/gallery service** using Task 4 media staging and Task 9-compatible audit payloads.
- [ ] **Step 4: Write failing component tests** for list actions, add/edit form errors, upload preview, delete confirmation, drag reorder, and keyboard/mobile up/down controls.
- [ ] **Step 5: Implement project pages, actions, gallery editor, and sortable list**; invalidate public home/project cache only after success.
- [ ] **Step 6: Run focused tests, full tests, typecheck, lint, and build**; expect all to pass.
- [ ] **Step 7: Commit** with `feat: add project and gallery management`.

### Task 7: Personnel CRUD, prices, portraits, and ordering

**Files:**
- Create: `lib/admin/personnel-schema.ts`
- Create: `lib/content/personnel-service.ts`
- Create: `app/admin/personnel/page.tsx`
- Create: `app/admin/personnel/new/page.tsx`
- Create: `app/admin/personnel/[id]/page.tsx`
- Create: `app/admin/personnel/actions.ts`
- Create: `components/admin/PersonnelForm.tsx`
- Test: `tests/lib/personnel-service.test.ts`
- Test: `tests/app/admin-personnel.test.tsx`

**Interfaces:**
- Produces: `createPersonnel(input: PersonnelInput, actorId: number)`, `updatePersonnel(...)`, `softDeletePersonnel(...)`, `reorderPersonnel(ids: number[], actorId: number)`; price is a positive integer rubles/hour.

- [ ] **Step 1: Write failing service tests** for price validation, portrait replacement, old-file retention, CRUD, rollback, and atomic invalid-order rejection.
- [ ] **Step 2: Run service tests** and verify failure.
- [ ] **Step 3: Implement schema and transactional personnel service** using the transparent media profile.
- [ ] **Step 4: Write failing UI tests** for current price display, validation, preview, delete confirmation, desktop drag, and mobile/keyboard order buttons.
- [ ] **Step 5: Implement personnel list, form, actions, and cache invalidation** while preserving the public card aspect ratio and reverse side.
- [ ] **Step 6: Run focused and full tests, typecheck, lint, and build**; expect all to pass.
- [ ] **Step 7: Commit** with `feat: add personnel management`.

### Task 8: Homepage, footer, and client management

**Files:**
- Create: `lib/admin/site-content-schema.ts`
- Create: `lib/content/site-content-service.ts`
- Create: `app/admin/homepage/page.tsx`
- Create: `app/admin/homepage/actions.ts`
- Create: `app/admin/footer/page.tsx`
- Create: `app/admin/footer/actions.ts`
- Create: `app/admin/clients/page.tsx`
- Create: `app/admin/clients/actions.ts`
- Create: `components/admin/HomepageForm.tsx`
- Create: `components/admin/FooterForm.tsx`
- Create: `components/admin/ClientForm.tsx`
- Test: `tests/lib/site-content-service.test.ts`
- Test: `tests/app/admin-site-content.test.tsx`

**Interfaces:**
- Produces: `updateHomepage(input: HomepageInput, actorId: number)`, `updateFooter(input: FooterInput, actorId: number)`, `createClient`, `updateClient`, `softDeleteClient`, `reorderClients`, and `setClientVisibility`.

- [ ] **Step 1: Write failing service tests** for URL/contact validation, hero replacement rollback, client logo alpha, visibility, CRUD, and atomic duplicate/missing-ID reorder rejection.
- [ ] **Step 2: Run service tests** and verify failure.
- [ ] **Step 3: Implement structured services and validation**; preserve old hero/logo assets for history and invalidate affected public caches after commit.
- [ ] **Step 4: Write failing UI tests** for hero preview, phone/messenger/email fields, promotion visibility/copy, client logo preview on dark background, visibility toggle, and responsive ordering controls.
- [ ] **Step 5: Implement the three admin sections** with unsaved-change warnings and inline Russian errors.
- [ ] **Step 6: Run focused and full tests, typecheck, lint, and build**; expect all to pass.
- [ ] **Step 7: Commit** with `feat: add homepage footer and client management`.

### Task 9: Audit history and 30-day restoration

**Files:**
- Create: `lib/audit/types.ts`
- Create: `lib/audit/repository.ts`
- Create: `lib/audit/restore.ts`
- Create: `app/admin/history/page.tsx`
- Create: `app/admin/history/actions.ts`
- Create: `components/admin/HistoryTable.tsx`
- Create: `components/admin/RestoreDialog.tsx`
- Test: `tests/lib/audit-restore.test.ts`
- Test: `tests/app/admin-history.test.tsx`

**Interfaces:**
- Produces: `recordAudit(tx, entry: AuditInput): number`, `listAudit(filters: AuditFilters): AuditEntry[]`, `restoreAuditEntry(id: number, actorId: number): ActionResult<{ restoredAuditId: number }>`, `purgeExpiredDeletedContent(now: Date): PurgeReport`.

- [ ] **Step 1: Write failing tests** for before/after snapshots on every mutation class, filters, restoring update/delete/order, creating a new restore audit record, 30-day eligibility, missing-media failure with unchanged current state, and purge only after expiry.
- [ ] **Step 2: Run audit tests** and verify failure.
- [ ] **Step 3: Implement append-only audit repository and entity-specific restoration inside transactions**; verify all referenced media before changing state.
- [ ] **Step 4: Write failing UI tests** for history filters, readable diffs, expired state, and explicit restore confirmation.
- [ ] **Step 5: Implement history and restore UI** and connect Tasks 6–8 to `recordAudit` within their mutation transactions.
- [ ] **Step 6: Run focused and full tests, typecheck, lint, and build**; expect all to pass.
- [ ] **Step 7: Commit** with `feat: add content history and restoration`.

### Task 10: Switch the public site to runtime-managed content

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/personnel/page.tsx`
- Modify: `components/Hero.tsx`
- Modify: `components/Projects.tsx`
- Modify: `components/ProjectCard.tsx`
- Modify: `components/PersonnelGrid.tsx`
- Modify: `components/Footer.tsx`
- Modify: `components/Header.tsx`
- Modify: `tests/app/page.test.tsx`
- Modify: `tests/app/personnel-page.test.tsx`
- Modify: `tests/components/hero-footer.test.tsx`
- Create: `tests/app/public-content-integration.test.tsx`

**Interfaces:**
- Consumes: `getPublicContent()` and media URLs from Tasks 3–4.
- Produces: prop-driven public components that contain no mutable-content imports from `data/*.ts`; pages are runtime dynamic and use tagged reads suitable for action invalidation.

- [ ] **Step 1: Update tests first** to provide repository fixtures and assert that changed DB content, order, visibility, prices, gallery cover, hero background, contacts, promotion, and clients render publicly.
- [ ] **Step 2: Run public tests** and verify they fail while components still import static data.
- [ ] **Step 3: Refactor components to typed props and make both pages load server-side content**; use `unoptimized` or controlled media sizing only where runtime media requires it.
- [ ] **Step 4: Add integration tests proving an admin service update changes the next public render** without rebuilding and hidden/deleted records disappear.
- [ ] **Step 5: Run all tests, typecheck, lint, build, and compare key public copy/order against the seed fixture**; expect equivalence before edits.
- [ ] **Step 6: Commit** with `feat: serve public content from admin database`.

### Task 11: Backup, recovery, deployment, and final verification

**Files:**
- Create: `scripts/backup.ts`
- Create: `scripts/restore-backup.ts`
- Create: `scripts/purge-expired-content.ts`
- Create: `deploy/systemd/event-crew-backup.service`
- Create: `deploy/systemd/event-crew-backup.timer`
- Create: `deploy/systemd/event-crew-purge.service`
- Create: `deploy/systemd/event-crew-purge.timer`
- Create: `docs/admin-operations.md`
- Modify: `package.json`
- Test: `tests/scripts/backup-restore.test.ts`

**Interfaces:**
- Produces: `npm run backup`, `npm run restore-backup -- <archive>`, `npm run purge:expired`, verified systemd units, and an operations runbook.

- [ ] **Step 1: Write failing backup tests** for a consistent SQLite snapshot plus uploads, checksum manifest, successful restore into an empty directory, refusal to overwrite without `--force`, retention of exactly 30 successful daily archives, and no deletion after a failed backup.
- [ ] **Step 2: Run backup tests** and verify failure.
- [ ] **Step 3: Implement backup/restore/purge scripts** with temporary output, atomic final rename, checksums, and explicit data-directory validation.
- [ ] **Step 4: Add systemd units and operations documentation** covering environment variables, directory ownership, migration/seed, interactive admin creation, backup test, restore drill, service restart, and rollback.
- [ ] **Step 5: Run `npm.cmd run test:run`, `npm.cmd run typecheck`, `npm.cmd run lint`, and `npm.cmd run build`**; expect zero failures.
- [ ] **Step 6: Run a local smoke flow**: seed current data, create a temporary owner, log in, modify one record, confirm public render changes, restore history, back up, restore into a second temp directory, and compare content/media hashes.
- [ ] **Step 7: Review `git diff --check`, confirm no database, upload, backup, secret, or `.superpowers` file is tracked, and document the production command sequence**.
- [ ] **Step 8: Commit** with `feat: complete admin operations and deployment`.

## Self-Review Results

- Spec coverage: authentication, CRUD/reorder, all requested content, hero/media, clients, immediate publication, audit restore, backups, migration, mobile UI, and VPS operations each map to a task.
- Step scan: tasks are separated at independently reviewable boundaries and every implementation follows a failing test.
- Type consistency: content, auth, media, audit, and `ActionResult` interfaces are introduced before consumers.
- Review Focus: each of the five high-risk conditions has a named test in its owning task.
- Proportion: the plan fixes interfaces and acceptance evidence without prescribing component bodies or SQL implementation details beyond the approved data contract.
