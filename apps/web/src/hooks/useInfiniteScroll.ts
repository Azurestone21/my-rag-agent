import { useEffect, useRef } from 'react';

interface UseInfiniteScrollOptions {
  /** 距离底部多少像素时触发加载 */
  threshold?: number;
  /** 是否还有更多数据 */
  hasMore: boolean;
  /** 是否正在加载中 */
  loading: boolean;
  /** 触发加载的回调函数 */
  onLoadMore: () => void;
}

export function useInfiniteScroll({
  threshold = 100,
  hasMore,
  loading,
  onLoadMore,
}: UseInfiniteScrollOptions) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 如果已经没有更多数据，或者正在加载中，则不监听
    if (!hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // 如果滚动容器底部出现在视口中，触发加载
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      {
        root: container, // 指定滚动容器
        rootMargin: `0px 0px ${threshold}px 0px`, // 提前触发
        threshold: 0.1,
      }
    );

    // 观察滚动容器底部，判断是否触底
    const sentinel = document.createElement('div');
    container.appendChild(sentinel);
    observer.observe(sentinel);

    return () => {
      observer.disconnect();
      if (sentinel.parentNode === container) {
        container.removeChild(sentinel);
      }
    };
  }, [hasMore, loading, onLoadMore, threshold]);

  return containerRef;
}