import { auth, currentUser } from "@clerk/nextjs/server";

export type AuthActor = {
  id: string;
  displayName: string;
  email?: string;
  provider: "clerk" | "development";
};

export function isClerkServerConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
  );
}

export async function getCurrentActor(): Promise<AuthActor | null> {
  if (!isClerkServerConfigured()) {
    return {
      id: "dev-demo-user",
      displayName: "マジックラビット",
      email: "demo@stampforge.local",
      provider: "development",
    };
  }

  const session = await auth();

  if (!session.userId) {
    return null;
  }

  const user = await currentUser().catch(() => null);
  const primaryEmail = user?.emailAddresses.find(
    (email) => email.id === user.primaryEmailAddressId
  );

  return {
    id: session.userId,
    displayName:
      user?.fullName ||
      user?.username ||
      primaryEmail?.emailAddress ||
      "StampForge Creator",
    email: primaryEmail?.emailAddress,
    provider: "clerk",
  };
}
