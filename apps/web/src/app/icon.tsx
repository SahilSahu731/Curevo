import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 10,
          background: "#047857",
          color: "white",
          fontFamily: "Arial",
          fontSize: 38,
          fontWeight: 800,
        }}
      >
        C
      </div>
    ),
    size,
  );
}
