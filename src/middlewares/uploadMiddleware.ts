import multer from "multer";
import path from "path";
import { logger } from "../utils/logger.js";

// configuração de armazenamento local para uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    logger.info("Upload iniciado");
    cb(null, "uploads/");
  },
  filename: (_req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    logger.info(`Arquivo salvo: ${uniqueName}`);
    cb(null, uniqueName);
  },
});

export const upload = multer({ storage });
