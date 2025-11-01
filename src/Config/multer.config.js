import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.config.js";
import multer from "multer";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads",
    allowed_formats: [
      "jpg",
      "png",
      "jpeg",
      "gif",
      "webp",
      "svg",
      "pdf",
      "docx",
      "xlsx",
      "pptx",
      "mp4",
      "mov",
      "avi",
      "mkv",
    ],
  },
});

const upload = multer({ storage });

export default upload;
