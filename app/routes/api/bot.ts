import { createBotHandler } from "~/components/bot/handler";
import type { ActionFunctionArgs } from "react-router";

const botHandler = createBotHandler();

export async function action(c: ActionFunctionArgs) {
  if (c.request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  return botHandler(c);
}

// Telegram never GETs this endpoint, but for completeness:
export async function loader() {
  return new Response("Use POST for Telegram webhook", { status: 405 });
}