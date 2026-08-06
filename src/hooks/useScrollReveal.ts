import { useEffect, useRef } from "react";

/**
 * Hook that adds a "revealed" class to elements with ".reveal" or ".reveal-scale"
 * when they enter the viewport using IntersectionObserver.
 */
export function useScrollReveal(rootMargin = "-60px") {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const targets = container.querySelectorAll(".reveal, .reveal-scale");
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin, threshold: 0.08 },
    );

    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [rootMargin]);

  return containerRef;
}
