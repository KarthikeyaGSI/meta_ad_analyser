// src/server/middleware/ratelimit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL ?? "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN ?? "",
});

// tokens per duration (seconds) from env or defaults
const LIMIT_TOKENS = Number(process.env.RATE_LIMIT_TOKENS) || 1000;
const LIMIT_DURATION = Number(process.env.RATE_LIMIT_DURATION) || 60; // seconds

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(LIMIT_TOKENS, `${LIMIT_DURATION} s`),
});

export async function ratelimitMiddleware(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "anonymous";
  const { success, limit, reset, remaining } = await ratelimit.limit(ip);
  if (!success) {
    const response = new NextResponse(JSON.stringify({ error: "Too Many Requests" }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    });
    return response;
  }
  // pass through – optionally set rate‑limit headers
  const response = NextResponse.next();
  response.headers.set("X-RateLimit-Limit", limit.toString());
  response.headers.set("X-RateLimit-Remaining", remaining.toString());
  response.headers.set("X-RateLimit-Reset", reset.toString());
  return response;
}
