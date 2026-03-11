import { NextRequest, NextResponse } from "next/server";

// Temporary in-memory storage (will be replaced with Vercel serverless DB)
const submissions: Map<string, Record<string, unknown>> = new Map();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { city, doctorName, uin, interestedInSemaglutide, submittedAt, isUpdate } = body;

    // Validate required fields
    if (!city || !doctorName || !uin || !interestedInSemaglutide) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check for duplicate submission (by UIN)
    if (submissions.has(uin) && !isUpdate) {
      return NextResponse.json(
        { success: false, duplicate: true, message: "This UIN has already submitted a response" },
        { status: 409 }
      );
    }

    // Store/update submission
    const submission = {
      city,
      doctorName,
      uin,
      interestedInSemaglutide,
      submittedAt,
      updatedAt: isUpdate ? new Date().toISOString() : undefined,
    };

    submissions.set(uin, submission);

    console.log(`Survey submission ${isUpdate ? "updated" : "received"}:`, submission);

    return NextResponse.json({
      success: true,
      message: isUpdate ? "Response updated successfully" : "Survey submitted successfully",
    });
  } catch (error) {
    console.error("Submission error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return all submissions (for admin/debug purposes)
  const allSubmissions = Array.from(submissions.values());
  return NextResponse.json({
    success: true,
    count: allSubmissions.length,
    submissions: allSubmissions,
  });
}
