import { Request, Response } from "express";
import jwt from "jsonwebtoken";

export const login = (req: Request, res: Response) => {
  const { email, password } = req.body;

  // sederhana (sesuai scope test, tidak perlu DB)
  if (email !== "admin@mail.com" || password !== "123456") {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  const token = jwt.sign(
    { email },
    process.env.JWT_SECRET as string,
    { expiresIn: "1d" }
  );

  return res.json({
    success: true,
    message: "Login success",
    token,
  });
};