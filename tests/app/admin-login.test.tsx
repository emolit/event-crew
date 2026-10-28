import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import LoginPage from "@/app/admin/(auth)/login/page";
import { buildSessionCookie } from "@/lib/auth/session";

vi.mock("@/app/admin/login/actions", () => ({
  loginAction: vi.fn(async () => ({ message: null })),
}));

describe("admin login page", () => {
  test("renders an accessible owner login form", () => {
    render(<LoginPage />);

    expect(screen.getByRole("heading", { name: "Вход в админ-панель" })).toBeInTheDocument();
    expect(screen.getByLabelText("Логин")).toHaveAttribute("autocomplete", "username");
    expect(screen.getByLabelText("Пароль")).toHaveAttribute("autocomplete", "current-password");
    expect(screen.getByRole("button", { name: "Войти" })).toBeInTheDocument();
  });

  test("builds the required twelve-hour HttpOnly cookie", () => {
    expect(buildSessionCookie("a".repeat(64), true)).toEqual({
      name: "eventcrew_admin",
      value: "a".repeat(64),
      options: {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 43_200,
      },
    });
  });
});
