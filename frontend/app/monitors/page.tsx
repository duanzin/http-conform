"use client";

import { MonitorForm } from "@/components/monitors/MonitorForm";
import { MonitorList } from "@/components/monitors/MonitorList";
import { MonitorPageHeader } from "@/components/monitors/MonitorPageHeader";
import { StatusMessage } from "@/components/monitors/StatusMessage";
import { useMonitors } from "@/hooks/useMonitors";

export default function MonitorsPage() {
  const {
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
  } = useMonitors();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
      <MonitorPageHeader
        title="Monitors"
        description="Create, update, and remove your HTTP checks."
      />

      <MonitorForm
        title="Add Monitor"
        form={createForm}
        submitting={submitting}
        submitLabel="Add Monitor"
        submittingLabel="Saving..."
        onChange={setCreateForm}
        onSubmit={submitCreate}
      />

      {errorMessage && <StatusMessage message={errorMessage} variant="error" />}
      {successMessage && <StatusMessage message={successMessage} variant="success" />}

      <MonitorList
        monitors={sortedMonitors}
        loading={loading}
        onRefresh={loadMonitors}
        onEdit={startEdit}
        onDelete={removeMonitor}
      />

      {editingId && (
        <MonitorForm
          title="Edit Monitor"
          form={editForm}
          submitting={submitting}
          variant="edit"
          submitLabel="Save Changes"
          submittingLabel="Updating..."
          onChange={setEditForm}
          onSubmit={submitEdit}
          onCancel={cancelEdit}
        />
      )}
    </div>
  );
}
