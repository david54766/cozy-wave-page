import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Loader2 } from "lucide-react";
import { TONES, mockLesson, type Tone, type LessonGenerationContent } from "@/lib/aiCourses";

export interface LessonFormValues {
  topic: string;
  audience: string;
  tone: Tone;
  desired_length: string;
  key_points: string;
  call_to_action: string;
  include_summary: boolean;
  include_quiz: boolean;
}

export function AILessonGeneratorForm({ onGenerated }: {
  onGenerated: (values: LessonFormValues, content: LessonGenerationContent) => void;
}) {
  const [v, setV] = useState<LessonFormValues>({
    topic: "", audience: "", tone: "friendly", desired_length: "medium",
    key_points: "", call_to_action: "", include_summary: true, include_quiz: false,
  });
  const [busy, setBusy] = useState(false);

  const run = async () => {
    if (!v.topic.trim()) return;
    setBusy(true);
    const content = mockLesson(v);
    await new Promise((r) => setTimeout(r, 300));
    setBusy(false);
    onGenerated(v, content);
  };

  return (
    <Card className="rounded-2xl">
      <CardContent className="pt-5 space-y-3">
        <div className="space-y-1.5"><Label>Lesson topic *</Label><Input value={v.topic} onChange={(e) => setV({ ...v, topic: e.target.value })} maxLength={200} /></div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Target audience</Label><Input value={v.audience} onChange={(e) => setV({ ...v, audience: e.target.value })} maxLength={200} /></div>
          <div className="space-y-1.5">
            <Label>Tone</Label>
            <Select value={v.tone} onValueChange={(x) => setV({ ...v, tone: x as Tone })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{TONES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Desired length</Label>
            <Select value={v.desired_length} onValueChange={(x) => setV({ ...v, desired_length: x })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Short</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="long">Long</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label>Call to action</Label><Input value={v.call_to_action} onChange={(e) => setV({ ...v, call_to_action: e.target.value })} maxLength={200} /></div>
        </div>
        <div className="space-y-1.5"><Label>Key points (comma or newline separated)</Label><Textarea rows={3} value={v.key_points} onChange={(e) => setV({ ...v, key_points: e.target.value })} /></div>
        <div className="flex items-center justify-between rounded-xl border border-border px-3 py-2">
          <Label className="cursor-pointer">Include summary / takeaways</Label>
          <Switch checked={v.include_summary} onCheckedChange={(x) => setV({ ...v, include_summary: x })} />
        </div>
        <div className="flex items-center justify-between rounded-xl border border-border px-3 py-2">
          <Label className="cursor-pointer">Include quiz questions (placeholder)</Label>
          <Switch checked={v.include_quiz} onCheckedChange={(x) => setV({ ...v, include_quiz: x })} />
        </div>
        <Button onClick={run} disabled={busy || !v.topic.trim()}>
          {busy ? <Loader2 className="size-4 mr-1.5 animate-spin" /> : <Sparkles className="size-4 mr-1.5" />}Generate lesson
        </Button>
      </CardContent>
    </Card>
  );
}