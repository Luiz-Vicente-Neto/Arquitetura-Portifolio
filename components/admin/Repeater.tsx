"use client";

import { Button } from "./ui";

export interface RepeaterColumn<T> {
  key: keyof T & string;
  label: string;
  width?: string;
  multiline?: boolean;
}

/** Editor genérico de listas (trajetória, prêmios, serviços, etapas do processo…). */
export default function Repeater<T extends Record<string, string>>({
  value,
  onChange,
  columns,
  empty,
  addLabel = "+ Adicionar item",
}: {
  value: T[];
  onChange: (v: T[]) => void;
  columns: RepeaterColumn<T>[];
  empty: T;
  addLabel?: string;
}) {
  const update = (i: number, key: keyof T, v: string) =>
    onChange(value.map((row, idx) => (idx === i ? { ...row, [key]: v } : row)));
  const move = (from: number, to: number) => {
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <div>
      <ul className="space-y-2">
        {value.map((row, i) => (
          <li key={i} className="flex flex-col gap-2 rounded-lg border border-[#e4e1db] bg-[#fbfaf8] p-2 md:flex-row md:items-start">
            {columns.map((col) =>
              col.multiline ? (
                <textarea
                  key={col.key}
                  className="admin-input !min-h-[2.6rem]"
                  rows={2}
                  placeholder={col.label}
                  aria-label={col.label}
                  style={col.width ? { flex: `0 0 ${col.width}` } : { flex: 1 }}
                  value={row[col.key]}
                  onChange={(e) => update(i, col.key, e.target.value)}
                />
              ) : (
                <input
                  key={col.key}
                  className="admin-input"
                  placeholder={col.label}
                  aria-label={col.label}
                  style={col.width ? { flex: `0 0 ${col.width}` } : { flex: 1 }}
                  value={row[col.key]}
                  onChange={(e) => update(i, col.key, e.target.value)}
                />
              ),
            )}
            <div className="flex shrink-0 gap-1">
              <Button variant="ghost" className="!px-2" onClick={() => move(i, i - 1)} aria-label="Subir">
                ↑
              </Button>
              <Button variant="ghost" className="!px-2" onClick={() => move(i, i + 1)} aria-label="Descer">
                ↓
              </Button>
              <Button
                variant="danger"
                className="!px-2"
                onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                aria-label="Remover"
              >
                ✕
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <Button variant="secondary" className="mt-3" onClick={() => onChange([...value, { ...empty }])}>
        {addLabel}
      </Button>
    </div>
  );
}
