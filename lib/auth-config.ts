export const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export function isClerkPublicConfigured() {
  return Boolean(clerkPublishableKey);
}
