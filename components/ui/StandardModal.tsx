"use client";

import type { ComponentProps, ReactNode } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";

type ModalSize = ComponentProps<typeof Modal>["size"];
type ModalScrollBehavior = ComponentProps<typeof Modal>["scrollBehavior"];

export interface StandardModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
  scrollBehavior?: ModalScrollBehavior;
  bodyClassName?: string;
  isDismissable?: boolean;
  hideCloseButton?: boolean;
  contentWrapper?: (children: ReactNode) => ReactNode;
}

export function StandardModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  scrollBehavior,
  bodyClassName,
  isDismissable,
  hideCloseButton,
  contentWrapper,
}: StandardModalProps) {
  const inner = (
    <>
      {title && <ModalHeader>{title}</ModalHeader>}
      <ModalBody className={bodyClassName}>{children}</ModalBody>
      {footer && <ModalFooter>{footer}</ModalFooter>}
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={size}
      scrollBehavior={scrollBehavior}
      isDismissable={isDismissable}
      hideCloseButton={hideCloseButton}
    >
      <ModalContent>{contentWrapper ? contentWrapper(inner) : inner}</ModalContent>
    </Modal>
  );
}
