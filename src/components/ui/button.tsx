"use client";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-sm font-medium transition-[background,color,box-shadow,transform] duration-150 ease-[var(--ease-out-expo)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent-500)] disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: "bg-[var(--color-ink)] text-[var(--color-paper)] hover:bg-[var(--color-warm-700)]",
        accent:  "bg-[var(--color-accent-500)] text-white hover:bg-[var(--color-accent-600)]",
        outline: "border border-[var(--color-line)] bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-warm-100)] dark:hover:bg-[var(--color-warm-800)]",
        ghost:   "bg-transparent text-[var(--color-ink-2)] hover:bg-[var(--color-warm-100)] hover:text-[var(--color-ink)] dark:hover:bg-[var(--color-warm-800)]",
        soft:    "bg-[var(--color-warm-100)] text-[var(--color-ink)] hover:bg-[var(--color-warm-150)] dark:bg-[var(--color-warm-800)] dark:hover:bg-[var(--color-warm-700)]",
      },
      size: {
        sm: "h-7 px-2.5 text-[12px]",
        md: "h-8 px-3 text-[13px]",
        lg: "h-10 px-4 text-sm",
        icon: "h-8 w-8",
        iconSm: "h-7 w-7",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
  },
);
Button.displayName = "Button";
export { buttonVariants };
