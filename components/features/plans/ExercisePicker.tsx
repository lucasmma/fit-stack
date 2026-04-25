"use client";

import { useMemo, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Button,
  Listbox,
  ListboxItem,
  Tabs,
  Tab,
} from "@heroui/react";
import { toast } from "sonner";
import type { ExerciseDTO, CreateExerciseInput } from "@/lib/schemas/exercise";
import { CreateExerciseInputSchema } from "@/lib/schemas/exercise";
import { api, ApiError } from "@/lib/api-client";
import { useZodForm } from "@/lib/hooks/use-zod-form";
import { FormRoot } from "@/components/forms/FormRoot";
import { TextField, TextAreaField } from "@/components/forms/Field";

interface ExercisePickerProps {
  isOpen: boolean;
  onClose: () => void;
  catalog: ExerciseDTO[];
  onSelect: (exercise: ExerciseDTO) => void | Promise<void>;
}

export function ExercisePicker({ isOpen, onClose, catalog, onSelect }: ExercisePickerProps) {
  const [tab, setTab] = useState<"search" | "new">("search");
  const [query, setQuery] = useState("");
  const [localCatalog, setLocalCatalog] = useState(catalog);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return localCatalog;
    return localCatalog.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        (e.muscleGroup ?? "").toLowerCase().includes(q) ||
        (e.equipment ?? "").toLowerCase().includes(q),
    );
  }, [localCatalog, query]);

  const form = useZodForm({
    schema: CreateExerciseInputSchema,
    defaultValues: { name: "", muscleGroup: "", equipment: "", description: "" },
    onSubmit: async (values: CreateExerciseInput) => {
      try {
        const created = await api.exercises.create(values);
        setLocalCatalog((prev) => [created, ...prev]);
        form.reset();
        toast.success("Exercise created");
        await onSelect(created);
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : "Could not create exercise");
      }
    },
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader>Add exercise</ModalHeader>
        <ModalBody className="gap-3">
          <Tabs
            selectedKey={tab}
            onSelectionChange={(key) => setTab(key as "search" | "new")}
            aria-label="Exercise source"
          >
            <Tab key="search" title="Catalog">
              <div className="flex flex-col gap-3">
                <Input
                  autoFocus
                  variant="bordered"
                  placeholder="Search exercises…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <Listbox
                  aria-label="Exercises"
                  emptyContent="No matching exercises"
                  className="max-h-80"
                >
                  {filtered.map((exercise) => (
                    <ListboxItem
                      key={exercise.id}
                      description={[exercise.muscleGroup, exercise.equipment]
                        .filter(Boolean)
                        .join(" · ")}
                      onPress={() => void onSelect(exercise)}
                    >
                      {exercise.name}
                    </ListboxItem>
                  ))}
                </Listbox>
              </div>
            </Tab>
            <Tab key="new" title="Create custom">
              <FormRoot form={form} className="flex flex-col gap-3">
                <TextField<CreateExerciseInput>
                  name="name"
                  label="Name"
                  placeholder="e.g. Cable Crossover"
                  isRequired
                />
                <div className="grid grid-cols-2 gap-3">
                  <TextField<CreateExerciseInput>
                    name="muscleGroup"
                    label="Muscle group"
                    placeholder="e.g. Chest"
                  />
                  <TextField<CreateExerciseInput>
                    name="equipment"
                    label="Equipment"
                    placeholder="e.g. Cable"
                  />
                </div>
                <TextAreaField<CreateExerciseInput>
                  name="description"
                  label="Description"
                  placeholder="Optional cues or notes"
                />
                <Button type="submit" color="primary" isLoading={form.isSubmitting}>
                  Create and add
                </Button>
              </FormRoot>
            </Tab>
          </Tabs>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
