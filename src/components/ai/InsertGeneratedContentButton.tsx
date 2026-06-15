import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

export function InsertGeneratedContentButton({ text, label = "Copy" }: { text: string; label?: string }) {
  return (
    <Button variant="outline" size="sm" onClick={async () => {
      await navigator.clipboard.writeText(text);
      toast.success("Copied — paste into the lesson editor");
    }}>
      <Copy className="size-4 mr-1.5" />{label}
    </Button>
  );
}