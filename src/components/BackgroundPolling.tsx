'use client';

import { useEffect, useRef } from 'react';
import { setupReplayPolling, stopReplayPolling } from '@/lib/cron';

export function BackgroundPolling(): null {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Set up polling on client-side only
    intervalRef.current = setupReplayPolling();

    // Clean up on unmount
    return () => {
      if (intervalRef.current) {
        stopReplayPolling(intervalRef.current);
      }
    };
  }, []);

  // This component doesn't render anything
  return null;
} 