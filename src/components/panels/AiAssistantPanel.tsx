import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, User, X, Loader2, Sparkles, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { AiChatService, type ChatMessage } from "@/services/ai/AiChatService";
import { useGeolocation } from "@/hooks/useGeolocation";

export function AiAssistantPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "model",
      text: "Namaste! I am your BusSetu AI Assistant. Ask me anything about current live buses, route speeds, seat availability, or walking ETAs on Prayagraj highways!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { location } = useGeolocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const prompt = textToSend ?? input;
    if (!prompt.trim() || loading) return;

    if (!textToSend) setInput("");
    setMessages((prev) => [...prev, { role: "user", text: prompt }]);
    setLoading(true);

    try {
      // Exclude system contexts when sending history
      const response = await AiChatService.askAi(
        prompt,
        location,
        messages.filter((m) => m.text !== messages[0].text)
      );
      setMessages((prev) => [...prev, { role: "model", text: response }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "Sorry, I am facing an issue connecting to my telemetry database right now. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "Recommend fastest bus",
    "Show buses with most vacant seats",
    "Where is the nearest stop?",
    "Will I miss my bus if I walk?",
  ];

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 z-[999] flex items-center gap-2 rounded-full bg-gradient-to-r from-brand to-brand-hover px-4 py-3 text-xs font-bold text-brand-foreground shadow-lg shadow-brand/20 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        aria-label="Open AI Assistant"
      >
        <Sparkles className="h-4 w-4 animate-pulse text-yellow-300" />
        <span>Ask AI Advisor</span>
      </button>

      {/* Slide-out Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 380 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 380 }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed inset-y-0 right-0 z-[1000] w-full max-w-sm border-l border-border/80 bg-background/95 backdrop-blur-xl shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/60 bg-muted/20 px-4 py-3.5">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-brand/10 text-brand">
                  <Bot className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xs text-foreground flex items-center gap-1.5">
                    Live Telemetry AI Advisor
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                  </h3>
                  <p className="text-[10px] text-muted-foreground">Powered by Gemini 2.5 Flash</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/80 hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m, idx) => {
                const isModel = m.role === "model";
                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-2.5 ${isModel ? "justify-start" : "justify-end"}`}
                  >
                    {isModel && (
                      <div className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand">
                        <Bot className="h-3.5 w-3.5" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2.5 text-xs leading-normal shadow-sm ${
                        isModel
                          ? "bg-card border border-border/60 text-foreground rounded-tl-sm prose prose-sm prose-p:leading-relaxed prose-pre:p-0 prose-pre:bg-transparent max-w-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_strong]:font-bold [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:mt-1"
                          : "bg-brand text-brand-foreground rounded-tr-sm"
                      }`}
                    >
                      {isModel ? (
                        <ReactMarkdown>{m.text}</ReactMarkdown>
                      ) : (
                        m.text
                      )}
                    </div>
                    {!isModel && (
                      <div className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-muted border text-muted-foreground">
                        <User className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </div>
                );
              })}

              {loading && (
                <div className="flex items-start gap-2.5 justify-start">
                  <div className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand">
                    <Bot className="h-3.5 w-3.5 animate-spin" />
                  </div>
                  <div className="max-w-[85%] rounded-2xl bg-card border border-border/60 px-3 py-2.5 text-xs text-muted-foreground flex items-center gap-1.5">
                    <Loader2 className="h-3 w-3 animate-spin text-brand" />
                    Analyzing live Prayagraj bus feeds...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions list (if no user replies yet) */}
            {messages.length === 1 && !loading && (
              <div className="px-4 py-2 border-t border-border/40">
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                  Try asking
                </span>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(s)}
                      className="rounded-full border border-border bg-card hover:border-brand/40 hover:bg-brand/5 px-2.5 py-1 text-[10px] text-muted-foreground hover:text-foreground cursor-pointer text-left"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="border-t border-border/80 bg-background p-3 flex gap-2 items-center"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about seats, ETA, speeds..."
                className="flex-1 rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-brand-foreground shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
