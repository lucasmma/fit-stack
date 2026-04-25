"use client";

import { FormProvider } from "react-hook-form";
import type { ReactNode } from "react";
import type { UseZodFormReturn } from "@/lib/hooks/use-zod-form";
import type { z } from "zod";

interface FormRootProps<TSchema extends z.ZodType> {
  form: UseZodFormReturn<TSchema>;
  children: ReactNode;
  className?: string;
}

export function FormRoot<TSchema extends z.ZodType>({
  form,
  children,
  className,
}: FormRootProps<TSchema>) {
  // Destructure our extensions so FormProvider only sees UseFormReturn fields.
  const { submit: _submit, isSubmitting: _isSubmitting, ...rhf } = form;
  return (
    <FormProvider {...rhf}>
      <form onSubmit={form.submit} className={className} noValidate>
        {children}
      </form>
    </FormProvider>
  );
}
