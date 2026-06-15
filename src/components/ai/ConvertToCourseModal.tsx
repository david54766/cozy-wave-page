import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { convertOutlineToCourse, type AICourseGeneration } from "@/lib/aiCourses";

export function ConvertToCourseModal({ open, onOpenChange, generation, onConverted }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  generation: AICourseGeneration | null;
  onConverted: (courseId: string) => void;
}) {
  const [spaces, setSpaces] = useState<{ id: string; name: string }[]>([]);
  const [spaceId, setSpaceId] = useState("");
  const [visibility, setVisibility] = useState<"public" | "members_only" | "space_members" | "hidden">("space_members");
  const [access, setAccess] = useState<"free" | "preview" | "paid" | "paid_placeholder">("free");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      const { data } = await supabase.from("spaces").select("id,name").eq("is_archived", false).order("sort_order");
      setSpaces((data ?? []) as any);
      if (data?.[0]) setSpaceId(data[0].id);
    })();
  }, [open]);

  const run = async () => {
    if (!generation || !spaceId) return toast.error("Pick a Space");
    setBusy(true);
    try {
      const courseId = await convertOutlineToCourse(generation, { space_id: spaceId, visibility, access_level: access });
      toast.success("Course created from outline");
      onConverted(courseId);
      onOpenChange(false);
    } catch (e: any) { toast.error(e?.message ?? "Failed to convert"); }
    finally { setBusy(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Create course from outline</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Lessons will be created as hidden so you can review before publishing.</p>
          <div className="space-y-1.5">
            <Label>Target Space</Label>
            <Select value={spaceId} onValueChange={setSpaceId}>
              <SelectTrigger><SelectValue placeholder="Pick a Space" /></SelectTrigger>
              <SelectContent>{spaces.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Visibility</Label>
              <Select value={visibility} onValueChange={(v) => setVisibility(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="members_only">Members only</SelectItem>
                  <SelectItem value="space_members">Space members</SelectItem>
                  <SelectItem value="hidden">Hidden</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Access</Label>
              <Select value={access} onValueChange={(v) => setAccess(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="preview">Preview</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={run} disabled={busy}>{busy && <Loader2 className="size-4 mr-1.5 animate-spin" />}Create course</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}