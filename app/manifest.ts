import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Clyra — Personal Creative & Productivity Workspace",
    short_name: "Clyra",
    description: "All-in-one dark minimalist workspace for developer tools, AI prompt collection, and web projects portfolio.",
    start_url: "/",
    display: "standalone",
    background_color: "#08090d",
    theme_color: "#6366f1",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
