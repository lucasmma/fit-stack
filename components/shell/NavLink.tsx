"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

interface NavLinkProps {
  href: string;
  icon: ReactNode;
  label: string;
  onNavigate?: () => void;
}

export function NavLink({ href, icon, label, onNavigate }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-medium px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-default-600 hover:bg-default-100 hover:text-foreground",
      )}
    >
      <span aria-hidden className="text-lg">
        {icon}
      </span>
      <span>{label}</span>
    </Link>
  );
}
