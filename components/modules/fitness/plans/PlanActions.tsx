"use client";

import { useState } from "react";
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  useDisclosure,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { PlanDetailDTO } from "@/lib/schemas/fitness/plan";
import { api, ApiError } from "@/lib/api-client";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export function PlanActions({ plan }: { plan: PlanDetailDTO }) {
  const router = useRouter();
  const confirm = useDisclosure();
  const [loading, setLoading] = useState(false);

  const activate = async () => {
    setLoading(true);
    try {
      await api.plans.activate(plan.id);
      toast.success(`${plan.name} is now active`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not activate plan");
    } finally {
      setLoading(false);
    }
  };

  const archive = async () => {
    setLoading(true);
    try {
      await api.plans.delete(plan.id);
      toast.success("Plan archived");
      router.push("/fitness/plans");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not archive plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dropdown placement="bottom-end">
        <DropdownTrigger>
          <Button variant="flat" isIconOnly aria-label="Plan actions">
            ⋯
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="Plan actions">
          {!plan.isActive ? (
            <DropdownItem key="activate" onPress={activate}>
              Set as active
            </DropdownItem>
          ) : null}
          <DropdownItem key="archive" color="danger" onPress={confirm.onOpen}>
            Archive plan
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <ConfirmDialog
        isOpen={confirm.isOpen}
        onClose={confirm.onClose}
        onConfirm={archive}
        title="Archive plan?"
        message="Archived plans disappear from your list. Past sessions linked to this plan are preserved."
        confirmLabel="Archive"
        destructive
        isLoading={loading}
      />
    </>
  );
}
