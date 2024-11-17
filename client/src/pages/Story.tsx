import { useParams } from "wouter";
import useSWR from "swr";
import { Card } from "@/components/ui/card";
import StoryText from "../components/StoryText";
import StoryControls from "../components/StoryControls";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Story() {
  const { id } = useParams();
  const { data: story, mutate } = useSWR(`/api/stories/${id}`);

  const handleChoice = async (choice: string) => {
    try {
      const response = await fetch(`/api/stories/${id}/continue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choice })
      });
      const updatedStory = await response.json();
      mutate(updatedStory);
    } catch (error) {
      console.error("Failed to progress story:", error);
    }
  };

  if (!story) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-[url('/parchment-bg.svg')] p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        <Card className="border-2 border-amber-900 p-6">
          <ScrollArea className="h-[60vh]">
            <StoryText
              scene={story.currentScene}
              history={story.history}
            />
          </ScrollArea>
        </Card>
        
        <StoryControls
          story={story}
          onChoice={handleChoice}
        />
      </div>
    </div>
  );
}
