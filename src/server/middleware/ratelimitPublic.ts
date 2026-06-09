// src/server/middleware/ratelimitPublic.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL ?? "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN ?? "",
});

// 300 requests per 60 seconds per IP
const LIMIT_TOKENS = 300;
const LIMIT_DURATION = 60; // seconds
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(LIMIT_TOKENS, `${LIMIT_DURATION} s`),
});

export async function ratelimitPublic(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
  let success = true;
  let limit = 0;
  let remaining = 0;
  let reset = 0;

  try {
    const result = await ratelimit.limit(ip);
    success = result.success;
    limit = result.limit;
    remaining = result.remaining;
    reset = result.reset;
  } catch (err) {
    console.warn("Public ratelimit fetch failed, bypassing", err);
  }

  if (!success) {
    return new NextResponse(JSON.stringify({ error: "Too Many Requests" }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    });
  }
  const response = NextResponse.next();
  response.headers.set("X-RateLimit-Limit", limit.toString());
  response.headers.set("X-RateLimit-Remaining", remaining.toString());
  response.headers.set("X-RateLimit-Reset", reset.toString());
  return response;
}
