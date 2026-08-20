export async function subscribeToNewsletter(email: string, source = "website") {
  if (!process.env.NEWSLETTER_PROVIDER_URL || !process.env.NEWSLETTER_PROVIDER_API_KEY || !process.env.NEWSLETTER_LIST_ID) {
    throw new Error("Newsletter provider is not configured.");
  }
  const response = await fetch(process.env.NEWSLETTER_PROVIDER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.NEWSLETTER_PROVIDER_API_KEY}` },
    body: JSON.stringify({ email, listId: process.env.NEWSLETTER_LIST_ID, source }),
  });
  if (!response.ok) throw new Error(`Newsletter provider returned ${response.status}.`);
  return response.json();
}
