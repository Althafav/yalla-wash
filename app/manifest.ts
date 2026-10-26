import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Yalla Wash",
    short_name: "Yalla Wash",
    description: "Book a wash for your car, bike or auto, join the live queue and collect stamps.",
    start_url: "/home",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0B1F3A",
    theme_color: "#0B1F3A",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
