const backendCandidates = [
  process.env.BACKEND_API_URL,
  process.env.NEXT_PUBLIC_API_BASE_URL,
  "http://backend:8080",
  "http://localhost:8080",
].filter((value): value is string => Boolean(value));

export async function fetchBackend(path: string, init?: RequestInit): Promise<Response> {
  let lastError: unknown;

  for (const baseUrl of backendCandidates) {
    const target = `${baseUrl}${path}`;

    try {
      return await fetch(target, {
        ...init,
        headers: {
          "content-type": "application/json",
          ...(init?.headers ?? {}),
        },
        cache: "no-store",
      });
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(`Could not reach backend API candidates. Last error: ${String(lastError)}`);
}

export async function toClientResponse(response: Response): Promise<Response> {
  const text = await response.text();
  const contentType = response.headers.get("content-type") ?? "application/json";
  const location = response.headers.get("location");

  const headers = new Headers({
    "content-type": contentType,
  });

  if (location) {
    headers.set("location", location);
  }

  return new Response(text, {
    status: response.status,
    headers,
  });
}
