"use client";

import { useState } from "react";
import { Button, Drawer, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter } from "@heroui/react";
import { Logo } from "./Logo";
import { NavItems } from "./NavItems";
import { UserMenu } from "./UserMenu";

export function MobileNav({ email, fullName }: { email: string; fullName: string | null }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex h-14 items-center justify-between border-b border-default-200 bg-content1 px-4 lg:hidden">
        <Logo />
        <Button
          isIconOnly
          variant="light"
          aria-label="Open menu"
          onPress={() => setOpen(true)}
        >
          <span aria-hidden className="text-xl">
            ☰
          </span>
        </Button>
      </div>
      <Drawer isOpen={open} onClose={() => setOpen(false)} placement="left" size="xs">
        <DrawerContent>
          <DrawerHeader>
            <Logo />
          </DrawerHeader>
          <DrawerBody>
            <NavItems onNavigate={() => setOpen(false)} />
          </DrawerBody>
          <DrawerFooter>
            <UserMenu email={email} fullName={fullName} />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
