import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import fileRoutes from "./routes/fileRoutes";
import authRoutes from "./routes/auth.routes"; // 🔐 TAMBAHAN SAJA

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// route utama
app.get("/", (req, res) => {
  res.send("API Running 🚀");
});

// 🔐 AUTH LOGIN ROUTE (TAMBAHAN, TIDAK MENGUBAH YANG LAIN)
app.use("/auth", authRoutes);

// 🔥 WAJIB: hubungkan routes (TETAP ASLI)
app.use("/api", fileRoutes);

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});