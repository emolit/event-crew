"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/admin/login/actions";

const initialState: LoginState = { message: null };

export default function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState);

  return (
    <form action={action} className="mt-8 grid gap-5">
      <label className="grid gap-2 text-sm font-bold" htmlFor="username">
        Логин
        <input
          autoComplete="username"
          className="min-h-12 rounded-md border border-white/20 bg-white/5 px-4 text-base text-white outline-none focus:border-[color:var(--accent)]"
          id="username"
          name="username"
          required
        />
      </label>
      <label className="grid gap-2 text-sm font-bold" htmlFor="password">
        Пароль
        <input
          autoComplete="current-password"
          className="min-h-12 rounded-md border border-white/20 bg-white/5 px-4 text-base text-white outline-none focus:border-[color:var(--accent)]"
          id="password"
          name="password"
          required
          type="password"
        />
      </label>
      {state.message ? <p className="text-sm font-semibold text-red-300" role="alert">{state.message}</p> : null}
      <button
        className="min-h-12 rounded-md bg-[color:var(--accent)] px-5 text-sm font-black uppercase tracking-[0.08em] text-black disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Проверяем…" : "Войти"}
      </button>
    </form>
  );
}
