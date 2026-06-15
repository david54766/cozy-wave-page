import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Copy } from "lucide-react";
import { mockAssignment, logCourseUsage, type AssignmentType } from "@/lib/aiCourses";
import { toast } from "sonner";

const TYPES: { value: AssignmentType; label: string }[] = [
  { value: "reflection", label: "Reflection question" },
  { value: "homework", label: "Homework task" },
  { value: "discussion", label: "Discussion prompt" },
  { value: "worksheet", label: "Worksheet outline" },
  { value: "checklist", label: "Implementation checklist" },
];

export function AIAssignmentGenerator() {
  const [type, setType] = useState<AssignmentType>("reflection");
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState("");

  const run = () => {
    if (!topic.trim()) return;
    setResult(mockAssignment(type, topic));
    logCourseUsage("assignment_generated");
  };
  const copy = async () => {
    await navigator.clipboard.writeText(result);
    toast.success("Copied");
  };
  return (
    <Card className="rounded-2xl">
      <CardContent className="pt-5 space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Assignment type</Label>
            <Select value={type} onValueChange={(v) => setType(v as AssignmentType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label>Topic</Label><Input value={topic} onChange={(e) => setTopic(e.target.value)} maxLength={200} /></div>
        </div>
        <Button onClick={run} disabled={!topic.trim()}><Sparkles className="size-4 mr-1.5" />Generate</Button>
        {result && (
          <div className="space-y-2">
            <Textarea rows={5} value={result} onChange={(e) => setResult(e.target.value)} />
            <Button variant="outline" size="sm" onClick={copy}><Copy className="size-4 mr-1.5" />Copy</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}