"use client";

import { Button } from "@heroui/react";
import { useZodForm } from "@/lib/hooks/use-zod-form";
import {
  CreateWorkoutInputSchema,
  type CreateWorkoutInput,
} from "@/lib/schemas/fitness/workout";
import { FormRoot } from "@/components/forms/FormRoot";
import { TextField, TextAreaField } from "@/components/forms/Field";
import { StandardModal } from "@/components/ui/StandardModal";

interface AddWorkoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (values: CreateWorkoutInput) => Promise<void>;
}

export function AddWorkoutDialog({ isOpen, onClose, onCreate }: AddWorkoutDialogProps) {
  const form = useZodForm({
    schema: CreateWorkoutInputSchema,
    defaultValues: { name: "", description: "" },
    onSubmit: async (values) => {
      await onCreate(values);
      form.reset();
    },
  });

  return (
    <StandardModal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      scrollBehavior="inside"
      title="Add workout"
      bodyClassName="flex flex-col gap-3"
      contentWrapper={(c) => (
        <FormRoot form={form} className="contents">
          {c}
        </FormRoot>
      )}
      footer={
        <>
          <Button variant="light" onPress={onClose} isDisabled={form.isSubmitting}>
            Cancel
          </Button>
          <Button color="primary" type="submit" isLoading={form.isSubmitting}>
            Add
          </Button>
        </>
      }
    >
      <TextField<CreateWorkoutInput>
        name="name"
        label="Workout name"
        placeholder="e.g. Push, Pull, Legs"
        isRequired
        autoFocus
      />
      <TextAreaField<CreateWorkoutInput>
        name="description"
        label="Description"
        placeholder="Optional"
      />
    </StandardModal>
  );
}
