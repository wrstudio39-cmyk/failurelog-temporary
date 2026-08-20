import { NextRequest, NextResponse } from "next/server";
import { FEATURES } from "@/lib/config";
import { subscribeToNewsletter } from "@/lib/phase2/newsletter";

export async function POST(req: NextRequest) {
  if (!FEATURES.newsletterAutomation) return NextResponse.json({ error: "Feature disabled" }, { status: 404 });
  try {
    const { email, source } = await req.json();
    if (!email) return NextResponse.json({ error: "email is required" }, { status: 400 });
    return NextResponse.json(await subscribeToNewsletter(email, source));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Subscription failed" }, { status: 400 });
  }
}
