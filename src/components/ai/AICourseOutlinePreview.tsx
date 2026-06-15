import { Card, CardContent } from "@/components/ui/card";
import type { CourseOutline } from "@/lib/aiCourses";

export function AICourseOutlinePreview({ outline }: { outline: CourseOutline }) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="pt-5 space-y-4">
        <div>
          <h3 className="text-xl font-semibold">{outline.course_title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{outline.course_description}</p>
          {outline.course_outcome && <p className="text-sm mt-2"><span className="font-medium">Outcome: </span>{outline.course_outcome}</p>}
        </div>
        <ol className="space-y-3">
          {outline.sections.map((s, i) => (
            <li key={i} className="rounded-xl border border-border p-3">
              <p className="font-medium">{i + 1}. {s.title}</p>
              {s.description && <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>}
              <ul className="mt-2 space-y-1.5">
                {s.lessons.map((l, j) => (
                  <li key={j} className="text-sm">
                    <p className="font-medium">{j + 1}. {l.title}</p>
                    {l.description && <p className="text-xs text-muted-foreground">{l.description}</p>}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}