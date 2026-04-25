"use client";

import {
  Button,
  Select,
  SelectItem,
  Input,
} from "@heroui/react";
import { useState } from "react";
import type { CreateShareLinkInput, ShareScope } from "@/lib/schemas/share";
import { SHARE_SCOPE_LABEL } from "@/lib/schemas/share";
import { StandardModal } from "@/components/ui/StandardModal";

interface CreateShareLinkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (input: CreateShareLinkInput) => void | Promise<void>;
}

const SCOPE_OPTIONS: Array<{ value: ShareScope; label: string }> = (
  Object.entries(SHARE_SCOPE_LABEL) as Array<[ShareScope, string]>
).map(([value, label]) => ({ value, label }));

export function CreateShareLinkDialog({ isOpen, onClose, onCreate }: CreateShareLinkDialogProps) {
  const [name, setName] = useState("");
  const [scope, setScope] = useState<ShareScope>("PROGRESS_ONLY");
  const [expiresAt, setExpiresAt] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    try {
      await onCreate({
        name: name || undefined,
        scope,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      });
      setName("");
      setScope("PROGRESS_ONLY");
      setExpiresAt("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <StandardModal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      scrollBehavior="inside"
      title="New share link"
      bodyClassName="flex flex-col gap-3"
      footer={
        <>
          <Button variant="light" onPress={onClose} isDisabled={submitting}>
            Cancel
          </Button>
          <Button color="primary" onPress={submit} isLoading={submitting}>
            Create
          </Button>
        </>
      }
    >
      <Input
        label="Label"
        placeholder="e.g. Coach John"
        variant="bordered"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Select
        label="Scope"
        variant="bordered"
        selectedKeys={new Set([scope])}
        onSelectionChange={(keys) => {
          const next = Array.from(keys as Set<ShareScope>)[0];
          if (next) setScope(next);
        }}
      >
        {SCOPE_OPTIONS.map((o) => (
          <SelectItem key={o.value}>{o.label}</SelectItem>
        ))}
      </Select>
      <Input
        label="Expires"
        type="date"
        variant="bordered"
        description="Optional. Leave empty for no expiry."
        value={expiresAt}
        onChange={(e) => setExpiresAt(e.target.value)}
      />
    </StandardModal>
  );
}
