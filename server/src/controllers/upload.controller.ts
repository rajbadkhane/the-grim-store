import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { asyncHandler } from "../utils/asyncHandler.js";
import { cloudinary } from "../config/cloudinary.js";
import { env } from "../config/env.js";

export const uploadImages = asyncHandler(async (req, res) => {
  const files = (req.files as Express.Multer.File[]) ?? [];
  const images = [];

  for (const file of files) {
    if (env.cloudinaryName && env.cloudinaryApiKey && env.cloudinarySecret) {
      const uploaded = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder: "grim-store/products", resource_type: "image" }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        });
        stream.end(file.buffer);
      });
      images.push({ url: uploaded.secure_url, alt: file.originalname, publicId: uploaded.public_id });
    } else {
      const extension = path.extname(file.originalname) || ".jpg";
      const filename = `${randomUUID()}${extension}`;
      const directory = path.join(process.cwd(), "uploads", "products");
      await mkdir(directory, { recursive: true });
      await writeFile(path.join(directory, filename), file.buffer);
      const host = req.get("host") ?? `localhost:${env.port}`;
      images.push({ url: `${req.protocol}://${host}/uploads/products/${filename}`, alt: file.originalname, publicId: filename });
    }
  }

  res.status(201).json({ success: true, images });
});
