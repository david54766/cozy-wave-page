import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { getCroppedBlob, type PixelCrop } from "@/lib/crop";

/**
 * Crop dialog with a fixed aspect ratio and a zoom slider. Returns the cropped
 * region as a JPEG Blob. Works in browsers and native WebViews (drag + pinch).
 */
export function ImageCropper({
  open,
  imageSrc,
  aspect,
  title = "Crop image",
  requirement,
  onCancel,
  onCropped,
}: {
  open: boolean;
  imageSrc: string;
  aspect: number;
  title?: string;
  requirement?: string;
  onCancel: () => void;
  onCropped: (blob: Blob) => void;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [areaPixels, setAreaPixels] = useState<PixelCrop | null>(null);
  const [busy, setBusy] = useState(false);

  const onComplete = useCallback((_area: unknown, areaPx: PixelCrop) => setAreaPixels(areaPx), []);

  const nudge = (dx: number, dy: number) =>
    setCrop((c) => ({ x: c.x + dx, y: c.y + dy }));

  const save = async () => {
    if (!areaPixels) return;
    setBusy(true);
    try {
      const blob = await getCroppedBlob(imageSrc, areaPixels);
      onCropped(blob);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onCancel(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {requirement && <p className="text-xs text-muted-foreground -mt-1">{requirement}</p>}
        <div className="relative w-full h-72 bg-muted rounded-xl overflow-hidden">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onComplete}
          />
        </div>
        <p className="text-xs text-muted-foreground -mt-1">
          Drag the image to reposition, or use the arrows below to nudge it.
        </p>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground w-10">Zoom</span>
          <Slider min={1} max={3} step={0.01} value={[zoom]} onValueChange={(v) => setZoom(v[0])} className="flex-1" />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground w-10">Shift</span>
          <div className="flex items-center gap-2 flex-wrap">
            <Button type="button" size="icon" variant="outline" onClick={() => nudge(20, 0)} aria-label="Shift left">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button type="button" size="icon" variant="outline" onClick={() => nudge(0, 20)} aria-label="Shift up">
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button type="button" size="icon" variant="outline" onClick={() => nudge(0, -20)} aria-label="Shift down">
              <ArrowDown className="h-4 w-4" />
            </Button>
            <Button type="button" size="icon" variant="outline" onClick={() => nudge(-20, 0)} aria-label="Shift right">
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setCrop({ x: 0, y: 0 })}>
              Reset
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={busy}>Cancel</Button>
          <Button onClick={save} disabled={busy || !areaPixels}>{busy ? "Saving…" : "Use image"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
