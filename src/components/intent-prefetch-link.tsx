"use client";

import type { ComponentProps, FocusEvent, MouseEvent, PointerEvent } from "react";
import { useState } from "react";
import { Link } from "@/libs/i18n/navigation";

type IntentPrefetchLinkProps = Omit<ComponentProps<typeof Link>, "prefetch">;

export function IntentPrefetchLink({
  href,
  onFocus,
  onMouseEnter,
  onPointerEnter,
  ...props
}: IntentPrefetchLinkProps) {
  const [intent, setIntent] = useState(false);

  function handleFocus(event: FocusEvent<HTMLAnchorElement>) {
    setIntent(true);
    onFocus?.(event);
  }

  function handleMouseEnter(event: MouseEvent<HTMLAnchorElement>) {
    setIntent(true);
    onMouseEnter?.(event);
  }

  function handlePointerEnter(event: PointerEvent<HTMLAnchorElement>) {
    setIntent(true);
    onPointerEnter?.(event);
  }

  return (
    <Link
      {...props}
      href={href}
      prefetch={intent ? true : null}
      onFocus={handleFocus}
      onMouseEnter={handleMouseEnter}
      onPointerEnter={handlePointerEnter}
    />
  );
}
