import type { User } from "../generated/prisma/client";
import { db } from "./db";

export type Context = {
  user: User | null;
  guestToken: string | null;
};

function parseCookieValue(cookieHeader: string, key: string): string | null {
  const entry = cookieHeader
    .split("; ")
    .find((pair) => pair.startsWith(`${key}=`));
  return entry ? entry.slice(key.length + 1) : null;
}

export async function createContext({
  req,
}: {
  req: Request;
}): Promise<Context> {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const sessionToken = parseCookieValue(cookieHeader, "session_token");
  const guestToken = parseCookieValue(cookieHeader, "guest_cart_token");

  if (!sessionToken) {
    return { user: null, guestToken };
  }

  const session = await db.session.findFirst({
    where: { id: sessionToken, expiresAt: { gt: new Date() } },
    include: { user: true },
  });

  return { user: session?.user ?? null, guestToken };
}
