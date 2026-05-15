export type ResourceFileType = "VIDEO" | "PDF" | "IMAGE" | "AUDIO" | "DOCUMENT" | "OTHER";
export type ResourceCategory = "COURS" | "REGLEMENT" | "FORMATION" | "GENERAL";

export interface Resource {
  id: string;
  title: string;
  description: string | null;
  fileName: string;
  fileSize: number;
  fileType: ResourceFileType;
  category: ResourceCategory;
  isDownloadable: boolean;
  downloadCount: number;
  courseId?: string | null;
  createdAt: string;
  updatedAt: string;
}
