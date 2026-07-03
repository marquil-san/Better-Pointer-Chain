import { motion, AnimatePresence } from "framer-motion";
import type { MemoryNode } from "../engine/memoryEngine";
import { formatAddr, formatValue } from "../engine/traversalEngine";

interface Props {
  root: MemoryNode;
  activePath: string[];
  onNodeClick: (node: MemoryNode, path: string[]) => void;
}

function NodeRow({
  node,
  depth,
  activePath,
  currentPath,
  onNodeClick,
}: {
  node: MemoryNode;
  depth: number;
  activePath: string[];
  currentPath: string[];
  onNodeClick: (node: MemoryNode, path: string[]) => void;
}) {
  const isActive =
    currentPath.length <= activePath.length &&
    currentPath.every((p, i) => activePath[i] === p);
  const isExact = JSON.stringify(currentPath) === JSON.stringify(activePath);

  const typeColors: Record<string, string> = {
    root: "text-slate-400",
    pointer: "text-blue-400",
    value: "text-emerald-400",
    entity: "text-yellow-400",
    chunk: "text-amber-500",
  };

  const typeDotsColors: Record<string, string> = {
    root: "bg-slate-500",
    pointer: "bg-blue-500",
    value: "bg-emerald-500",
    entity: "bg-yellow-500",
    chunk: "bg-amber-500",
  };

  return (
    <>
      <motion.div
        layout
        onClick={() => onNodeClick(node, currentPath)}
        title={`${node.description ?? node.name}\n${formatAddr(node.address)} → ${formatValue(node.value)}`}
        className={`
          flex items-center gap-1.5 py-0.5 rounded cursor-pointer text-[10px]
          hover:bg-slate-700/50 transition-all group
          ${isExact ? "ring-1 ring-inset ring-emerald-500/30 bg-emerald-900/20" : ""}
        `}
        style={{ paddingLeft: 6 + depth * 12, paddingRight: 6 }}
      >
        {/* connector tick */}
        {depth > 0 && (
          <span className="text-slate-700 select-none text-[8px] shrink-0">└</span>
        )}

        <div
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${typeDotsColors[node.type]} ${isActive && !isExact ? "animate-pulse" : ""}`}
        />

        <span className={`font-mono font-semibold truncate min-w-0 ${typeColors[node.type]}`}>
          {node.name}
        </span>

        {node.offset !== undefined && (
          <span className="text-slate-700 font-mono text-[8px] shrink-0">
            +{("0x" + node.offset.toString(16).toUpperCase().padStart(2, "0"))}
          </span>
        )}

        {isExact && (
          <span className="font-mono text-[9px] text-emerald-400 font-bold ml-auto shrink-0 pl-1">
            ={formatValue(node.value)}
          </span>
        )}

        {!isExact && (
          <span className="font-mono text-[8px] text-slate-600 ml-auto opacity-0 group-hover:opacity-100 transition-opacity shrink-0 pl-1">
            {formatAddr(node.address)}
          </span>
        )}
      </motion.div>

      {node.children && (
        <AnimatePresence>
          {Object.values(node.children).map((child) => (
            <NodeRow
              key={child.address}
              node={child}
              depth={depth + 1}
              activePath={activePath}
              currentPath={[...currentPath, child.name]}
              onNodeClick={onNodeClick}
            />
          ))}
        </AnimatePresence>
      )}
    </>
  );
}

export function MemoryGraphView({ root, activePath, onNodeClick }: Props) {
  return (
    <div className="h-full flex flex-col bg-slate-900/50 rounded-lg border border-slate-700 overflow-hidden">
      <div className="px-3 py-2 border-b border-slate-700 bg-slate-900 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span className="text-[10px] font-mono text-slate-300 font-semibold uppercase tracking-wider">
            Memory View
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1 text-[8px] font-mono text-slate-600">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />ptr</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />val</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-yellow-500 inline-block" />entity</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />chunk</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-1 min-h-0">
        <NodeRow
          node={root}
          depth={0}
          activePath={activePath}
          currentPath={[root.name]}
          onNodeClick={onNodeClick}
        />
      </div>
    </div>
  );
}
