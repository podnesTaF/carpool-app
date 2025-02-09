import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest, NextResponse } from "next/server";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToS3(file: any, folder: string) {
  const fileBuffer = await file.arrayBuffer();
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: `${folder}${file.filename}`,
    BBody: Buffer.from(fileBuffer),
    ContentType: file.type,
  };
  try {
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    return new NextResponse(
      JSON.stringify({ message: "Image uploaded successfully" }),
      { status: 200 }
    );
  } catch (err) {
    console.error("S3 upload error:", err);
    return new NextResponse((err as Error).message, { status: 500 });
  }
}

export async function getImageFromS3(req: NextRequest, folder: string) {
  const key = `${folder}${req.nextUrl.searchParams.get("filename")}`;

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: key,
  };

  try {
    const command = new GetObjectCommand(params);
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return new NextResponse(JSON.stringify({ url }), { status: 200 });
  } catch (err) {
    console.error("S3 retrieve error:", err);
    return new NextResponse((err as Error).message, { status: 500 });
  }
}
