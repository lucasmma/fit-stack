import { createServerClient } from "@/lib/supabase/server";
import { makePhotoData } from "@/server/modules/fitness/factories/photo-factory";
import { PageHeader } from "@/components/ui/PageHeader";
import { PhotosGallery } from "@/components/modules/fitness/photos/PhotosGallery";
import { UploadPhotoButton } from "@/components/modules/fitness/photos/UploadPhotoButton";

export const metadata = { title: "Photos — personal-hq" };

export default async function PhotosPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const photos = await makePhotoData().list(user!.id);

  return (
    <div>
      <PageHeader
        title="Progress photos"
        description="Weekly photos to track body composition over time."
        actions={<UploadPhotoButton />}
      />
      <PhotosGallery initialPhotos={photos} />
    </div>
  );
}
