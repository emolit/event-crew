"use client";
import { useRef } from "react";
import ConfirmDialog from "@/components/admin/ConfirmDialog";

export default function DeleteAction({ action, description, title = "Удалить" }: { action: (formData: FormData) => void | Promise<void>; description: string; title?: string }) {
  const form = useRef<HTMLFormElement>(null);
  return <><form action={action} className="hidden" ref={form}/><ConfirmDialog description={description} onConfirm={()=>form.current?.requestSubmit()} title={title}/></>;
}
