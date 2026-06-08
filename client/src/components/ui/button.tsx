import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-5 text-sm font-bold transition-[transform,background-color,border-color,box-shadow,color] duration-150 ease-out will-change-transform active:translate-y-px active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-y-0 disabled:active:scale-100 cursor-pointer",
        variant === "primary" && "bg-red-650 text-white shadow-[0_8px_20px_rgba(239,68,68,0.2)] hover:bg-red-500 active:shadow-[0_4px_12px_rgba(239,68,68,0.28)]",
        variant === "ghost" && "bg-transparent text-neutral-800 dark:text-white hover:bg-neutral-100 dark:hover:bg-white/10",
        variant === "outline" && "border border-neutral-250 dark:border-white/15 bg-neutral-50 dark:bg-white/5 text-neutral-800 dark:text-white hover:border-red-500 dark:hover:border-red-400 hover:bg-red-500/5 dark:hover:bg-red-500/10",
        className
      )}
      {...props}
    />
  );
}
