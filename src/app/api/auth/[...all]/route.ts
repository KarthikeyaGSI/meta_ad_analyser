import { auth } from "@/server/auth";
import { toNodeHandler } from "better-auth/node";

export const GET = auth.handler;
export const POST = auth.handler;
