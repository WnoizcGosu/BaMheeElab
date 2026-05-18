import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:  "bg-brand-red text-white",
        outline:  "border border-brand-red text-brand-red bg-transparent",
        easy:     "bg-green-100 text-green-700 border border-green-200",
        medium:   "bg-yellow-100 text-yellow-700 border border-yellow-200",
        hard:     "bg-red-100 text-red-700 border border-red-200",
        topic:    "bg-[#FFF9F0] border border-[#F5CBA7] text-[#C0392B]",
        skill:    "border border-[#C0392B] text-[#C0392B] bg-transparent",
        lang:     "bg-[#FDECD8] text-[#C0392B] border border-[#F5CBA7]",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
