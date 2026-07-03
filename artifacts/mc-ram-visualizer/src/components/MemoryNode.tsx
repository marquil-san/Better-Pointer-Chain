import { motion } from "framer-motion";
import { formatAddr, formatValue } from "../engine/traversalEngine";
import type { MemoryNode as MemoryNodeType } from "../engine/memoryEngine";

interface Props {
  node: MemoryNodeType;
  state: "idle" | "active" | "final" | "visited";
  onClick?: () => void;
  showFullPath?: string;
}

const stateStyles: Record<string, string> = {
  idle: "border-slate-600 bg-slate-800/60 text-slate-300",
  active: "border-yellow-400 bg-yellow-900/30 text-yellow-200 shadow-[0_0_16px_2px_rgba(250,204,21,0.3)]",
  final: "border-emerald-400 bg-emerald-900/30 text-emerald-200 shadow-[0_0_16px_2px_rgba(52,211,153,0.3)]",
  visited: "border-blue-600 bg-blue-900/20 text-blue-300",
};

const typeIcons: Record<string, string> = {
  root: "⬛",
  pointer: "🔵",
  value: "🟢",
  entity: "🟡",
  chunk: "🟤",
};

export function MemoryNodeCard({ node, state, onClick, showFullPath }: Props) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.85, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.82 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      onClick={onClick}
      title={showFullPath ?? node.description ?? node.name}
      className={`
        relative cursor-pointer select-none rounded-lg border-2
        px-3 py-2 w-[140px] shrink-0
        transition-all duration-300 font-mono text-[10px]
        ${stateStyles[state]}
        ${onClick ? "hover:scale-105 hover:brightness-110" : ""}
      `}
    >
      <div className="flex items-center gap-1 mb-1">
        <span className="text-sm leading-none">{typeIcons[node.type] ?? "⬜"}</span>
        <span className="font-bold text-[10px] uppercase tracking-wide truncate">{node.name}</span>
      </div>
      <div className="text-[9px] space-y-px">
        <div className="flex justify-between gap-1">
          <span className="text-slate-500 shrink-0">ADDR</span>
          <span className="font-semibold truncate">{formatAddr(node.address)}</span>
        </div>
        <div className="flex justify-between gap-1">
          <span className="text-slate-500 shrink-0">VAL</span>
          <span className={`font-semibold truncate ${state === "final" ? "text-emerald-300" : ""}`}>
            {formatValue(node.value)}
          </span>
        </div>
        {node.offset !== undefined && (
          <div className="flex justify-between gap-1">
            <span className="text-slate-500 shrink-0">OFF</span>
            <span>+{("0x" + node.offset.toString(16).toUpperCase().padStart(2, "0"))}</span>
          </div>
        )}
      </div>
      {state === "active" && (
        <motion.div
          className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-yellow-400"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ repeat: Infinity, duration: 0.9 }}
        />
      )}
    </motion.div>
  );
}
