import { fetchBackend, toClientResponse } from "@/lib/backend-api";

type Params = {
  params: Promise<{ id: string }>;
};

function getForwardHeaders(request: Request): Record<string, string> {
  const auth = request.headers.get("authorization");
  return auth ? { authorization: auth } : {};
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.text();

  const response = await fetchBackend(`/api/monitors/${id}`, {
    method: "PUT",
    headers: getForwardHeaders(request),
    body,
  });

  return toClientResponse(response);
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params;

  const response = await fetchBackend(`/api/monitors/${id}`, {
    method: "DELETE",
    headers: getForwardHeaders(request),
  });

  return toClientResponse(response);
}

