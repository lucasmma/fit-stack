"use client";

import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  Button,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createBrowserClient } from "@/lib/supabase/browser";

export function UserMenu({ email, fullName }: { email: string; fullName: string | null }) {
  const router = useRouter();
  const display = fullName ?? email;

  const signOut = async () => {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Signed out");
    router.replace("/login");
  };

  return (
    <Dropdown placement="top-end">
      <DropdownTrigger>
        <Button
          variant="light"
          className="h-auto w-full justify-start px-2 py-2"
          startContent={<Avatar size="sm" name={display} className="shrink-0" />}
        >
          <span className="flex min-w-0 flex-col items-start">
            <span className="w-full truncate text-sm font-medium">{display}</span>
            {fullName && <span className="w-full truncate text-xs text-default-500">{email}</span>}
          </span>
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Account actions">
        <DropdownItem key="signout" color="danger" onPress={signOut}>
          Sign out
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
