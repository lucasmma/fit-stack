"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { PHOTO_POSES, POSE_LABEL, type PhotoDTO, type PhotoPose } from "@/lib/schemas/photo";
import { EmptyState } from "@/components/ui/EmptyState";
import { PhotoTile } from "./PhotoTile";
import { PhotoLightbox } from "./PhotoLightbox";

interface PhotosGalleryProps {
  initialPhotos: PhotoDTO[];
}

type WeekBucket = {
  weekStart: string;
  sets: Array<{ setId: string; takenAt: string; byPose: Map<PhotoPose, PhotoDTO> }>;
  legacy: PhotoDTO[];
};

export function PhotosGallery({ initialPhotos }: PhotosGalleryProps) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [lightbox, setLightbox] = useState<PhotoDTO | null>(null);

  const weeks = useMemo<WeekBucket[]>(() => {
    const byWeek = new Map<string, WeekBucket>();
    for (const photo of photos) {
      const bucket = byWeek.get(photo.weekStartDate) ?? {
        weekStart: photo.weekStartDate,
        sets: [],
        legacy: [],
      };

      if (photo.photoSetId && photo.pose) {
        let set = bucket.sets.find((s) => s.setId === photo.photoSetId);
        if (!set) {
          set = { setId: photo.photoSetId, takenAt: photo.takenAt, byPose: new Map() };
          bucket.sets.push(set);
        }
        set.byPose.set(photo.pose, photo);
        if (photo.takenAt > set.takenAt) set.takenAt = photo.takenAt;
      } else {
        bucket.legacy.push(photo);
      }
      byWeek.set(photo.weekStartDate, bucket);
    }

    const buckets = Array.from(byWeek.values());
    for (const b of buckets) {
      b.sets.sort((a, z) => (a.takenAt < z.takenAt ? 1 : -1));
    }
    return buckets.sort((a, z) => (a.weekStart < z.weekStart ? 1 : -1));
  }, [photos]);

  const removePhoto = (id: string) =>
    setPhotos((prev) => prev.filter((p) => p.id !== id));

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
        {weeks.map((bucket) => (
          <section key={bucket.weekStart}>
            <h3 className="mb-2 text-sm font-semibold text-default-600">
              Week of {format(parseISO(bucket.weekStart), "MMM d, yyyy")}
            </h3>
            <div className="flex flex-col gap-4">
              {bucket.sets.map((set) => (
                <div key={set.setId} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {PHOTO_POSES.map((pose) => {
                    const photo = set.byPose.get(pose);
                    return photo ? (
                      <PhotoTile
                        key={pose}
                        photo={photo}
                        onOpen={() => setLightbox(photo)}
                        onDeleted={() => removePhoto(photo.id)}
                      />
                    ) : (
                      <PosePlaceholder key={pose} pose={pose} />
                    );
                  })}
                </div>
              ))}
              {bucket.legacy.length > 0 && (
                <div>
                  {bucket.sets.length > 0 && (
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-default-500">
                      Sem pose
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {bucket.legacy.map((photo) => (
                      <PhotoTile
                        key={photo.id}
                        photo={photo}
                        onOpen={() => setLightbox(photo)}
                        onDeleted={() => removePhoto(photo.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        ))}
      </div>
      <PhotoLightbox photo={lightbox} onClose={() => setLightbox(null)} />
    </>
  );
}

function PosePlaceholder({ pose }: { pose: PhotoPose }) {
  return (
    <div className="flex aspect-[3/4] flex-col items-center justify-center rounded-medium border border-dashed border-default-200 bg-default-50 text-xs text-default-500">
      <span className="text-[10px] uppercase tracking-wide">{POSE_LABEL[pose]}</span>
      <span className="mt-1 text-default-400">—</span>
    </div>
  );
}
