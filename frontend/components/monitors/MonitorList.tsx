import type { Monitor } from "@/lib/monitors/types";

type MonitorListProps = {
  monitors: Monitor[];
  loading: boolean;
  onRefresh: () => void;
  onEdit: (monitor: Monitor) => void;
  onDelete: (id: string) => void;
};

export function MonitorList({ monitors, loading, onRefresh, onEdit, onDelete }: MonitorListProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Monitor List</h2>
        <button
          type="button"
          onClick={onRefresh}
          className="rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-600">Loading monitors...</p>
      ) : monitors.length === 0 ? (
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
              {monitors.map((monitor) => (
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
                        onClick={() => onEdit(monitor)}
                        className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(monitor.id)}
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
  );
}
