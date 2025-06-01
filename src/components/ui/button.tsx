import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { tv, type VariantProps } from "tailwind-variants"
import { cn } from "@/utilities/ui"

const buttonVariants = tv({
  base: [
    "inline-flex items-center justify-between whitespace-nowrap",
    "box-border",
    "font-medium transition-all",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none",
    "shrink-0 outline-none [&_svg]:shrink-0",
    "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
    "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
    "aria-invalid:border-destructive",
    "[&>svg]:ml-auto [&>svg]:flex-none",
  ],
  variants: {
    variant: {
      default: [
        "from-primary to-secondary bg-gradient-to-r",
        "text-white shadow-xs hover:opacity-90",
      ],
      outline: [
        "border-light-border border bg-white/3 backdrop-blur-[5px]",
        "text-white",
        "hover:text-dark hover:bg-white",
        "focus-visible:ring-white/50",
      ],
      outlineGradient: [
        "gradient-border",
        "bg-white/2 backdrop-blur-sm",
        "text-white",
        "hover:text-dark hover:bg-white",
        "focus-visible:ring-white/50",
      ],
      secondary: [
        "bg-secondary text-secondary-foreground shadow-xs",
        "hover:bg-secondary/80",
      ],
      ghost: [
        "bg-white/5 backdrop-blur-[5px]",
        "text-white hover:bg-white/10 hover:text-white",
      ],
      link: "text-primary underline-offset-4 hover:underline",
    },
    layout: {
      default: "",
      centered: "justify-center [&>svg]:ml-0",
    },
    size: {
      default: [
        "h-9 gap-2 px-4 py-2 text-sm",
        "[&_svg:not([class*='size-'])]:size-6",
        "has-[>svg]:px-3",
      ],
      sm: [
        "h-8 gap-1.5 px-3 text-xs",
        "[&_svg:not([class*='size-'])]:size-4",
        "has-[>svg]:px-2.5",
      ],
      lg: ["gap-4 px-8 py-6 text-base", "[&_svg:not([class*='size-'])]:size-6"],
    },
    icon: {
      true: [
        "size-16 justify-center text-lg",
        "[&_svg:not([class*='size-'])]:size-8",
        "[&>svg]:ml-0",
      ],
    },
  },
  compoundVariants: [
    {
      size: ["sm", "default", "lg"],
      class: "!text-sm",
    },
    {
      layout: ["default", "centered"],
      size: ["default", "sm", "lg"],
      class: "[&>svg]:h-6 [&>svg]:w-6",
    },
  ],
  defaultVariants: {
    variant: "default",
    layout: "default",
    size: "lg",
  },
})

function Button({
  className,
  variant,
  size,
  layout,
  icon,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, layout, icon, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  ref?: React.Ref<HTMLButtonElement>
}
