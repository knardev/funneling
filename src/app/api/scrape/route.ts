import { scrapeNaverSections } from "@/features/post-generation/actions/others/counting_smartblock";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { keyword } = await request.json();
    
    if (!keyword) {
      return NextResponse.json(
        { error: "Keyword is required" },
        { status: 400 }
      );
    }

    const sections = await scrapeNaverSections(keyword);
    return NextResponse.json({ sections });
  } catch (error) {
    console.error("Scraping error:", error);
    return NextResponse.json(
      { error: "Failed to scrape data" },
      { status: 500 }
    );
  }
} 