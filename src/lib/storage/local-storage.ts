import path from "path";
import { promises as fs } from "fs";
import { randomUUID } from "crypto";
import type {
  FileDeleteInput,
  FileUploadInput,
  StorageProvider,
  StoredFileResult,
} from "./types";

const PROJECT_ROOT = process.cwd();
const LOCAL_UPLOADS_DIR =
  process.env.LOCAL_UPLOADS_DIR?.trim() || "public/uploads";

const UPLOADS_ROOT = path.join(PROJECT_ROOT, LOCAL_UPLOADS_DIR);

function sanitizeFolder(folder: string): string {
  return folder.replace(/^\/+|\/+$/g, "").replace(/\.\./g, "");
}

function sanitizeExtension(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  if (!ext || ext.length > 10) return "";
  return ext.replace(/[^a-z0-9.]/g, "");
}

function buildPublicUrl(storageKey: string): string {
  return `/${LOCAL_UPLOADS_DIR.replace(/^public\/?/, "").replace(/\\/g, "/")}/${storageKey}`.replace(
    /\/+/g,
    "/"
  );
}

export class LocalStorageProvider implements StorageProvider {
  async upload(input: FileUploadInput): Promise<StoredFileResult> {
    const safeFolder = sanitizeFolder(input.folder);
    const safeExt = sanitizeExtension(input.filename);
    const generatedName = `${randomUUID()}${safeExt}`;
    const storageKey = path.posix.join(safeFolder, generatedName);

    const targetDir = path.join(UPLOADS_ROOT, safeFolder);
    const targetPath = path.join(UPLOADS_ROOT, storageKey);

    await fs.mkdir(targetDir, { recursive: true });
    await fs.writeFile(targetPath, input.buffer);

    return {
      storageKey,
      url: buildPublicUrl(storageKey),
      contentType: input.contentType,
      size: input.buffer.length,
      filename: generatedName,
    };
  }

  async delete(input: FileDeleteInput): Promise<void> {
    const normalizedKey = input.storageKey.replace(/^\/+/, "").replace(/\.\./g, "");
    const absolutePath = path.join(UPLOADS_ROOT, normalizedKey);

    try {
      await fs.unlink(absolutePath);
    } catch (error) {
      // إذا الملف غير موجود لا نعتبرها مشكلة
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
    }
  }
}