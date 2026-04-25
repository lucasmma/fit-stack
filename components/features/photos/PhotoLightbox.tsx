"use client";

import { Modal, ModalContent, ModalBody } from "@heroui/react";
import { format, parseISO } from "date-fns";
import type { PhotoDTO } from "@/lib/schemas/photo";

interface PhotoLightboxProps {
  photo: PhotoDTO | null;
  onClose: () => void;
}

export function PhotoLightbox({ photo, onClose }: PhotoLightboxProps) {
  return (
    <Modal isOpen={!!photo} onClose={onClose} size="3xl" scrollBehavior="inside">
      <ModalContent>
        {photo && (
          <ModalBody className="items-center gap-3 p-2">
            <img
              src={photo.url}
              alt=""
              className="max-h-[80vh] w-auto rounded-medium object-contain"
            />
            <div className="flex items-center gap-4 text-sm text-default-500">
              <span>{format(parseISO(photo.takenAt), "PPP")}</span>
              {photo.bodyWeightKg != null && <span>{photo.bodyWeightKg} kg</span>}
              {photo.bodyFatPct != null && <span>{photo.bodyFatPct}%</span>}
            </div>
            {photo.notes && <p className="text-sm text-default-500">{photo.notes}</p>}
          </ModalBody>
        )}
      </ModalContent>
    </Modal>
  );
}
