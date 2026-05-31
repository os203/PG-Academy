import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ count: 0 });
    }

    const count = await db.certificate.count({
      where: { userId },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("[CERTIFICATES_COUNT_ERROR]", error);
    return NextResponse.json({ count: 0 });
  }
}
