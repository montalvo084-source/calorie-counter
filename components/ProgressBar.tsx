"use client";

import { useEffect, useRef, useState } from "react";

interface ProgressBarProps {
  value: number;
  max: number;
  overColor?: string;
}

export default function ProgressBar({ value, max, overColor = "bg-danger" }: ProgressBarProps) {
  const [width, setWidth] = useState(0);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      setTimeout(() => {
        setWidth(Math.min(100, Math.round((value / max) * 100)));
      }, 50);
    } else {
      setWidth(Math.min(100, Math.round((value / max) * 100)));
    }
  }, [value, max]);

  const isOver = value > max;
  const barColor = isOver ? overColor : width >= 100 ? "bg-success" : "bg-accent";

  return (
    <div className="h-2 rounded-full bg-border overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
        style={{ width: `${width}%`, transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
      />
    </div>
  );
}
