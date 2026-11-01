# Clear Audit History Restoration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore content by marking the original audit entry as restored, without adding a second history row, and present that state in plain Russian copy.

**Architecture:** Extend `audit_log` with nullable restoration metadata and the actual pre-restore snapshot. Perform the content rollback and audit-entry update in the existing SQLite transaction. Expose the metadata through `listAudit`, then render a terminal restored state in `HistoryTable`.

**Tech Stack:** Next.js 16, React 19, TypeScript, Node SQLite, Vitest, Testing Library

**Spec:** `docs/superpowers/specs/2026-11-01-audit-history-restore-design.md`

## Global Constraints

- A restoration updates the original audit row and never inserts an additional `restore` row.
- A successfully restored entry cannot be restored again.
- Failed restoration changes neither content nor audit metadata.
- Existing audit rows and legacy `restore` rows remain readable.
- The UI copy must use «Изменение восстановлено» and show who restored the entry and when.

## Review Focus

- Two restore requests for the same entry: the second must fail without changing content.
- Missing media during restore: content and restoration metadata must both remain unchanged.
- Expired entries: remain non-restorable even when restoration columns are null.
- A deleted restoring user: the entry remains readable with a null display name.
- Legacy rows whose action is `restore`: remain visible and do not break list mapping.

---

### Task 1: Persist restoration metadata on audit entries

**Files:**
- Create: `db/migrations/002_audit_restore_metadata.sql`
- Modify: `lib/audit/repository.ts`
- Modify: `tests/lib/db-migrations.test.ts`
- Modify: `tests/lib/audit-restore.test.ts`

**Interfaces:**
- Produces: `AuditEntry.restoredAt: string | null`, `restoredByUserId: number | null`, `restoredByUsername: string | null`, and `restoredFrom: unknown`.
- Produces database columns: `restored_at`, `restored_by_user_id`, and `restored_from_json` on `audit_log`.

- [ ] **Step 1: Write failing migration and repository tests**

Assert that a fresh migrated database contains all three columns, old rows map them to `null`, legacy `restore` rows still map, and `restorable` is false when `restored_at` is populated.

- [ ] **Step 2: Run tests to verify failure**

Run: `npm.cmd run test:run -- tests/lib/db-migrations.test.ts tests/lib/audit-restore.test.ts`

Expected: FAIL because the migration columns and `AuditEntry` fields do not exist.

- [ ] **Step 3: Add migration and repository mapping**

Add nullable columns with `restored_by_user_id` referencing `users(id) ON DELETE SET NULL`. Join the restoring user separately in `listAudit`, parse `restored_from_json`, and include `restored_at IS NULL` in the `restorable` calculation.

- [ ] **Step 4: Run focused tests**

Run: `npm.cmd run test:run -- tests/lib/db-migrations.test.ts tests/lib/audit-restore.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add db/migrations/002_audit_restore_metadata.sql lib/audit/repository.ts tests/lib/db-migrations.test.ts tests/lib/audit-restore.test.ts
git commit -m "feat: track restoration on audit entries"
```

### Task 2: Restore content without creating another history row

**Files:**
- Modify: `lib/audit/restore.ts`
- Modify: `tests/lib/audit-restore.test.ts`
- Modify: `tests/lib/reviewer-regressions.test.ts`

**Interfaces:**
- Consumes: restoration fields from Task 1.
- Produces: `restoreAuditEntry(id, actorId, options): ActionResult<{ restoredEntryId: number }>`.

- [ ] **Step 1: Write failing service tests**

Test that restoration keeps the audit row count unchanged, sets metadata on the original row, stores the real current snapshot in `restoredFrom`, restores the requested snapshot, rejects a second restore, and leaves metadata null after missing-media or expired-entry failure.

- [ ] **Step 2: Run tests to verify failure**

Run: `npm.cmd run test:run -- tests/lib/audit-restore.test.ts tests/lib/reviewer-regressions.test.ts`

Expected: FAIL because restoration currently inserts a new `restore` row.

- [ ] **Step 3: Update `restoreAuditEntry` transaction**

Remove the `recordAudit(... action: "restore")` call. After verifying media and applying the snapshot, update the selected `audit_log` row with `restored_at=CURRENT_TIMESTAMP`, `restored_by_user_id=?`, and `restored_from_json=?`, guarded by `restored_at IS NULL`; return `restoredEntryId: id`.

- [ ] **Step 4: Run focused tests**

Run: `npm.cmd run test:run -- tests/lib/audit-restore.test.ts tests/lib/reviewer-regressions.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/audit/restore.ts tests/lib/audit-restore.test.ts tests/lib/reviewer-regressions.test.ts
git commit -m "fix: keep restoration on original audit entry"
```

### Task 3: Present a simple terminal restored state

**Files:**
- Modify: `components/admin/HistoryTable.tsx`
- Modify: `tests/app/admin-history.test.tsx`

**Interfaces:**
- Consumes: restored metadata exposed by `AuditEntry`.
- Produces: restored-row copy «Изменение восстановлено», restoration detail, actor/date metadata, and no restore button.

- [ ] **Step 1: Write failing UI tests**

Render one active and one restored entry. Assert that the restored entry shows «Изменение восстановлено», the restoring username and timestamp, a readable returned-value direction, and no restore button; assert that active and expired entries retain their current actions.

- [ ] **Step 2: Run test to verify failure**

Run: `npm.cmd run test:run -- tests/app/admin-history.test.tsx`

Expected: FAIL because restored metadata is not rendered.

- [ ] **Step 3: Implement restored-state rendering**

Keep the existing card layout and filter. Add a compact status badge and restoration summary based on `restoredFrom -> before`; show `restoredByUsername ?? "Удалённый пользователь"` and `restoredAt`. Render neither the restore dialog nor the expiry message for restored rows.

- [ ] **Step 4: Run UI and full verification**

Run: `npm.cmd run test:run -- tests/app/admin-history.test.tsx`

Expected: PASS.

Run: `npm.cmd run test:run && npm.cmd run typecheck && npm.cmd run lint && npm.cmd run build`

Expected: all tests pass, typecheck and lint exit 0, and the production build lists `/admin/history`.

- [ ] **Step 5: Commit**

```bash
git add components/admin/HistoryTable.tsx tests/app/admin-history.test.tsx
git commit -m "feat: simplify restored history entries"
```
