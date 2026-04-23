import express, { Request, Response } from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import axios from "axios";
import FormData from "form-data";
import { PDFDocument } from "pdf-lib";

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const PORT = Number(process.env.PORT) || 3000;
const APYHUB_TOKEN = process.env.APYHUB_TOKEN;

app.use(cors());
app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.send("Image to PDF backend is running.");
});

app.post("/convert-image-to-pdf", upload.array("files"), async (req: Request, res: Response) => {
  try {
    if (!APYHUB_TOKEN) {
      return res.status(500).json({
        error: "Missing APYHUB_TOKEN in .env"
      });
    }

    const files = req.files as Express.Multer.File[] | undefined;

    if (!files || files.length === 0) {
      return res.status(400).json({
        error: "No image files uploaded."
      });
    }

    for (const file of files) {
      const originalName = file.originalname.toLowerCase();
      const allowedMimeTypes = ["image/jpeg", "image/png"];

      const isValidFile =
        allowedMimeTypes.includes(file.mimetype) ||
        originalName.endsWith(".jpg") ||
        originalName.endsWith(".jpeg") ||
        originalName.endsWith(".png");

      if (!isValidFile) {
        return res.status(400).json({
          error: `Invalid file: ${file.originalname}. Only JPG, JPEG, and PNG files are allowed.`
        });
      }
    }

    const rawOutput =
      typeof req.body.output === "string" && req.body.output.trim() !== ""
        ? req.body.output.trim()
        : "output.pdf";

    const output = rawOutput.toLowerCase().endsWith(".pdf")
      ? rawOutput
      : `${rawOutput}.pdf`;

    const landscape = req.body.landscape === "true" ? "true" : "false";

    const mergedPdf = await PDFDocument.create();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      const singleOutputName = `part-${i + 1}.pdf`;
      const apiUrl = `https://api.apyhub.com/convert/image-file/pdf-file?output=${encodeURIComponent(
        singleOutputName
      )}&landscape=${landscape}`;

      const formData = new FormData();
      formData.append("file", file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype
      });

      const apiResponse = await axios.post(apiUrl, formData, {
        headers: {
          "apy-token": APYHUB_TOKEN,
          ...formData.getHeaders()
        },
        responseType: "arraybuffer"
      });

      const pdfBytes = apiResponse.data;
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());

      copiedPages.forEach((page) => {
        mergedPdf.addPage(page);
      });
    }

    const mergedPdfBytes = await mergedPdf.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${output}"`);

    return res.send(Buffer.from(mergedPdfBytes));
  } catch (error: any) {
    console.error("Server error:", error?.response?.data || error.message);

    if (error.response) {
      if (
        error.response.headers &&
        String(error.response.headers["content-type"] || "").includes("application/json")
      ) {
        try {
          const errorText = Buffer.from(error.response.data).toString("utf8");
          const parsed = JSON.parse(errorText);

          return res.status(error.response.status).json({
            error: parsed?.error?.message || "ApyHub request failed."
          });
        } catch {
          return res.status(error.response.status).json({
            error: "ApyHub request failed."
          });
        }
      }

      return res.status(error.response.status).json({
        error: "ApyHub request failed."
      });
    }

    return res.status(500).json({
      error: "Unexpected server error while converting images to PDF."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
