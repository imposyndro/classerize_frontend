"use client";

import { useState } from "react";
import axios from "axios";
import { FiUploadCloud, FiDownload, FiFileText } from "react-icons/fi";
import PrimaryButton from "@/components/ai-usage/buttons/PrimaryButton";
import SecondaryButton from "@/components/ai-usage/buttons/SecondaryButton";

export default function ImportForm({ onImported }) {
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setText(await file.text());
  };

  const submit = async () => {
    if (!text.trim()) {
      setResult({ error: "Paste CSV/JSON or choose a file first." });
      return;
    }
    setBusy(true);
    setResult(null);
    try {
      const trimmed = text.trim();
      const body = trimmed.startsWith("[") || trimmed.startsWith("{")
        ? { records: JSON.parse(trimmed) }
        : { csv: trimmed };
      const res = await axios.post("/api/ai-usage/usage/import", body);
      setResult(res.data);
      onImported?.();
    } catch (err) {
      setResult({ error: err.response?.data?.error || "Import failed. Check the format." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card space-y-4 p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Import CSV / JSON</h2>
          <p className="text-xs text-content-muted">
            Columns: <code className="text-content">model, occurredAt, inputTokens, cachedInputTokens, outputTokens, requestCount, label</code>
          </p>
        </div>
        <SecondaryButton as="a" href="/sample-usage.csv" download className="shrink-0">
          <FiDownload /> Sample CSV
        </SecondaryButton>
      </div>

      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-surface-border bg-surface-muted px-6 py-10 text-center transition hover:border-brand-500">
        <FiUploadCloud size={28} className="text-brand-500" />
        <span className="text-sm font-medium">
          {fileName || "Click to choose a .csv or .json file"}
        </span>
        <span className="text-xs text-content-muted">or paste below</span>
        <input type="file" accept=".csv,.json,text/csv,application/json" className="hidden" onChange={onFile} />
      </label>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        placeholder={"model,occurredAt,inputTokens,outputTokens,label\nclaude-sonnet-4-6,2026-06-01,12000,3000,research"}
        className="w-full rounded-lg border-surface-border bg-surface font-mono text-xs text-content focus:border-brand-500 focus:ring-brand-500"
      />

      <div className="flex items-center gap-3">
        <PrimaryButton onClick={submit} disabled={busy}>
          <FiFileText /> {busy ? "Importing…" : "Import"}
        </PrimaryButton>

        {result?.error && <span className="text-sm text-red-500">{result.error}</span>}
        {result && !result.error && (
          <span className="text-sm text-emerald-500">
            Imported {result.imported} record{result.imported === 1 ? "" : "s"}
            {result.skipped ? `, skipped ${result.skipped}` : ""}.
          </span>
        )}
      </div>

      {result?.skippedDetails?.length > 0 && (
        <div className="rounded-lg border border-surface-border bg-surface-muted p-3 text-xs text-content-muted">
          <div className="mb-1 font-medium text-content">Skipped rows</div>
          <ul className="space-y-0.5">
            {result.skippedDetails.map((s, i) => (
              <li key={i}>
                Row {s.row}: {s.reason}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
