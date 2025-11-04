import { drive_v3 } from "googleapis";
export declare function getOrCreateFolder(folderName: string, parentId?: string): Promise<string>;
export declare function uploadFile(filePath: string, fileName: string, folderId: string, mimeType: string): Promise<drive_v3.Schema$File>;
//# sourceMappingURL=googeDrive.d.ts.map