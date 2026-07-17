import { useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { uploadImage } from "@/lib/upload";

/**
 * "Upload from device" button. A plain file input works on desktop browsers,
 * the iOS WKWebView (photo picker), and the Android Capacitor WebView — so this
 * one component covers all platforms. On success it calls onUploaded with the
 * public URL.
 */
export function ImageUpload({
  userId,
  kind,
  onUploaded,
  label = "Upload image",
  children,
  size = "sm",
  variant = "outline",
}: {
  userId: string;
  kind: string;
  onUploaded: (url: string) => void;
  label?: string;
  children?: ReactNode;
  size?: "sm" | "icon" | "default";
  variant?: "outline" | "ghost" | "default";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB");
      return;
    }
    setBusy(true);
    try {
      const url = await uploadImage(file, userId, kind);
      onUploaded(url);
      toast.success("Image uploaded");
    } catch (err: any) {
      toast.error(err?.message ?? "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
      <Button type="button" variant={variant} size={size} onClick={() => inputRef.current?.click()} disabled={busy}>
        {busy ? (
          <Loader2 className="size-4 animate-spin" />
        ) : children ? (
          children
        ) : (
          <><Upload className="size-4 mr-1.5" />{label}</>
        )}
      </Button>
    </>
  );
}
