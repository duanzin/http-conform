type StatusMessageProps = {
  message: string;
  variant: "error" | "success";
};

const styles = {
  error: "border-red-200 bg-red-50 text-red-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export function StatusMessage({ message, variant }: StatusMessageProps) {
  return (
    <p className={`rounded-lg border px-3 py-2 text-sm ${styles[variant]}`}>{message}</p>
  );
}
