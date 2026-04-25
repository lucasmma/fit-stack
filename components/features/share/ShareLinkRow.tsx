"use client";

import { Card, CardBody, Button, Chip } from "@heroui/react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import type { ShareLinkDTO } from "@/lib/schemas/share";
import { SHARE_SCOPE_LABEL } from "@/lib/schemas/share";

interface ShareLinkRowProps {
  link: ShareLinkDTO;
  onRevoke: (id: string) => void | Promise<void>;
}

export function ShareLinkRow({ link, onRevoke }: ShareLinkRowProps) {
  const revoked = !!link.revokedAt;
  const expired = !!link.expiresAt && new Date(link.expiresAt) < new Date();
  const inactive = revoked || expired;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link.url);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy link");
    }
  };

  return (
    <Card shadow="sm">
      <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate font-medium">
              {link.name ?? SHARE_SCOPE_LABEL[link.scope]}
            </p>
            {revoked && <Chip size="sm" color="danger" variant="flat">Revoked</Chip>}
            {!revoked && expired && (
              <Chip size="sm" color="warning" variant="flat">Expired</Chip>
            )}
          </div>
          <p className="truncate text-xs text-default-500">{link.url}</p>
          <p className="text-xs text-default-400">
            {SHARE_SCOPE_LABEL[link.scope]} · Created {format(parseISO(link.createdAt), "MMM d, yyyy")}
            {link.expiresAt && ` · Expires ${format(parseISO(link.expiresAt), "MMM d, yyyy")}`}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button size="sm" variant="flat" onPress={copy} isDisabled={inactive}>
            Copy
          </Button>
          {!revoked && (
            <Button
              size="sm"
              variant="light"
              color="danger"
              onPress={() => void onRevoke(link.id)}
            >
              Revoke
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
