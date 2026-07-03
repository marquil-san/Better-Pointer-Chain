import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  logs: string[];
  onClear: () => void;
}

const LOG_COLORS: Record<string, string> = {
  "[TRAVERSE]": "text-purple-400",
  "[ADDR]": "text-cyan-400",
  "[STEP": "text-blue-300",
  "[DEREF]": "text-yellow-300",
  "[FOUND]": "text-emerald-400",
  "[ERROR]": "text-red-400",
  "[INFO]": "text-slate-400",
  "[INTERRUPT]": "text-orange-400",
  "[SUGGEST]": "text-indigo-300",
};

function getLogColor(log: string): string {
  for (const [key, color] of Object.entries(LOG_COLORS)) {
    if (log.startsWith(key)) return color;
  }
  return "text-slate-400";
}

export function DebugConsole({ logs, onClear }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="h-full flex flex-col bg-slate-950 rounded-lg border border-slate-700 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-slate-700 bg-slate-900 shrink-0">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
        </div>
        <span className="text-[10px] font-mono text-slate-400 ml-1">Debug Console</span>
        <span className="text-[9px] text-slate-600 font-mono ml-auto">{logs.length} lines</span>
        <button
          onClick={onClear}
          title="Clear console"
          className="ml-2 px-2 py-0.5 rounded text-[9px] font-mono text-slate-500 border border-slate-700
            hover:border-slate-500 hover:text-slate-300 transition-all shrink-0"
        >
          Clear
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-px font-mono text-[11px] leading-relaxed min-h-0">
        <AnimatePresence initial={false}>
          {logs.map((log, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              className={`flex gap-2 ${getLogColor(log)}`}
            >
              <span className="text-slate-700 select-none shrink-0 w-5 text-right tabular-nums">{i + 1}</span>
              <span className="break-all min-w-0">{log}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
