import { getStripe } from "@/lib/stripe";

export async function verifyStripeRevenue(paymentIntentIds: string[]) {
  const stripe = getStripe();
  let total = 0;
  for (const id of paymentIntentIds) {
    const intent = await stripe.paymentIntents.retrieve(id);
    if (intent.status === "succeeded") total += intent.amount_received;
  }
  return { status: "verified" as const, amountCents: total, currency: "usd", checkedAt: new Date().toISOString() };
}
