"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";

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
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalBody>
          <p className="text-sm text-default-600">{message}</p>
        </ModalBody>
        <ModalFooter>
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
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
