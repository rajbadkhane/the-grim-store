import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "focus-ring relative inline-flex min-h-11 items-center justify-center gap-2 overflow-hidden rounded-2xl px-5 text-sm font-black transition-[transform,background-color,border-color,box-shadow,color,filter] duration-200 ease-out will-change-transform active:translate-y-px active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-y-0 disabled:active:scale-100 cursor-pointer",
        variant === "primary" && "border border-[#FF3B30]/30 bg-gradient-to-r from-[#D71920] via-[#FF3B30] to-[#7A0B10] text-white shadow-[0_0_34px_rgba(215,25,32,0.28)] hover:shadow-[0_0_48px_rgba(255,59,48,0.34)]",
        variant === "ghost" && "bg-transparent text-slate-200 hover:bg-white/10 hover:text-white",
        variant === "outline" && "border border-white/15 bg-white/[0.045] text-slate-100 backdrop-blur-xl hover:border-[#FF3B30]/50 hover:bg-[#FF3B30]/10 hover:text-white hover:shadow-[0_0_30px_rgba(215,25,32,0.18)]",
        className
      )}
      {...props}
    />
  );
}
