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
          justifyContent: "center",
          padding: 72,
          background: "#061826",
          color: "white",
          fontFamily: "Arial",
        }}
      >
        <div style={{ fontSize: 34, color: "#34d399", marginBottom: 18 }}>Curevo SmartQueue</div>
        <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05, maxWidth: 900 }}>
          Real-time medical OS for modern clinics
        </div>
        <div style={{ marginTop: 28, fontSize: 28, color: "#cbd5e1" }}>
          Queues • Appointments • Telehealth • Medical Records
        </div>
      </div>
    ),
    size
  );
}
