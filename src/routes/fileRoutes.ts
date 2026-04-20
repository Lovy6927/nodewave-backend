import express from "express";
import { upload } from "../config/multer";
import { uploadFile, getFiles, retryFile } from "../controllers/fileController";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();

// 🔐 semua endpoint diproteksi JWT
router.post("/upload", authMiddleware, upload.single("file"), uploadFile);

router.get("/files", authMiddleware, getFiles);

router.post("/files/:id/retry", authMiddleware, retryFile);

export default router;