import { ImageResponse } from "next/og";

export const alt =
  "Opalina — Estúdio de odontologia estética nos Jardins, São Paulo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "80px",
        background: "linear-gradient(160deg, #f5f5f2 0%, #e4eaed 100%)",
        color: "#23272d",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 680 }}>
        <div style={{ fontSize: 120, letterSpacing: -4 }}>Opalina</div>
        <div style={{ fontSize: 36, marginTop: 24, color: "#5b6168" }}>
          Estética dental com a naturalidade da luz.
        </div>
        <div style={{ fontSize: 26, marginTop: 40, color: "#5b6168" }}>
          Jardins, São Paulo
        </div>
      </div>
      <div
        style={{
          width: 300,
          height: 400,
          borderRadius: "50% / 42%",
          background:
            "radial-gradient(circle at 35% 25%, #fbfaf7 0%, #efe9df 45%, #d6e2ea 100%)",
          boxShadow: "0 30px 60px -30px rgba(35,39,45,0.35)",
        }}
      />
    </div>,
    size,
  );
}
