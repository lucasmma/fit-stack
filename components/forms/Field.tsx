"use client";

import { Input, Textarea, Select, SelectItem } from "@heroui/react";
import { Controller, useFormContext, type FieldPath, type FieldValues } from "react-hook-form";
import type { ReactNode } from "react";

type BaseProps<TValues extends FieldValues> = {
  name: FieldPath<TValues>;
  label: string;
  placeholder?: string;
  description?: ReactNode;
  isRequired?: boolean;
  autoFocus?: boolean;
  autoComplete?: string;
};

export function TextField<TValues extends FieldValues>({
  type = "text",
  ...props
}: BaseProps<TValues> & { type?: "text" | "email" | "password" | "url" }) {
  const { control } = useFormContext<TValues>();
  return (
    <Controller
      control={control}
      name={props.name}
      render={({ field, fieldState }) => (
        <Input
          {...field}
          value={field.value ?? ""}
          type={type}
          label={props.label}
          placeholder={props.placeholder}
          description={props.description}
          isRequired={props.isRequired}
          autoFocus={props.autoFocus}
          autoComplete={props.autoComplete}
          isInvalid={!!fieldState.error}
          errorMessage={fieldState.error?.message}
          variant="bordered"
        />
      )}
    />
  );
}

export function NumberField<TValues extends FieldValues>({
  step = 1,
  min,
  max,
  ...props
}: BaseProps<TValues> & { step?: number; min?: number; max?: number; endContent?: ReactNode }) {
  const { control } = useFormContext<TValues>();
  return (
    <Controller
      control={control}
      name={props.name}
      render={({ field, fieldState }) => (
        <Input
          value={field.value === null || field.value === undefined ? "" : String(field.value)}
          onChange={(e) => {
            const raw = e.target.value;
            field.onChange(raw === "" ? null : Number(raw));
          }}
          onBlur={field.onBlur}
          type="number"
          step={step}
          min={min}
          max={max}
          label={props.label}
          placeholder={props.placeholder}
          description={props.description}
          isRequired={props.isRequired}
          isInvalid={!!fieldState.error}
          errorMessage={fieldState.error?.message}
          variant="bordered"
          inputMode="decimal"
        />
      )}
    />
  );
}

export function TextAreaField<TValues extends FieldValues>({
  rows = 3,
  ...props
}: BaseProps<TValues> & { rows?: number }) {
  const { control } = useFormContext<TValues>();
  return (
    <Controller
      control={control}
      name={props.name}
      render={({ field, fieldState }) => (
        <Textarea
          {...field}
          value={field.value ?? ""}
          minRows={rows}
          label={props.label}
          placeholder={props.placeholder}
          description={props.description}
          isRequired={props.isRequired}
          isInvalid={!!fieldState.error}
          errorMessage={fieldState.error?.message}
          variant="bordered"
        />
      )}
    />
  );
}

type SelectOption = { value: string; label: string };

export function SelectField<TValues extends FieldValues>({
  options,
  ...props
}: BaseProps<TValues> & { options: SelectOption[] }) {
  const { control } = useFormContext<TValues>();
  return (
    <Controller
      control={control}
      name={props.name}
      render={({ field, fieldState }) => (
        <Select
          selectedKeys={field.value ? new Set([String(field.value)]) : new Set()}
          onSelectionChange={(keys) => {
            const next = Array.from(keys as Set<string>)[0];
            field.onChange(next ?? null);
          }}
          label={props.label}
          placeholder={props.placeholder}
          description={props.description}
          isRequired={props.isRequired}
          isInvalid={!!fieldState.error}
          errorMessage={fieldState.error?.message}
          variant="bordered"
        >
          {options.map((opt) => (
            <SelectItem key={opt.value}>{opt.label}</SelectItem>
          ))}
        </Select>
      )}
    />
  );
}
