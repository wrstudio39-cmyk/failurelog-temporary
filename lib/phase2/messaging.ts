import { createClient } from "@/lib/supabase/server";

export async function createOrGetConversation(listingId: string, buyerId: string, sellerId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("listing_id", listingId)
    .eq("buyer_id", buyerId)
    .eq("seller_id", sellerId)
    .maybeSingle();
  if (error) throw error;
  if (data) return data;
  const created = await supabase.from("conversations").insert({ listing_id: listingId, buyer_id: buyerId, seller_id: sellerId }).select().single();
  if (created.error) throw created.error;
  return created.data;
}

export async function sendMessage(conversationId: string, senderId: string, body: string) {
  const supabase = createClient();
  const result = await supabase.from("messages").insert({ conversation_id: conversationId, sender_id: senderId, body }).select().single();
  if (result.error) throw result.error;
  return result.data;
}
