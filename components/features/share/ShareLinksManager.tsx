"use client";

import { useState } from "react";
import { Button, useDisclosure } from "@heroui/react";
import { toast } from "sonner";
import type { ShareLinkDTO, CreateShareLinkInput } from "@/lib/schemas/share";
import { api, ApiError } from "@/lib/api-client";
import { EmptyState } from "@/components/ui/EmptyState";
import { CreateShareLinkDialog } from "./CreateShareLinkDialog";
import { ShareLinkRow } from "./ShareLinkRow";

interface ShareLinksManagerProps {
  initialLinks: ShareLinkDTO[];
}

export function ShareLinksManager({ initialLinks }: ShareLinksManagerProps) {
  const [links, setLinks] = useState(initialLinks);
  const createDisclosure = useDisclosure();

  const create = async (input: CreateShareLinkInput) => {
    try {
      const link = await api.shareLinks.create(input);
      setLinks((prev) => [link, ...prev]);
      toast.success("Link created");
      createDisclosure.onClose();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not create link");
    }
  };

  const revoke = async (id: string) => {
    try {
      await api.shareLinks.revoke(id);
      setLinks((prev) =>
        prev.map((l) => (l.id === id ? { ...l, revokedAt: new Date().toISOString() } : l)),
      );
      toast.success("Link revoked");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not revoke link");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-default-500">{links.length} link{links.length === 1 ? "" : "s"}</p>
        <Button color="primary" onPress={createDisclosure.onOpen}>
          New link
        </Button>
      </div>
      {links.length === 0 ? (
        <EmptyState
          icon="🔗"
          title="No share links yet"
          description="Create a link and send it to a friend or coach. You can revoke it any time."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {links.map((link) => (
            <ShareLinkRow key={link.id} link={link} onRevoke={revoke} />
          ))}
        </div>
      )}
      <CreateShareLinkDialog
        isOpen={createDisclosure.isOpen}
        onClose={createDisclosure.onClose}
        onCreate={create}
      />
    </div>
  );
}
