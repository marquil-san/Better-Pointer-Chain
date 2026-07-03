export type MemoryNode = {
  name: string;
  address: number;
  value: number | string;
  children?: Record<string, MemoryNode>;
  offset?: number;
  type: "pointer" | "value" | "entity" | "chunk" | "root";
  description?: string;
};

export type MemoryMap = Map<number, number | string>;

function hex(n: number): string {
  return "0x" + n.toString(16).toUpperCase().padStart(4, "0");
}

export function hexAddr(n: number): string {
  return hex(n);
}

export const DIMENSION_DATA = {
  overworld: { id: 0, color: "#4CAF50", fogColor: "#87CEEB" },
  nether: { id: -1, color: "#FF5722", fogColor: "#FF6B35" },
  end: { id: 1, color: "#9C27B0", fogColor: "#4A148C" },
};

export type Dimension = keyof typeof DIMENSION_DATA;

//
// 🔥 ENTITY BUILDER
//
function makeHumanoidEntity(name: string, base: number): MemoryNode {
  return {
    name,
    address: base,
    value: base + 0x100,
    type: "entity",
    children: {
      health: { name: "health", address: base + 0x100, value: 20, type: "value" },
      maxHealth: { name: "maxHealth", address: base + 0x102, value: 20, type: "value" },

      position: {
        name: "position",
        address: base + 0x110,
        value: base + 0x200,
        type: "pointer",
        children: {
          x: { name: "x", address: base + 0x200, value: 10, type: "value" },
          y: { name: "y", address: base + 0x204, value: 64, type: "value" },
          z: { name: "z", address: base + 0x208, value: 10, type: "value" },
        },
      },

      velocity: {
        name: "velocity",
        address: base + 0x120,
        value: base + 0x300,
        type: "pointer",
        children: {
          dx: { name: "dx", address: base + 0x300, value: 0, type: "value" },
          dy: { name: "dy", address: base + 0x304, value: -0.08, type: "value" },
          dz: { name: "dz", address: base + 0x308, value: 0, type: "value" },
        },
      },

      rotation: {
        name: "rotation",
        address: base + 0x130,
        value: base + 0x400,
        type: "pointer",
        children: {
          yaw: { name: "yaw", address: base + 0x400, value: 90, type: "value" },
          pitch: { name: "pitch", address: base + 0x404, value: 0, type: "value" },
        },
      },

      state: {
        name: "state",
        address: base + 0x140,
        value: base + 0x500,
        type: "pointer",
        children: {
          isOnGround: { name: "isOnGround", address: base + 0x500, value: "true", type: "value" },
          isInAir: { name: "isInAir", address: base + 0x501, value: "false", type: "value" },
          isBurning: { name: "isBurning", address: base + 0x502, value: "false", type: "value" },
          isInWater: { name: "isInWater", address: base + 0x503, value: "false", type: "value" },
          isSprinting: { name: "isSprinting", address: base + 0x504, value: "false", type: "value" },
        },
      },

      timers: {
        name: "timers",
        address: base + 0x150,
        value: base + 0x600,
        type: "pointer",
        children: {
          hurtTime: { name: "hurtTime", address: base + 0x600, value: 0, type: "value" },
          deathTime: { name: "deathTime", address: base + 0x604, value: 0, type: "value" },
          attackCooldown: { name: "attackCooldown", address: base + 0x608, value: 10, type: "value" },
        },
      },

      ai: {
        name: "ai",
        address: base + 0x160,
        value: base + 0x700,
        type: "pointer",
        children: {
          state: { name: "state", address: base + 0x700, value: "idle", type: "value" },
          target: { name: "target", address: base + 0x704, value: "player", type: "value" },
          aggression: { name: "aggression", address: base + 0x708, value: 50, type: "value" },
        },
      },

      environment: {
        name: "environment",
        address: base + 0x170,
        value: base + 0x800,
        type: "pointer",
        children: {
          lightLevel: { name: "lightLevel", address: base + 0x800, value: 15, type: "value" },
          blockBelow: { name: "blockBelow", address: base + 0x804, value: "grass", type: "value" },
        },
      },
    },
  };
}

function makeCreeper(name: string, base: number): MemoryNode {
  const e = makeHumanoidEntity(name, base);
  e.children = {
    ...e.children,
    fuse: { name: "fuse", address: base + 0x900, value: 30, type: "value" },
    explosionRadius: { name: "explosionRadius", address: base + 0x904, value: 3, type: "value" },
    charged: { name: "charged", address: base + 0x908, value: "false", type: "value" },
  };
  return e;
}

