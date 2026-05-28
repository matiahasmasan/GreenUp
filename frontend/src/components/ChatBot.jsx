import { useState, useRef, useEffect } from "react";

const SUGGESTIONS = [
  "What's popular today?",
  "Something vegetarian?",
  "I want a light meal",
  "Surprise me 🎲",
];

const GREETING = {
  from: "bot",
  text: "Hi! I'm Sprout 🌱, your menu assistant. Tell me what you're in the mood for and I'll help you pick the perfect dish.",
};

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  const send = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, { from: "user", text: trimmed }]);
    setInput("");
    setIsTyping(true);

    // No workflow yet — placeholder reply so the UX feels alive.
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "Thanks! I'm still learning the menu 🍃 — soon I'll be able to recommend the perfect dish for you.",
        },
      ]);
    }, 1100);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    send(input);
  };

  return (
    <>
      {/* Floating launcher button */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        aria-label="Open menu assistant"
        className={`fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-2xl text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl active:scale-95 ${
          isOpen ? "rotate-90 scale-90" : ""
        }`}
      >
        {isOpen ? "✕" : "🌱"}
        {!isOpen && (
          <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-amber-400"></span>
          </span>
        )}
      </button>

      {/* Chat panel */}
      <div
        className={`fixed bottom-36 right-4 z-40 flex w-[calc(100vw-2rem)] max-w-sm origin-bottom-right flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 transition-all duration-300 ${
          isOpen
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-4 scale-95 opacity-0"
        }`}
        style={{ height: "min(70vh, 32rem)" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 bg-gradient-to-br from-green-500 to-emerald-600 px-4 py-3 text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-xl backdrop-blur">
            🌱
          </div>
          <div className="flex-1">
            <p className="font-semibold leading-tight">Sprout</p>
            <p className="flex items-center gap-1.5 text-xs text-green-50">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-300"></span>
              Menu assistant · online
            </p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close chat"
            className="rounded-full p-1.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 space-y-3 overflow-y-auto bg-gray-50 px-4 py-4"
        >
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.from === "bot" && (
                <div className="mr-2 mt-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm">
                  🌱
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm ${
                  m.from === "user"
                    ? "rounded-br-md bg-gradient-to-br from-green-500 to-emerald-600 text-white"
                    : "rounded-bl-md bg-white text-gray-700 ring-1 ring-gray-100"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="mr-2 mt-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm">
                🌱
              </div>
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-sm ring-1 ring-gray-100">
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-300 [animation-delay:-0.3s]"></span>
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-300 [animation-delay:-0.15s]"></span>
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-300"></span>
              </div>
            </div>
          )}
        </div>

        {/* Suggestion chips */}
        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-2 bg-gray-50 px-4 pb-3">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-full border border-green-200 bg-white px-3 py-1.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-50"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 border-t border-gray-100 bg-white px-3 py-3"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the menu..."
            className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            aria-label="Send message"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
          >
            ➤
          </button>
        </form>
      </div>
    </>
  );
}
