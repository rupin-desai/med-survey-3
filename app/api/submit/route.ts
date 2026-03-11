import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      city,
      doctorName,
      uin,
      interestedInSemaglutide,
      submittedAt,
      isUpdate,
    } = body;

    // Validate required fields
    if (!city || !doctorName || !uin || !interestedInSemaglutide) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check for existing submission by UIN
    const existing = await prisma.submission.findUnique({
      where: { uin },
    });

    if (existing && !isUpdate) {
      return NextResponse.json(
        {
          success: false,
          duplicate: true,
          message: "This UIN has already submitted a response",
        },
        { status: 409 },
      );
    }

    if (isUpdate && existing) {
      // Update existing submission
      await prisma.submission.update({
        where: { uin },
        data: {
          city,
          doctorName,
          interestedInSemaglutide,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Response updated successfully",
      });
    }

    // Create new submission
    await prisma.submission.create({
      data: {
        city,
        doctorName,
        uin,
        interestedInSemaglutide,
        submittedAt: submittedAt ? new Date(submittedAt) : new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Survey submitted successfully",
    });
  } catch (error) {
    console.error("Submission error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const submissions = await prisma.submission.findMany({
      orderBy: { submittedAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
