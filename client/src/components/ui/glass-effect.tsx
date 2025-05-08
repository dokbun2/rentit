import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassEffectProps {
  children: ReactNode;
  className?: string;
}

const GlassEffect = ({ children, className }: GlassEffectProps) => {
  return (
    <div className={cn("p-6 backdrop-blur-md bg-black/30 border border-white/10 rounded-lg", className)}>
      {children}
    </div>
  );
};

export default GlassEffect;
