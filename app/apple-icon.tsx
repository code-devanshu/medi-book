import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 40,
          background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {/* Vertical bar */}
          <div
            style={{
              position: "absolute",
              width: 28,
              height: 96,
              borderRadius: 14,
              background: "white",
            }}
          />
          {/* Horizontal bar */}
          <div
            style={{
              position: "absolute",
              width: 96,
              height: 28,
              borderRadius: 14,
              background: "white",
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
