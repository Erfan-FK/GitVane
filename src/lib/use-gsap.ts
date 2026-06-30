"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;
function ensureRegistered() {
  if (!registered && typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
}

/** True when the user has asked for reduced motion. */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Scope GSAP animations to a container ref. The `setup` callback receives the
 * scoped `gsap.context` selector helper and runs inside a context that is
 * reverted automatically on unmount. Animations are skipped entirely when the
 * user prefers reduced motion, so markup must render in a usable final state.
 */
export function useGsapContext(
  setup: (ctx: { gsap: typeof gsap; ScrollTrigger: typeof ScrollTrigger }) => void,
  deps: React.DependencyList = [],
) {
  const scope = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    if (prefersReducedMotion()) return;
    ensureRegistered();

    const ctx = gsap.context(() => {
      setup({ gsap, ScrollTrigger });
    }, scope);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return scope;
}

export { gsap, ScrollTrigger };
