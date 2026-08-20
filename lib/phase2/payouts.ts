import { getStripe } from "@/lib/stripe";

export async function createSellerTransfer(params: {
  amountCents: number;
  currency: string;
  destinationAccountId: string;
  purchaseId: string;
}) {
  const stripe = getStripe();
  return stripe.transfers.create({
    amount: params.amountCents,
    currency: params.currency,
    destination: params.destinationAccountId,
    metadata: { purchase_id: params.purchaseId },
  });
}
