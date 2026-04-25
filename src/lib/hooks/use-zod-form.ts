"use client";

import { useForm, type DefaultValues, type UseFormReturn, type FieldValues, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { ApiError } from "@/lib/api-client";
import { toast } from "sonner";

interface UseZodFormArgs<TSchema extends z.ZodType> {
  schema: TSchema;
  defaultValues?: DefaultValues<z.infer<TSchema>>;
  onSubmit: (values: z.infer<TSchema>) => Promise<void> | void;
}

export interface UseZodFormReturn<TSchema extends z.ZodType>
  extends UseFormReturn<z.infer<TSchema>> {
  submit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isSubmitting: boolean;
}

export function useZodForm<TSchema extends z.ZodType>(
  args: UseZodFormArgs<TSchema>,
): UseZodFormReturn<TSchema> {
  const form = useForm<z.infer<TSchema>>({
    resolver: zodResolver(args.schema) as never,
    defaultValues: args.defaultValues,
    mode: "onBlur",
  });

  const submit = form.handleSubmit(async (values) => {
    try {
      await args.onSubmit(values);
    } catch (err) {
      handleSubmissionError(err, form);
    }
  });

  return { ...form, submit, isSubmitting: form.formState.isSubmitting };
}

function handleSubmissionError<TValues extends FieldValues>(
  err: unknown,
  form: UseFormReturn<TValues>,
) {
  if (err instanceof ApiError) {
    if (err.status === 400 && Array.isArray(err.issues)) {
      for (const issue of err.issues as Array<{ path: Array<string | number>; message: string }>) {
        const path = issue.path.join(".");
        if (path) {
          form.setError(path as Path<TValues>, { message: issue.message });
        }
      }
      return;
    }
    toast.error(err.message);
    return;
  }
  toast.error(err instanceof Error ? err.message : "Something went wrong.");
}
