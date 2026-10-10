import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const alt = `${siteConfig.name} — Dubai property advisory`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Default social sharing card. Listing, community and article pages supply their own photograph. */
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#101b2d",
        color: "#f7f5f0",
        padding: "72px 80px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <svg width="40" height="50" viewBox="0 0 24 30" fill="none">
          <path d="M2 29V11C2 5.477 6.477 1 12 1s10 4.477 10 10v18" stroke="#f7f5f0" strokeWidth="1.6" />
          <path d="M7.5 29V13.5a4.5 4.5 0 0 1 9 0V29" stroke="#c7a66a" strokeWidth="1.6" />
        </svg>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 34, letterSpacing: 10 }}>NEXORA</span>
          <span style={{ fontSize: 15, letterSpacing: 8, color: "#c7a66a" }}>REALTY</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: 66, lineHeight: 1.08, maxWidth: 900 }}>Find more than a property. Discover your next opportunity.</span>
        <span style={{ marginTop: 28, fontSize: 26, color: "rgba(247,245,240,0.7)" }}>Homes, off-plan projects and investment property across Dubai</span>
      </div>
      <div style={{ display: "flex", height: 4, width: 160, background: "#c7a66a" }} />
    </div>,
    size,
  );
}
