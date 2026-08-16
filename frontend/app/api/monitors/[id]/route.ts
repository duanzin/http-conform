import { fetchBackend, toClientResponse } from "@/lib/backend-api";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.text();

  const response = await fetchBackend(`/api/monitors/${id}`, {
    method: "PUT",
    body,
  });

  return toClientResponse(response);
}

export async function DELETE(_: Request, { params }: Params) {
  const { id } = await params;

  const response = await fetchBackend(`/api/monitors/${id}`, {
    method: "DELETE",
  });

  return toClientResponse(response);
}
