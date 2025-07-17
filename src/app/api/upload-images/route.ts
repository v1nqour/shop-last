import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const uploadPromises = files.map(async (file) => {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return new Promise<string>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { resource_type: "image", upload_preset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET },
            (error, result) => {
              if (error) reject(error);
              else resolve(result!.secure_url);
            }
          )
          .end(buffer);
      });
    });

    const urls = await Promise.all(uploadPromises);
    return NextResponse.json({ urls }, { status: 200 });
  } catch (error) {
    console.error("Error uploading images:", error);
    return NextResponse.json({ error: "Failed to upload images" }, { status: 500 });
  }
}