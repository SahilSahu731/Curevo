import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#f2ecdf",
          color: "#18352c",
          fontFamily: "Arial",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontSize: 32, fontWeight: 700 }}>
          <div
            style={{
              width: 46,
              height: 46,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 16,
              borderRadius: 14,
              background: "#315c49",
              color: "#f8f4eb",
              fontSize: 27,
            }}
          >
            ◌
          </div>
          Curevo
        </div>

        <div style={{ display: "flex", flexDirection: "column", maxWidth: 960 }}>
          <div style={{ fontSize: 78, fontWeight: 700, lineHeight: 1.04, letterSpacing: -3 }}>
            Small steps for steadier days.
          </div>
          <div style={{ marginTop: 28, fontSize: 28, lineHeight: 1.35, color: "#52665b" }}>
            Self-guided paths for focus, reflection, routines, and everyday wellbeing.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", fontSize: 21, color: "#6c5d45" }}>
          Focus&nbsp;&nbsp;·&nbsp;&nbsp;Routines&nbsp;&nbsp;·&nbsp;&nbsp;Reflection
        </div>
      </div>
    ),
    size
  );
}
