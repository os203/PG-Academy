import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "ِUnauthorized" }, { status: 401 });
    }
    const user = await verifyToken(token);
    if (!user || (user.role !== "ADMIN" && user.role !== "INSTRUCTOR")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_"); // Sanitize filename
    const filename = `${uniqueSuffix}-${originalName}`;

    // Ensure the uploads directory exists
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (err) {
      console.error("Error creating upload directory:", err);
    }

    // Write the file
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    // Return the URL path
    const fileUrl = `/uploads/${filename}`;

    return NextResponse.json({ url: fileUrl, name: file.name }, { status: 201 });
  } catch (error) {
    console.error("[UPLOAD_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
