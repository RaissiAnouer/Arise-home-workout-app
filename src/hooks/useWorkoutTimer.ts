import { useState, useEffect, useRef } from 'react';
import { formatDuration } from '../utils/workoutStats';

interface UseWorkoutTimerProps {
  initialSeconds?: number;
  isPaused?: boolean;
  onTick?: (seconds: number) => void;
}

export function useWorkoutTimer({
  initialSeconds = 0,
  isPaused = false,
  onTick,
}: UseWorkoutTimerProps = {}) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  useEffect(() => {
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setSeconds((prev) => {
        const next = prev + 1;
        if (onTickRef.current) {
          onTickRef.current(next);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused]);

  return {
    seconds,
    formattedTimer: formatDuration(seconds),
    setSeconds,
  };
}
