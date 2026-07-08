import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, X, Loader2, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { AiChatService, type ChatMessage } from "@/services/ai/AiChatService";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useTranslation } from "@/hooks/useTranslation";
import { useUiStore } from "@/store/useUiStore";

const AI_PANEL_LANG = {
  en: {
    greeting: "Hello! I am BusSetu AI. Ask me anything about current live buses, route speeds, seat availability, or walking ETAs on Prayagraj highways!",
    tryAsking: "Try asking",
    suggestions: [
      "Recommend fastest bus",
      "Show buses with most vacant seats",
      "Where is the nearest stop?",
      "Will I miss my bus if I walk?",
    ]
  },
  hi: {
    greeting: "नमस्ते! मैं बससेतु एआई हूँ। मुझसे प्रयागराज राजमार्गों पर वर्तमान लाइव बसों, मार्ग की गति, सीटों की उपलब्धता या पैदल चलने के ईटीए के बारे में कुछ भी पूछें!",
    tryAsking: "पूछने का प्रयास करें",
    suggestions: [
      "सबसे तेज़ बस की सिफ़ारिश करें",
      "सबसे अधिक खाली सीटों वाली बसें दिखाएं",
      "निकटतम स्टॉप कहाँ है?",
      "यदि मैं पैदल चलूँ तो क्या मेरी बस छूट जाएगी?",
    ]
  },
  th: {
    greeting: "สวัสดีครับ! ผมคือ BusSetu AI ถามผมได้ทุกเรื่องเกี่ยวกับรถบัสไลฟ์สด ความเร็วเส้นทาง ที่นั่งว่าง หรือระยะเวลาเดินเท้าบนทางหลวงประยาราช!",
    tryAsking: "ลองถามดู",
    suggestions: [
      "แนะนำรถบัสที่เร็วที่สุด",
      "แสดงรถบัสที่มีที่นั่งว่างมากที่สุด",
      "จุดจอดที่ใกล้ที่สุดอยู่ที่ไหน?",
      "ถ้าฉันเดินไปจะตกรถบัสไหม?",
    ]
  }
};

export function AiAssistantPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { location } = useGeolocation();
  const { language, setLanguage } = useTranslation();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const selectTrip = useUiStore((s) => s.selectTrip);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize and synchronize initial greeting language
  useEffect(() => {
    setMessages((prev) => {
      const activeGreeting = AI_PANEL_LANG[language]?.greeting || AI_PANEL_LANG.en.greeting;
      if (prev.length <= 1) {
        return [{ role: "model", text: activeGreeting }];
      }
      return prev;
    });
  }, [language]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const prompt = textToSend ?? input;
    if (!prompt.trim() || loading) return;

    // Dynamically auto-detect language from input and synchronize UI language state
    let detectedLang = language;
    if (/[\u0900-\u097F]/.test(prompt)) {
      detectedLang = "hi";
    } else if (/[\u0e00-\u0e7f]/.test(prompt)) {
      detectedLang = "th";
    } else if (/[a-zA-Z]/.test(prompt)) {
      detectedLang = "en";
    }
    if (detectedLang !== language) {
      setLanguage(detectedLang);
    }

    if (!textToSend) setInput("");
    setMessages((prev) => [...prev, { role: "user", text: prompt }]);
    setLoading(true);

    try {
      // Exclude system contexts when sending history
      const response = await AiChatService.askAi(
        prompt,
        location,
        messages.filter((m) => m.text !== messages[0].text),
        language
      );
      setMessages((prev) => [...prev, { role: "model", text: response }]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: err?.message || "Sorry, I am facing an issue connecting to my telemetry database right now. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      {/* Floating Language Selection Pill next to robot icon */}
      <div className="fixed top-4 right-[76px] z-[999] flex h-14 items-center gap-1.5 rounded-full border border-border bg-card/90 backdrop-blur-md px-3.5 shadow-xl hover:shadow-2xl transition-all duration-300">
        {[
          { code: "en", label: "🇺🇸 EN" },
          { code: "hi", label: "🇮🇳 हिंदी" },
          { code: "th", label: "🇹🇭 ไทย" }
        ].map((lang) => {
          const isActive = language === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => setLanguage(lang.code as any)}
              className={`rounded-full px-2.5 py-1.5 text-[10px] font-black transition-all cursor-pointer ${
                isActive
                  ? "bg-brand text-brand-foreground shadow-sm shadow-brand/20 scale-105"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              }`}
            >
              {lang.label}
            </button>
          );
        })}
      </div>

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-[999] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-brand to-indigo-600 p-0 shadow-xl shadow-brand/35 hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer border border-white/20 group overflow-hidden"
        aria-label="Open AI Assistant"
      >
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_2s_infinite]" />
        <img src="/ai-avatar.png" alt="Ask AI" className="relative h-10 w-10 object-contain group-hover:rotate-6 transition-transform duration-300" />
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
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-white border border-border/50 overflow-hidden shrink-0">
                  <img src="/ai-avatar.png" alt="AI" className="h-full w-full object-cover" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xs text-foreground flex items-center gap-1.5">
                    BusSetu AI
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                  </h3>
                  <p className="text-[10px] text-muted-foreground">Powered by Gemini 2.5 Flash</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as any)}
                    className="appearance-none rounded-full border border-border/70 bg-card text-foreground text-[10px] font-semibold pl-2 pr-6 py-1 focus:outline-none hover:bg-accent cursor-pointer"
                  >
                    <option value="en">🇺🇸 EN</option>
                    <option value="hi">🇮🇳 HI</option>
                    <option value="th">🇹🇭 TH</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-1.5 flex items-center">
                    <svg className="h-2 w-2 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/80 hover:text-foreground cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
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
                      <div className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-white border border-border/50 overflow-hidden">
                        <img src="/ai-avatar.png" alt="AI" className="h-full w-full object-cover" />
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
                        <ReactMarkdown
                          components={{
                            a: ({ href, children }) => {
                              if (href?.startsWith("#bus-")) {
                                const tripId = href.replace("#bus-", "");
                                return (
                                  <button
                                    onClick={() => {
                                      selectTrip(tripId);
                                      setIsOpen(false); // Close AI panel so they see details panel immediately
                                    }}
                                    className="text-brand font-black underline hover:text-brand/80 cursor-pointer inline-flex items-center gap-0.5 bg-brand/5 border border-brand/20 px-1.5 py-0.5 rounded-md hover:scale-[1.02] active:scale-[0.98] transition-transform"
                                  >
                                    🚌 {children}
                                  </button>
                                );
                              }
                              return (
                                <a href={href} target="_blank" rel="noreferrer" className="text-brand underline">
                                  {children}
                                </a>
                              );
                            },
                          }}
                        >
                          {m.text}
                        </ReactMarkdown>
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
                  <div className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-white border border-border/50 overflow-hidden">
                    <img src="/ai-avatar.png" alt="AI" className="h-full w-full object-cover animate-pulse" />
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
                  {AI_PANEL_LANG[language]?.tryAsking || AI_PANEL_LANG.en.tryAsking}
                </span>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {(AI_PANEL_LANG[language]?.suggestions || AI_PANEL_LANG.en.suggestions).map((s, i) => (
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
