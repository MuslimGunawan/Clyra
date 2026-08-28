import { notFound } from "next/navigation";
import { verifyEphemeralToken } from "@/lib/cryptoTokens";
import LandingPage from "@/app/page";
import ToolsDirectoryPage from "@/app/tools/page";
import PromptsGalleryPage from "@/app/projects/prompts/page";
import WebProjectsPage from "@/app/projects/web/page";
import TermsPage from "@/app/terms/page";
import ToolDetailPage from "@/app/tools/[slug]/page";
import AdminDashboardPage from "@/app/admin/page";
import MemberWorkspacePage from "@/app/member/workspace/page";
import MemberLoginPage from "@/app/member/login/page";
import MemberActivatePage from "@/app/member/activate/page";

interface TokenGatewayProps {
  params: Promise<{ token: string }>;
}

export default async function EphemeralTokenGatewayPage({ params }: TokenGatewayProps) {
  const { token } = await params;
  const verified = verifyEphemeralToken(token);

  // If token is invalid, manipulated, or expired -> Trigger standard 404 Not Found
  if (!verified.valid || !verified.target) {
    notFound();
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

  if (target === "/admin") {
    return <AdminDashboardPage />;
  }

  if (target === "/member/workspace") {
    return <MemberWorkspacePage />;
  }

  if (target === "/member/login") {
    return <MemberLoginPage />;
  }

  if (target.startsWith("/member/activate")) {
    return <MemberActivatePage />;
  }

  // If route is unknown, trigger 404
  notFound();
}
