import LogoMark from "./LogoMark";

export default function Header() {
  return (
    <header
      className="flex items-center justify-between px-6 shrink-0"
      style={{
        height: "60px",
        backgroundColor: "#18181B",
        borderBottom: "1px solid #27272A",
      }}
    >
      <LogoMark />

      <div className="flex items-center gap-3">
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#E4E4E7" }}>
          Priya Menon
        </span>
        <div
          className="flex items-center justify-center"
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "4px",
            backgroundColor: "#27272A",
            border: "1px solid #3F3F46",
          }}
        >
          <span
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              fontSize: "12px",
              fontWeight: 600,
              color: "#E4E4E7",
            }}
          >
            PM
          </span>
        </div>
      </div>
    </header>
  );
}
