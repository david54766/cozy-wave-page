import { useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { uploadImage } from "@/lib/upload";
import { ImageCropper } from "@/components/ImageCropper";

const MAX_MB = 5;

/**
 * "Upload from device" button. A plain file input works on desktop browsers,
 * the iOS WKWebView (photo picker), and the Android Capacitor WebView — so this
 * one component covers all platforms. On success it calls onUploaded with the
 * public URL.
 *
 * If `aspect` is set, the picked image opens in a cropper (fixed ratio + zoom)
 * before upload. `hint` (e.g. "Square · up to 5 MB") is shown under the button.
 */
export function ImageUpload({
  userId,
  kind,
  onUploaded,
  label = "Upload image",
  children,
  size = "sm",
  variant = "outline",
  aspect,
  requirement,
  cropTitle = "Crop image",
}: {
  userId: string;
  kind: string;
  onUploaded: (url: string) => void;
  label?: string;
  children?: ReactNode;
  size?: "sm" | "icon" | "default";
  variant?: "outline" | "ghost" | "default";
  aspect?: number;
  requirement?: string;
  cropTitle?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  const doUpload = async (file: File) => {
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

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(`Image must be under ${MAX_MB} MB`);
      return;
    }
    if (aspect) {
      setCropSrc(URL.createObjectURL(file)); // open the cropper
    } else {
      await doUpload(file);
    }
  };

  const onCropped = async (blob: Blob) => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
    await doUpload(new File([blob], `${kind}.jpg`, { type: "image/jpeg" }));
  };

  const cancelCrop = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
  };

  const button = (
    <Button type="button" variant={variant} size={size} onClick={() => inputRef.current?.click()} disabled={busy}>
      {busy ? (
        <Loader2 className="size-4 animate-spin" />
      ) : children ? (
        children
      ) : (
        <><Upload className="size-4 mr-1.5" />{label}</>
      )}
    </Button>
  );

  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
      {button}
      {cropSrc && aspect && (
        <ImageCropper
          open
          imageSrc={cropSrc}
          aspect={aspect}
          title={cropTitle}
          requirement={requirement ?? `JPG or PNG · up to ${MAX_MB} MB`}
          onCancel={cancelCrop}
          onCropped={onCropped}
        />
      )}
    </>
  );
}
