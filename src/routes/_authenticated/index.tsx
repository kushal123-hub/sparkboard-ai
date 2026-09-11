import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Bell,
  ChevronDown,
  Filter,
  LayoutGrid,
  LogOut,
  Plus,
  Search,
  Settings,
  Sparkles,
  SlidersHorizontal,
  CheckCircle2,
  KanbanSquare,
} from "lucide-react";

import atlasMark from "@/assets/atlas-mark.png";
import { AssistantPanel } from "@/components/board/assistant-panel";
import { CardDialog, type CardDraft } from "@/components/board/card-dialog";
import { CardFace } from "@/components/board/kanban-card";
import { KanbanColumn } from "@/components/board/kanban-column";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  createCard,
  deleteCard,
  listCards,
  moveCard,
  updateCard,
  type Card,
  type ColumnKey,
} from "@/lib/cards.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/")({
  ssr: false,
  component: BoardPage,
});

const COLUMNS: { key: ColumnKey; title: string }[] = [
  { key: "todo", title: "To Do" },
  { key: "in_progress", title: "In Progress" },
  { key: "done", title: "Done" },
];

const NAV = [
  { icon: LayoutGrid, label: "Overview" },
  { icon: KanbanSquare, label: "Board", active: true },
  { icon: CheckCircle2, label: "Completed" },
  { icon: Settings, label: "Settings" },
];

