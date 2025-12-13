import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Those Who Serve",
    short_name: "Serve",
    description:
      "Schedule and manage those serving within the 39th St Church of Christ congregation.",
    start_url: "/manage-men",
    display: "standalone",
    background_color: "#f4e8d6",
    theme_color: "#f4e8d6",
    lang: "en",
    icons: [
      {
        src: "/logo.png",
        sizes: "768x768",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo.png",
        sizes: "768x768",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
