import { Logo } from "./Logo";
import { NavItems } from "./NavItems";
import { UserMenu } from "./UserMenu";

export function Sidebar({ email, fullName }: { email: string; fullName: string | null }) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-default-200 bg-content1 lg:flex">
      <div className="flex h-16 items-center border-b border-default-200 px-5">
        <Logo />
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <NavItems />
      </div>
      <div className="border-t border-default-200 p-3">
        <UserMenu email={email} fullName={fullName} />
      </div>
    </aside>
  );
}
