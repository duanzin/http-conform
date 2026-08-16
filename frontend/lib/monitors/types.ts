export type Monitor = {
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

export type ApiErrorResponse = {
  code: string;
  message: string;
  details: string[];
  path: string;
  timestamp: string;
};

export type MonitorFormState = {
  name: string;
  url: string;
  method: string;
  intervalSeconds: string;
  timeoutMs: string;
  enabled: boolean;
};
