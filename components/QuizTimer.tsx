"use client";

import { useEffect, useState, useRef } from "react";

interface QuizTimerProps {
  timeLimit: number;
  endTime?: number;
  onTimeUp?: () => void;
}

export default function QuizTimer({ timeLimit, endTime, onTimeUp }: QuizTimerProps) {
  const [timeLeft, setTimeLeft] = useState(() => Math.max(0, timeLimit));
  const onTimeUpRef = useRef(onTimeUp);
  const hasCalledTimeUpRef = useRef(false);

  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  useEffect(() => {
    const deadline = endTime ?? Date.now() + Math.max(0, timeLimit) * 1000;
    hasCalledTimeUpRef.current = false;

    const updateTimer = () => {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0 && !hasCalledTimeUpRef.current) {
        hasCalledTimeUpRef.current = true;
        onTimeUpRef.current?.();
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 250);

    return () => clearInterval(timer);
  }, [timeLimit, endTime]);

  return <span>{timeLeft}</span>;
}
