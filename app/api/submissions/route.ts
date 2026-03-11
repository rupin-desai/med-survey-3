import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Temporary in-memory storage - will be replaced with Vercel serverless DB
// This shares state with the submit route via module scope
// Note: In production with serverless, you'll need a real database

// For now, return empty array - will be connected to DB later
export async function GET() {
  try {
    // TODO: Replace with actual database query when connected to Vercel serverless DB
    // For now, returning empty array as placeholder
    // In production, this will fetch from your Vercel Postgres/KV store
    
    console.log("Fetching submissions from database...");
    
    // Placeholder - will be replaced with actual DB query
    const submissions: unknown[] = [];
    
    return NextResponse.json(submissions);
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}
