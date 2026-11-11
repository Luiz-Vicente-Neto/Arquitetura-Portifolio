import { db } from "@/lib/db";
import { isAuthorizedRequest } from "@/lib/auth";

export async function GET(request: Request) {
  if (!(await isAuthorizedRequest(request))) return Response.json({ error: "Não autorizado." }, { status: 401 });
  return Response.json({ media: await (await db()).listMedia() });
}
