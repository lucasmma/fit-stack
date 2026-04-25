"use client";

import Image from "next/image";
import { format, parseISO } from "date-fns";
import type { PhotoDTO } from "@/lib/schemas/photo";
import { StandardModal } from "@/components/ui/StandardModal";

interface PhotoLightboxProps {
  photo: PhotoDTO | null;
  onClose: () => void;
}

export function PhotoLightbox({ photo, onClose }: PhotoLightboxProps) {
  return (
    <StandardModal
      isOpen={!!photo}
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
      bodyClassName="items-center gap-3 p-2"
    >
      {photo && (
        <>
          <Image
            src={photo.url}
            alt=""
            width={photo.width ?? 1200}
            height={photo.height ?? 1600}
            sizes="(max-width: 768px) 100vw, 768px"
            className="max-h-[80vh] w-auto rounded-medium object-contain"
            unoptimized
          />
          <div className="flex items-center gap-4 text-sm text-default-500">
            <span>{format(parseISO(photo.takenAt), "PPP")}</span>
            {photo.bodyWeightKg != null && <span>{photo.bodyWeightKg} kg</span>}
            {photo.bodyFatPct != null && <span>{photo.bodyFatPct}%</span>}
          </div>
          {photo.notes && <p className="text-sm text-default-500">{photo.notes}</p>}
        </>
      )}
    </StandardModal>
  );
}
