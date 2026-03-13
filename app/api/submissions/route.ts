import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const submissions = await prisma.submission.findMany({
      orderBy: { submittedAt: "desc" },
    });

    // Transform to match the expected format for admin page
    const formattedSubmissions = submissions.map(
      (s: {
        city: string;
        doctorName: string;
        uin: string;
        semaglutideRelevantForPractice: string | null;
        interestedInSemaglutide: string;
        submittedAt: Date;
      }) => ({
        city: s.city,
        doctorName: s.doctorName,
        uin: s.uin,
        semaglutideRelevantForPractice: s.semaglutideRelevantForPractice,
        interestedInSemaglutide: s.interestedInSemaglutide,
        submittedAt: s.submittedAt.toISOString(),
      }),
    );

    return NextResponse.json(formattedSubmissions);
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 },
    );
  }
}
