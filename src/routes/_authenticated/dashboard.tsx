import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Calendar,
  ChevronDown,
  Clock,
  Inbox,
  MoreHorizontal,
  Plus,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

type ProjectStatus = "started" | "ongoing" | "completed";

type Project = {
  id: string;
  name: string;
  description: string;
  progress: number;
  teamSize: number;
  attachments: number;
  comments: number;
  status: ProjectStatus;
  color: string;
};

const PROJECTS: Project[] = [
  {
    id: "1",
    name: "Web Design",
    description: "Wireframing, mockups, clients collaboration",
    progress: 50,
    teamSize: 3,
    attachments: 6,
    comments: 4,
    status: "started",
    color: "bg-violet-100 text-violet-700",
  },
  {
    id: "2",
    name: "App Development",
    description: "Wireframing, mockups, clients collaboration",
    progress: 60,
    teamSize: 2,
    attachments: 6,
    comments: 4,
    status: "started",
    color: "bg-blue-100 text-blue-700",
  },
  {
    id: "3",
    name: "Mobile App",
    description: "Wireframing, mockups, clients collaboration",
    progress: 65,
    teamSize: 4,
    attachments: 6,
    comments: 4,
    status: "started",
    color: "bg-orange-100 text-orange-700",
  },
  {
    id: "4",
    name: "Mobile App",
    description: "Wireframing, mockups, clients collaboration",
    progress: 30,
    teamSize: 2,
    attachments: 6,
    comments: 4,
    status: "ongoing",
    color: "bg-orange-100 text-orange-700",
  },
  {
    id: "5",
    name: "Dashboard",
    description: "Wireframing, mockups, clients collaboration",
    progress: 40,
    teamSize: 3,
    attachments: 6,
    comments: 4,
    status: "ongoing",
    color: "bg-violet-100 text-violet-700",
  },
  {
    id: "6",
    name: "Web Development",
    description: "Wireframing, mockups, clients collaboration",
    progress: 50,
    teamSize: 2,
    attachments: 6,
    comments: 4,
    status: "ongoing",
    color: "bg-blue-100 text-blue-700",
  },
  {
    id: "7",
    name: "Dashboard",
    description: "Wireframing, mockups, clients collaboration",
    progress: 90,
    teamSize: 2,
    attachments: 6,
    comments: 4,
    status: "completed",
    color: "bg-violet-100 text-violet-700",
  },
  {
    id: "8",
    name: "Landing Page",
    description: "Wireframing, mockups, clients collaboration",
    progress: 70,
    teamSize: 2,
    attachments: 6,
    comments: 4,
    status: "completed",
    color: "bg-pink-100 text-pink-700",
  },
  {
    id: "9",
    name: "App Development",
    description: "Wireframing, mockups, clients collaboration",
    progress: 80,
    teamSize: 3,
    attachments: 6,
    comments: 4,
    status: "completed",
    color: "bg-blue-100 text-blue-700",
  },
];

const AVATAR_COLORS = [
  "bg-violet-500",
  "bg-blue-500",
  "bg-pink-500",
  "bg-orange-500",
  "bg-green-500",
];

function TeamAvatars({ count }: { count: number }) {
  return (
    <div className="flex -space-x-1.5">
      {Array.from({ length: Math.min(count, 4) }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "size-5 rounded-full border-2 border-white",
            AVATAR_COLORS[i % AVATAR_COLORS.length],
          )}
        />
      ))}
    </div>
  );
}

