import { RequestHandler } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { imageStorage } from "../lib/image-storage";

// Create uploads directory if it doesn't exist (fallback)
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
// When using Supabase, we use memory storage instead of disk storage
const storage = imageStorage.isAvailable()
  ? multer.memoryStorage() // Use memory storage for Supabase
  : multer.diskStorage({
      // Use disk storage as fallback
      destination: (req, file, cb) => {
        cb(null, uploadsDir);
      },
      filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `image-${uniqueSuffix}${ext}`);
      },
    });

const fileFilter = (req: any, file: any, cb: any) => {
  // Accept only image files
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export const uploadMiddleware = upload.single("image");

export const handleImageUpload: RequestHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log(
      "File uploaded:",
      req.file.originalname,
      "Size:",
      req.file.size,
    );

    // Check if Supabase storage is available
    if (imageStorage.isAvailable()) {
      // Use Supabase storage
      console.log("Using Supabase storage for image upload");

      // Convert buffer to Blob object for Supabase
      const fileBlob = new Blob([new Uint8Array(req.file.buffer)], { type: req.file.mimetype });

      // Determine folder based on request context (optional)
      const folder = req.body.folder || "products";

      const result = await imageStorage.uploadImageFromBlob(
        fileBlob,
        req.file.originalname,
        folder,
      );

      if (!result.success) {
        console.error("Supabase upload failed:", result.error);
        return res.status(500).json({ error: result.error });
      }

      console.log("Image uploaded to Supabase successfully:", result.url);
      res.json({
        url: result.url,
        fileName: result.fileName,
        storage: "supabase",
      });
    } else {
      // Fallback to local storage
      console.log("Using local storage for image upload");
      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({
        url: fileUrl,
        fileName: req.file.filename,
        storage: "local",
      });
    }
  } catch (error) {
    console.error("Error handling image upload:", error);
    res.status(500).json({ error: "Failed to process image upload" });
  }
};

export const handleMultipleImageUpload: RequestHandler = async (req, res) => {
  const uploadMultiple = upload.array("images", 10); // Allow up to 10 images

  uploadMultiple(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(400).json({ error: err.message });
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    try {
      if (imageStorage.isAvailable()) {
        // Use Supabase storage
        console.log("Using Supabase storage for multiple image upload");

        const fileObjects = files.map((file) => ({
          blob: new Blob([new Uint8Array(file.buffer)], { type: file.mimetype }),
          name: file.originalname,
        }));

        const folder = req.body.folder || "products";
        const results = await imageStorage.uploadMultipleImagesFromBlobs(
          fileObjects,
          folder,
        );

        const successfulUploads = results.filter((r) => r.success);
        const failedUploads = results.filter((r) => !r.success);

        if (failedUploads.length > 0) {
          console.warn("Some uploads failed:", failedUploads);
        }

        res.json({
          success: successfulUploads,
          failed: failedUploads,
          storage: "supabase",
        });
      } else {
        // Fallback to local storage
        console.log("Using local storage for multiple image upload");
        const urls = files.map((file) => ({
          success: true,
          url: `/uploads/${file.filename}`,
          fileName: file.filename,
        }));

        res.json({
          success: urls,
          failed: [],
          storage: "local",
        });
      }
    } catch (error) {
      console.error("Error handling multiple image upload:", error);
      res.status(500).json({ error: "Failed to process image uploads" });
    }
  });
};

export const deleteImage: RequestHandler = async (req, res) => {
  const { filename } = req.params;
  const { storage } = req.query;

  try {
    if (storage === "supabase" && imageStorage.isAvailable()) {
      // Delete from Supabase storage
      console.log("Deleting image from Supabase:", filename);
      const result = await imageStorage.deleteImage(filename);

      if (!result.success) {
        console.error("Supabase delete failed:", result.error);
        return res.status(500).json({ error: result.error });
      }

      res.status(204).send();
    } else {
      // Delete from local storage
      console.log("Deleting image from local storage:", filename);
      const filePath = path.join(uploadsDir, filename);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        res.status(204).send();
      } else {
        res.status(404).json({ error: "File not found" });
      }
    }
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ error: "Failed to delete file" });
  }
};

// Health check endpoint for image storage
export const getStorageInfo: RequestHandler = (req, res) => {
  res.json({
    storageType: imageStorage.isAvailable() ? "supabase" : "local",
    supabaseAvailable: imageStorage.isAvailable(),
    maxFileSize: "10MB",
    allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  });
};
