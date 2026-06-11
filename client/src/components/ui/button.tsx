import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "focus-ring relative inline-flex min-h-11 items-center justify-center gap-2 overflow-hidden rounded-2xl px-5 text-sm font-black transition-[transform,background-color,border-color,box-shadow,color,filter] duration-200 ease-out will-change-transform active:translate-y-px active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-y-0 disabled:active:scale-100 cursor-pointer",
        variant === "primary" && "border border-blue-300/30 bg-gradient-to-r from-blue-500 via-violet-600 to-purple-500 text-white shadow-[0_0_34px_rgba(59,130,246,0.28)] hover:shadow-[0_0_48px_rgba(168,85,247,0.36)]",
        variant === "ghost" && "bg-transparent text-slate-200 hover:bg-white/10 hover:text-white",
        variant === "outline" && "border border-white/15 bg-white/[0.045] text-slate-100 backdrop-blur-xl hover:border-blue-300/50 hover:bg-blue-500/10 hover:text-white hover:shadow-[0_0_30px_rgba(59,130,246,0.18)]",
        className
      )}
      {...props}
    />
  );
}
