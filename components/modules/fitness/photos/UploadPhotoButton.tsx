"use client";

import { useMemo, useRef, useState } from "react";
import { Button, Input, useDisclosure } from "@heroui/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { z } from "zod";
import {
  ALLOWED_CONTENT_TYPES,
  MAX_PHOTO_BYTES,
  PHOTO_POSES,
  POSE_LABEL,
  type ConfirmPhotoSetItem,
  type PhotoPose,
} from "@/lib/schemas/fitness/photo";
import { useZodForm } from "@/lib/hooks/use-zod-form";
import { FormRoot } from "@/components/forms/FormRoot";
import { TextAreaField, NumberField } from "@/components/forms/Field";
import { api, ApiError } from "@/lib/api-client";
import { isoWeekStart } from "@/lib/utils/week-start";
import { compressImage } from "@/lib/utils/image-compress";
import { StandardModal } from "@/components/ui/StandardModal";

const uploadSchema = z.object({
  takenAt: z.string().min(1, "Date is required"),
  bodyWeightKg: z.number().min(0).max(999).nullable().optional(),
  bodyFatPct: z.number().min(0).max(100).nullable().optional(),
  notes: z.string().max(500).optional(),
});

type UploadInput = z.infer<typeof uploadSchema>;
type AllowedContentType = (typeof ALLOWED_CONTENT_TYPES)[number];

type SlotState = {
  file: File | null;
  preview: string | null;
  status: "idle" | "uploading" | "done" | "error";
};

const initialSlotState = (): SlotState => ({
  file: null,
  preview: null,
  status: "idle",
});

export function UploadPhotoButton() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const [slots, setSlots] = useState<Record<PhotoPose, SlotState>>(() => ({
    FRONT: initialSlotState(),
    LEFT: initialSlotState(),
    BACK: initialSlotState(),
    RIGHT: initialSlotState(),
  }));
  const photoSetIdRef = useRef<string | null>(null);
  const uploadedItemsRef = useRef<Map<PhotoPose, ConfirmPhotoSetItem>>(new Map());
  const [submitting, setSubmitting] = useState(false);

  const defaultDate = new Date().toISOString().slice(0, 10);

  const filledCount = useMemo(
    () => PHOTO_POSES.filter((pose) => slots[pose].file != null).length,
    [slots],
  );

  const form = useZodForm({
    schema: uploadSchema,
    defaultValues: {
      takenAt: defaultDate,
      bodyWeightKg: undefined,
      bodyFatPct: undefined,
      notes: "",
    },
    onSubmit: async (values) => {
      const filled = PHOTO_POSES.filter((pose) => slots[pose].file != null);
      if (filled.length === 0) {
        toast.error("Choose at least one photo");
        return;
      }
      await uploadFlow(values, filled);
    },
  });

  const setSlot = (pose: PhotoPose, next: SlotState) => {
    setSlots((prev) => {
      const previous = prev[pose];
      if (previous.preview && previous.preview !== next.preview) {
        URL.revokeObjectURL(previous.preview);
      }
      return { ...prev, [pose]: next };
    });
  };

  const handleFileChange = (pose: PhotoPose, file: File | null) => {
    if (!file) {
      setSlot(pose, initialSlotState());
      return;
    }
    if (!ALLOWED_CONTENT_TYPES.includes(file.type as AllowedContentType)) {
      toast.error("Use JPG, PNG, or WebP");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      toast.error("File is too large (max 10MB)");
      return;
    }
    uploadedItemsRef.current.delete(pose);
    setSlot(pose, {
      file,
      preview: URL.createObjectURL(file),
      status: "idle",
    });
  };

  const uploadFlow = async (values: UploadInput, posesToUpload: PhotoPose[]) => {
    setSubmitting(true);
    if (!photoSetIdRef.current) {
      photoSetIdRef.current = crypto.randomUUID();
    }
    const photoSetId = photoSetIdRef.current;

    setSlots((prev) => {
      const next = { ...prev };
      for (const pose of posesToUpload) {
        next[pose] = { ...next[pose], status: "uploading" };
      }
      return next;
    });

    const results = await Promise.allSettled(
      posesToUpload.map((pose) => uploadOne(pose)),
    );

    const failedPoses: PhotoPose[] = [];
    setSlots((prev) => {
      const next = { ...prev };
      results.forEach((result, idx) => {
        const pose = posesToUpload[idx];
        if (result.status === "fulfilled") {
          uploadedItemsRef.current.set(pose, result.value);
          next[pose] = { ...next[pose], status: "done" };
        } else {
          failedPoses.push(pose);
          next[pose] = { ...next[pose], status: "error" };
        }
      });
      return next;
    });

    if (failedPoses.length > 0) {
      const labels = failedPoses.map((p) => POSE_LABEL[p]).join(", ");
      toast.error(`Upload failed for: ${labels}. Click Upload again to retry.`);
      setSubmitting(false);
      return;
    }

    const items = Array.from(uploadedItemsRef.current.values());
    const taken = new Date(values.takenAt);

    try {
      await api.photos.confirmSet({
        photoSetId,
        takenAt: taken.toISOString(),
        weekStartDate: isoWeekStart(taken),
        bodyWeightKg: values.bodyWeightKg ?? undefined,
        bodyFatPct: values.bodyFatPct ?? undefined,
        notes: values.notes || undefined,
        photos: items,
      });
      toast.success(`Uploaded ${items.length} photo${items.length === 1 ? "" : "s"}`);
      reset();
      onClose();
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not save photo set");
    } finally {
      setSubmitting(false);
    }
  };

  const uploadOne = async (pose: PhotoPose): Promise<ConfirmPhotoSetItem> => {
    const cached = uploadedItemsRef.current.get(pose);
    if (cached) return cached;

    const slot = slots[pose];
    const file = slot.file;
    if (!file) throw new Error("Missing file");

    const compressed = await compressImage(file);

    const presign = await api.photos.presign({
      contentType: compressed.type,
      bytes: compressed.blob.size,
    });
    const putRes = await fetch(presign.uploadUrl, {
      method: "PUT",
      headers: { "content-type": compressed.type },
      body: compressed.blob,
    });
    if (!putRes.ok) throw new Error("S3 upload failed");

    return {
      s3Key: presign.s3Key,
      contentType: compressed.type,
      bytes: compressed.blob.size,
      width: compressed.width,
      height: compressed.height,
      pose,
    };
  };

  const reset = () => {
    setSlots((prev) => {
      for (const pose of PHOTO_POSES) {
        const url = prev[pose].preview;
        if (url) URL.revokeObjectURL(url);
      }
      return {
        FRONT: initialSlotState(),
        LEFT: initialSlotState(),
        BACK: initialSlotState(),
        RIGHT: initialSlotState(),
      };
    });
    photoSetIdRef.current = null;
    uploadedItemsRef.current.clear();
    setSubmitting(false);
    form.reset();
  };

  const handleClose = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  return (
    <>
      <Button color="primary" onPress={onOpen}>
        Upload photos
      </Button>
      <StandardModal
        isOpen={isOpen}
        onClose={handleClose}
        size="2xl"
        scrollBehavior="inside"
        title="Upload progress photo set"
        bodyClassName="flex flex-col gap-4"
        contentWrapper={(c) => (
          <FormRoot form={form} className="contents">
            {c}
          </FormRoot>
        )}
        footer={
          <>
            <Button variant="light" onPress={handleClose} isDisabled={submitting}>
              Cancel
            </Button>
            <Button
              color="primary"
              type="submit"
              isLoading={submitting}
              isDisabled={filledCount === 0}
            >
              Upload {filledCount > 0 ? `(${filledCount})` : ""}
            </Button>
          </>
        }
      >
        <Input
          label="Date taken"
          type="date"
          variant="bordered"
          value={form.watch("takenAt") as string}
          onChange={(e) => form.setValue("takenAt", e.target.value)}
          isInvalid={!!form.formState.errors.takenAt}
          errorMessage={form.formState.errors.takenAt?.message}
        />
        <div className="grid grid-cols-2 gap-3">
          <NumberField<UploadInput>
            name="bodyWeightKg"
            label="Body weight"
            step={0.1}
            min={0}
            max={999}
          />
          <NumberField<UploadInput>
            name="bodyFatPct"
            label="Body fat %"
            step={0.1}
            min={0}
            max={100}
          />
        </div>
        <TextAreaField<UploadInput>
          name="notes"
          label="Notes"
          placeholder="Optional"
        />
        <div>
          <p className="mb-2 text-sm font-medium">Photos by pose</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {PHOTO_POSES.map((pose) => (
              <PoseSlot
                key={pose}
                pose={pose}
                slot={slots[pose]}
                onSelect={(file) => handleFileChange(pose, file)}
                disabled={submitting}
              />
            ))}
          </div>
          <p className="mt-2 text-xs text-default-500">
            At least one pose. Empty slots can stay blank.
          </p>
        </div>
      </StandardModal>
    </>
  );
}

