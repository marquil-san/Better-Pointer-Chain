import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import {
  buildMemoryLayout,
  getAllPaths,
  getChainNodes,
  resolvePathInTree,
  AUTO_CHAINS,
  type Dimension,
  type MemoryNode,
} from "../engine/memoryEngine";
import { buildDebugLogs, buildTraversalSteps } from "../engine/traversalEngine";
import { MemoryGraphView } from "../components/MemoryGraphView";
import { ChainExplorer } from "../components/ChainExplorer";
import { DebugConsole } from "../components/DebugConsole";
import { ControlPanel } from "../components/ControlPanel";
import { InterruptConsole } from "../components/InterruptConsole";

export default function Visualizer() {
  const [dimension, setDimension] = useState<Dimension>("overworld");
  const [root, setRoot] = useState<MemoryNode>(() => buildMemoryLayout("overworld"));
  const [allPaths, setAllPaths] = useState<string[]>([]);

  const [isRunning, setIsRunning] = useState(true);
  const [isInterrupted, setIsInterrupted] = useState(false);
  const [showInterrupt, setShowInterrupt] = useState(false);
  const [speed, setSpeed] = useState(1000);

  const [chainIndex, setChainIndex] = useState(0);
  const [currentChain, setCurrentChain] = useState<MemoryNode[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const [chainName, setChainName] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [activePath, setActivePath] = useState<string[]>(["base"]);

  const stepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chainTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRunningRef = useRef(isRunning);
  const isInterruptedRef = useRef(isInterrupted);
  const speedRef = useRef(speed);

  isRunningRef.current = isRunning;
  isInterruptedRef.current = isInterrupted;
  speedRef.current = speed;

  useEffect(() => {
    const newRoot = buildMemoryLayout(dimension);
    setRoot(newRoot);
    const paths = getAllPaths(newRoot);
    setAllPaths(paths);
    addLog(`[INFO] Dimension changed to: ${dimension}`);
    addLog(`[INFO] Memory layout reloaded — ${paths.length} paths available`);
  }, [dimension]);

  useEffect(() => {
    const paths = getAllPaths(root);
    setAllPaths(paths);
  }, [root]);

  function addLog(msg: string) {
    setLogs((prev) => [...prev.slice(-300), msg]);
  }

  function addLogs(msgs: string[]) {
    setLogs((prev) => [...prev.slice(-300), ...msgs]);
  }

  function clearLogs() {
    setLogs([]);
    addLog("[INFO] Console cleared");
  }

  function startChain(chainParts: string[], name?: string, customRoot?: MemoryNode) {
    const r = customRoot ?? root;
    const chain = getChainNodes(r, chainParts);
    const chainLabel = name ?? chainParts.join(".");

    setCurrentChain(chain);
    setActiveStep(0);
    setChainName(chainLabel);
    if (chain.length > 0) setActivePath([chain[0].name]);

    const debugMsgs = buildDebugLogs(chain, chainLabel);
    addLogs(debugMsgs);
  }

  const advanceStep = useCallback(() => {
    if (!isRunningRef.current || isInterruptedRef.current) return;

    setCurrentChain((chain) => {
      setActiveStep((prev) => {
        const next = prev + 1;
        if (next < chain.length) {
          setActivePath(chain.slice(0, next + 1).map((n) => n.name));
        }
        return next;
      });
      return chain;
    });
  }, []);

  useEffect(() => {
    if (!isRunning || isInterrupted || currentChain.length === 0) return;

    if (activeStep >= currentChain.length - 1) {
      chainTimerRef.current = setTimeout(() => {
        if (!isRunningRef.current || isInterruptedRef.current) return;
        const nextIndex = (chainIndex + 1) % AUTO_CHAINS.length;
        setChainIndex(nextIndex);
        startChain(AUTO_CHAINS[nextIndex]);
      }, speed * 1.5);
      return;
    }

    stepTimerRef.current = setTimeout(advanceStep, speed);
    return () => {
      if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
    };
  }, [activeStep, isRunning, isInterrupted, speed, currentChain, chainIndex]);

  useEffect(() => {
    if (root && currentChain.length === 0) {
      addLog("[INFO] Minecraft RAM Pointer Visualizer initialized");
      addLog("[INFO] Simulated memory layout loaded");
      addLog(`[INFO] Auto-traverse mode: ${AUTO_CHAINS.length} chains queued`);
      startChain(AUTO_CHAINS[0]);
    }
  }, [root]);

  function handleInterrupt() {
    setIsInterrupted(true);
    setIsRunning(false);
    if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
    if (chainTimerRef.current) clearTimeout(chainTimerRef.current);
    setShowInterrupt(true);
    addLog("[INTERRUPT] Execution paused — waiting for user input");
  }

  function handleResume() {
    setIsInterrupted(false);
    setIsRunning(true);
    setShowInterrupt(false);
    addLog("[INFO] Execution resumed");
  }

  function handleJumpTo(pathStr: string) {
    setShowInterrupt(false);

    const parts = pathStr.toLowerCase().split(".");
    const chain = resolvePathInTree(root, pathStr);

    if (!chain || chain.length < 2) {
      addLog(`[ERROR] Invalid path: "${pathStr}" — not found`);
      const suggestions = allPaths
        .filter((p) => p.toLowerCase().includes(parts[parts.length - 1]))
        .slice(0, 3);
      if (suggestions.length > 0) {
        addLog(`[SUGGEST] Did you mean: ${suggestions.join(", ")}?`);
      }
      return;
    }

    addLog(`[INTERRUPT] Jumping to: ${pathStr}`);
    setCurrentChain(chain);
    setActiveStep(0);
    setChainName(pathStr);
    setActivePath([chain[0].name]);

    addLogs(buildDebugLogs(chain, pathStr));
    setIsInterrupted(false);
    setIsRunning(true);
  }

  function handleNodeClick(_node: MemoryNode, path: string[]) {
    const pathStr = path.slice(1).join(".");
    if (!pathStr) return;
    handleJumpTo(pathStr);
  }

  function handleToggleRun() {
    if (isRunning) {
      setIsRunning(false);
      if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
      addLog("[INFO] Execution paused");
    } else {
      setIsRunning(true);
      addLog("[INFO] Execution resumed");
    }
  }

  function handleDimensionChange(dim: Dimension) {
    setDimension(dim);
    setCurrentChain([]);
    setActiveStep(0);
    setChainIndex(0);
  }

  const steps = buildTraversalSteps(currentChain);

  return (
    <div className="h-[100dvh] w-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden">
      {/* ── Header ── */}
      <header className="flex items-center gap-2 px-3 py-2 border-b border-slate-800 bg-slate-900/80 backdrop-blur shrink-0 flex-wrap">
        <span className="text-lg shrink-0">⛏</span>
        <div className="min-w-0">
          <h1 className="font-mono font-bold text-xs sm:text-sm text-slate-100 tracking-tight truncate">
            Minecraft RAM Pointer Visualizer
          </h1>
          <p className="font-mono text-[8px] sm:text-[9px] text-slate-500 tracking-widest uppercase hidden sm:block">
            Memory Debugger · Pointer Chain Traversal
          </p>
        </div>

        <div className="ml-auto flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded px-2 py-1">
            <div className={`w-1.5 h-1.5 rounded-full ${
              isInterrupted ? "bg-orange-500 animate-pulse"
              : isRunning ? "bg-emerald-500 animate-pulse"
              : "bg-slate-600"
            }`} />
            <span className="font-mono text-[9px] text-slate-400">
              {isInterrupted ? "INTERRUPTED" : isRunning ? "LIVE" : "PAUSED"}
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={isInterrupted ? handleResume : handleInterrupt}
            className={`px-3 py-1.5 rounded-lg font-mono font-bold text-[11px] transition-all ${
              isInterrupted
                ? "bg-emerald-700 hover:bg-emerald-600 text-white"
                : "bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-900/40"
            }`}
          >
            {isInterrupted ? "▶ Resume" : "⚡ Interrupt"}
          </motion.button>
        </div>
      </header>

      {/* ── Main resizable layout ── */}
      <div className="flex-1 min-h-0 p-2 sm:p-3">
        <ResizablePanelGroup direction="horizontal" className="h-full gap-2 rounded-lg">

          {/* Left — Memory Tree */}
          <ResizablePanel defaultSize={18} minSize={10} maxSize={32} className="min-w-0">
            <MemoryGraphView
              root={root}
              activePath={activePath}
              onNodeClick={handleNodeClick}
            />
          </ResizablePanel>

          <ResizableHandle withHandle className="bg-slate-800 hover:bg-slate-600 transition-colors mx-0.5 rounded-full w-1.5" />

          {/* Center — Chain + Steps + Console */}
          <ResizablePanel defaultSize={62} minSize={35} className="min-w-0">
            <ResizablePanelGroup direction="vertical" className="h-full gap-2">

              {/* Chain Explorer */}
              <ResizablePanel defaultSize={42} minSize={22} className="min-h-0">
                <ChainExplorer
                  chain={currentChain}
                  activeStep={activeStep}
                  chainName={chainName}
                />
              </ResizablePanel>

              <ResizableHandle withHandle className="bg-slate-800 hover:bg-slate-600 transition-colors my-0.5 rounded-full h-1.5" />

              {/* Dereference Steps */}
              <ResizablePanel defaultSize={20} minSize={12} maxSize={35} className="min-h-0">
                <div className="h-full flex flex-col bg-slate-900/50 rounded-lg border border-slate-700 overflow-hidden">
                  <div className="px-3 py-1.5 border-b border-slate-700 bg-slate-900 flex items-center gap-2 shrink-0">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 shrink-0" />
                    <span className="text-[10px] font-mono text-slate-300 font-semibold uppercase tracking-wider whitespace-nowrap">
                      Dereference Steps
                    </span>
                  </div>
                  <div className="flex-1 overflow-x-auto overflow-y-hidden p-2 flex gap-2 items-center min-h-0">
                    <AnimatePresence>
                      {steps.map((step, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`shrink-0 rounded border px-2 py-1.5 font-mono text-[9px] leading-tight min-w-[100px] max-w-[180px]
                            ${i < activeStep
                              ? "border-blue-700 bg-blue-900/20 text-blue-300"
                              : i === activeStep
                              ? activeStep === steps.length - 1
                                ? "border-emerald-500 bg-emerald-900/30 text-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.2)]"
                                : "border-yellow-500 bg-yellow-900/20 text-yellow-300 shadow-[0_0_8px_rgba(250,204,21,0.2)]"
                              : "border-slate-700 bg-slate-800/40 text-slate-500"
                            }`}
                        >
                          <div className="text-slate-600 mb-0.5 text-[8px]">Step {step.stepNumber}</div>
                          <div className="break-all">{step.action}</div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle className="bg-slate-800 hover:bg-slate-600 transition-colors my-0.5 rounded-full h-1.5" />

              {/* Debug Console */}
              <ResizablePanel defaultSize={38} minSize={15} className="min-h-0">
                <DebugConsole logs={logs} onClear={clearLogs} />
              </ResizablePanel>

            </ResizablePanelGroup>
          </ResizablePanel>

          <ResizableHandle withHandle className="bg-slate-800 hover:bg-slate-600 transition-colors mx-0.5 rounded-full w-1.5" />

          {/* Right — Control Panel */}
          <ResizablePanel defaultSize={20} minSize={14} maxSize={32} className="min-w-0">
            <div className="h-full overflow-y-auto">
              <ControlPanel
                isRunning={isRunning}
                isInterrupted={isInterrupted}
                speed={speed}
                dimension={dimension}
                onToggleRun={handleToggleRun}
                onInterrupt={handleInterrupt}
                onResume={handleResume}
                onSpeedChange={setSpeed}
                onDimensionChange={handleDimensionChange}
                currentChainName={chainName}
                stepIndex={activeStep}
                totalSteps={currentChain.length}
              />
            </div>
          </ResizablePanel>

        </ResizablePanelGroup>
      </div>

      <InterruptConsole
        isOpen={showInterrupt}
        onClose={() => {
          setShowInterrupt(false);
          handleResume();
        }}
        onSubmit={handleJumpTo}
        suggestions={allPaths}
      />
    </div>
  );
}
