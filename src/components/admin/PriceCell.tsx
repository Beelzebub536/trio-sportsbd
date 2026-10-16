"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Inline price input for the bulk editor. Keeps its own text state so a
 * half-typed number never reaches the batch, and reverts on blur.
 */
export default function PriceCell({
  value,
  onCommit,
  label,
  allowEmpty = false,
}: {
  value: number | null;
  onCommit: (value: number | null) => void;
  label: string;
  allowEmpty?: boolean;
}) {
  const [text, setText] = useState(value == null ? "" : String(value));
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    setText(value == null ? "" : String(value));
    setInvalid(false);
  }, [value]);

  const commit = (raw: string) => {
    if (raw.trim() === "") {
      if (allowEmpty) {
        setInvalid(false);
        onCommit(null);
        return;
      }
      setInvalid(true);
      return;
    }

    const parsed = Number(raw);
    if (!Number.isInteger(parsed) || parsed < 0) {
      setInvalid(true);
      return;
    }

    setInvalid(false);
    onCommit(parsed);
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      aria-label={label}
      aria-invalid={invalid}
      value={text}
      onChange={(event) => {
        setText(event.target.value);
        commit(event.target.value);
      }}
      onBlur={() => {
        setText(value == null ? "" : String(value));
        setInvalid(false);
      }}
      className={cn(
        "h-9 w-24 border border-input bg-white px-2 text-sm tabular-nums",
        invalid && "border-red-500 bg-red-50",
      )}
    />
  );
}
