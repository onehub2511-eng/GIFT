import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Dhwani — Ek Midnight Rose";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 76, background: "linear-gradient(135deg, #090609 0%, #2a0d1a 58%, #0d080c 100%)", color: "#f4e6df", position: "relative" }}>
        <div style={{ position: "absolute", right: 92, top: 42, fontSize: 170, color: "#b35c70", opacity: 0.28 }}>✿</div>
        <div style={{ fontSize: 22, letterSpacing: 9, textTransform: "uppercase", color: "#d7a9a5" }}>A Princess Day note</div>
        <div style={{ fontSize: 92, fontFamily: "serif", marginTop: 32, lineHeight: 1 }}>Dhwani</div>
        <div style={{ fontSize: 48, fontFamily: "serif", fontStyle: "italic", color: "#d9a6a8", marginTop: 8 }}>Ek Midnight Rose</div>
        <div style={{ fontSize: 22, marginTop: 42, color: "#dfc8c3", letterSpacing: 2 }}>Kuch yaadein · Kuch alfaaz · Ek royal wish</div>
        <div style={{ fontSize: 18, marginTop: 28, color: "#ad8588" }}>With warmth, Daksh Manish Bisht</div>
      </div>
    ),
    { ...size }
  );
}
