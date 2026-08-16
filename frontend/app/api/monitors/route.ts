import { fetchBackend, toClientResponse } from "@/lib/backend-api";

export async function GET() {
  const response = await fetchBackend("/api/monitors", { method: "GET" });
  return toClientResponse(response);
}

export async function POST(request: Request) {
  const body = await request.text();

  const response = await fetchBackend("/api/monitors", {
    method: "POST",
    body,
  });

  return toClientResponse(response);
}
