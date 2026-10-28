import { cn } from "cn"

function Skeleton({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & { variant?: "default" | "circle" }) {
  return (
    <div
      data-slot="skeleton"
      data-variant={variant}
      className={cn("animate-pulse rounded-md bg-muted data-[variant=circle]:rounded-full", className)}
      {...props}
    />
  )
}

export { Skeleton }
