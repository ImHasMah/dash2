import { supabase } from "./supabase";

// Image storage configuration
const STORAGE_BUCKET = "product-images";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// Helper function to generate unique file names
const generateFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split(".").pop()?.toLowerCase() || "jpg";
  return `${timestamp}-${randomStr}.${extension}`;
};

// Helper function to validate file
const validateFile = (file: File): { valid: boolean; error?: string } => {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_TYPES.join(", ")}`,
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    };
  }

  return { valid: true };
};

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
  fileName?: string;
}

export interface ImageDeleteResult {
  success: boolean;
  error?: string;
}

// Image storage operations
export const imageStorage = {
  /**
   * Upload an image to Supabase storage
   * @param file - The image file to upload
   * @param folder - Optional folder path (e.g., "products", "variants")
   * @returns Promise with upload result
   */
  async uploadImage(file: File, folder?: string): Promise<ImageUploadResult> {
    if (!supabase) {
      return {
        success: false,
        error: "Supabase not configured. Image upload not available.",
      };
    }

    try {
      // Validate file
      const validation = validateFile(file);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error,
        };
      }

      // Generate unique file name
      const fileName = generateFileName(file.name);
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      // Upload file to Supabase storage
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Supabase storage upload error:", error);
        return {
          success: false,
          error: `Upload failed: ${error.message}`,
        };
      }

      // Get public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

      return {
        success: true,
        url: urlData.publicUrl,
        fileName: filePath,
      };
    } catch (error) {
      console.error("Image upload error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown upload error",
      };
    }
  },

  /**
   * Upload an image from a Blob (Node/Express) with an original filename
   */
  async uploadImageFromBlob(
    blob: Blob,
    originalName: string,
    folder?: string,
  ): Promise<ImageUploadResult> {
    // Supabase client accepts Blob or File; but we need a name to generate unique filename
    // Create a File-like using Web File if available, otherwise pass Blob and use originalName for extension
    const extension = originalName.split(".").pop() || "jpg";
    const fileName = generateFileName(originalName);
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    if (!supabase) {
      return {
        success: false,
        error: "Supabase not configured. Image upload not available.",
      };
    }

    try {
      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, blob, {
          cacheControl: "3600",
          upsert: false,
          contentType: (blob as any).type || `image/${extension}`,
        });

      if (error) {
        return { success: false, error: `Upload failed: ${error.message}` };
      }

      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

      return { success: true, url: urlData.publicUrl, fileName: filePath };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown upload error",
      };
    }
  },

  /**
   * Upload multiple images from Blobs
   */
  async uploadMultipleImagesFromBlobs(
    files: { blob: Blob; name: string }[],
    folder?: string,
  ): Promise<ImageUploadResult[]> {
    const results: ImageUploadResult[] = [];
    for (const f of files) {
      // eslint-disable-next-line no-await-in-loop
      const res = await this.uploadImageFromBlob(f.blob, f.name, folder);
      results.push(res);
    }
    return results;
  },

  /**
   * Upload multiple images to Supabase storage
   * @param files - Array of image files to upload
   * @param folder - Optional folder path
   * @returns Promise with array of upload results
   */
  async uploadMultipleImages(
    files: File[],
    folder?: string,
  ): Promise<ImageUploadResult[]> {
    const uploadPromises = files.map((file) => this.uploadImage(file, folder));
    return Promise.all(uploadPromises);
  },

  /**
   * Delete an image from Supabase storage
   * @param filePath - The file path in storage (returned from upload)
   * @returns Promise with deletion result
   */
  async deleteImage(filePath: string): Promise<ImageDeleteResult> {
    if (!supabase) {
      return {
        success: false,
        error: "Supabase not configured. Image deletion not available.",
      };
    }

    try {
      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([filePath]);

      if (error) {
        console.error("Supabase storage delete error:", error);
        return {
          success: false,
          error: `Delete failed: ${error.message}`,
        };
      }

      return { success: true };
    } catch (error) {
      console.error("Image delete error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown delete error",
      };
    }
  },

  /**
   * Delete multiple images from Supabase storage
   * @param filePaths - Array of file paths to delete
   * @returns Promise with deletion result
   */
  async deleteMultipleImages(filePaths: string[]): Promise<ImageDeleteResult> {
    if (!supabase) {
      return {
        success: false,
        error: "Supabase not configured. Image deletion not available.",
      };
    }

    try {
      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove(filePaths);

      if (error) {
        console.error("Supabase storage delete error:", error);
        return {
          success: false,
          error: `Delete failed: ${error.message}`,
        };
      }

      return { success: true };
    } catch (error) {
      console.error("Image delete error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown delete error",
      };
    }
  },

  /**
   * Get the public URL for an image
   * @param filePath - The file path in storage
   * @returns Public URL or null if not available
   */
  getPublicUrl(filePath: string): string | null {
    if (!supabase) {
      return null;
    }

    try {
      const { data } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error("Error getting public URL:", error);
      return null;
    }
  },

  /**
   * Check if image storage is available
   * @returns boolean indicating if Supabase storage is configured
   */
  isAvailable(): boolean {
    return !!supabase;
  },
};

// Export bucket name for use in other modules
export { STORAGE_BUCKET };
