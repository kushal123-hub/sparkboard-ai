import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";

import { SortableCard } from "@/components/board/kanban-card";
import { Button } from "@/components/ui/button";
import type { Card, ColumnKey } from "@/lib/cards.functions";
import { cn } from "@/lib/utils";

const DOT: Record<ColumnKey, string> = {
  todo: "bg-column-todo",
  in_progress: "bg-column-progress",
  done: "bg-column-done",
};

export function KanbanColumn({
  columnKey,
  title,
  cards,
  onAdd,
  onOpen,
}: {
  columnKey: ColumnKey;
  title: string;
  cards: Card[];
  onAdd: (columnKey: ColumnKey) => void;
  onOpen: (card: Card) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: columnKey, data: { type: "column" } });

  return (
    <section className="flex min-w-0 flex-col">
      <header className="flex items-center justify-between px-1 pb-3">
        <div className="flex items-center gap-2">
          <span className={cn("size-2.5 rounded-full", DOT[columnKey])} />
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
            {cards.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onAdd(columnKey)}
          aria-label={`Add a card to ${title}`}
        >
          <Plus />
        </Button>
      </header>

      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-[420px] flex-1 flex-col gap-3 rounded-3xl border border-transparent bg-muted/50 p-3 transition-colors duration-200",
          isOver && "border-primary/40 bg-accent/70",
        )}
      >
        <SortableContext
          items={cards.map((card) => card.id)}
          strategy={verticalListSortingStrategy}
        >
          {cards.map((card) => (
            <SortableCard key={card.id} card={card} onOpen={onOpen} />
          ))}
        </SortableContext>

        {cards.length === 0 ? (
          <button
            type="button"
            onClick={() => onAdd(columnKey)}
            className="mt-1 rounded-2xl border border-dashed border-border py-8 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
          >
            Drop a card here or add one
          </button>
        ) : null}
      </div>
    </section>
  );
}
