import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[#C4A97D] text-[#1a1a2e] hover:bg-[#B8956A] font-medium",
        destructive: "bg-red-900/40 text-red-300 border border-red-700/50 hover:bg-red-900/60",
        outline: "border border-[#C4A97D]/40 bg-transparent text-[#C4A97D] hover:bg-[#C4A97D]/10 hover:border-[#C4A97D]/70",
        secondary: "bg-[#C4A97D]/15 text-[#C4A97D] hover:bg-[#C4A97D]/25",
        ghost: "hover:bg-[#C4A97D]/10 hover:text-[#C4A97D]",
        link: "text-[#C4A97D] underline-offset-4 hover:underline",
        luxury: "btn-luxury text-foreground font-semibold hover:shadow-luxury rounded-full",
        glass: "glass hover:bg-card/80 text-foreground border-border/50",
        filter: "border border-border/40 text-foreground/70 hover:border-border/80 hover:text-foreground data-[active=true]:border-foreground/60 data-[active=true]:text-foreground data-[active=true]:bg-secondary/30",
        cart: "border border-foreground/30 text-foreground hover:border-[#D4AF37]/60 hover:text-[#D4AF37] transition-all duration-300 hover:shadow-sm",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
