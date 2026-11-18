import { NextResponse } from "next/server";
import { letter } from "@/lib/story";

// Server endpoint: the client fetches the letter from the Next.js backend.
export async function GET() {
  return NextResponse.json(
    { ...letter, occasion: "Princess Day", recipient: "Dhwani" },
    {
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300"
      }
    }
  );
}
