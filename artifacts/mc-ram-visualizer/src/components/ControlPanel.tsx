import { motion } from "framer-motion";
import type { Dimension } from "../engine/memoryEngine";
import { DIMENSION_DATA } from "../engine/memoryEngine";

interface Props {
  isRunning: boolean;
  isInterrupted: boolean;
  speed: number;
  dimension: Dimension;
  onToggleRun: () => void;
  onInterrupt: () => void;
  onResume: () => void;
  onSpeedChange: (s: number) => void;
  onDimensionChange: (d: Dimension) => void;
  currentChainName: string;
  stepIndex: number;
  totalSteps: number;
}

const SPEEDS = [
  { label: "0.5×", value: 2000 },
  { label: "1×", value: 1000 },
  { label: "2×", value: 500 },
  { label: "4×", value: 250 },
];

export function ControlPanel({
  isRunning,
  isInterrupted,
  speed,
  dimension,
  onToggleRun,
  onInterrupt,
  onResume,
  onSpeedChange,
  onDimensionChange,
  currentChainName,
  stepIndex,
  totalSteps,
}: Props) {
  return (
    <div className="h-full bg-slate-900 border border-slate-700 rounded-lg p-3 flex flex-col gap-3 overflow-y-auto">
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-2 h-2 rounded-full bg-violet-500 shrink-0" />
        <span className="text-[10px] font-mono text-slate-300 font-semibold uppercase tracking-wider">
          Control Panel
        </span>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 bg-slate-800 rounded px-2 py-1.5 shrink-0">
        <div
          className={`w-2 h-2 rounded-full shrink-0 ${
            isInterrupted
              ? "bg-orange-500 animate-pulse"
              : isRunning
              ? "bg-emerald-500 animate-pulse"
              : "bg-slate-600"
          }`}
        />
        <span className="font-mono text-[9px] text-slate-400 truncate">
          {isInterrupted ? "INTERRUPTED" : isRunning ? "RUNNING" : "PAUSED"}
        </span>
        <span className="ml-auto font-mono text-[9px] text-slate-600 shrink-0">
          {stepIndex}/{totalSteps}
        </span>
      </div>

      {/* Chain name */}
      <div className="font-mono text-[9px] text-slate-500 truncate shrink-0" title={currentChainName}>
        <span className="text-slate-600">chain: </span>
        <span className="text-blue-400">{currentChainName || "—"}</span>
      </div>

      {/* Primary controls */}
      <div className="flex gap-1.5 shrink-0">
        <button
          onClick={onToggleRun}
          className={`flex-1 py-1.5 rounded font-mono font-bold text-[10px] transition-all ${
            isRunning
              ? "bg-slate-700 hover:bg-slate-600 text-slate-300"
              : "bg-emerald-700 hover:bg-emerald-600 text-emerald-100"
          }`}
        >
          {isRunning ? "⏸ Pause" : "▶ Run"}
        </button>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={isInterrupted ? onResume : onInterrupt}
          className={`flex-1 py-1.5 rounded font-mono font-bold text-[10px] transition-all ${
            isInterrupted
              ? "bg-emerald-700 hover:bg-emerald-600 text-emerald-100"
              : "bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-900/30"
          }`}
        >
          {isInterrupted ? "↩ Resume" : "⚡ Interrupt"}
        </motion.button>
      </div>

      {/* Speed */}
      <div className="shrink-0">
        <p className="text-[9px] font-mono text-slate-500 mb-1.5 uppercase tracking-wider">Speed</p>
        <div className="flex gap-1">
          {SPEEDS.map((s) => (
            <button
              key={s.value}
              onClick={() => onSpeedChange(s.value)}
              className={`flex-1 py-1 rounded font-mono text-[9px] transition-all ${
                speed === s.value
                  ? "bg-violet-700 text-violet-100 font-bold"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dimension */}
      <div className="shrink-0">
        <p className="text-[9px] font-mono text-slate-500 mb-1.5 uppercase tracking-wider">Dimension</p>
        <div className="flex flex-col gap-1">
          {Object.entries(DIMENSION_DATA).map(([dim, data]) => (
            <button
              key={dim}
              onClick={() => onDimensionChange(dim as Dimension)}
              className={`w-full py-1.5 px-2 rounded font-mono text-[9px] text-left transition-all flex items-center gap-1.5 ${
                dimension === dim
                  ? "bg-slate-700 text-white font-bold ring-1 ring-inset ring-slate-500"
                  : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50"
              }`}
            >
              <span
                className="w-2 h-2 rounded-sm shrink-0"
                style={{ backgroundColor: data.color }}
              />
              <span className="truncate">{dim.charAt(0).toUpperCase() + dim.slice(1)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-auto pt-2 border-t border-slate-800 shrink-0">
        <p className="text-[9px] font-mono text-slate-600 mb-1.5 uppercase tracking-wider">Legend</p>
        <div className="space-y-1">
          {[
            { color: "bg-yellow-400", label: "Active step" },
            { color: "bg-blue-500", label: "Visited ptr" },
            { color: "bg-emerald-400", label: "Final value" },
            { color: "bg-slate-600", label: "Idle node" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${color} shrink-0`} />
              <span className="font-mono text-[9px] text-slate-500">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
