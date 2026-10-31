import prisma from '@/src/lib/prisma';
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import {  NextResponse } from "next/server";

const s3Client = new S3Client({
  region: "auto",
  endpoint: "https://a609418789f790e56700464586507986.r2.cloudflarestorage.com",
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

// PUT: Update file metadata
export async function PUT(request, { params }) {
  try {
    const { folder_id, updated_by_id, key } = await request.json();
    const id = parseInt(params.id);

    await prisma.files.update({
      where: { id },
      data: {
        folder_path: folder_id || null,
        updated_by_id: parseInt(updated_by_id) || null,
        files_folder_links: {
          deleteMany: {},
          create: folder_id ? { folder_id: parseInt(folder_id) } : {},
        },
      },
    });

    return NextResponse.json({ message: "File metadata updated" });
  } catch (err) {
    console.error("Error updating file:", err);
    return NextResponse.json({ error: "Failed to update file" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE: Delete a file
export async function DELETE(request, { params }) {
  try {
    const { key } = await request.json();
    const id = parseInt(params.id);

    await s3Client.send(new DeleteObjectCommand({
      Bucket: "tdilcs-legal",
      Key: key,
    }));
    await prisma.files.delete({
      where: { id },
    });

    return NextResponse.json({ message: "File deleted" });
  } catch (err) {
    console.error("Error deleting file:", err);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}