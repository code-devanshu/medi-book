import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 9,
          background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Stethoscope-inspired M shape with cross */}
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {/* Vertical bar */}
          <div
            style={{
              position: "absolute",
              width: 5,
              height: 17,
              borderRadius: 3,
              background: "white",
            }}
          />
          {/* Horizontal bar */}
          <div
            style={{
              position: "absolute",
              width: 17,
              height: 5,
              borderRadius: 3,
              background: "white",
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
