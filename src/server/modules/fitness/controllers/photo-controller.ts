import "server-only";
import type { Handler } from "@/server/shared/presentation/protocols/http";
import type { PhotoData } from "@/server/modules/fitness/data/photo-data";
import type { S3UploadService } from "@/server/shared/services/s3-upload/s3-upload";
import { ok, created, noContent } from "@/server/shared/presentation/helpers/http";
import type {
  PhotoDTO,
  PresignInput,
  PresignDTO,
  ConfirmPhotoInput,
  ConfirmPhotoSetInput,
} from "@/lib/schemas/fitness/photo";

type ListQuery = { from?: string; to?: string };
type IdParams = { id: string };

export class PhotoController {
  constructor(
    private readonly data: PhotoData,
    private readonly s3: S3UploadService,
  ) {}

  list: Handler<unknown, ListQuery, unknown, PhotoDTO[]> = async (req) =>
    ok(await this.data.list(req.auth.userId, req.query ?? {}));

  presign: Handler<PresignInput, unknown, unknown, PresignDTO> = async (req) => {
    const result = await this.s3.presignPut({
      userId: req.auth.userId,
      contentType: req.body.contentType,
      bytes: req.body.bytes,
    });
    return ok(result);
  };

  confirm: Handler<ConfirmPhotoInput, unknown, unknown, PhotoDTO> = async (req) =>
    created(await this.data.confirm(req.auth.userId, req.body));

  confirmSet: Handler<ConfirmPhotoSetInput, unknown, unknown, PhotoDTO[]> = async (req) =>
    created(await this.data.confirmSet(req.auth.userId, req.body));

  delete: Handler<unknown, unknown, IdParams, null> = async (req) => {
    await this.data.delete(req.params.id, req.auth.userId);
    return noContent();
  };
}
