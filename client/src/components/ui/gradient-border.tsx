import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GradientBorderProps {
  children: ReactNode;
  className?: string;
}

const GradientBorder = ({ children, className }: GradientBorderProps) => {
  return (
    <div className={cn("relative z-0 rounded-xl overflow-hidden gradient-border", className)}>
      <style>{`
        .gradient-border::before {
          content: '';
          position: absolute;
          z-index: -2;
          left: -50%;
          top: -50%;
          width: 200%;
          height: 200%;
          background-image: conic-gradient(transparent, hsl(var(--primary)), transparent 30%);
          animation: rotate 4s linear infinite;
        }
        
        .gradient-border::after {
          content: '';
          position: absolute;
          z-index: -1;
          left: 2px;
          top: 2px;
          width: calc(100% - 4px);
          height: calc(100% - 4px);
          background: hsl(240, 10%, 3.9%);
          border-radius: 0.7rem;
        }
        
        @keyframes rotate {
          100% {
            transform: rotate(1turn);
          }
        }
      `}</style>
      {children}
    </div>
  );
};

export default GradientBorder;