function ProjectCard({ project, dragging }: { project: Project; dragging?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-4 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift cursor-pointer",
        dragging && "rotate-2 scale-[1.03] shadow-lift opacity-90",
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", project.color)}>
          {project.name}
        </span>
        <button type="button" className="text-muted-foreground hover:text-foreground transition-colors">
          <MoreHorizontal className="size-4" />
        </button>
      </div>

      <p className="text-xs text-muted-foreground mt-1 mb-3">{project.description}</p>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${project.progress}%` }}
          />
        </div>
        <p className="text-right text-[11px] text-muted-foreground mt-1">{project.progress}%</p>
      </div>

      <div className="flex items-center justify-between">
        <TeamAvatars count={project.teamSize} />
        <div className="flex items-center gap-3 text-muted-foreground">
          <span className="flex items-center gap-1 text-[11px]">
            <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            {project.attachments}
          </span>
          <span className="flex items-center gap-1 text-[11px]">
            <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {project.comments}
          </span>
        </div>
      </div>
    </div>
  );
}

const COLUMNS_CONFIG: { key: ProjectStatus; label: string }[] = [
  { key: "started", label: "Started" },
  { key: "ongoing", label: "On Going" },
  { key: "completed", label: "Completed" },
];

function CircularProgress({ value }: { value: number }) {
  const r = 54;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg className="size-36 -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/50" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-primary transition-all duration-700"
        />
      </svg>
      <span className="absolute text-2xl font-bold text-foreground">{value}%</span>
    </div>
  );
}

export default function DashboardPage() {
  const [activeColumn, setActiveColumn] = useState<ProjectStatus | null>(null);
  const total = 144;
  const completed = 56;
  const inProgress = 72;
  const waiting = 24;

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main board area */}
      <div className="flex-1 overflow-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <Button className="gap-2 rounded-xl px-5">
            <Plus className="size-4" />
            Create Project
          </Button>
        </div>

        {/* Kanban columns */}
        <div className="grid grid-cols-3 gap-5">
          {COLUMNS_CONFIG.map((col) => {
            const colProjects = PROJECTS.filter((p) => p.status === col.key);
            return (
              <div key={col.key}>
                {/* Column header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <h2 className="text-sm font-semibold text-foreground">{col.label}</h2>
                  <button
                    type="button"
                    className="flex size-6 items-center justify-center rounded-lg hover:bg-accent transition-colors"
                    onClick={() => setActiveColumn(col.key)}
                  >
                    <Plus className="size-3.5 text-muted-foreground" />
                  </button>
                </div>
                {/* Cards */}
                <div className="flex flex-col gap-3">
                  {colProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right panel */}
      <aside className="hidden lg:flex w-72 shrink-0 flex-col gap-5 border-l border-border bg-card/60 p-5 overflow-auto">
        {/* Selected team */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Selected</p>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-orange-400 flex items-center justify-center">
              <User className="size-5 text-white" />
            </div>
            <p className="text-sm font-semibold text-foreground">Design Team</p>
          </div>
        </div>

        {/* Circular progress */}
        <div className="flex justify-center">
          <CircularProgress value={72} />
        </div>

        {/* Project stats */}
        <div>
          <p className="text-sm font-semibold text-foreground mb-3">Projects</p>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-2xl bg-muted p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Total</p>
              <p className="mt-1 text-xl font-bold text-foreground">
                <span className="inline-block w-1 h-4 rounded-sm bg-primary mr-1.5 align-middle" />
                {total}
              </p>
            </div>
            <div className="rounded-2xl bg-orange-50 dark:bg-orange-950/30 p-3">
              <p className="text-[10px] uppercase tracking-wider text-orange-600 dark:text-orange-400 font-semibold">Completed</p>
              <p className="mt-1 text-xl font-bold text-foreground">
                <span className="inline-block w-1 h-4 rounded-sm bg-orange-400 mr-1.5 align-middle" />
                {completed}
              </p>
            </div>
            <div className="rounded-2xl bg-violet-50 dark:bg-violet-950/30 p-3">
              <p className="text-[10px] uppercase tracking-wider text-violet-600 dark:text-violet-400 font-semibold">In Progress</p>
              <p className="mt-1 text-xl font-bold text-foreground">
                <span className="inline-block w-1 h-4 rounded-sm bg-primary mr-1.5 align-middle" />
                {inProgress}
              </p>
            </div>
            <div className="rounded-2xl bg-blue-50 dark:bg-blue-950/30 p-3">
              <p className="text-[10px] uppercase tracking-wider text-blue-600 dark:text-blue-400 font-semibold">Waiting</p>
              <p className="mt-1 text-xl font-bold text-foreground">
                <span className="inline-block w-1 h-4 rounded-sm bg-blue-400 mr-1.5 align-middle" />
                {waiting}
              </p>
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="rounded-2xl border border-border bg-card p-3.5 flex items-center gap-3">
          <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Clock className="size-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-muted-foreground">Sunday, 20 December</p>
            <p className="text-sm font-semibold text-foreground truncate">08:00 – 11:00 AM</p>
          </div>
          <button type="button" className="ml-auto text-muted-foreground hover:text-foreground">
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        </div>

        {/* Internal messages */}
        <div className="rounded-2xl border border-border bg-primary/5 p-3.5 flex items-center gap-3">
          <div className="size-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <Inbox className="size-4 text-primary-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-muted-foreground">Declaration centre</p>
            <p className="text-sm font-semibold text-foreground truncate">Internal Messages</p>
          </div>
          <button type="button" className="text-muted-foreground hover:text-foreground">
            <ChevronDown className="size-4" />
          </button>
        </div>
      </aside>
    </div>
  );
}
