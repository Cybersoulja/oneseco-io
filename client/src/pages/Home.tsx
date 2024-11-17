import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CharacterCreator from "../components/CharacterCreator";
import { Scroll, BookOpen, PlusCircle } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();
  const [showCreator, setShowCreator] = useState(false);

  const handleCreateCharacter = async (character) => {
    try {
      const response = await fetch("/api/characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(character)
      });
      const newCharacter = await response.json();
      
      const storyResponse = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId: newCharacter.id })
      });
      const story = await storyResponse.json();
      
      setLocation(`/story/${story.id}`);
    } catch (error) {
      console.error("Failed to create character:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[url('/parchment-bg.svg')] p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="border-2 border-amber-900">
          <CardHeader>
            <CardTitle className="text-4xl font-serif text-center text-amber-900">
              Tales of Adventure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!showCreator ? (
              <div className="flex flex-col items-center gap-4">
                <Button
                  size="lg"
                  onClick={() => setShowCreator(true)}
                  className="w-64"
                >
                  <PlusCircle className="mr-2" />
                  Begin New Tale
                </Button>
                <div className="flex gap-4">
                  <Button variant="outline" className="w-48">
                    <Scroll className="mr-2" />
                    Load Story
                  </Button>
                  <Button variant="outline" className="w-48">
                    <BookOpen className="mr-2" />
                    Tutorial
                  </Button>
                </div>
              </div>
            ) : (
              <CharacterCreator onSubmit={handleCreateCharacter} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
