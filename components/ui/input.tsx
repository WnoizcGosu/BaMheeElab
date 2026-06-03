import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-[#E8D5B0] bg-[#FFF9F0] px-3 py-2 text-sm text-gray-800",
          "placeholder:text-gray-400",
          "focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent",
          "transition-all duration-200",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
