import { verifyEphemeralToken } from "@/lib/cryptoTokens";
import InvalidTokenPage from "@/app/v/invalid/page";
import LandingPage from "@/app/page";
import ToolsDirectoryPage from "@/app/tools/page";
import PromptsGalleryPage from "@/app/projects/prompts/page";
import WebProjectsPage from "@/app/projects/web/page";
import TermsPage from "@/app/terms/page";
import ToolDetailPage from "@/app/tools/[slug]/page";

interface TokenGatewayProps {
  params: Promise<{ token: string }>;
}

export default async function EphemeralTokenGatewayPage({ params }: TokenGatewayProps) {
  const { token } = await params;
  const verified = verifyEphemeralToken(token);

  if (!verified.valid || !verified.target) {
    return <InvalidTokenPage />;
  }

  const target = verified.target;

  // Direct In-Place Rendering: The browser address bar STAYS on /v/[token]!
  if (target === "/" || target === "") {
    return <LandingPage />;
  }

  if (target === "/tools") {
    return <ToolsDirectoryPage />;
  }

  if (target.startsWith("/tools/")) {
    const slug = target.replace("/tools/", "");
    return <ToolDetailPage params={Promise.resolve({ slug })} />;
  }

  if (target === "/projects/prompts") {
    return <PromptsGalleryPage />;
  }

  if (target === "/projects/web") {
    return <WebProjectsPage />;
  }

  if (target === "/terms") {
    return <TermsPage />;
  }

  return <LandingPage />;
}
