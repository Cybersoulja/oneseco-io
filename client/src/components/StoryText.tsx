import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface StoryTextProps {
  scene: string;
  history: Array<{ scene: string; choice: string }>;
}

export default function StoryText({ scene, history }: StoryTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [scene]);

  return (
    <div ref={containerRef} className="space-y-6 font-serif text-lg">
      {history.map((entry, index) => (
        <div key={index} className="opacity-75">
          <p className="mb-2">{entry.scene}</p>
          <p className="text-amber-800 italic">
            ➥ {entry.choice}
          </p>
        </div>
      ))}
      
      <p className={cn(
        "text-xl leading-relaxed animate-ink-flow",
        "after:content-[''] after:block after:w-full after:h-px after:bg-amber-900/20"
      )}>
        {scene}
      </p>
    </div>
  );
}
