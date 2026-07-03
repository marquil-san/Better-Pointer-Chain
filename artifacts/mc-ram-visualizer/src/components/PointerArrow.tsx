import { motion } from "framer-motion";

interface Props {
  active?: boolean;
  visited?: boolean;
}

export function PointerArrow({ active, visited }: Props) {
  const color = active
    ? "#FACC15"
    : visited
    ? "#3B82F6"
    : "#475569";

  return (
    <div className="flex items-center justify-center w-16 flex-shrink-0">
      <svg width="64" height="24" viewBox="0 0 64 24" fill="none">
        <motion.line
          x1="4"
          y1="12"
          x2="52"
          y2="12"
          stroke={color}
          strokeWidth={active ? 2.5 : 1.5}
          strokeDasharray={active ? "none" : "4 3"}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
        />
        <motion.polygon
          points="52,6 62,12 52,18"
          fill={color}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, delay: 0.3 }}
        />
        {active && (
          <motion.circle
            cx="28"
            cy="12"
            r="3"
            fill="#FACC15"
            animate={{ cx: [8, 50, 8] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          />
        )}
      </svg>
    </div>
  );
}
