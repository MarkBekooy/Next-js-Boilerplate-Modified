import type { MDXComponents } from "mdx/types";
import { cn } from "cn";

const components: MDXComponents = {
  a: ({ children, className, ...props }) => (
    <a
      className={cn("font-medium text-primary underline underline-offset-4", className)}
      {...props}
    >
      {children}
    </a>
  ),
  blockquote: ({ className, ...props }) => (
    <blockquote
      className={cn("mt-6 border-l-2 border-primary pl-5 text-muted-foreground italic", className)}
      {...props}
    />
  ),
  h1: ({ children, className, ...props }) => (
    <h1
      className={cn(
        "text-4xl leading-tight font-semibold tracking-tight text-balance md:text-6xl",
        className,
      )}
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, className, ...props }) => (
    <h2
      className={cn("mt-12 scroll-mt-24 text-3xl font-semibold tracking-tight", className)}
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, className, ...props }) => (
    <h3 className={cn("mt-8 text-xl font-semibold tracking-tight", className)} {...props}>
      {children}
    </h3>
  ),
  li: ({ className, ...props }) => <li className={cn("pl-1", className)} {...props} />,
  ol: ({ className, ...props }) => (
    <ol
      className={cn("mt-5 list-decimal space-y-2 pl-6 leading-7 text-muted-foreground", className)}
      {...props}
    />
  ),
  p: ({ className, ...props }) => (
    <p className={cn("mt-5 leading-8 text-muted-foreground", className)} {...props} />
  ),
  strong: ({ className, ...props }) => (
    <strong className={cn("font-semibold text-foreground", className)} {...props} />
  ),
  table: ({ className, ...props }) => (
    <div className="mt-6 overflow-x-auto">
      <table className={cn("w-full border-collapse text-left text-sm", className)} {...props} />
    </div>
  ),
  td: ({ className, ...props }) => (
    <td className={cn("px-4 py-3 align-top text-muted-foreground", className)} {...props} />
  ),
  th: ({ className, ...props }) => (
    <th className={cn("px-4 py-3 font-semibold text-foreground", className)} {...props} />
  ),
  thead: ({ className, ...props }) => <thead className={cn("border-b", className)} {...props} />,
  tr: ({ className, ...props }) => <tr className={cn("border-b", className)} {...props} />,
  ul: ({ className, ...props }) => (
    <ul
      className={cn("mt-5 list-disc space-y-2 pl-6 leading-7 text-muted-foreground", className)}
      {...props}
    />
  ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}
