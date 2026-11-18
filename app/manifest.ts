import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dhwani — Ek Midnight Rose",
    short_name: "Midnight Rose",
    description: "Princess Day ke liye ek chhoti si kahaani.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b0609",
    theme_color: "#0b0609",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }]
  };
}
