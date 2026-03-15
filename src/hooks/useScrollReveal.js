import { useEffect, useRef } from 'react';

/**
 * Adds 'is-visible' class to children as they scroll into view.
 * Returns a ref to attach to the container element.
 * Uses MutationObserver to detect dynamically added .reveal elements.
 */
export function useScrollReveal(options = {}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const threshold = options.threshold || 0.15;
    const rootMargin = options.rootMargin || '0px 0px -50px 0px';

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin }
    );

    // Observe all current .reveal elements
    const observeAll = () => {
      container.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => {
        io.observe(el);
      });
    };

    observeAll();

    // Watch for new .reveal elements added to the DOM
    const mo = new MutationObserver(() => observeAll());
    mo.observe(container, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [options.threshold, options.rootMargin]);

  return containerRef;
}
