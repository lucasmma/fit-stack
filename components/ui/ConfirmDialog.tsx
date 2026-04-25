"use client";

import { Button } from "@heroui/react";
import { StandardModal } from "./StandardModal";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
  onClose,
  isLoading,
}: ConfirmDialogProps) {
  return (
    <StandardModal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title={title}
      footer={
        <>
          <Button variant="light" onPress={onClose} isDisabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            color={destructive ? "danger" : "primary"}
            onPress={() => void onConfirm()}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-default-600">{message}</p>
    </StandardModal>
  );
}
