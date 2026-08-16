"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { createMonitor, deleteMonitor, fetchMonitors, updateMonitor } from "@/lib/monitors/api";
import { EMPTY_MONITOR_FORM } from "@/lib/monitors/constants";
import type { Monitor, MonitorFormState } from "@/lib/monitors/types";

export function useMonitors() {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState<MonitorFormState>(EMPTY_MONITOR_FORM);
  const [editForm, setEditForm] = useState<MonitorFormState>(EMPTY_MONITOR_FORM);

  const sortedMonitors = useMemo(
    () => [...monitors].sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1)),
    [monitors],
  );

  function clearMessages() {
    setErrorMessage(null);
    setSuccessMessage(null);
  }

  async function loadMonitors() {
    setLoading(true);
    setErrorMessage(null);

    const result = await fetchMonitors();
    if (!result.ok) {
      setErrorMessage(result.error);
    } else {
      setMonitors(result.monitors);
    }

    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;

    async function loadInitialMonitors() {
      const result = await fetchMonitors();

      if (cancelled) {
        return;
      }

      if (!result.ok) {
        setErrorMessage(result.error);
      } else {
        setMonitors(result.monitors);
      }

      setLoading(false);
    }

    void loadInitialMonitors();

    return () => {
      cancelled = true;
    };
  }, []);

  async function submitCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    clearMessages();

    const result = await createMonitor(createForm);
    if (!result.ok) {
      setErrorMessage(result.error);
    } else {
      setCreateForm(EMPTY_MONITOR_FORM);
      setSuccessMessage("Monitor created.");
      await loadMonitors();
    }

    setSubmitting(false);
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
    setEditForm(EMPTY_MONITOR_FORM);
  }

  async function submitEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingId) {
      return;
    }

    setSubmitting(true);
    clearMessages();

    const result = await updateMonitor(editingId, editForm);
    if (!result.ok) {
      setErrorMessage(result.error);
    } else {
      setEditingId(null);
      setSuccessMessage("Monitor updated.");
      await loadMonitors();
    }

    setSubmitting(false);
  }

  async function removeMonitor(id: string) {
    setSubmitting(true);
    clearMessages();

    const result = await deleteMonitor(id);
    if (!result.ok) {
      setErrorMessage(result.error);
    } else {
      if (editingId === id) {
        cancelEdit();
      }
      setSuccessMessage("Monitor deleted.");
      await loadMonitors();
    }

    setSubmitting(false);
  }

  return {
    sortedMonitors,
    loading,
    submitting,
    editingId,
    errorMessage,
    successMessage,
    createForm,
    editForm,
    setCreateForm,
    setEditForm,
    loadMonitors,
    submitCreate,
    startEdit,
    cancelEdit,
    submitEdit,
    removeMonitor,
  };
}
