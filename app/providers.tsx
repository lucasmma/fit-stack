"use client";

import { HeroUIProvider } from "@heroui/react";
import { Toaster } from "sonner";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();
  return (
    <HeroUIProvider navigate={(href) => router.push(href)}>
      <Toaster position="top-right" richColors closeButton />
      {children}
    </HeroUIProvider>
  );
}
