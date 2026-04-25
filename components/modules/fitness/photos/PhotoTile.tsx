"use client";

import Image from "next/image";
import { Card, Button, useDisclosure } from "@heroui/react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { useState } from "react";
import { POSE_LABEL, type PhotoDTO } from "@/lib/schemas/fitness/photo";
import { api, ApiError } from "@/lib/api-client";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface PhotoTileProps {
  photo: PhotoDTO;
  onOpen: () => void;
  onDeleted: () => void;
}

export function PhotoTile({ photo, onOpen, onDeleted }: PhotoTileProps) {
  const confirm = useDisclosure();
  const [deleting, setDeleting] = useState(false);

  const remove = async () => {
    setDeleting(true);
    try {
      await api.photos.delete(photo.id);
      toast.success("Photo deleted");
      confirm.onClose();
      onDeleted();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not delete photo");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card shadow="sm" className="overflow-hidden">
      <button
        type="button"
        onClick={onOpen}
        className="group relative block aspect-[3/4] w-full"
        aria-label={`View photo from ${format(parseISO(photo.takenAt), "PPP")}`}
      >
        <Image
          src={photo.url}
          alt=""
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
          className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
          unoptimized
        />
        {photo.pose && (
          <span className="absolute left-2 top-2 rounded-full bg-default-900/70 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
            {POSE_LABEL[photo.pose]}
          </span>
        )}
      </button>
      <div className="flex items-center justify-between gap-2 px-2 py-2 text-xs">
        <span className="text-default-600">{format(parseISO(photo.takenAt), "MMM d")}</span>
        {photo.bodyWeightKg != null && (
          <span className="text-default-500">{photo.bodyWeightKg} kg</span>
        )}
        <Button
          isIconOnly
          size="sm"
          variant="light"
          color="danger"
          aria-label="Delete photo"
          onPress={confirm.onOpen}
        >
          ✕
        </Button>
      </div>
      <ConfirmDialog
        isOpen={confirm.isOpen}
        onClose={confirm.onClose}
        onConfirm={remove}
        title="Delete photo?"
        message="This cannot be undone."
        confirmLabel="Delete"
        destructive
        isLoading={deleting}
      />
    </Card>
  );
}
