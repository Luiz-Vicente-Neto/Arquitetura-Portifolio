import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSecret, getUser, hashPassword } from "./db";

export const SESSION_COOKIE = "arq_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 dias

interface SessionPayload {
  email: string;
  exp: number;
}

function sign(value: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}

export async function createSessionToken(email: string): Promise<string> {
  const secret = await getSecret();
  const payload: SessionPayload = { email, exp: Date.now() + MAX_AGE_SECONDS * 1000 };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body, secret)}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const [secret, user] = await Promise.all([getSecret(), getUser()]);
  const a = Buffer.from(sig);
  const b = Buffer.from(sign(body, secret));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as SessionPayload;
    if (payload.exp < Date.now() || payload.email !== user.email) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function verifyPassword(email: string, password: string): Promise<boolean> {
  const user = await getUser();
  if (email.trim().toLowerCase() !== user.email.toLowerCase()) return false;
  const { hash } = hashPassword(password, user.salt);
  const a = Buffer.from(hash, "hex");
  const b = Buffer.from(user.passwordHash, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: MAX_AGE_SECONDS,
  secure: process.env.NODE_ENV === "production" && process.env.INSECURE_COOKIES !== "1",
};

export async function getSession() {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

/** Para páginas e server actions do painel: redireciona ao login se não houver sessão. */
export async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

/** Para route handlers: lê o cookie direto do request. */
export async function isAuthorizedRequest(request: Request): Promise<boolean> {
  const header = request.headers.get("cookie") ?? "";
  const match = header
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${SESSION_COOKIE}=`));
  const token = match ? decodeURIComponent(match.slice(SESSION_COOKIE.length + 1)) : null;
  return (await verifySessionToken(token)) !== null;
}
