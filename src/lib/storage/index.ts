import type { StorageProvider } from "./types";
import { LocalStorageProvider } from "./local-storage";

declare global {
   
  var __storageProvider__: StorageProvider | undefined;
}

function createStorageProvider(): StorageProvider {
  const driver = (process.env.STORAGE_DRIVER || "local").toLowerCase();

  switch (driver) {
    case "local":
    default:
      return new LocalStorageProvider();
  }
}

export const storage: StorageProvider =
  global.__storageProvider__ ?? createStorageProvider();

if (process.env.NODE_ENV !== "production") {
  global.__storageProvider__ = storage;
}
