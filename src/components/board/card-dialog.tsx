import { useEffect, useState } from "react";
import { Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PRIORITIES, type Card, type ColumnKey, type Priority } from "@/lib/cards.functions";
import { cn } from "@/lib/utils";

export type CardDraft = {
  title: string;
  description: string;
  priority: Priority;
  labels: string[];
};

const PRIORITY_STYLES: Record<Priority, string> = {
  high: "bg-priority-high text-priority-high-foreground",
  medium: "bg-priority-medium text-priority-medium-foreground",
  low: "bg-priority-low text-priority-low-foreground",
};

export function CardDialog({
  open,
  card,
  columnKey,
  columnTitle,
  onOpenChange,
  onSave,
  onDelete,
}: {
  open: boolean;
  card: Card | null;
  columnKey: ColumnKey;
  columnTitle: string;
  onOpenChange: (open: boolean) => void;
  onSave: (draft: CardDraft) => void;
  onDelete: (() => void) | null;
}) {
  const [draft, setDraft] = useState<CardDraft>({
    title: "",
    description: "",
    priority: "medium",
    labels: [],
  });
  const [labelInput, setLabelInput] = useState("");

  useEffect(() => {
    if (!open) return;
    setLabelInput("");
    setDraft(
      card
        ? {
            title: card.title,
            description: card.description,
            priority: card.priority,
            labels: card.labels,
          }
        : { title: "", description: "", priority: "medium", labels: [] },
    );
  }, [open, card]);

  const addLabel = () => {
    const value = labelInput.trim();
    if (!value || draft.labels.includes(value) || draft.labels.length >= 8) return;
    setDraft((prev) => ({ ...prev, labels: [...prev.labels, value] }));
    setLabelInput("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{card ? "Edit card" : "New card"}</DialogTitle>
          <DialogDescription>In {columnTitle}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="card-title">Title</Label>
            <Input
              id="card-title"
              autoFocus
              value={draft.title}
              placeholder="What needs doing?"
              onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
              onKeyDown={(event) => {
                if (event.key === "Enter" && draft.title.trim()) onSave(draft);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="card-description">Description</Label>
            <Textarea
              id="card-description"
              rows={4}
              value={draft.description}
              placeholder="Extra detail, links, acceptance criteria…"
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, description: event.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <div className="flex gap-2">
              {PRIORITIES.map((priority) => (
                <button
                  key={priority}
                  type="button"
                  onClick={() => setDraft((prev) => ({ ...prev, priority }))}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-all",
                    draft.priority === priority
                      ? cn(PRIORITY_STYLES[priority], "ring-2 ring-primary/40")
                      : "bg-secondary text-muted-foreground hover:text-foreground",
                  )}
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="card-label">Labels</Label>
            <div className="flex gap-2">
              <Input
                id="card-label"
                value={labelInput}
                placeholder="Add a label and press Enter"
                onChange={(event) => setLabelInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addLabel();
                  }
                }}
              />
              <Button type="button" variant="secondary" onClick={addLabel}>
                Add
              </Button>
            </div>
            {draft.labels.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {draft.labels.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        labels: prev.labels.filter((item) => item !== label),
                      }))
                    }
                    className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-secondary-foreground hover:bg-accent"
                  >
                    {label}
                    <X className="size-3" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          {onDelete ? (
            <Button type="button" variant="ghost" onClick={onDelete} className="text-destructive">
              <Trash2 />
              Delete
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={!draft.title.trim()} onClick={() => onSave(draft)}>
              {card ? "Save changes" : `Add to ${columnTitle}`}
            </Button>
          </div>
        </DialogFooter>
        <input type="hidden" value={columnKey} />
      </DialogContent>
    </Dialog>
  );
}
