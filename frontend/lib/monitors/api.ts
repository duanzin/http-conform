import type { ApiErrorResponse, Monitor, MonitorFormState } from "./types";

export function parseErrorBody(body: unknown): string {
  if (!body || typeof body !== "object") {
    return "Request failed.";
  }

  const error = body as Partial<ApiErrorResponse>;
  if (Array.isArray(error.details) && error.details.length > 0) {
    return error.details.join(" | ");
  }

  return error.message ?? "Request failed.";
}

export async function safeJson(response: Response): Promise<unknown> {
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

function toMonitorPayload(form: MonitorFormState) {
  return {
    ...form,
    intervalSeconds: Number(form.intervalSeconds),
    timeoutMs: Number(form.timeoutMs),
  };
}

export async function fetchMonitors(): Promise<{ ok: true; monitors: Monitor[] } | { ok: false; error: string }> {
  try {
    const response = await fetch("/api/monitors", { method: "GET" });
    const body = await safeJson(response);

    if (!response.ok) {
      return { ok: false, error: parseErrorBody(body) };
    }

    return { ok: true, monitors: Array.isArray(body) ? (body as Monitor[]) : [] };
  } catch {
    return { ok: false, error: "Could not load monitors." };
  }
}

export async function createMonitor(
  form: MonitorFormState,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const response = await fetch("/api/monitors", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(toMonitorPayload(form)),
    });

    const body = await safeJson(response);

    if (!response.ok) {
      return { ok: false, error: parseErrorBody(body) };
    }

    return { ok: true };
  } catch {
    return { ok: false, error: "Could not create monitor." };
  }
}

export async function updateMonitor(
  id: string,
  form: MonitorFormState,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const response = await fetch(`/api/monitors/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(toMonitorPayload(form)),
    });

    const body = await safeJson(response);

    if (!response.ok) {
      return { ok: false, error: parseErrorBody(body) };
    }

    return { ok: true };
  } catch {
    return { ok: false, error: "Could not update monitor." };
  }
}

export async function deleteMonitor(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const response = await fetch(`/api/monitors/${id}`, { method: "DELETE" });

    if (!response.ok) {
      const body = await safeJson(response);
      return { ok: false, error: parseErrorBody(body) };
    }

    return { ok: true };
  } catch {
    return { ok: false, error: "Could not delete monitor." };
  }
}
