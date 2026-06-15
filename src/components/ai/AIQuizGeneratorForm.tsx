import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Loader2 } from "lucide-react";
import { DIFFICULTIES, mockQuiz, type Difficulty, type QuizContent } from "@/lib/aiCourses";

export interface QuizFormValues {
  topic: string;
  question_count: number;
  difficulty: Difficulty;
  multiple_choice: boolean;
}

export function AIQuizGeneratorForm({ onGenerated }: {
  onGenerated: (values: QuizFormValues, quiz: QuizContent) => void;
}) {
  const [v, setV] = useState<QuizFormValues>({ topic: "", question_count: 5, difficulty: "medium", multiple_choice: true });
  const [busy, setBusy] = useState(false);
  const run = async () => {
    if (!v.topic.trim()) return;
    setBusy(true);
    const q = mockQuiz(v);
    await new Promise((r) => setTimeout(r, 250));
    setBusy(false);
    onGenerated(v, q);
  };
  return (
    <Card className="rounded-2xl">
      <CardContent className="pt-5 space-y-3">
        <div className="space-y-1.5"><Label>Quiz topic / source *</Label><Input value={v.topic} onChange={(e) => setV({ ...v, topic: e.target.value })} maxLength={200} /></div>
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="space-y-1.5"><Label>Questions</Label><Input type="number" min={1} max={20} value={v.question_count} onChange={(e) => setV({ ...v, question_count: Math.max(1, Math.min(20, Number(e.target.value) || 1)) })} /></div>
          <div className="space-y-1.5">
            <Label>Difficulty</Label>
            <Select value={v.difficulty} onValueChange={(x) => setV({ ...v, difficulty: x as Difficulty })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{DIFFICULTIES.map((d) => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 flex items-end">
            <div className="flex items-center justify-between rounded-xl border border-border px-3 py-2 w-full">
              <Label className="cursor-pointer text-xs">Multiple choice</Label>
              <Switch checked={v.multiple_choice} onCheckedChange={(x) => setV({ ...v, multiple_choice: x })} />
            </div>
          </div>
        </div>
        <Button onClick={run} disabled={busy || !v.topic.trim()}>
          {busy ? <Loader2 className="size-4 mr-1.5 animate-spin" /> : <Sparkles className="size-4 mr-1.5" />}Generate quiz
        </Button>
        <p className="text-xs text-muted-foreground">Quiz publishing will be connected in a later phase.</p>
      </CardContent>
    </Card>
  );
}