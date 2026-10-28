"use client";

export interface SortableItem { id: number; label: string }

export default function SortableList({ items, onChange }: { items: SortableItem[]; onChange: (ids: number[]) => void }) {
  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = items.map(({ id }) => id);
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };
  return <ul className="grid gap-2">{items.map((item, index) => <li className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3" key={item.id}><span className="font-bold">{item.label}</span><span className="flex gap-2"><button aria-label={`Переместить ${item.label} вверх`} className="size-9 rounded border border-white/15" disabled={index === 0} onClick={() => move(index,-1)} type="button">↑</button><button aria-label={`Переместить ${item.label} вниз`} className="size-9 rounded border border-white/15" disabled={index === items.length - 1} onClick={() => move(index,1)} type="button">↓</button></span></li>)}</ul>;
}