//
// 🔥 PLAYER BUILDER
//
function makePlayer(base: number): Record<string, MemoryNode> {
  return {
    health: { name: "health", address: base, value: 20, type: "value" },
    hunger: { name: "hunger", address: base + 0x4, value: 18, type: "value" },
    xp: { name: "xp", address: base + 0x8, value: 42, type: "value" },

    position: {
      name: "position",
      address: base + 0x10,
      value: base + 0x100,
      type: "pointer",
      children: {
        x: { name: "x", address: base + 0x100, value: 128, type: "value" },
        y: { name: "y", address: base + 0x104, value: 64, type: "value" },
        z: { name: "z", address: base + 0x108, value: 256, type: "value" },
      },
    },

    inventory: {
      name: "inventory",
      address: base + 0x20,
      value: base + 0x200,
      type: "pointer",
      children: Object.fromEntries(
        Array.from({ length: 20 }).map((_, i) => [
          `slot${i}`,
          {
            name: `slot${i}`,
            address: base + 0x200 + i * 4,
            value: `item_${i}`,
            type: "value",
          },
        ])
      ),
    },

    armor: {
      name: "armor",
      address: base + 0x300,
      value: base + 0x400,
      type: "pointer",
      children: {
        helmet: { name: "helmet", address: base + 0x400, value: "diamond", type: "value" },
        chestplate: { name: "chestplate", address: base + 0x404, value: "diamond", type: "value" },
        leggings: { name: "leggings", address: base + 0x408, value: "diamond", type: "value" },
        boots: { name: "boots", address: base + 0x40C, value: "diamond", type: "value" },
      },
    },

    abilities: {
      name: "abilities",
      address: base + 0x500,
      value: base + 0x600,
      type: "pointer",
      children: {
        canFly: { name: "canFly", address: base + 0x600, value: "false", type: "value" },
        isFlying: { name: "isFlying", address: base + 0x604, value: "false", type: "value" },
        speed: { name: "speed", address: base + 0x608, value: 0.1, type: "value" },
      },
    },

    stats: {
      name: "stats",
      address: base + 0x700,
      value: base + 0x800,
      type: "pointer",
      children: {
        kills: { name: "kills", address: base + 0x800, value: 50, type: "value" },
        deaths: { name: "deaths", address: base + 0x804, value: 3, type: "value" },
        playTime: { name: "playTime", address: base + 0x808, value: 9999, type: "value" },
      },
    },
  };
}

//
// 🔥 MAIN MEMORY TREE
//
export function buildMemoryLayout(dimension: Dimension = "overworld"): MemoryNode {
  const dimData = DIMENSION_DATA[dimension];

  return {
    name: "base",
    address: 0x1000,
    value: 0x2000,
    type: "root",
    children: {
      minecraft: {
        name: "minecraft",
        address: 0x2000,
        value: 0x3000,
        type: "pointer",
        children: {
          world: {
            name: "world",
            address: 0x3000,
            value: 0x4000,
            type: "pointer",
            children: {
              dimension: {
                name: "dimension",
                address: 0x4000,
                value: dimData.id,
                type: "value",
              },

              entities: {
                name: "entities",
                address: 0x4100,
                value: 0x5000,
                type: "pointer",
                children: {
                  zombie1: makeHumanoidEntity("zombie1", 0x5000),
                  skeleton1: makeHumanoidEntity("skeleton1", 0x5200),
                  creeper1: makeCreeper("creeper1", 0x5400),
                },
              },
            },
          },

          localPlayer: {
            name: "localPlayer",
            address: 0x8000,
            value: 0x9000,
            type: "pointer",
            children: makePlayer(0x9000),
          },
        },
      },
    },
  };
}

export function resolvePathInTree(
  root: MemoryNode,
  pathStr: string
): MemoryNode[] | null {
  const parts = pathStr.toLowerCase().split(".");
  const chain = getChainNodes(root, parts);
  return chain.length > 1 ? chain : null;
}

export function getAllPaths(root: MemoryNode, prefix = ""): string[] {
  const paths: string[] = [];
  const currentPath = prefix ? `${prefix}.${root.name}` : root.name;
  if (prefix) paths.push(currentPath);

  if (root.children) {
    for (const child of Object.values(root.children)) {
      paths.push(...getAllPaths(child, currentPath));
    }
  }
  return paths;
}

export const AUTO_CHAINS: string[][] = [
  ["localPlayer", "health"],
  ["world", "entities", "creeper1"],
  ["world", "chunks", "chunk_0_0"],
  ["localPlayer", "position"],
  ["world", "entities", "zombie1"],
  ["localPlayer", "inventory"],
  ["world", "dimension"],
  ["world", "chunks", "chunk_0_1"],
  ["localPlayer", "hunger"],
  ["localPlayer", "velocity"],
];

function findNodeDeep(node: MemoryNode, name: string): MemoryNode | null {
  if (node.name.toLowerCase() === name.toLowerCase()) return node;
  if (!node.children) return null;
  for (const child of Object.values(node.children)) {
    const found = findNodeDeep(child, name);
    if (found) return found;
  }
  return null;
}

function getPathToNode(root: MemoryNode, target: string): MemoryNode[] | null {
  if (root.name.toLowerCase() === target.toLowerCase()) return [root];
  if (!root.children) return null;
  for (const child of Object.values(root.children)) {
    const path = getPathToNode(child, target);
    if (path) return [root, ...path];
  }
  return null;
}

export function getChainNodes(root: MemoryNode, chainParts: string[]): MemoryNode[] {
  if (chainParts.length === 0) return [root];

  const firstPart = chainParts[0];
  const fullPath = getPathToNode(root, firstPart);
  if (!fullPath) return [root];

  const chain: MemoryNode[] = fullPath;
  let current = chain[chain.length - 1];

  for (let i = 1; i < chainParts.length; i++) {
    if (!current.children) break;
    const part = chainParts[i];
    const found = Object.values(current.children).find(
      (c) => c.name.toLowerCase() === part.toLowerCase()
    );
    if (!found) break;
    chain.push(found);
    current = found;
  }

  return chain;
}
