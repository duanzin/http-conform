import type { MonitorFormState } from "./types";

export const HTTP_METHODS = ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];

export const EMPTY_MONITOR_FORM: MonitorFormState = {
  name: "",
  url: "https://",
  method: "GET",
  intervalSeconds: "60",
  timeoutMs: "5000",
  enabled: true,
};
