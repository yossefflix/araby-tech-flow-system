
import { supabase } from "@/integrations/supabase/client";

export interface FileUploadResult {
  fileName: string;
  fileUrl: string;
  fileSize: number;
}

export const fileStorage = {
  async uploadFile(file: File, folder: string = 'general'): Promise<FileUploadResult | null> {
    try {
      const fileName = `${folder}/${Date.now()}-${file.name}`;
      
      const { data, error } = await supabase.storage
        .from('work-files')
        .upload(fileName, file);

      if (error) {
        console.error('Error uploading file:', error);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('work-files')
        .getPublicUrl(data.path);

      return {
        fileName: data.path,
        fileUrl: publicUrl,
        fileSize: file.size
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  },

  async uploadMultipleFiles(files: File[], folder: string = 'general'): Promise<FileUploadResult[]> {
    const uploadPromises = files.map(file => this.uploadFile(file, folder));
    const results = await Promise.all(uploadPromises);
    return results.filter(result => result !== null) as FileUploadResult[];
  },

  getFileUrl(fileName: string): string {
    const { data: { publicUrl } } = supabase.storage
      .from('work-files')
      .getPublicUrl(fileName);
    return publicUrl;
  },

  async deleteFile(fileName: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from('work-files')
        .remove([fileName]);

      if (error) {
        console.error('Error deleting file:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }
};
