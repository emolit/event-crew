import type { ReactNode } from "react";

export default function StatusNotice({ children, kind }: { children: ReactNode; kind: "success" | "error" }) {
  return <div className={`rounded-lg border px-4 py-3 text-sm font-bold ${kind === "success" ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100" : "border-red-400/30 bg-red-400/10 text-red-100"}`} role={kind === "success" ? "status" : "alert"}>{children}</div>;
}
