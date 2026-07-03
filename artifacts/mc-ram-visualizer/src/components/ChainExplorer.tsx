import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MemoryNodeCard } from "./MemoryNode";
import { PointerArrow } from "./PointerArrow";
import type { MemoryNode } from "../engine/memoryEngine";

interface Props {
  chain: MemoryNode[];
  activeStep: number;
  chainName: string;
}

export function ChainExplorer({ chain, activeStep, chainName }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    nodeRefs.current = nodeRefs.current.slice(0, chain.length);
  }, [chain.length]);

  useEffect(() => {
    const el = nodeRefs.current[activeStep];
    const container = scrollRef.current;
    if (!el || !container) return;

    const elLeft = el.offsetLeft;
    const elWidth = el.offsetWidth;
    const containerWidth = container.clientWidth;
    const targetScroll = elLeft - containerWidth / 2 + elWidth / 2;

    container.scrollTo({ left: Math.max(0, targetScroll), behavior: "smooth" });
  }, [activeStep]);

  return (
    <div className="h-full flex flex-col bg-slate-900/50 rounded-lg border border-slate-700 overflow-hidden">
      <div className="px-3 py-2 border-b border-slate-700 bg-slate-900 flex items-center gap-2 shrink-0">
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
        <span className="text-[11px] font-mono text-slate-300 font-semibold uppercase tracking-wider whitespace-nowrap">
          Chain Explorer
        </span>
        <span className="ml-auto text-[10px] font-mono text-slate-500 truncate min-w-0">
          {chainName}
        </span>
        <span className="text-[9px] font-mono text-slate-600 shrink-0 ml-1">
          {activeStep + 1}/{chain.length}
        </span>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 flex items-center overflow-x-auto overflow-y-hidden px-4 py-3 gap-0 min-h-0"
        style={{ scrollbarWidth: "thin" }}
      >
        <AnimatePresence mode="popLayout">
          {chain.map((node, i) => {
            const state =
              i < activeStep
                ? "visited"
                : i === activeStep
                ? activeStep === chain.length - 1
                  ? "final"
                  : "active"
                : "idle";

            const isLast = i === chain.length - 1;
            const isArrowActive = i === activeStep - 1;
            const isArrowVisited = i < activeStep - 1;

            return (
              <motion.div
                key={node.address + node.name}
                ref={(el) => { nodeRefs.current[i] = el; }}
                className="flex items-center shrink-0"
                initial={{ opacity: 0, x: 30, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.85 }}
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
              >
                <MemoryNodeCard
                  node={node}
                  state={state}
                  showFullPath={chainName}
                />
                {!isLast && (
                  <PointerArrow
                    active={isArrowActive}
                    visited={isArrowVisited}
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="px-3 py-1.5 border-t border-slate-800 bg-slate-950/50 shrink-0">
        <div className="flex items-center gap-1 font-mono text-[10px] text-slate-500 flex-wrap">
          {chain.slice(0, activeStep + 1).map((node, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span className="text-slate-700">›</span>}
              <span
                className={
                  i === activeStep
                    ? "text-emerald-400 font-semibold"
                    : "text-slate-400"
                }
              >
                {node.name}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
