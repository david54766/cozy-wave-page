import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";
import { generateInsight, type AIMemberInsight } from "@/lib/memberAi";
import { toast } from "sonner";

export function GenerateMemberInsightButton({
  userId, memberName, onGenerated, label = "Generate insight",
}: { userId: string; memberName: string | null; onGenerated: (i: AIMemberInsight) => void; label?: string }) {
  const [loading, setLoading] = useState(false);
  const run = async () => {
    setLoading(true);
    try {
      const i = await generateInsight(userId, memberName);
      onGenerated(i);
      toast.success("Insight generated");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to generate");
    } finally { setLoading(false); }
  };
  return (
    <Button onClick={run} disabled={loading} variant="outline" size="sm">
      {loading ? <Loader2 className="size-3 mr-1 animate-spin" /> : <Sparkles className="size-3 mr-1" />}
      {label}
    </Button>
  );
}
