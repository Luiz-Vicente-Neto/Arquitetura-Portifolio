import { readDb } from "@/lib/db";
import { isAuthorizedRequest } from "@/lib/auth";

export function GET(request: Request) {
  if (!isAuthorizedRequest(request)) return Response.json({ error: "Não autorizado." }, { status: 401 });
  return Response.json({ media: readDb().media });
}
