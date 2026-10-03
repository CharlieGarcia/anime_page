import { useEffect, useRef } from 'react';

// Calls onReachEnd whenever the returned sentinel element scrolls into view while enabled
export function useInfiniteScroll<T extends Element>(onReachEnd: () => void, enabled: boolean) {
  const sentinelRef = useRef<T | null>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !enabled) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onReachEnd();
      },
      { root: null, threshold: 0.1 }
    );
    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [onReachEnd, enabled]);

  return sentinelRef;
}