interface PoseSlotProps {
  pose: PhotoPose;
  slot: SlotState;
  onSelect: (file: File | null) => void;
  disabled: boolean;
}

function PoseSlot({ pose, slot, onSelect, disabled }: PoseSlotProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = () => inputRef.current?.click();

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-default-700">{POSE_LABEL[pose]}</span>
        <StatusBadge status={slot.status} />
      </div>
      <button
        type="button"
        onClick={openPicker}
        disabled={disabled}
        className="relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-medium border border-dashed border-default-300 bg-default-50 text-xs text-default-500 transition-colors hover:border-primary disabled:opacity-60"
      >
        {slot.preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={slot.preview} alt="" className="h-full w-full object-cover" />
        ) : (
          <span>Tap to choose</span>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_CONTENT_TYPES.join(",")}
        className="hidden"
        onChange={(e) => onSelect(e.target.files?.[0] ?? null)}
      />
      {slot.file && (
        <div className="flex items-center justify-between gap-1">
          <span className="truncate text-[11px] text-default-500">
            {(slot.file.size / 1024 / 1024).toFixed(2)} MB
          </span>
          <Button
            size="sm"
            variant="light"
            onPress={() => onSelect(null)}
            isDisabled={disabled}
          >
            Remove
          </Button>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: SlotState["status"] }) {
  if (status === "idle") return null;
  const map: Record<Exclude<SlotState["status"], "idle">, { label: string; cls: string }> = {
    uploading: { label: "Uploading…", cls: "bg-primary/10 text-primary" },
    done: { label: "Sent", cls: "bg-success/10 text-success" },
    error: { label: "Failed", cls: "bg-danger/10 text-danger" },
  };
  const { label, cls } = map[status];
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${cls}`}>{label}</span>
  );
}

