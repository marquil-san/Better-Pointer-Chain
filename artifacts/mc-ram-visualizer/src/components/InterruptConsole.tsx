import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (path: string) => void;
  suggestions: string[];
}

export function InterruptConsole({ isOpen, onClose, onSubmit, suggestions }: Props) {
  const [input, setInput] = useState("");
  const [filtered, setFiltered] = useState<string[]>([]);
  const [selected, setSelected] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setInput("");
      setFiltered([]);
      setSelected(-1);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  function handleChange(val: string) {
    setInput(val);
    setSelected(-1);
    if (!val.trim()) {
      setFiltered([]);
      return;
    }
    const lower = val.toLowerCase();
    setFiltered(
      suggestions
        .filter((s) => s.toLowerCase().includes(lower))
        .slice(0, 8)
    );
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, -1));
    } else if (e.key === "Enter") {
      const val = selected >= 0 && filtered[selected] ? filtered[selected] : input;
      if (val.trim()) handleSubmit(val.trim());
    } else if (e.key === "Escape") {
      onClose();
    }
  }

  function handleSubmit(val: string) {
    if (!val.trim()) return;
    onSubmit(val.trim());
    setInput("");
    setFiltered([]);
  }

  const presets = [
    "localPlayer.health",
    "localPlayer.position",
    "world.entities.creeper1",
    "world.chunks.chunk_0_0",
    "world.dimension",
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            className="bg-slate-900 border border-orange-500/60 rounded-xl shadow-2xl shadow-orange-900/30 w-full max-w-lg overflow-hidden"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
          >
            <div className="px-5 py-3 border-b border-orange-500/30 bg-orange-900/20 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-orange-300 font-mono text-xs font-bold uppercase tracking-widest">
                INTERRUPT — Jump to Address
              </span>
              <button
                onClick={onClose}
                className="ml-auto text-slate-500 hover:text-slate-300 transition-colors text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-slate-400 font-mono text-[11px]">
                Enter a memory path to traverse:
              </p>

              <div className="relative">
                <div className="flex items-center gap-2 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 focus-within:border-orange-500/60 transition-colors">
                  <span className="text-orange-400 font-mono text-sm shrink-0">&gt;</span>
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => handleChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g. localPlayer.health"
                    className="flex-1 bg-transparent outline-none font-mono text-sm text-slate-200 placeholder-slate-600"
                    spellCheck={false}
                    autoComplete="off"
                  />
                </div>

                <AnimatePresence>
                  {filtered.length > 0 && (
                    <motion.div
                      className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg overflow-hidden z-10 shadow-xl"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                    >
                      {filtered.map((s, i) => (
                        <button
                          key={s}
                          onClick={() => handleSubmit(s)}
                          className={`w-full text-left px-3 py-2 font-mono text-[11px] transition-colors
                            ${i === selected
                              ? "bg-orange-900/40 text-orange-300"
                              : "text-slate-300 hover:bg-slate-700"
                            }`}
                        >
                          {s}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div>
                <p className="text-slate-600 font-mono text-[10px] mb-2 uppercase tracking-wider">Quick access</p>
                <div className="flex flex-wrap gap-2">
                  {presets.map((p) => (
                    <button
                      key={p}
                      onClick={() => handleSubmit(p)}
                      className="px-2 py-1 rounded bg-slate-800 border border-slate-600 text-[10px] font-mono text-slate-400
                        hover:bg-orange-900/30 hover:border-orange-500/50 hover:text-orange-300 transition-all"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleSubmit(input)}
                className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-mono font-bold
                  text-sm rounded-lg transition-colors shadow-lg"
              >
                Jump to Address
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
