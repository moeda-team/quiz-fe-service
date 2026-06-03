"use client";

import { useLayoutEffect, useState, useRef } from "react";

interface QuizTimerProps {
  timeLimit: number;
  onTimeUp?: () => void;
}

export default function QuizTimer({ timeLimit, onTimeUp }: QuizTimerProps) {
  const [timeLeft, setTimeLeft] = useState(0);
  const timeLimitRef = useRef(0);
  const shouldResetRef = useRef(false);
  const hasCalledTimeUpRef = useRef(false);

  useLayoutEffect(() => {
    if (timeLimit <= 0) {
      timeLimitRef.current = 0;
      shouldResetRef.current = false;
      hasCalledTimeUpRef.current = false;
      return;
    }

    timeLimitRef.current = timeLimit;
    shouldResetRef.current = true;
    hasCalledTimeUpRef.current = false;

    setTimeLeft(timeLimit);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (shouldResetRef.current) {
          shouldResetRef.current = false;
          hasCalledTimeUpRef.current = false;
          return timeLimitRef.current;
        }
        const newTime = Math.max(0, prev - 1);
        if (newTime === 0 && !hasCalledTimeUpRef.current && onTimeUp) {
          hasCalledTimeUpRef.current = true;
          onTimeUp();
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLimit, onTimeUp]);

  return <span>{timeLeft}s</span>;
}
