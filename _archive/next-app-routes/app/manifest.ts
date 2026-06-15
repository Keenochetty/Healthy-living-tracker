import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Family Health",
    short_name: "Family Health",
    description:
      "A private family health dashboard for records, reminders, and care tracking.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#020817",
    theme_color: "#0ea5e9",
    orientation: "portrait",
    categories: ["health", "medical", "productivity"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/maskable-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
