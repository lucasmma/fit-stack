import { NavLink } from "./NavLink";

export const NAV_MODULES = [
  {
    id: "fitness",
    label: "Fitness",
    icon: "🏋️",
    description: "Plans, sessions, calendar, progress.",
    items: [
      { href: "/fitness", label: "Overview", icon: "📊" },
      { href: "/fitness/plans", label: "Plans", icon: "📋" },
      { href: "/fitness/sessions", label: "Sessions", icon: "🏋️" },
      { href: "/fitness/calendar", label: "Calendar", icon: "📅" },
      { href: "/fitness/photos", label: "Photos", icon: "📷" },
      { href: "/fitness/settings/share", label: "Share", icon: "🔗" },
    ],
  },
] as const;

export function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-5" aria-label="Primary">
      {NAV_MODULES.map((module) => (
        <div key={module.id} className="flex flex-col gap-1">
          <p className="px-3 text-xs font-semibold uppercase tracking-wide text-default-500">
            {module.label}
          </p>
          {module.items.map((item) => (
            <NavLink key={item.href} {...item} onNavigate={onNavigate} />
          ))}
        </div>
      ))}
    </nav>
  );
}
