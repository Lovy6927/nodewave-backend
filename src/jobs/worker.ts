import { Worker } from "bullmq"
import IORedis from "ioredis"
import { PrismaClient } from "@prisma/client"
import XLSX from "xlsx"

const connection = new IORedis({
  maxRetriesPerRequest: null
})
const prisma = new PrismaClient()

const worker = new Worker(
  "file-queue",
  async (job) => {
    const { fileId } = job.data

    console.log("Processing file:", fileId)

    const file = await prisma.file.findUnique({
      where: { id: fileId }
    })

    if (!file) return

    // update jadi IN_PROGRESS
    await prisma.file.update({
      where: { id: fileId },
      data: { status: "IN_PROGRESS" }
    })

    try {
      // baca excel
      const workbook = XLSX.readFile(file.path)
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const data = XLSX.utils.sheet_to_json(sheet)

      console.log("Parsed Data:", data)

      // simulasi simpan data (nanti bisa kamu kembangkan)

      // update jadi SUCCESS
      await prisma.file.update({
        where: { id: fileId },
        data: { status: "SUCCESS" }
      })

    } catch (error) {
      console.log(error)

      // update jadi FAILED
      await prisma.file.update({
        where: { id: fileId },
        data: { status: "FAILED" }
      })
    }
  },
  { connection }
)

console.log("Worker is running...")