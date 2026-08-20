import { NextRequest, NextResponse } from "next/server";
import { FEATURES } from "@/lib/config";
import { verifyGithubRepository } from "@/lib/phase2/github-verification";

export async function POST(req: NextRequest) {
  if (!FEATURES.automatedVerification) return NextResponse.json({ error: "Feature disabled" }, { status: 404 });
  try {
    const { repoUrl } = await req.json();
    if (!repoUrl) return NextResponse.json({ error: "repoUrl is required" }, { status: 400 });
    return NextResponse.json(await verifyGithubRepository(repoUrl));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Verification failed" }, { status: 400 });
  }
}
