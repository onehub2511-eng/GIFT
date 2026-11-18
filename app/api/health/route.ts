import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    app: "dhwani-midnight-rose",
    message: "Sab kuch apni jagah roshan hai."
  });
}
