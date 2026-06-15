import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Loader2 } from "lucide-react";
import { SKILL_LEVELS, TONES, mockOutline, type SkillLevel, type Tone, type CourseOutline } from "@/lib/aiCourses";

export interface OutlineFormValues {
  topic: string;
  audience: string;
  skill_level: SkillLevel;
  desired_outcome: string;
  sections_count: number;
  lessons_per_section: number;
  tone: Tone;
  additional_instructions: string;
}

export function AICourseBuilderForm({ onGenerated, busy }: {
  onGenerated: (values: OutlineFormValues, outline: CourseOutline) => void;
  busy?: boolean;
}) {
  const [v, setV] = useState<OutlineFormValues>({
    topic: "", audience: "", skill_level: "beginner", desired_outcome: "",
    sections_count: 4, lessons_per_section: 3, tone: "friendly", additional_instructions: "",
  });
  const [generating, setGenerating] = useState(false);

  const handle = async () => {
    if (!v.topic.trim()) return;
    setGenerating(true);
    // Always mock for now (Phase 5B uses mock mode per Phase 5A AI settings).
    const outline = mockOutline(v);
    await new Promise((r) => setTimeout(r, 400));
    setGenerating(false);
    onGenerated(v, outline);
  };

  return (
    <Card className="rounded-2xl">
      <CardContent className="pt-5 space-y-3">
        <div className="space-y-1.5"><Label>Course topic *</Label><Input value={v.topic} onChange={(e) => setV({ ...v, topic: e.target.value })} placeholder="e.g. Public speaking for beginners" maxLength={200} /></div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Target audience</Label><Input value={v.audience} onChange={(e) => setV({ ...v, audience: e.target.value })} placeholder="e.g. New managers" maxLength={200} /></div>
          <div className="space-y-1.5"><Label>Desired outcome</Label><Input value={v.desired_outcome} onChange={(e) => setV({ ...v, desired_outcome: e.target.value })} placeholder="What learners will be able to do" maxLength={200} /></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Skill level</Label>
            <Select value={v.skill_level} onValueChange={(x) => setV({ ...v, skill_level: x as SkillLevel })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{SKILL_LEVELS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Tone</Label>
            <Select value={v.tone} onValueChange={(x) => setV({ ...v, tone: x as Tone })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{TONES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Number of sections</Label><Input type="number" min={1} max={12} value={v.sections_count} onChange={(e) => setV({ ...v, sections_count: Math.max(1, Math.min(12, Number(e.target.value) || 1)) })} /></div>
          <div className="space-y-1.5"><Label>Lessons per section</Label><Input type="number" min={1} max={10} value={v.lessons_per_section} onChange={(e) => setV({ ...v, lessons_per_section: Math.max(1, Math.min(10, Number(e.target.value) || 1)) })} /></div>
        </div>
        <div className="space-y-1.5"><Label>Additional instructions</Label><Textarea rows={3} value={v.additional_instructions} onChange={(e) => setV({ ...v, additional_instructions: e.target.value })} placeholder="Any specific framing, examples, or constraints" /></div>
        <Button onClick={handle} disabled={generating || busy || !v.topic.trim()}>
          {(generating || busy) ? <Loader2 className="size-4 mr-1.5 animate-spin" /> : <Sparkles className="size-4 mr-1.5" />}
          Generate outline
        </Button>
      </CardContent>
    </Card>
  );
}