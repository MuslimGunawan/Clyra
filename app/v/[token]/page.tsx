import { redirect } from "next/navigation";
import { verifyEphemeralToken } from "@/lib/cryptoTokens";

interface TokenGatewayProps {
  params: Promise<{ token: string }>;
}

export default async function EphemeralTokenGatewayPage({ params }: TokenGatewayProps) {
  const { token } = await params;
  const verified = verifyEphemeralToken(token);

  if (!verified.valid || !verified.target) {
    redirect("/v/invalid");
  }

  // Token is 100% verified & signature matches -> forward instantly to authentic target
  redirect(verified.target);
}
