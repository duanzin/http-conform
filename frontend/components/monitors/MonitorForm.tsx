import { FormEvent } from "react";
import { HTTP_METHODS } from "@/lib/monitors/constants";
import type { MonitorFormState } from "@/lib/monitors/types";

type MonitorFormVariant = "create" | "edit";

type MonitorFormProps = {
  title: string;
  form: MonitorFormState;
  submitting: boolean;
  variant?: MonitorFormVariant;
  submitLabel: string;
  submittingLabel: string;
  onChange: (next: MonitorFormState) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel?: () => void;
};

const variantStyles = {
  create: {
    section: "border-slate-200 bg-white",
    title: "text-slate-900",
    field: "border-slate-300 text-slate-700 placeholder-slate-500",
    option: "text-slate-700",
    submit: "bg-slate-900 hover:bg-slate-700",
    cancel: "border-slate-300 text-slate-700 hover:bg-slate-50",
  },
  edit: {
    section: "border-amber-200 bg-amber-50",
    title: "text-amber-900",
    field: "border-amber-300 text-amber-900 placeholder-amber-500",
    option: "text-amber-900",
    submit: "bg-amber-600 hover:bg-amber-500",
    cancel: "border-amber-300 text-amber-900 hover:bg-amber-100",
  },
};

export function MonitorForm({
  title,
  form,
  submitting,
  variant = "create",
  submitLabel,
  submittingLabel,
  onChange,
  onSubmit,
  onCancel,
}: MonitorFormProps) {
  const styles = variantStyles[variant];

  function updateField<K extends keyof MonitorFormState>(key: K, value: MonitorFormState[K]) {
    onChange({ ...form, [key]: value });
  }

  return (
    <section className={`rounded-2xl border p-5 shadow-sm ${styles.section}`}>
      <h2 className={`mb-4 text-lg font-semibold ${styles.title}`}>{title}</h2>

      <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
        <input
          className={`rounded-lg border px-3 py-2 text-sm ${styles.field}`}
          placeholder="Name"
          value={form.name}
          onChange={(event) => updateField("name", event.target.value)}
          required
        />
        <input
          className={`rounded-lg border px-3 py-2 text-sm ${styles.field}`}
          placeholder="URL"
          value={form.url}
          onChange={(event) => updateField("url", event.target.value)}
          required
        />
        <select
          className={`rounded-lg border px-3 py-2 text-sm ${styles.field}`}
          value={form.method}
          onChange={(event) => updateField("method", event.target.value)}
        >
          {HTTP_METHODS.map((method) => (
            <option key={method} value={method} className={styles.option}>
              {method}
            </option>
          ))}
        </select>
        <input
          className={`rounded-lg border px-3 py-2 text-sm ${styles.field}`}
          type="number"
          min={10}
          max={86400}
          value={form.intervalSeconds}
          onChange={(event) => updateField("intervalSeconds", event.target.value)}
          required
        />
        <input
          className={`rounded-lg border px-3 py-2 text-sm ${styles.field}`}
          type="number"
          min={100}
          max={30000}
          value={form.timeoutMs}
          onChange={(event) => updateField("timeoutMs", event.target.value)}
          required
        />
        <label className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${styles.field}`}>
          <input
            type="checkbox"
            checked={form.enabled}
            onChange={(event) => updateField("enabled", event.target.checked)}
          />
          Enabled
        </label>

        <div className={`flex gap-2 ${onCancel ? "" : "sm:col-span-2"}`}>
          <button
            type="submit"
            disabled={submitting}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${styles.submit}`}
          >
            {submitting ? submittingLabel : submitLabel}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className={`rounded-lg border px-4 py-2 text-sm ${styles.cancel}`}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
