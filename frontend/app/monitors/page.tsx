"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Monitor = {
  id: string;
  name: string;
  url: string;
  method: string;
  intervalSeconds: number;
  timeoutMs: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

type ApiErrorResponse = {
  code: string;
  message: string;
  details: string[];
  path: string;
  timestamp: string;
};

type MonitorFormState = {
  name: string;
  url: string;
  method: string;
  intervalSeconds: string;
  timeoutMs: string;
  enabled: boolean;
};

const emptyForm: MonitorFormState = {
  name: "",
  url: "https://",
  method: "GET",
  intervalSeconds: "60",
  timeoutMs: "5000",
  enabled: true,
};

const methods = ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];

function parseErrorBody(body: unknown): string {
  if (!body || typeof body !== "object") {
    return "Request failed.";
  }

  const error = body as Partial<ApiErrorResponse>;
  if (Array.isArray(error.details) && error.details.length > 0) {
    return error.details.join(" | ");
  }

  return error.message ?? "Request failed.";
}

async function safeJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export default function MonitorsPage() {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState<MonitorFormState>(emptyForm);
  const [editForm, setEditForm] = useState<MonitorFormState>(emptyForm);

  const sortedMonitors = useMemo(
    () => [...monitors].sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1)),
    [monitors],
  );

  async function loadMonitors() {
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/monitors", { method: "GET" });
      const body = await safeJson(response);

      if (!response.ok) {
        setErrorMessage(parseErrorBody(body));
        return;
      }

      setMonitors(Array.isArray(body) ? (body as Monitor[]) : []);
    } catch {
      setErrorMessage("Could not load monitors.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function fetchInitialMonitors() {
      try {
        const response = await fetch("/api/monitors", { method: "GET" });
        const body = await safeJson(response);

        if (cancelled) {
          return;
        }

        if (!response.ok) {
          setErrorMessage(parseErrorBody(body));
          return;
        }

        setMonitors(Array.isArray(body) ? (body as Monitor[]) : []);
      } catch {
        if (!cancelled) {
          setErrorMessage("Could not load monitors.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchInitialMonitors();

    return () => {
      cancelled = true;
    };
  }, []);

  function clearMessages() {
    setErrorMessage(null);
    setSuccessMessage(null);
  }

  async function submitCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    clearMessages();

    const payload = {
      ...createForm,
      intervalSeconds: Number(createForm.intervalSeconds),
      timeoutMs: Number(createForm.timeoutMs),
    };

    try {
      const response = await fetch("/api/monitors", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = await safeJson(response);

      if (!response.ok) {
        setErrorMessage(parseErrorBody(body));
        return;
      }

      setCreateForm(emptyForm);
      setSuccessMessage("Monitor created.");
      await loadMonitors();
    } catch {
      setErrorMessage("Could not create monitor.");
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(monitor: Monitor) {
    setEditingId(monitor.id);
    setEditForm({
      name: monitor.name,
      url: monitor.url,
      method: monitor.method,
      intervalSeconds: String(monitor.intervalSeconds),
      timeoutMs: String(monitor.timeoutMs),
      enabled: monitor.enabled,
    });
    clearMessages();
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(emptyForm);
  }

  async function submitEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingId) {
      return;
    }

    setSubmitting(true);
    clearMessages();

    const payload = {
      ...editForm,
      intervalSeconds: Number(editForm.intervalSeconds),
      timeoutMs: Number(editForm.timeoutMs),
    };

    try {
      const response = await fetch(`/api/monitors/${editingId}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = await safeJson(response);

      if (!response.ok) {
        setErrorMessage(parseErrorBody(body));
        return;
      }

      setEditingId(null);
      setSuccessMessage("Monitor updated.");
      await loadMonitors();
    } catch {
      setErrorMessage("Could not update monitor.");
    } finally {
      setSubmitting(false);
    }
  }

  async function removeMonitor(id: string) {
    setSubmitting(true);
    clearMessages();

    try {
      const response = await fetch(`/api/monitors/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const body = await safeJson(response);
        setErrorMessage(parseErrorBody(body));
        return;
      }

      if (editingId === id) {
        cancelEdit();
      }

      setSuccessMessage("Monitor deleted.");
      await loadMonitors();
    } catch {
      setErrorMessage("Could not delete monitor.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Monitors</h1>
        <p className="mt-1 text-sm text-slate-600">Create, update, and remove your HTTP checks.</p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Add Monitor</h2>

        <form onSubmit={submitCreate} className="grid gap-3 sm:grid-cols-2">
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 placeholder-slate-500"
            placeholder="Name"
            value={createForm.name}
            onChange={(event) => setCreateForm((prev) => ({ ...prev, name: event.target.value }))}
            required
          />
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 placeholder-slate-500"
            placeholder="URL"
            value={createForm.url}
            onChange={(event) => setCreateForm((prev) => ({ ...prev, url: event.target.value }))}
            required
          />
          <select
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
            value={createForm.method}
            onChange={(event) => setCreateForm((prev) => ({ ...prev, method: event.target.value }))}
          >
            {methods.map((method) => (
              <option key={method} value={method} className="text-slate-700">
                {method}
              </option>
            ))}
          </select>
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 placeholder-slate-500"
            type="number"
            min={10}
            max={86400}
            value={createForm.intervalSeconds}
            onChange={(event) => setCreateForm((prev) => ({ ...prev, intervalSeconds: event.target.value }))}
            required
          />
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 placeholder-slate-500"
            type="number"
            min={100}
            max={30000}
            value={createForm.timeoutMs}
            onChange={(event) => setCreateForm((prev) => ({ ...prev, timeoutMs: event.target.value }))}
            required
          />
          <label className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={createForm.enabled}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, enabled: event.target.checked }))}
            />
            Enabled
          </label>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Add Monitor"}
            </button>
          </div>
        </form>
      </section>

      {errorMessage && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>}
      {successMessage && <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{successMessage}</p>}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Monitor List</h2>
          <button
            type="button"
            onClick={loadMonitors}
            className="rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-slate-600">Loading monitors...</p>
        ) : sortedMonitors.length === 0 ? (
          <p className="text-sm text-slate-600">No monitors yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-190 border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="px-2 py-2">Name</th>
                  <th className="px-2 py-2">Method</th>
                  <th className="px-2 py-2">URL</th>
                  <th className="px-2 py-2">Interval</th>
                  <th className="px-2 py-2">Timeout</th>
                  <th className="px-2 py-2">Enabled</th>
                  <th className="px-2 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedMonitors.map((monitor) => (
                  <tr key={monitor.id} className="border-b border-slate-100 align-top">
                    <td className="px-2 py-3 font-medium text-slate-900">{monitor.name}</td>
                    <td className="px-2 py-3 text-slate-700">{monitor.method}</td>
                    <td className="px-2 py-3 text-slate-700">{monitor.url}</td>
                    <td className="px-2 py-3 text-slate-700">{monitor.intervalSeconds}s</td>
                    <td className="px-2 py-3 text-slate-700">{monitor.timeoutMs}ms</td>
                    <td className="px-2 py-3 text-slate-700">{monitor.enabled ? "Yes" : "No"}</td>
                    <td className="px-2 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(monitor)}
                          className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => removeMonitor(monitor.id)}
                          className="rounded border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editingId && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-amber-900">Edit Monitor</h2>
          <form onSubmit={submitEdit} className="grid gap-3 sm:grid-cols-2">
            <input
              className="rounded-lg border border-amber-300 px-3 py-2 text-sm text-amber-900 placeholder-amber-500"
              placeholder="Name"
              value={editForm.name}
              onChange={(event) => setEditForm((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
            <input
              className="rounded-lg border border-amber-300 px-3 py-2 text-sm text-amber-900 placeholder-amber-500"
              placeholder="URL"
              value={editForm.url}
              onChange={(event) => setEditForm((prev) => ({ ...prev, url: event.target.value }))}
              required
            />
            <select
              className="rounded-lg border border-amber-300 px-3 py-2 text-sm text-amber-900"
              value={editForm.method}
              onChange={(event) => setEditForm((prev) => ({ ...prev, method: event.target.value }))}
            >
              {methods.map((method) => (
                <option key={method} value={method} className="text-amber-900">
                  {method}
                </option>
              ))}
            </select>
            <input
              className="rounded-lg border border-amber-300 px-3 py-2 text-sm text-amber-900 placeholder-amber-500"
              type="number"
              min={10}
              max={86400}
              value={editForm.intervalSeconds}
              onChange={(event) => setEditForm((prev) => ({ ...prev, intervalSeconds: event.target.value }))}
              required
            />
            <input
              className="rounded-lg border border-amber-300 px-3 py-2 text-sm text-amber-900 placeholder-amber-500"
              type="number"
              min={100}
              max={30000}
              value={editForm.timeoutMs}
              onChange={(event) => setEditForm((prev) => ({ ...prev, timeoutMs: event.target.value }))}
              required
            />
            <label className="flex items-center gap-2 rounded-lg border border-amber-300 px-3 py-2 text-sm text-amber-900">
              <input
                type="checkbox"
                checked={editForm.enabled}
                onChange={(event) => setEditForm((prev) => ({ ...prev, enabled: event.target.checked }))}
              />
              Enabled
            </label>

            <div className="flex gap-2 sm:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500 disabled:opacity-50"
              >
                {submitting ? "Updating..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-lg border border-amber-300 px-4 py-2 text-sm text-amber-900 hover:bg-amber-100"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
