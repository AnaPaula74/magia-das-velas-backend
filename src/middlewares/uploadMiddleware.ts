import multer from "multer";
import path from "path";
import fs from "fs";
import { ValidationError } from "../errors/customErrors.js";
import { logger } from "../utils/logger.js";

const uploadDir = "uploads";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const allowedExtensions = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
];

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    logger.info("Upload iniciado");
    cb(null, uploadDir);
  },

  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;

    logger.info(`Arquivo salvo: ${uniqueName}`);

    cb(null, uniqueName);
  },
});

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();

  const isMimeAllowed = allowedMimeTypes.includes(file.mimetype);
  const isExtensionAllowed = allowedExtensions.includes(extension);

  if (!isMimeAllowed || !isExtensionAllowed) {
    return cb(
      new ValidationError("Formato de arquivo inválido. Use JPG, PNG ou WEBP.")
    );
  }

  return cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});