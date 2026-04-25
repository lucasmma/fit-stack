"use client";

import { useRef, useState } from "react";
import {
  Button,
  Input,
  useDisclosure,
  Progress,
} from "@heroui/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { ALLOWED_CONTENT_TYPES, MAX_PHOTO_BYTES } from "@/lib/schemas/photo";
import { useZodForm } from "@/lib/hooks/use-zod-form";
import { FormRoot } from "@/components/forms/FormRoot";
import { TextAreaField, NumberField } from "@/components/forms/Field";
import { api, ApiError } from "@/lib/api-client";
import { isoWeekStart } from "@/lib/utils/week-start";
import { StandardModal } from "@/components/ui/StandardModal";

const uploadSchema = z.object({
  takenAt: z.string().min(1, "Date is required"),
  bodyWeightKg: z.number().min(0).max(999).nullable().optional(),
  bodyFatPct: z.number().min(0).max(100).nullable().optional(),
  notes: z.string().max(500).optional(),
});

type UploadInput = z.infer<typeof uploadSchema>;

export function UploadPhotoButton() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);

  const defaultDate = new Date().toISOString().slice(0, 10);

  const form = useZodForm({
    schema: uploadSchema,
    defaultValues: {
      takenAt: defaultDate,
      bodyWeightKg: undefined,
      bodyFatPct: undefined,
      notes: "",
    },
    onSubmit: async (values) => {
      if (!file) {
        toast.error("Please choose a photo");
        return;
      }
      await uploadFlow(file, values);
    },
  });

  const uploadFlow = async (selected: File, values: UploadInput) => {
    if (!ALLOWED_CONTENT_TYPES.includes(selected.type as (typeof ALLOWED_CONTENT_TYPES)[number])) {
      toast.error("Use JPG, PNG, or WebP");
      return;
    }
    if (selected.size > MAX_PHOTO_BYTES) {
      toast.error("File is too large (max 10MB)");
      return;
    }

    try {
      setProgress(10);
      const presign = await api.photos.presign({
        contentType: selected.type as (typeof ALLOWED_CONTENT_TYPES)[number],
        bytes: selected.size,
      });
      setProgress(30);
      const putRes = await fetch(presign.uploadUrl, {
        method: "PUT",
        headers: { "content-type": selected.type },
        body: selected,
      });
      if (!putRes.ok) throw new Error("S3 upload failed");
      setProgress(70);

      const dims = await readImageDimensions(selected).catch(() => null);
      const taken = new Date(values.takenAt);

      await api.photos.confirm({
        s3Key: presign.s3Key,
        contentType: selected.type as (typeof ALLOWED_CONTENT_TYPES)[number],
        bytes: selected.size,
        width: dims?.width,
        height: dims?.height,
        takenAt: taken.toISOString(),
        weekStartDate: isoWeekStart(taken),
        bodyWeightKg: values.bodyWeightKg ?? undefined,
        bodyFatPct: values.bodyFatPct ?? undefined,
        notes: values.notes || undefined,
      });
      setProgress(100);
      toast.success("Photo uploaded");
      reset();
      onClose();
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Upload failed");
    } finally {
      setProgress(0);
    }
  };

  const reset = () => {
    setFile(null);
    setProgress(0);
    form.reset();
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleClose = () => {
    if (progress > 0 && progress < 100) return;
    reset();
    onClose();
  };

  return (
    <>
      <Button color="primary" onPress={onOpen}>
        Upload photo
      </Button>
      <StandardModal
        isOpen={isOpen}
        onClose={handleClose}
        size="md"
        title="Upload progress photo"
        bodyClassName="flex flex-col gap-3"
        contentWrapper={(c) => (
          <FormRoot form={form} className="contents">
            {c}
          </FormRoot>
        )}
        footer={
          <>
            <Button variant="light" onPress={handleClose} isDisabled={progress > 0 && progress < 100}>
              Cancel
            </Button>
            <Button
              color="primary"
              type="submit"
              isLoading={progress > 0 && progress < 100}
              isDisabled={!file}
            >
              Upload
            </Button>
          </>
        }
      >
        <div>
          <label className="mb-1 block text-sm font-medium">Photo</label>
          <input
            ref={fileRef}
            type="file"
            accept={ALLOWED_CONTENT_TYPES.join(",")}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-default-600 file:mr-3 file:rounded-medium file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
          />
          {file && (
            <p className="mt-1 text-xs text-default-500">
              {file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          )}
        </div>
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
        {progress > 0 && (
          <Progress
            value={progress}
            color="primary"
            size="sm"
            aria-label="Upload progress"
          />
        )}
      </StandardModal>
    </>
  );
}

async function readImageDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      reject(new Error("Could not read image"));
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}
