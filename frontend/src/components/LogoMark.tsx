export default function LogoMark() {
  return (
    <div className="flex items-center gap-3">
      <div style={{ position: "relative", display: "inline-flex"}}>
        <div
          style={{
            width: "34px",
            height: "34px",
            backgroundColor: "#1E1E24",
            border: "1px solid #3F3F46",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: 700,
              fontSize: "17px",
              color: "#E4E4E7",
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            AR
          </span>
        </div>
        <svg
          width="26"
          height="11"
          viewBox="0 0 26 13"
          fill="none"
          style={{ position: "absolute", top: "-3px", left: "50%", transform: "translateX(-50%)" }}
        >
          <rect x="0" y="8" width="26" height="3" rx="1" fill="#5C2D2D" />
          <rect x="5" y="1" width="16" height="9" rx="1" fill="#7C3C3C" />
          <rect x="5" y="7" width="16" height="2.5" fill="#3D1A1A" />
          <rect x="10" y="1" width="6" height="2" rx="1" fill="#6B3434" />
        </svg>
      </div>
      <span
        style={{
          fontFamily: "Space Grotesk, sans-serif",
          fontWeight: 600,
          fontSize: "20px",
          color: "#E4E4E7",
          letterSpacing: "-0.03em",
          lineHeight: 1,
        }}
      >
        Agent Recon
      </span>
    </div>
  );
}
