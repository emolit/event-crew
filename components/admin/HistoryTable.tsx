"use client";

import type { AuditEntry } from "@/lib/audit/repository";
import RestoreDialog from "@/components/admin/RestoreDialog";

export default function HistoryTable({
  entries,
  restoreAction = async () => {},
}: {
  entries: AuditEntry[];
  restoreAction?: (id: number) => unknown | Promise<unknown>;
}) {
  return (
    <>
      <form className="mt-6 flex gap-3">
        <label>
          Тип записи
          <select aria-label="Тип записи" className="ml-2 bg-black p-2" name="entityType">
            <option value="">Все</option>
            <option value="project">Проекты</option>
            <option value="personnel">Персонал</option>
            <option value="client">Клиенты</option>
          </select>
        </label>
      </form>
      <div className="mt-5 grid gap-3">
        {entries.map((entry) => (
          <article
            className="rounded-xl border border-white/10 bg-white/5 p-4"
            key={entry.id}
          >
            <div className="flex flex-wrap justify-between gap-3">
              <strong>
                {label(entry.entityType)} · {action(entry.action)}
              </strong>
              <time>{entry.createdAt}</time>
            </div>
            <p className="mt-2 text-sm text-white/65">{diff(entry.before, entry.after)}</p>
            <div className="mt-3">
              {entry.restoredAt ? (
                <div className="rounded-lg border border-[color:var(--accent)]/35 bg-[color:var(--accent)]/10 p-3">
                  <strong className="text-sm text-[color:var(--accent)]">
                    Изменение восстановлено
                  </strong>
                  <p className="mt-1 text-sm text-white/75">
                    Возвращено: {restoredDiff(entry.restoredFrom, entry.before)}
                  </p>
                  <p className="mt-1 text-xs text-white/45">
                    {entry.restoredByUsername ?? "Удалённый пользователь"} · {entry.restoredAt}
                  </p>
                </div>
              ) : entry.action === "restore" ? (
                <span className="text-sm text-white/60">Восстановление выполнено</span>
              ) : entry.restorable ? (
                <RestoreDialog action={restoreAction} entryId={entry.id} />
              ) : (
                <span className="text-sm text-white/40">Срок восстановления истёк</span>
              )}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function label(value: string) {
  return (
    {
      project: "Проект",
      personnel: "Персонал",
      client: "Клиент",
      homepage: "Главный экран",
      footer: "Футер",
      "project-list": "Порядок проектов",
      "personnel-list": "Порядок персонала",
      "client-list": "Порядок клиентов",
    } as Record<string, string>
  )[value] ?? value;
}

function action(value: string) {
  return (
    {
      create: "создание",
      update: "изменение",
      delete: "удаление",
      reorder: "порядок",
      restore: "восстановление",
    } as Record<string, string>
  )[value] ?? value;
}

function restoredDiff(from: unknown, to: unknown) {
  if (!from && to) {
    return "удалённая запись возвращена";
  }
  return diff(from, to);
}

function diff(from: unknown, to: unknown) {
  if (!from || !to) {
    return to ? "Запись создана" : "Запись удалена";
  }
  if (typeof from !== "object" || typeof to !== "object") {
    return `${String(from)} → ${String(to)}`;
  }
  const before = from as Record<string, unknown>;
  const after = to as Record<string, unknown>;
  const parts: string[] = [];
  for (const key of Object.keys(after)) {
    if (
      ["title", "name", "price", "visible"].includes(key) &&
      JSON.stringify(before[key]) !== JSON.stringify(after[key])
    ) {
      parts.push(`${String(before[key])} → ${String(after[key])}`);
    }
  }
  return parts.join("; ") || "Состав данных изменён";
}
