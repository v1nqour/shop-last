import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({ 
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export async function POST(request: Request) {
  console.log('Environment Variables:', {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    apiSecret: !!process.env.CLOUDINARY_API_SECRET, // Avoid logging secret
    uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
  });

  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    console.log(`Uploading ${files.length} files`);

    const uploadResults = await Promise.all(
      files.map(async (file, index) => {
        console.log(`Processing file ${index + 1}: ${file.name}`);
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        return new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              upload_preset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
              folder: 'products'
            },
            (error, result) => {
              if (error) {
                console.error(`Upload error for file ${file.name}:`, error);
                return reject(error);
              }
              console.log(`Uploaded file ${file.name}:`, result?.secure_url);
              resolve({
                url: result?.secure_url,
                public_id: result?.public_id
              });
            }
          ).end(buffer);
        });
      })
    );

    return NextResponse.json({ results: uploadResults });
  } catch (error: any) {
    console.error('Detailed upload error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return NextResponse.json(
      { error: 'Failed to upload images', details: error.message },
      { status: 500 }
    );
  }
}