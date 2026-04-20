import { Request, Response } from "express"
import { PrismaClient } from "@prisma/client"
import { fileQueue } from "../queues/fileQueue"

const prisma = new PrismaClient()

// ✅ UPLOAD FILE
export const uploadFile = async (req: any, res: Response) => {
  try {
    const file = req.file

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      })
    }

    const saved = await prisma.file.create({
      data: {
        filename: file.filename,
        status: "PENDING",
        path: file.path
      }
    })

    // kirim ke queue
    await fileQueue.add("process-file", {
      fileId: saved.id
    })

    return res.json({
      success: true,
      message: "File uploaded & queued",
      data: saved
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Upload failed",
      error
    })
  }
}

// ✅ GET FILES (PAGINATION + FILTER)
export const getFiles = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const status = req.query.status as string

    const skip = (page - 1) * limit

    const where: any = {}
    if (status) {
      where.status = status
    }

    const [data, total] = await Promise.all([
      prisma.file.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" }
      }),
      prisma.file.count({ where })
    ])

    return res.json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch files",
      error
    })
  }
}

// ✅ RETRY PROCESS FILE
export const retryFile = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string)

if (isNaN(id)) {
  return res.status(400).json({
    success: false,
    message: "Invalid ID"
  })
}

    const file = await prisma.file.findUnique({
      where: { id }
    })

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found"
      })
    }

    // reset status
    await prisma.file.update({
      where: { id },
      data: { status: "PENDING" }
    })

    // kirim ulang ke queue
    await fileQueue.add("process-file", {
      fileId: id
    })

    return res.json({
      success: true,
      message: "File re-queued successfully"
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Retry failed",
      error
    })
  }
}