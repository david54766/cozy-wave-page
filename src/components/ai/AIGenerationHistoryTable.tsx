import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Archive, ExternalLink, Eye } from "lucide-react";
import { AIGenerationStatusPill } from "./AIGenerationStatusPill";
import type { AICourseGeneration, AILessonGeneration, AIQuizGeneration } from "@/lib/aiCourses";

export function AIGenerationHistoryTable({
  courses, lessons, quizzes, onArchiveCourse, onArchiveLesson, onArchiveQuiz,
}: {
  courses: AICourseGeneration[];
  lessons: AILessonGeneration[];
  quizzes: AIQuizGeneration[];
  onArchiveCourse: (id: string) => void;
  onArchiveLesson: (id: string) => void;
  onArchiveQuiz: (id: string) => void;
}) {
  const fmt = (d: string) => new Date(d).toLocaleString();
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-lg font-semibold mb-2">Course outlines</h2>
        {courses.length === 0 ? <p className="text-sm text-muted-foreground">No course generations yet.</p> : (
          <ul className="space-y-2">
            {courses.map((c) => (
              <li key={c.id}>
                <Card className="rounded-2xl"><CardContent className="pt-5 flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{c.title}</p>
                    <p className="text-xs text-muted-foreground">{c.topic} · {fmt(c.created_at)}</p>
                  </div>
                  <AIGenerationStatusPill status={c.status} />
                  {c.created_course_id && (
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/admin/courses/$courseId" params={{ courseId: c.created_course_id }}><ExternalLink className="size-4 mr-1" />Open course</Link>
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/admin/ai-course-builder/$generationId" params={{ generationId: c.id }}><Eye className="size-4 mr-1" />View</Link>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onArchiveCourse(c.id)} title="Archive"><Archive className="size-4" /></Button>
                </CardContent></Card>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h2 className="text-lg font-semibold mb-2">Lesson drafts</h2>
        {lessons.length === 0 ? <p className="text-sm text-muted-foreground">No lesson generations yet.</p> : (
          <ul className="space-y-2">
            {lessons.map((l) => (
              <li key={l.id}>
                <Card className="rounded-2xl"><CardContent className="pt-5 flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{l.generated_content?.lesson_title ?? l.topic}</p>
                    <p className="text-xs text-muted-foreground">{l.topic} · {fmt(l.created_at)}</p>
                  </div>
                  <AIGenerationStatusPill status={l.status} />
                  <Button variant="ghost" size="icon" onClick={() => onArchiveLesson(l.id)} title="Archive"><Archive className="size-4" /></Button>
                </CardContent></Card>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h2 className="text-lg font-semibold mb-2">Quiz drafts</h2>
        {quizzes.length === 0 ? <p className="text-sm text-muted-foreground">No quiz generations yet.</p> : (
          <ul className="space-y-2">
            {quizzes.map((q) => (
              <li key={q.id}>
                <Card className="rounded-2xl"><CardContent className="pt-5 flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{q.generated_quiz_json?.title ?? q.topic}</p>
                    <p className="text-xs text-muted-foreground">{q.question_count} questions · {q.difficulty} · {fmt(q.created_at)}</p>
                  </div>
                  <AIGenerationStatusPill status={q.status} />
                  <Button variant="ghost" size="icon" onClick={() => onArchiveQuiz(q.id)} title="Archive"><Archive className="size-4" /></Button>
                </CardContent></Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}