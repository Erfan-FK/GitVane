import * as React from "react";

/**
 * Minimal Slot: merges its own props onto a single child element so components
 * can support an `asChild` pattern without pulling in @radix-ui/react-slot.
 */
export const Slot = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }
>(({ children, ...props }, ref) => {
  if (!React.isValidElement(children)) {
    return null;
  }

  const child = children as React.ReactElement<Record<string, unknown>>;
  const childProps = child.props;

  return React.cloneElement(child, {
    ...props,
    ...childProps,
    className: [
      (props as { className?: string }).className,
      (childProps as { className?: string }).className,
    ]
      .filter(Boolean)
      .join(" "),
    ref,
  } as Record<string, unknown>);
});
Slot.displayName = "Slot";
