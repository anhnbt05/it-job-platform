export interface UploadedImage {
  fileId: string;
  url: string;
  thumbnailUrl?: string;
  name: string;
  height?: number;
  width?: number;
  size: number;
  fileType: string;
}
