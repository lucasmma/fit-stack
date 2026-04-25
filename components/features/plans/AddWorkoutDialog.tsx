"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { useZodForm } from "@/lib/hooks/use-zod-form";
import {
  CreateWorkoutInputSchema,
  type CreateWorkoutInput,
} from "@/lib/schemas/workout";
import { FormRoot } from "@/components/forms/FormRoot";
import { TextField, TextAreaField } from "@/components/forms/Field";

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
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalContent>
        <ModalHeader>Add workout</ModalHeader>
        <FormRoot form={form} className="contents">
          <ModalBody className="flex flex-col gap-3">
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
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose} isDisabled={form.isSubmitting}>
              Cancel
            </Button>
            <Button color="primary" type="submit" isLoading={form.isSubmitting}>
              Add
            </Button>
          </ModalFooter>
        </FormRoot>
      </ModalContent>
    </Modal>
  );
}
