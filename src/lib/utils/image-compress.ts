"use client";

const MAX_DIMENSION = 2000;
const QUALITY = 0.85;
const TARGET_TYPE = "image/jpeg" as const;

export type CompressedImage = {
  blob: Blob;
  width: number;
  height: number;
  type: typeof TARGET_TYPE;
};

export async function compressImage(file: File): Promise<CompressedImage> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error("Could not decode image");
  }

  try {
    const { width: srcW, height: srcH } = bitmap;

    // Fast path: already within size + already target format — no re-encode needed.
    if (
      file.type === TARGET_TYPE &&
      srcW <= MAX_DIMENSION &&
      srcH <= MAX_DIMENSION
    ) {
      return { blob: file, width: srcW, height: srcH, type: TARGET_TYPE };
    }

    const scale = Math.min(1, MAX_DIMENSION / Math.max(srcW, srcH));
    const width = Math.round(srcW * scale);
    const height = Math.round(srcH * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    try {
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas 2D context unavailable");

      // JPEG has no alpha channel — without a fill, transparent pixels encode as black.
      if ((TARGET_TYPE as string) === "image/jpeg") {
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, width, height);
      }
      ctx.drawImage(bitmap, 0, 0, width, height);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, TARGET_TYPE, QUALITY),
      );
      if (!blob) throw new Error("Image encoding failed");

      // If re-encoding made an already-tight JPEG bigger, keep the original.
      if (blob.size >= file.size && file.type === TARGET_TYPE) {
        return { blob: file, width: srcW, height: srcH, type: TARGET_TYPE };
      }

      return { blob, width, height, type: TARGET_TYPE };
    } finally {
      // Release canvas backing store (notably matters on iOS Safari).
      canvas.width = 0;
      canvas.height = 0;
    }
  } finally {
    bitmap.close();
  }
}
