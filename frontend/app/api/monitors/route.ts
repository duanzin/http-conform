import { fetchBackend, toClientResponse } from "@/lib/backend-api";

function getForwardHeaders(request: Request): Record<string, string> {
  const auth = request.headers.get("authorization");
  return auth ? { authorization: auth } : {};
}

export async function GET(request: Request) {
  const response = await fetchBackend("/api/monitors", {
    method: "GET",
    headers: getForwardHeaders(request),
  });
  return toClientResponse(response);
}

export async function POST(request: Request) {
  const body = await request.text();

  const response = await fetchBackend("/api/monitors", {
    method: "POST",
    headers: getForwardHeaders(request),
    body,
  });

  return toClientResponse(response);
}

