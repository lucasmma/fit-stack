"use client";

import { Button } from "@heroui/react";
import { useFormContext } from "react-hook-form";
import type { ReactNode } from "react";

interface SubmitButtonProps {
  children: ReactNode;
  fullWidth?: boolean;
  color?: "primary" | "danger" | "default";
}

export function SubmitButton({
  children,
  fullWidth = false,
  color = "primary",
}: SubmitButtonProps) {
  const { formState } = useFormContext();
  return (
    <Button
      type="submit"
      color={color}
      fullWidth={fullWidth}
      isLoading={formState.isSubmitting}
      isDisabled={formState.isSubmitting}
    >
      {children}
    </Button>
  );
}
