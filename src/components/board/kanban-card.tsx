import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Tag } from "lucide-react";

import type { Card, Priority } from "@/lib/cards.functions";
import { cn } from "@/lib/utils";

const PRIORITY_STYLES: Record<Priority, string> = {
  high: "bg-priority-high text-priority-high-foreground",
  medium: "bg-priority-medium text-priority-medium-foreground",
  low: "bg-priority-low text-priority-low-foreground",
};

const PRIORITY_LABELS: Record<Priority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export function CardFace({
  card,
  dragging = false,
  overlay = false,
}: {
  card: Card;
  dragging?: boolean;
  overlay?: boolean;
}) {
  return (
    <div
      className={cn(
        "group relative rounded-2xl border border-border/70 bg-card p-4 text-left shadow-card transition-all duration-200",
        !overlay && "hover:-translate-y-0.5 hover:shadow-lift",
        dragging && "opacity-40",
        overlay && "rotate-2 scale-[1.03] shadow-lift",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold leading-snug text-card-foreground">{card.title}</p>
        <GripVertical className="mt-0.5 size-4 shrink-0 text-muted-foreground/50 opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      {card.description ? (
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {card.description}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-[11px] font-semibold",
            PRIORITY_STYLES[card.priority],
          )}
        >
          {PRIORITY_LABELS[card.priority]}
        </span>
        {card.labels.map((label) => (
          <span
            key={label}
            className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-secondary-foreground"
          >
            <Tag className="size-3" />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function SortableCard({
  card,
  onOpen,
}: {
  card: Card;
  onOpen: (card: Card) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: "card", columnKey: card.column_key },
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className="animate-card-in cursor-grab touch-none active:cursor-grabbing"
      {...attributes}
      {...listeners}
      onClick={() => onOpen(card)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter") onOpen(card);
      }}
    >
      <CardFace card={card} dragging={isDragging} />
    </div>
  );
}
