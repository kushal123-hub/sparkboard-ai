import { createOpenAI } from "@ai-sdk/openai";
import { createClient } from "@supabase/supabase-js";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

import type { Database } from "@/integrations/supabase/types";
import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayResponseHeaders,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "@/lib/ai-gateway.server";

const COLUMN_LABELS: Record<string, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authHeader = request.headers.get("authorization") ?? "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
        if (!token || token.split(".").length !== 3) {
          return new Response("Unauthorized", { status: 401 });
        }

        const supabaseUrl = process.env["SUPABASE_URL"];
        const supabaseKey = process.env["SUPABASE_PUBLISHABLE_KEY"];
        const lovableApiKey = process.env["LOVABLE_API_KEY"];
        if (!supabaseUrl || !supabaseKey) {
          return new Response("Backend is not configured", { status: 500 });
        }
        if (!lovableApiKey) {
          return new Response("The AI assistant is not configured yet.", { status: 500 });
        }

        const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
          global: {
            fetch: (input, init) => {
              const headers = new Headers(init?.headers);
              headers.set("apikey", supabaseKey);
              headers.set("Authorization", `Bearer ${token}`);
              return fetch(input, { ...init, headers });
            },
          },
          auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
        });

        const { data: claims, error: claimsError } = await supabase.auth.getClaims(token);
        if (claimsError || !claims?.claims?.sub) {
          return new Response("Unauthorized", { status: 401 });
        }

        const body = (await request.json()) as { messages?: unknown };
        if (!Array.isArray(body.messages)) {
          return new Response("Messages are required", { status: 400 });
        }
        const messages = body.messages as UIMessage[];

        const { data: cards } = await supabase
          .from("cards")
          .select("title, description, priority, labels, column_key")
          .order("position", { ascending: true });

        const board =
          (cards ?? []).length === 0
            ? "The board is currently empty."
            : (cards ?? [])
                .map(
                  (card) =>
                    `- [${COLUMN_LABELS[card.column_key] ?? card.column_key}] ${card.title} ` +
                    `(priority: ${card.priority}` +
                    `${card.labels?.length ? `, labels: ${card.labels.join(", ")}` : ""})` +
                    `${card.description ? `\n  notes: ${card.description}` : ""}`,
                )
                .join("\n");

        const initialRunId = getLovableAiGatewayRunId(request);
        const runIdFetch = createLovableAiGatewayRunIdFetch(initialRunId);
        const lovable = createOpenAI({
          baseURL: "https://ai.gateway.lovable.dev/v1",
          apiKey: lovableApiKey,
          headers: {
            "Lovable-API-Key": lovableApiKey,
            "X-Lovable-AIG-SDK": "vercel-ai-sdk",
          },
          fetch: runIdFetch.fetch,
        });

        const result = streamText({
          model: lovable.responses("openai/gpt-6-astra"),
          system:
            "You are Atlas, the assistant built into this Kanban board. " +
            "Answer questions about the user's board: what is in each column, what is high priority, " +
            "what to focus on next, and short summaries. Be concise, warm and concrete, and refer to cards by title. " +
            "You can only read the board — if the user asks you to change it, explain that they can drag cards or edit them directly.\n\n" +
            `Current board (columns: To Do, In Progress, Done):\n${board}`,
          messages: convertToModelMessages(messages),
          providerOptions: {
            openai: {
              forceReasoning: true,
              reasoningEffort: "low",
              reasoningSummary: "auto",
              store: false,
              include: ["reasoning.encrypted_content"],
            },
          },
          abortSignal: request.signal,
        });

        const response = result.toUIMessageStreamResponse({
          sendReasoning: true,
          headers: getLovableAiGatewayResponseHeaders(undefined, {
            ...(initialRunId ? { "X-Lovable-AIG-Run-ID": initialRunId } : {}),
          }),
        });

        return withLovableAiGatewayRunIdHeader(response, runIdFetch);
      },
    },
  },
});
