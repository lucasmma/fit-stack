"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import type { PhotoDTO } from "@/lib/schemas/photo";
import { EmptyState } from "@/components/ui/EmptyState";
import { PhotoTile } from "./PhotoTile";
import { PhotoLightbox } from "./PhotoLightbox";

interface PhotosGalleryProps {
  initialPhotos: PhotoDTO[];
}

export function PhotosGallery({ initialPhotos }: PhotosGalleryProps) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [lightbox, setLightbox] = useState<PhotoDTO | null>(null);

  const weeks = useMemo(() => {
    const buckets = new Map<string, PhotoDTO[]>();
    for (const photo of photos) {
      const existing = buckets.get(photo.weekStartDate) ?? [];
      existing.push(photo);
      buckets.set(photo.weekStartDate, existing);
    }
    return Array.from(buckets.entries()).sort(([a], [b]) => (a < b ? 1 : -1));
  }, [photos]);

  if (photos.length === 0) {
    return (
      <EmptyState
        icon="📷"
        title="No photos yet"
        description="Weekly progress photos help you see changes the scale can’t."
      />
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        {weeks.map(([weekStart, weekPhotos]) => (
          <section key={weekStart}>
            <h3 className="mb-2 text-sm font-semibold text-default-600">
              Week of {format(parseISO(weekStart), "MMM d, yyyy")}
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {weekPhotos.map((photo) => (
                <PhotoTile
                  key={photo.id}
                  photo={photo}
                  onOpen={() => setLightbox(photo)}
                  onDeleted={() =>
                    setPhotos((prev) => prev.filter((p) => p.id !== photo.id))
                  }
                />
              ))}
            </div>
          </section>
        ))}
      </div>
      <PhotoLightbox photo={lightbox} onClose={() => setLightbox(null)} />
    </>
  );
}
