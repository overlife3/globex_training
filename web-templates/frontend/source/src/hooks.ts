/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef } from "react";

export function useDebounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
) {
  const timeoutId = useRef<number | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }

      timeoutId.current = setTimeout(() => {
        func(...args);
      }, wait);
    },
    [func, wait]
  );
}

export function useOutsideClick<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  callback: () => void
): void {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, callback]);
}
// временно блокирует прокрутку страницы
export function useLockBodyScroll(isLocked: boolean) {
  const scrollY = useRef(0);
  const prevStyles = useRef<Record<string, string>>({});

  useEffect(() => {
    const body = document.body;

    if (isLocked) {
      prevStyles.current = {
        position: body.style.position,
        top: body.style.top,
        left: body.style.left,
        right: body.style.right,
        overflow: body.style.overflow,
        paddingRight: body.style.paddingRight,
      };

      scrollY.current = window.pageYOffset;

      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      body.style.position = "fixed";
      body.style.top = `-${scrollY.current}px`;
      body.style.overflow = "hidden";
      body.style.left = "0";
      body.style.right = "0";
      if (scrollbarWidth > 0) {
        body.style.paddingRight = `${scrollbarWidth}px`;
      }
    } else {
      const y = scrollY.current;
      Object.entries(prevStyles.current).forEach(([key, value]) => {
        body.style[key as any] = value;
      });
      window.scrollTo(0, y);
    }

    return () => {
      Object.entries(prevStyles.current).forEach(([key, value]) => {
        document.body.style[key as any] = value;
      });
    };
  }, [isLocked]);
}
