import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import AdminShell from "@/components/admin/AdminShell";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import StatusNotice from "@/components/admin/StatusNotice";
import DeleteAction from "@/components/admin/DeleteAction";

const owner = { id: 1, username: "ivan", role: "owner" as const };

describe("admin shell", () => {
  test("renders the approved sections, public-site link, and POST logout", () => {
    render(<AdminShell user={owner}><p>Содержимое</p></AdminShell>);

    expect(screen.getByRole("navigation", { name: "Разделы админ-панели" })).toBeInTheDocument();
    for (const label of ["Обзор", "Проекты", "Персонал", "Главный экран", "Футер", "Клиенты", "История"]) {
      expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
    }
    expect(screen.getByRole("link", { name: "Открыть сайт" })).toHaveAttribute("href", "/");
    const logout = screen.getByRole("button", { name: "Выйти" });
    expect(logout.closest("form")).toHaveAttribute("action", "/admin/logout");
    expect(logout.closest("form")).toHaveAttribute("method", "post");
  });

  test("exposes an accessible mobile navigation toggle", () => {
    render(<AdminShell user={owner}><p>Содержимое</p></AdminShell>);
    const toggle = screen.getByRole("button", { name: "Открыть меню" });

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(toggle);
    expect(screen.getByRole("button", { name: "Закрыть меню" })).toHaveAttribute("aria-expanded", "true");
  });

  test("provides reusable status and confirmation feedback", () => {
    render(
      <>
        <StatusNotice kind="success">Изменения сохранены</StatusNotice>
        <ConfirmDialog description="Проект можно восстановить 30 дней" onConfirm={() => undefined} title="Удалить проект?" />
      </>,
    );

    expect(screen.getByRole("status")).toHaveTextContent("Изменения сохранены");
    expect(screen.getByRole("button", { name: "Удалить проект?" })).toBeInTheDocument();
  });

  test("requires confirmation before submitting a destructive action", () => {
    const action=vi.fn();render(<DeleteAction action={action} description="Удалить карточку?"/>);
    fireEvent.click(screen.getByRole("button",{name:"Удалить"}));expect(action).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button",{name:"Отмена"}));expect(action).not.toHaveBeenCalled();
  });
});
