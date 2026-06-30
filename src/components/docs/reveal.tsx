"use client";

import { useGsapContext } from "@/lib/use-gsap";

/**
 * Wraps a block of docs content and reveals direct children with a subtle
 * scroll-triggered fade-up. Falls back to fully-visible static content when the
 * user prefers reduced motion (the GSAP hook is skipped).
 */
export function Reveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const scope = useGsapContext(({ gsap }) => {
    const items = gsap.utils.toArray<HTMLElement>("[data-reveal]");
    items.forEach((el) => {
      gsap.from(el, {
        autoAlpha: 0,
        y: 20,
        duration: 0.5,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          toggleActions: "play none none none",
        },
      });
    });
  }, []);

  return (
    <div ref={scope} className={className}>
      {children}
    </div>
  );
}
