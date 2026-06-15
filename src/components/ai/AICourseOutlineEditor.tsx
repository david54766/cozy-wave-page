import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import type { CourseOutline, OutlineLesson, OutlineSection } from "@/lib/aiCourses";

export function AICourseOutlineEditor({ value, onChange }: {
  value: CourseOutline;
  onChange: (v: CourseOutline) => void;
}) {
  const update = (patch: Partial<CourseOutline>) => onChange({ ...value, ...patch });
  const updateSection = (i: number, patch: Partial<OutlineSection>) => {
    const sections = value.sections.map((s, idx) => idx === i ? { ...s, ...patch } : s);
    update({ sections });
  };
  const updateLesson = (si: number, li: number, patch: Partial<OutlineLesson>) => {
    const sections = value.sections.map((s, idx) => idx !== si ? s : {
      ...s, lessons: s.lessons.map((l, j) => j === li ? { ...l, ...patch } : l),
    });
    update({ sections });
  };
  const addSection = () => update({
    sections: [...value.sections, { title: "New section", description: "", lessons: [] }],
  });
  const removeSection = (i: number) => update({ sections: value.sections.filter((_, idx) => idx !== i) });
  const addLesson = (si: number) => {
    const sections = value.sections.map((s, idx) => idx !== si ? s : {
      ...s, lessons: [...s.lessons, { title: "New lesson", description: "" }],
    });
    update({ sections });
  };
  const removeLesson = (si: number, li: number) => {
    const sections = value.sections.map((s, idx) => idx !== si ? s : {
      ...s, lessons: s.lessons.filter((_, j) => j !== li),
    });
    update({ sections });
  };

  return (
    <Card className="rounded-2xl">
      <CardContent className="pt-5 space-y-4">
        <div className="space-y-1.5"><Label>Course title</Label><Input value={value.course_title} onChange={(e) => update({ course_title: e.target.value })} maxLength={200} /></div>
        <div className="space-y-1.5"><Label>Course description</Label><Textarea rows={3} value={value.course_description} onChange={(e) => update({ course_description: e.target.value })} /></div>
        <div className="space-y-1.5"><Label>Course outcome</Label><Textarea rows={2} value={value.course_outcome} onChange={(e) => update({ course_outcome: e.target.value })} /></div>

        <div className="space-y-3">
          {value.sections.map((s, si) => (
            <div key={si} className="rounded-xl border border-border p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Input value={s.title} onChange={(e) => updateSection(si, { title: e.target.value })} className="font-medium" />
                <Button variant="ghost" size="icon" onClick={() => removeSection(si)}><Trash2 className="size-4" /></Button>
              </div>
              <Textarea rows={2} value={s.description ?? ""} onChange={(e) => updateSection(si, { description: e.target.value })} placeholder="Section description" />
              <div className="space-y-2 pl-3 border-l-2 border-border">
                {s.lessons.map((l, li) => (
                  <div key={li} className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Input value={l.title} onChange={(e) => updateLesson(si, li, { title: e.target.value })} placeholder="Lesson title" />
                      <Button variant="ghost" size="icon" onClick={() => removeLesson(si, li)}><Trash2 className="size-4" /></Button>
                    </div>
                    <Textarea rows={2} value={l.description ?? ""} onChange={(e) => updateLesson(si, li, { description: e.target.value })} placeholder="Lesson description" />
                  </div>
                ))}
                <Button size="sm" variant="outline" onClick={() => addLesson(si)}><Plus className="size-4 mr-1.5" />Add lesson</Button>
              </div>
            </div>
          ))}
          <Button variant="outline" onClick={addSection}><Plus className="size-4 mr-1.5" />Add section</Button>
        </div>
      </CardContent>
    </Card>
  );
}