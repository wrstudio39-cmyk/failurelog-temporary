import { NextRequest, NextResponse } from "next/server";
import { FEATURES } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";
import { createOrGetConversation, sendMessage } from "@/lib/phase2/messaging";

export async function POST(req: NextRequest) {
  if (!FEATURES.messaging) return NextResponse.json({ error: "Feature disabled" }, { status: 404 });
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { listingId, sellerId, conversationId, body } = await req.json();
    if (!body) return NextResponse.json({ error: "body is required" }, { status: 400 });
    if (conversationId) return NextResponse.json(await sendMessage(conversationId, user.id, body));
    if (!listingId || !sellerId) return NextResponse.json({ error: "listingId and sellerId are required" }, { status: 400 });
    const conversation = await createOrGetConversation(listingId, user.id, sellerId);
    const message = await sendMessage(conversation.id, user.id, body);
    return NextResponse.json({ conversation, message });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Message failed" }, { status: 400 });
  }
}
