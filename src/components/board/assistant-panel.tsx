import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import atlasMark from "@/assets/atlas-mark.png.asset.json";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "What should I focus on next?",
  "Summarise what's in progress",
  "Which cards are high priority?",
];

export function AssistantPanel({
  open,
  onClose,
  boardVersion,
}: {
  open: boolean;
  onClose: () => void;
  boardVersion: number;
}) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const { messages, sendMessage, status, error } = useChat({
    id: `assistant-${boardVersion}`,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      headers: async () => {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
    }),
  });

  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (open) textareaRef.current?.focus();
  }, [open, status]);

  const submit = (text: string) => {
    const value = text.trim();
    if (!value || busy) return;
    setInput("");
    void sendMessage({ text: value });
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-0 right-0 z-40 flex w-full max-w-md flex-col border-l border-border bg-surface shadow-panel transition-transform duration-300 ease-out",
        open ? "translate-x-0" : "translate-x-full",
      )}
      aria-hidden={!open}
    >
      <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <img src={atlasMark.url} alt="" className="size-9 rounded-xl" />
          <div>
            <p className="text-sm font-semibold text-foreground">Atlas</p>
            <p className="text-xs text-muted-foreground">Knows what's on your board</p>
          </div>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close assistant">
          <X />
        </Button>
      </header>

      <Conversation className="flex-1">
        <ConversationContent className="gap-4">
          {messages.length === 0 ? (
            <div className="space-y-3 py-6">
              <p className="text-sm text-muted-foreground">
                Ask me anything about your board — I can read every card.
              </p>
              <div className="flex flex-col gap-2">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => submit(suggestion)}
                    className="rounded-2xl border border-border bg-card px-4 py-2.5 text-left text-sm text-card-foreground shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/40"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {messages.map((message) => (
            <Message from={message.role} key={message.id}>
              <MessageContent
                className={cn(
                  message.role === "assistant" && "bg-transparent p-0 text-foreground",
                )}
              >
                {message.parts.map((part, index) =>
                  part.type === "text" ? (
                    <MessageResponse key={index}>{part.text}</MessageResponse>
                  ) : null,
                )}
              </MessageContent>
            </Message>
          ))}

          {status === "submitted" ? <Shimmer>Thinking…</Shimmer> : null}
          {error ? (
            <p className="rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error.message || "The assistant could not answer just now. Please try again."}
            </p>
          ) : null}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t border-border p-4">
        <PromptInput
          onSubmit={(message) => submit(message.text ?? input)}
          globalDrop={false}
          multiple={false}
        >
          <PromptInputTextarea
            ref={textareaRef}
            value={input}
            placeholder="Ask about your board…"
            onChange={(event) => setInput(event.target.value)}
          />
          <PromptInputFooter className="justify-end">
            <PromptInputSubmit status={status} disabled={!input.trim() && !busy} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </aside>
  );
}
