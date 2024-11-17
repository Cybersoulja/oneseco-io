import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const characterSchema = z.object({
  name: z.string().min(2).max(50),
  background: z.string().min(10),
  traits: z.object({
    class: z.string(),
    virtue: z.string(),
    flaw: z.string()
  })
});

interface CharacterCreatorProps {
  onSubmit: (character: z.infer<typeof characterSchema>) => void;
}

export default function CharacterCreator({ onSubmit }: CharacterCreatorProps) {
  const form = useForm<z.infer<typeof characterSchema>>({
    resolver: zodResolver(characterSchema),
    defaultValues: {
      name: "",
      background: "",
      traits: {
        class: "warrior",
        virtue: "honor",
        flaw: "pride"
      }
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Character Name</FormLabel>
              <FormControl>
                <Input {...field} className="border-amber-900/20" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="background"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Background Story</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  className="border-amber-900/20 min-h-[100px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="traits.class"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Class</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="border-amber-900/20">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="warrior">Warrior</SelectItem>
                  <SelectItem value="mage">Mage</SelectItem>
                  <SelectItem value="rogue">Rogue</SelectItem>
                  <SelectItem value="cleric">Cleric</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit" className="w-full">
            Begin Journey
          </Button>
        </div>
      </form>
    </Form>
  );
}
