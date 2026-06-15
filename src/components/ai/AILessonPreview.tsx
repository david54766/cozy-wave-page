import { Card, CardContent } from "@/components/ui/card";
import type { LessonGenerationContent } from "@/lib/aiCourses";

export function AILessonPreview({ content }: { content: LessonGenerationContent }) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="pt-5 space-y-3">
        <h3 className="text-xl font-semibold">{content.lesson_title}</h3>
        <pre className="whitespace-pre-wrap text-sm font-sans">{content.lesson_content}</pre>
        {content.key_takeaways.length > 0 && (
          <div>
            <p className="font-medium text-sm mb-1">Key takeaways</p>
            <ul className="list-disc pl-5 text-sm space-y-0.5">{content.key_takeaways.map((k, i) => <li key={i}>{k}</li>)}</ul>
          </div>
        )}
        {content.action_steps.length > 0 && (
          <div>
            <p className="font-medium text-sm mb-1">Action steps</p>
            <ul className="list-disc pl-5 text-sm space-y-0.5">{content.action_steps.map((k, i) => <li key={i}>{k}</li>)}</ul>
          </div>
        )}
        {content.discussion_question && (
          <p className="text-sm"><span className="font-medium">Discussion: </span>{content.discussion_question}</p>
        )}
        {content.suggested_resources.length > 0 && (
          <div>
            <p className="font-medium text-sm mb-1">Suggested resources</p>
            <ul className="list-disc pl-5 text-sm space-y-0.5">{content.suggested_resources.map((k, i) => <li key={i}>{k}</li>)}</ul>
          </div>
        )}
        {content.quiz_questions && content.quiz_questions.length > 0 && (
          <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-3">
            <p className="font-medium text-sm">Quiz questions (placeholder)</p>
            <ul className="text-sm mt-1 space-y-1">
              {content.quiz_questions.map((q, i) => <li key={i}>• {q.question}</li>)}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}