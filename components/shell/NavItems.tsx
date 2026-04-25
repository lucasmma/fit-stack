import { NavLink } from "./NavLink";

export const NAV_ITEMS = [
  { href: "/plans", label: "Plans", icon: "📋" },
  { href: "/sessions", label: "Sessions", icon: "🏋️" },
  { href: "/calendar", label: "Calendar", icon: "📅" },
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/photos", label: "Photos", icon: "📷" },
  { href: "/settings/share", label: "Share", icon: "🔗" },
] as const;

export function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1" aria-label="Primary">
      {NAV_ITEMS.map((item) => (
        <NavLink key={item.href} {...item} onNavigate={onNavigate} />
      ))}
    </nav>
  );
}
