import type { MemoryNode } from "./memoryEngine";

export type TraversalStep = {
  stepNumber: number;
  node: MemoryNode;
  action: string;
  isActive: boolean;
  isFinal: boolean;
};

export function buildTraversalSteps(chain: MemoryNode[]): TraversalStep[] {
  return chain.map((node, i) => {
    const isFirst = i === 0;
    const isFinal = i === chain.length - 1;
    const prev = chain[i - 1];

    let action: string;
    if (isFirst) {
      action = `base = ${formatAddr(node.address)}`;
    } else if (node.offset !== undefined && prev) {
      const addrHex = formatAddr(prev.address);
      const offHex = formatOffset(node.offset);
      const resultHex = formatAddr(node.address);
      if (isFinal && typeof node.value !== "object") {
        action = `${addrHex} +${offHex} → ${resultHex} (${node.name}) = ${formatValue(node.value)}`;
      } else {
        action = `${addrHex} +${offHex} → dereference → ${resultHex} (${node.name})`;
      }
    } else {
      action = `resolve → ${formatAddr(node.address)} (${node.name})`;
    }

    return {
      stepNumber: i + 1,
      node,
      action,
      isActive: false,
      isFinal,
    };
  });
}

export function formatAddr(n: number): string {
  return "0x" + n.toString(16).toUpperCase().padStart(4, "0");
}

export function formatOffset(n: number): string {
  return "0x" + n.toString(16).toUpperCase().padStart(2, "0");
}

export function formatValue(v: number | string): string {
  if (typeof v === "number") {
    if (v > 0x1000) return "0x" + v.toString(16).toUpperCase().padStart(4, "0");
    return String(v);
  }
  return v;
}

export function buildDebugLogs(chain: MemoryNode[], chainName: string): string[] {
  const logs: string[] = [];
  logs.push(`[TRAVERSE] Starting chain: ${chainName}`);
  logs.push(`[ADDR] base = ${formatAddr(chain[0].address)}`);

  for (let i = 1; i < chain.length; i++) {
    const node = chain[i];
    const prev = chain[i - 1];
    const isFinal = i === chain.length - 1;

    if (node.offset !== undefined) {
      logs.push(
        `[STEP ${i}] +${formatOffset(node.offset)} → ${formatAddr(node.address)} (${node.name})`
      );
      if (i < chain.length - 1 || !isFinal) {
        logs.push(`[DEREF] *${formatAddr(node.address)} → ${formatAddr(Number(node.value))}`);
      }
      if (isFinal) {
        logs.push(`[FOUND] ${node.name} = ${formatValue(node.value)}`);
      }
    }
  }

  return logs;
}
