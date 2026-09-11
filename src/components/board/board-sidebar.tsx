import { CheckCircle2, KanbanSquare, LayoutGrid, LogOut, Settings, Sparkles } from "lucide-react";

import atlasMark from "@/assets/atlas-mark.png";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { icon: LayoutGrid, label: "Overview" },
  { icon: KanbanSquare, label: "Board", active: true },
  { icon: CheckCircle2, label: "Completed" },
  { icon: Settings, label: "Settings" },
];

export function BoardSidebar({
  onAskAtlas,
  onSignOut,
}: {
  onAskAtlas: () => void;
  onSignOut: () => void;
}) {
  return (
    <nav className="sticky top-0 hidden h-screen w-[76px] flex-col items-center gap-2 bg-sidebar py-5 sm:flex">
      <img src={atlasMark} alt="Atlas Board" className="size-10 rounded-2xl" />

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
        onClick={onAskAtlas}
        aria-label="Ask Atlas"
        className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
      >
        <Sparkles className="size-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onSignOut}
        aria-label="Sign out"
        className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
      >
        <LogOut className="size-5" />
      </Button>
    </nav>
  );
}
