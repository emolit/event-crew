"use client";

import { useState } from "react";

export default function ConfirmDialog({ description, onConfirm, title }: { description: string; onConfirm: () => void; title: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="rounded-md border border-red-400/40 px-3 py-2 text-sm font-bold text-red-200" onClick={() => setOpen(true)} type="button">{title}</button>
      {open ? (
        <div aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-5" role="dialog">
          <div className="w-full max-w-md rounded-xl bg-white p-6 text-black"><h2 className="text-xl font-black">{title}</h2><p className="mt-2 text-sm text-black/65">{description}</p><div className="mt-6 flex justify-end gap-3"><button className="px-4 py-2 font-bold" onClick={() => setOpen(false)} type="button">Отмена</button><button className="rounded-md bg-red-700 px-4 py-2 font-bold text-white" onClick={() => { onConfirm(); setOpen(false); }} type="button">Подтвердить</button></div></div>
        </div>
      ) : null}
    </>
  );
}
