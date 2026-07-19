export interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = src;
  });
}

/**
 * Crops `imageSrc` to the given pixel region and returns a JPEG Blob, downscaled
 * so the longest edge is at most `maxEdge` px (keeps uploads small).
 */
export async function getCroppedBlob(
  imageSrc: string,
  crop: PixelCrop,
  maxEdge = 1400,
): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const scale = Math.min(1, maxEdge / Math.max(crop.width, crop.height));
  const outW = Math.max(1, Math.round(crop.width * scale));
  const outH = Math.max(1, Math.round(crop.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, outW, outH);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Could not crop image"))),
      "image/jpeg",
      0.9,
    );
  });
}
