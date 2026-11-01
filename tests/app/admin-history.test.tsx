import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import HistoryTable from "@/components/admin/HistoryTable";
import RestoreDialog from "@/components/admin/RestoreDialog";

const entry = {
  id: 1,
  entityType: "personnel",
  entityId: "2",
  action: "update" as const,
  before: { name: "Хелперы", price: 600 },
  after: { name: "Хелперы", price: 700 },
  userId: 1,
  username: "owner",
  createdAt: "2026-10-28 12:00:00",
  restoredAt: null,
  restoredByUserId: null,
  restoredByUsername: null,
  restoredFrom: null,
  restorable: true,
};

describe("history UI", () => {
  test("shows filters and readable changes", () => {
    render(<HistoryTable entries={[entry]} />);
    expect(screen.getByLabelText("Тип записи")).toBeInTheDocument();
    expect(screen.getByText(/600 → 700/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /восстановить/i })).toBeInTheDocument();
  });

  test("shows a restored entry as one closed and readable history item", () => {
    render(
      <HistoryTable
        entries={[
          entry,
          {
            ...entry,
            id: 2,
            restoredAt: "2026-11-01 12:30:00",
            restoredByUserId: 2,
            restoredByUsername: "admin",
            restoredFrom: { name: "Хелперы", price: 700 },
            restorable: false,
          },
        ]}
      />,
    );

    const restoredCard = screen.getByText("Изменение восстановлено").closest("article");
    expect(restoredCard).not.toBeNull();
    const restored = within(restoredCard!);
    expect(restored.getByText(/700 → 600/)).toBeInTheDocument();
    expect(restored.getByText(/admin/)).toBeInTheDocument();
    expect(restored.getByText(/2026-11-01 12:30:00/)).toBeInTheDocument();
    expect(restored.queryByRole("button", { name: /восстановить/i })).not.toBeInTheDocument();
    expect(restored.queryByText("Срок восстановления истёк")).not.toBeInTheDocument();
  });

  test("marks expired entries", () => {
    render(<HistoryTable entries={[{ ...entry, restorable: false }]} />);
    expect(screen.getByText("Срок восстановления истёк")).toBeInTheDocument();
  });

  test("requires explicit confirmation", () => {
    render(<RestoreDialog entryId={1} action={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Восстановить" }));
    expect(screen.getByRole("button", { name: "Подтвердить восстановление" })).toBeInTheDocument();
  });
});
