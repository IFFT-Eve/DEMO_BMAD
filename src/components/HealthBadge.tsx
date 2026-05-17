"use client";

import { trpc } from "@/lib/trpc/client";

export function HealthBadge() {
  const { data, isLoading } = trpc.health.ping.useQuery();

  if (isLoading) return <span>checking…</span>;

  // data is inferred as { ok: boolean } — no `any` required
  return <span>{data?.ok ? "API: ok" : "API: unreachable"}</span>;
}