function BoardPage() {
  const navigate = useNavigate();
  const router = useRouter();

  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [boardVersion, setBoardVersion] = useState(0);

  // Panel state
  const [assistantOpen, setAssistantOpen] = useState(false);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [dialogColumn, setDialogColumn] = useState<ColumnKey>("todo");

  // Drag state
  const [activeCard, setActiveCard] = useState<Card | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [userEmail, setUserEmail] = useState<string>("");

  // Load cards
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user.email ?? "");
    });
    listCards()
      .then((data) => {
        if (!cancelled) setCards(data);
      })
      .catch(() => toast.error("Couldn't load your board."))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const cardsForColumn = useCallback(
    (key: ColumnKey) => {
      const filtered = cards.filter(
        (c) =>
          c.column_key === key &&
          (searchQuery === "" ||
            c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.description.toLowerCase().includes(searchQuery.toLowerCase())),
      );
      return filtered.sort((a, b) => a.position - b.position);
    },
    [cards, searchQuery],
  );

  // DnD handlers
  const handleDragStart = (event: DragStartEvent) => {
    const card = cards.find((c) => c.id === event.active.id);
    setActiveCard(card ?? null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveCard(null);
    const { active, over } = event;
    if (!over) return;

    const draggedCard = cards.find((c) => c.id === active.id);
    if (!draggedCard) return;

    const overCardData = over.data.current;
    const targetColumn: ColumnKey =
      overCardData?.["type"] === "column"
        ? (over.id as ColumnKey)
        : (overCardData?.["columnKey"] as ColumnKey | undefined) ?? draggedCard.column_key;

    const targetCards = cards
      .filter((c) => c.column_key === targetColumn && c.id !== draggedCard.id)
      .sort((a, b) => a.position - b.position);

    const overIndex = targetCards.findIndex((c) => c.id === over.id);
    let newPosition: number;
    if (targetCards.length === 0) {
      newPosition = 1000;
    } else if (overIndex <= 0) {
      newPosition = (targetCards[0]?.position ?? 1000) / 2;
    } else if (overIndex >= targetCards.length) {
      newPosition = (targetCards[targetCards.length - 1]?.position ?? 0) + 1000;
    } else {
      newPosition =
        ((targetCards[overIndex - 1]?.position ?? 0) +
          (targetCards[overIndex]?.position ?? 0)) /
        2;
    }

    // Optimistic update
    setCards((prev) =>
      prev.map((c) =>
        c.id === draggedCard.id
          ? { ...c, column_key: targetColumn, position: newPosition }
          : c,
      ),
    );

    try {
      await moveCard({ data: { id: draggedCard.id, column_key: targetColumn, position: newPosition } });
      setBoardVersion((v) => v + 1);
    } catch {
      toast.error("Couldn't move the card.");
      // Revert
      setCards((prev) =>
        prev.map((c) =>
          c.id === draggedCard.id
            ? { ...c, column_key: draggedCard.column_key, position: draggedCard.position }
            : c,
        ),
      );
    }
  };

  // Dialog handlers
  const openAdd = (columnKey: ColumnKey) => {
    setEditingCard(null);
    setDialogColumn(columnKey);
    setDialogOpen(true);
  };

  const openEdit = (card: Card) => {
    setEditingCard(card);
    setDialogColumn(card.column_key);
    setDialogOpen(true);
  };

  const handleSave = async (draft: CardDraft) => {
    setDialogOpen(false);
    if (editingCard) {
      // Optimistic update
      setCards((prev) =>
        prev.map((c) => (c.id === editingCard.id ? { ...c, ...draft } : c)),
      );
      try {
        await updateCard({ data: { id: editingCard.id, ...draft } });
        setBoardVersion((v) => v + 1);
      } catch {
        toast.error("Couldn't update the card.");
      }
    } else {
      // Create
      try {
        const newCard = await createCard({
          data: { ...draft, column_key: dialogColumn },
        });
        setCards((prev) => [...prev, newCard]);
        setBoardVersion((v) => v + 1);
        toast.success("Card added!");
      } catch {
        toast.error("Couldn't create the card.");
      }
    }
  };

  const handleDelete = async () => {
    if (!editingCard) return;
    setDialogOpen(false);
    setCards((prev) => prev.filter((c) => c.id !== editingCard.id));
    try {
      await deleteCard({ data: { id: editingCard.id } });
      setBoardVersion((v) => v + 1);
      toast.success("Card deleted.");
    } catch {
      toast.error("Couldn't delete the card.");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    await router.invalidate();
    await navigate({ to: "/auth" });
  };

  const dialogColumnTitle =
    COLUMNS.find((c) => c.key === dialogColumn)?.title ?? "To Do";

  const totalCards = cards.length;
  const doneCards = cards.filter((c) => c.column_key === "done").length;

  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      {/* ── Sidebar ── */}
      <nav className="hidden sm:flex sticky top-0 h-screen w-[72px] flex-col items-center gap-2 bg-sidebar py-5 z-20 shrink-0">
        <img src={atlasMark} alt="SparkBoard" className="size-10 rounded-2xl shadow-lift" />

        <div className="mt-6 flex flex-1 flex-col items-center gap-1.5">
          {NAV.map(({ icon: Icon, label, active }) => (
            <button
              key={label}
              type="button"
              title={label}
              aria-label={label}
              className={cn(
                "flex size-11 items-center justify-center rounded-2xl transition-all duration-200",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lift"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              )}
            >
              <Icon className="size-5" />
            </button>
          ))}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setAssistantOpen(true)}
          aria-label="Ask Atlas AI"
          title="Ask Atlas AI"
          className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <Sparkles className="size-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSignOut}
          aria-label="Sign out"
          title="Sign out"
          className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <LogOut className="size-5" />
        </Button>
      </nav>

      {/* ── Main content ── */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between gap-4 border-b border-border bg-surface px-6 py-3.5 shrink-0">
          <div className="flex items-center gap-4 min-w-0">
            <div>
              <h1 className="text-base font-semibold text-foreground leading-tight">Actions</h1>
              <p className="text-xs text-muted-foreground">
                {doneCards}/{totalCards} done
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative hidden md:block flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search cards…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-muted pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Views toggle */}
            <button
              type="button"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-colors"
            >
              All · 5 Views
              <ChevronDown className="size-3" />
            </button>

            <Button
              size="sm"
              onClick={() => openAdd("todo")}
              className="gap-1.5 text-xs rounded-xl"
            >
              <Plus className="size-3.5" />
              New Action
            </Button>

            <button
              type="button"
              title="Filter"
              className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
            >
              <Filter className="size-3.5" />
              <span className="hidden sm:inline">Filter</span>
            </button>
            <button
              type="button"
              title="Ordering"
              className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
            >
              <SlidersHorizontal className="size-3.5" />
              <span className="hidden sm:inline">Ordering</span>
            </button>

            {/* User avatar */}
            <div
              title={userEmail}
              className="size-8 rounded-full bg-gradient-violet flex items-center justify-center text-white text-xs font-bold shrink-0"
            >
              {userEmail.charAt(0).toUpperCase() || "U"}
            </div>
          </div>
        </header>

        {/* Kanban board */}
        <div className="flex-1 overflow-x-auto overflow-y-auto">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <p className="text-sm text-muted-foreground">Loading board…</p>
              </div>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="flex h-full gap-5 p-6 min-w-max">
                {COLUMNS.map((col) => (
                  <div key={col.key} className="w-72 shrink-0">
                    <KanbanColumn
                      columnKey={col.key}
                      title={col.title}
                      cards={cardsForColumn(col.key)}
                      onAdd={openAdd}
                      onOpen={openEdit}
                    />
                  </div>
                ))}
              </div>
              <DragOverlay>
                {activeCard ? <CardFace card={activeCard} overlay /> : null}
              </DragOverlay>
            </DndContext>
          )}
        </div>
      </div>

      {/* ── AI Assistant Panel ── */}
      <AssistantPanel
        open={assistantOpen}
        onClose={() => setAssistantOpen(false)}
        boardVersion={boardVersion}
      />

      {/* ── Card Dialog ── */}
      <CardDialog
        open={dialogOpen}
        card={editingCard}
        columnKey={dialogColumn}
        columnTitle={dialogColumnTitle}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        onDelete={editingCard ? handleDelete : null}
      />
    </div>
  );
}
