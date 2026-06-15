import { Card, CardContent } from "@/components/ui/card";
import type { QuizContent } from "@/lib/aiCourses";

export function AIQuizPreview({ quiz }: { quiz: QuizContent }) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="pt-5 space-y-3">
        <h3 className="text-lg font-semibold">{quiz.title}</h3>
        <ol className="space-y-3">
          {quiz.questions.map((q, i) => (
            <li key={i} className="rounded-xl border border-border p-3">
              <p className="font-medium text-sm">{i + 1}. {q.question}</p>
              <ul className="mt-1.5 text-sm space-y-0.5">
                {q.options.map((o, oi) => (
                  <li key={oi} className={oi === q.correct_index ? "font-medium text-emerald-700 dark:text-emerald-300" : ""}>
                    {String.fromCharCode(65 + oi)}. {o}{oi === q.correct_index ? "  ✓" : ""}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground mt-1.5">{q.explanation}</p>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}