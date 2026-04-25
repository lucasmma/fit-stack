import { createServerClient } from "@/lib/supabase/server";
import { makeShareData } from "@/server/factories/share-factory";
import { PageHeader } from "@/components/ui/PageHeader";
import { ShareLinksManager } from "@/components/features/share/ShareLinksManager";

export const metadata = { title: "Share — fit-stack" };

export default async function SharePage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const links = await makeShareData().list(user!.id);

  return (
    <div>
      <PageHeader
        title="Share"
        description="Create read-only links to show friends or coaches your progress."
      />
      <ShareLinksManager initialLinks={links} />
    </div>
  );
}
