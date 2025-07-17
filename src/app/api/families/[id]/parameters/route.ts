import { NextResponse } from "next/server";
import { getFamilyParameters } from "@/lib/familyUtils";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const familyId = parseInt(id);
    if (isNaN(familyId)) {
      return NextResponse.json({ error: "Invalid family ID" }, { status: 400 });
    }

    const parameters = await getFamilyParameters(familyId);
    return NextResponse.json(parameters);
  } catch (error) {
    console.error("Error fetching family parameters:", error);
    return NextResponse.json({ error: "Failed to fetch family parameters" }, { status: 500 });
  }
}