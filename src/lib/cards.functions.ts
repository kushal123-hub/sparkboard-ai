import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const COLUMN_KEYS = ["todo", "in_progress", "done"] as const;
export type ColumnKey = (typeof COLUMN_KEYS)[number];

export const PRIORITIES = ["low", "medium", "high"] as const;
export type Priority = (typeof PRIORITIES)[number];

export type Card = {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  labels: string[];
  column_key: ColumnKey;
  position: number;
};

const columnSchema = z.enum(COLUMN_KEYS);
const prioritySchema = z.enum(PRIORITIES);

const createSchema = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().max(2000).default(""),
  priority: prioritySchema.default("medium"),
  labels: z.array(z.string().trim().min(1).max(40)).max(8).default([]),
  column_key: columnSchema.default("todo"),
});

const updateSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1).max(160).optional(),
  description: z.string().max(2000).optional(),
  priority: prioritySchema.optional(),
  labels: z.array(z.string().trim().min(1).max(40)).max(8).optional(),
});

const moveSchema = z.object({
  id: z.string().uuid(),
  column_key: columnSchema,
  position: z.number(),
});

const SELECT = "id, title, description, priority, labels, column_key, position";

function toCard(row: {
  id: string;
  title: string;
  description: string;
  priority: string;
  labels: string[];
  column_key: string;
  position: number;
}): Card {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    priority: (PRIORITIES as readonly string[]).includes(row.priority)
      ? (row.priority as Priority)
      : "medium",
    labels: row.labels ?? [],
    column_key: (COLUMN_KEYS as readonly string[]).includes(row.column_key)
      ? (row.column_key as ColumnKey)
      : "todo",
    position: row.position,
  };
}

export const listCards = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Card[]> => {
    const { data, error } = await context.supabase
      .from("cards")
      .select(SELECT)
      .order("position", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map(toCard);
  });

export const createCard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => createSchema.parse(input))
  .handler(async ({ data, context }): Promise<Card> => {
    const { data: last } = await context.supabase
      .from("cards")
      .select("position")
      .eq("column_key", data.column_key)
      .order("position", { ascending: false })
      .limit(1);

    const position = (last?.[0]?.position ?? 0) + 1000;

    const { data: row, error } = await context.supabase
      .from("cards")
      .insert({ ...data, position, user_id: context.userId })
      .select(SELECT)
      .single();
    if (error) throw new Error(error.message);
    return toCard(row);
  });

export const updateCard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => updateSchema.parse(input))
  .handler(async ({ data, context }): Promise<Card> => {
    const { id, ...rest } = data;
    const patch: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(rest)) {
      if (value !== undefined) patch[key] = value;
    }
    const { data: row, error } = await context.supabase
      .from("cards")
      .update(patch)
      .eq("id", id)
      .select(SELECT)
      .single();
    if (error) throw new Error(error.message);
    return toCard(row);
  });

export const moveCard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => moveSchema.parse(input))
  .handler(async ({ data, context }): Promise<Card> => {
    const { data: row, error } = await context.supabase
      .from("cards")
      .update({ column_key: data.column_key, position: data.position })
      .eq("id", data.id)
      .select(SELECT)
      .single();
    if (error) throw new Error(error.message);
    return toCard(row);
  });

export const deleteCard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }): Promise<{ id: string }> => {
    const { error } = await context.supabase.from("cards").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { id: data.id };
  });
