export interface FileUploadInput {
  buffer: Buffer;
  filename: string;
  contentType: string;
  folder: string;
}

export interface FileDeleteInput {
  storageKey: string;
}

export interface StoredFileResult {
  storageKey: string;
  url: string;
  contentType: string;
  size: number;
  filename: string;
}

export interface StorageProvider {
  upload(input: FileUploadInput): Promise<StoredFileResult>;
  delete(input: FileDeleteInput): Promise<void>;
}