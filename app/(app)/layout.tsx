import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { prisma } from "@/server/shared/config/prisma";
import { Sidebar } from "@/components/shell/Sidebar";
import { MobileNav } from "@/components/shell/MobileNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) redirect("/login");

  const profile = await prisma.profile.findUnique({ where: { id: user.id } });

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar email={user.email} fullName={profile?.fullName ?? null} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileNav email={user.email} fullName={profile?.fullName ?? null} />
        <main className="flex-1 overflow-x-hidden">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
