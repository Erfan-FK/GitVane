import { cn } from "@/lib/utils";

/**
 * GitVane brand mark: a navigation / send arrow fused with a git branch
 * (a connector line with two commit nodes). Uses `currentColor` so it adapts
 * to light/dark themes. Recreated as clean vector geometry from the source PNG.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-7", className)}
      aria-hidden="true"
    >
      {/* Arrow / paper-plane head pointing up-right, with a notch where the
          branch line meets it. */}
      <path
        d="M26.4 4.6 9.7 10.2c-1.6.55-1.9 2.69-.5 3.66l3.5 2.4-.02.02a4.2 4.2 0 0 1 4.84 4.84l.02-.02 2.4 3.5c.97 1.4 3.11 1.1 3.66-.5l5.6-16.7c.5-1.5-.92-2.92-2.4-2.4Z"
        fill="currentColor"
      />
      {/* Git branch: connector line + two commit nodes toward lower-left. */}
      <path
        d="M14.7 17.3 7.5 24.5"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle cx="15.2" cy="16.8" r="3.1" fill="currentColor" />
      <circle cx="6.4" cy="25.6" r="3.1" fill="currentColor" />
    </svg>
  );
}

export function Logo({
  className,
  markClassName,
  showWordmark = true,
}: {
  className?: string;
  markClassName?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark className={markClassName} />
      {showWordmark && (
        <span className="text-lg font-semibold tracking-tight">GitVane</span>
      )}
    </span>
  );
}
