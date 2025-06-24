import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-xl border border-system-gray-200 bg-white px-3 py-2 text-sm",
          "placeholder:text-system-gray-500 focus:border-apple-blue focus:outline-none focus:ring-2 focus:ring-apple-blue/20",
          "disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-colors duration-75",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };