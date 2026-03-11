import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function DELETE() {
  try {
    // Delete all submissions
    await prisma.submission.deleteMany({});

    return NextResponse.json({ 
      success: true, 
      message: "All submissions have been deleted" 
    });
  } catch (error) {
    console.error("Error clearing database:", error);
    return NextResponse.json(
      { error: "Failed to clear database" },
      { status: 500 }
    );
  }
}
