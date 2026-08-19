"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { FiPlusCircle } from "react-icons/fi";
import PrimaryButton from "@/components/ai-usage/buttons/PrimaryButton";
import { computeCostUsd } from "@/lib/pricing";
import { formatUsd } from "@/lib/format";

const EMPTY = {
  modelName: "",
  occurredAt: "",
  inputTokens: "",
  cachedInputTokens: "",
  outputTokens: "",
  requestCount: "1",
  label: "",
};

export default function ManualEntryForm({ onSaved }) {
  const [models, setModels] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios.get("/api/ai-usage/models").then((res) => setModels(res.data.models)).catch(() => {});
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // Live cost preview using the same formula as the server.
  const selected = models.find((m) => m.name === form.modelName);
  const previewCost = selected
    ? computeCostUsd(selected, {
        inputTokens: Number(form.inputTokens) || 0,
        cachedInputTokens: Number(form.cachedInputTokens) || 0,
        outputTokens: Number(form.outputTokens) || 0,
      })
    : 0;

  const submit = async (e) => {
    e.preventDefault();
    if (!form.modelName) {
      setStatus({ type: "error", msg: "Pick a model first." });
      return;
    }
    setSaving(true);
    setStatus(null);
    try {
      await axios.post("/api/ai-usage/usage", {
        ...form,
        occurredAt: form.occurredAt || undefined,
      });
      setStatus({ type: "success", msg: "Usage record saved." });
      setForm((f) => ({ ...EMPTY, modelName: f.modelName }));
      onSaved?.();
    } catch (err) {
      setStatus({ type: "error", msg: err.response?.data?.error || "Failed to save." });
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border-surface-border bg-surface text-sm text-content focus:border-brand-500 focus:ring-brand-500";

  return (
    <form onSubmit={submit} className="card space-y-4 p-6">
      <div>
        <h2 className="text-lg font-semibold">Log usage manually</h2>
        <p className="text-xs text-content-muted">Cost is computed automatically from the pricing catalog.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Model">
          <select value={form.modelName} onChange={set("modelName")} className={inputClass}>
            <option value="">Select a model…</option>
            {models.map((m) => (
              <option key={m.name} value={m.name}>
                {m.displayName} ({m.provider})
              </option>
            ))}
          </select>
        </Field>
        <Field label="Date (optional)">
          <input type="date" value={form.occurredAt} onChange={set("occurredAt")} className={inputClass} />
        </Field>
        <Field label="Input tokens (uncached)">
          <input type="number" min="0" value={form.inputTokens} onChange={set("inputTokens")} className={inputClass} placeholder="0" />
        </Field>
        <Field label="Cached input tokens">
          <input type="number" min="0" value={form.cachedInputTokens} onChange={set("cachedInputTokens")} className={inputClass} placeholder="0" />
        </Field>
        <Field label="Output tokens">
          <input type="number" min="0" value={form.outputTokens} onChange={set("outputTokens")} className={inputClass} placeholder="0" />
        </Field>
        <Field label="Requests">
          <input type="number" min="1" value={form.requestCount} onChange={set("requestCount")} className={inputClass} />
        </Field>
        <Field label="Label / project (optional)">
          <input value={form.label} onChange={set("label")} className={inputClass} placeholder="e.g. coding-agent" />
        </Field>
        <Field label="Estimated cost">
          <div className="flex h-[38px] items-center rounded-lg border border-surface-border bg-surface-muted px-3 text-sm font-medium">
            {selected ? formatUsd(previewCost, { decimals: 4 }) : "—"}
          </div>
        </Field>
      </div>

      <div className="flex items-center gap-3">
        <PrimaryButton type="submit" disabled={saving}>
          <FiPlusCircle /> {saving ? "Saving…" : "Add record"}
        </PrimaryButton>
        {status && (
          <span className={`text-sm ${status.type === "error" ? "text-red-500" : "text-emerald-500"}`}>
            {status.msg}
          </span>
        )}
      </div>
    </form>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-content-muted">{label}</span>
      {children}
    </label>
  );
}
