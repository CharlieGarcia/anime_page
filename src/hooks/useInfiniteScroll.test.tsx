import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { useInfiniteScroll } from './useInfiniteScroll';

type ObserverCallback = (entries: { isIntersecting: boolean }[]) => void;

// Stand-in for the browser's IntersectionObserver, which jsdom does not provide
class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];

  observed: Element[] = [];
  disconnected = false;

  constructor(private callback: ObserverCallback) {
    FakeIntersectionObserver.instances.push(this);
  }

  observe(element: Element) {
    this.observed.push(element);
  }

  disconnect() {
    this.disconnected = true;
  }

  // Simulates the sentinel entering or leaving the viewport
  trigger(isIntersecting: boolean) {
    this.callback([{ isIntersecting }]);
  }
}

function Sentinel({
  onReachEnd,
  enabled
}: {
  onReachEnd: () => void;
  enabled: boolean;
}) {
  const ref = useInfiniteScroll<HTMLDivElement>(onReachEnd, enabled);
  return <div ref={ref} data-testid="sentinel" />;
}

const observers = () => FakeIntersectionObserver.instances;

beforeEach(() => {
  FakeIntersectionObserver.instances = [];
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('useInfiniteScroll', () => {
  it('observes the sentinel element when enabled', () => {
    const { getByTestId } = render(<Sentinel onReachEnd={vi.fn()} enabled />);

    expect(observers()).toHaveLength(1);
    expect(observers()[0].observed).toEqual([getByTestId('sentinel')]);
  });

  it('calls onReachEnd when the sentinel scrolls into view', () => {
    const onReachEnd = vi.fn();
    render(<Sentinel onReachEnd={onReachEnd} enabled />);

    observers()[0].trigger(true);

    expect(onReachEnd).toHaveBeenCalledTimes(1);
  });

  it('ignores the sentinel leaving the view', () => {
    const onReachEnd = vi.fn();
    render(<Sentinel onReachEnd={onReachEnd} enabled />);

    observers()[0].trigger(false);

    expect(onReachEnd).not.toHaveBeenCalled();
  });

  it('does not observe while disabled', () => {
    render(<Sentinel onReachEnd={vi.fn()} enabled={false} />);

    expect(observers()).toHaveLength(0);
  });

  it('stops observing when it becomes disabled', () => {
    const onReachEnd = vi.fn();
    const { rerender } = render(<Sentinel onReachEnd={onReachEnd} enabled />);

    rerender(<Sentinel onReachEnd={onReachEnd} enabled={false} />);

    expect(observers()).toHaveLength(1);
    expect(observers()[0].disconnected).toBe(true);
  });

  it('stops observing on unmount', () => {
    const { unmount } = render(<Sentinel onReachEnd={vi.fn()} enabled />);

    unmount();

    expect(observers()[0].disconnected).toBe(true);
  });
});
