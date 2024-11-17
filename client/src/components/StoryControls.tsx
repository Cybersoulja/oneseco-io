import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Save, BookOpen, Home } from "lucide-react";
import { useLocation } from "wouter";

interface StoryControlsProps {
  story: {
    id: string;
    currentScene: string;
    context: Record<string, unknown>;
  };
  onChoice: (choice: string) => void;
}

export default function StoryControls({ story, onChoice }: StoryControlsProps) {
  const [, setLocation] = useLocation();

  const choices = [
    "Continue bravely forward",
    "Take a cautious approach",
    "Seek an alternative path"
  ];

  return (
    <div className="space-y-4">
      <Card className="border-2 border-amber-900 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {choices.map((choice, index) => (
            <Button
              key={index}
              onClick={() => onChoice(choice)}
              variant="outline"
              className="h-auto py-4 text-left"
            >
              {choice}
            </Button>
          ))}
        </div>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="ghost"
          onClick={() => setLocation("/")}
        >
          <Home className="mr-2" />
          Return to Start
        </Button>

        <div className="space-x-2">
          <Button variant="outline">
            <Save className="mr-2" />
            Save Progress
          </Button>
          <Button variant="outline">
            <BookOpen className="mr-2" />
            Story Log
          </Button>
        </div>
      </div>
    </div>
  );
}
