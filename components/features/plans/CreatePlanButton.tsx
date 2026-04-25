"use client";

import { useState } from "react";
import { Button, useDisclosure } from "@heroui/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useZodForm } from "@/lib/hooks/use-zod-form";
import { CreatePlanInputSchema, type CreatePlanInput } from "@/lib/schemas/plan";
import { api } from "@/lib/api-client";
import { FormRoot } from "@/components/forms/FormRoot";
import { TextField, TextAreaField } from "@/components/forms/Field";
import { StandardModal } from "@/components/ui/StandardModal";

export function CreatePlanButton() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const form = useZodForm({
    schema: CreatePlanInputSchema,
    defaultValues: { name: "", description: "" },
    onSubmit: async (values) => {
      setSubmitting(true);
      try {
        const plan = await api.plans.create(values);
        toast.success("Plan created");
        onClose();
        form.reset();
        router.refresh();
        router.push(`/plans/${plan.id}`);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <>
      <Button color="primary" onPress={onOpen}>
        New plan
      </Button>
      <StandardModal
        isOpen={isOpen}
        onClose={onClose}
        size="md"
        scrollBehavior="inside"
        title="New plan"
        bodyClassName="flex flex-col gap-3"
        contentWrapper={(c) => (
          <FormRoot form={form} className="contents">
            {c}
          </FormRoot>
        )}
        footer={
          <>
            <Button variant="light" onPress={onClose} isDisabled={submitting}>
              Cancel
            </Button>
            <Button color="primary" type="submit" isLoading={submitting}>
              Create
            </Button>
          </>
        }
      >
        <TextField<CreatePlanInput>
          name="name"
          label="Plan name"
          placeholder="e.g. PPL, Upper/Lower"
          isRequired
          autoFocus
        />
        <TextAreaField<CreatePlanInput>
          name="description"
          label="Description"
          placeholder="Optional notes about this plan"
        />
      </StandardModal>
    </>
  );
}
