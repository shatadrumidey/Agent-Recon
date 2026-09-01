export default function StatusBar() {
  return (
    <footer
      className="flex items-center justify-between px-6 shrink-0"
      style={{
        height: "30px",
        backgroundColor: "#18181B",
        borderTop: "1px solid #27272A",
      }}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: "#4ADE80",
              display: "inline-block",
            }}
          />
          <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "12px", color: "#A1A1AA" }}>
            System: Online
          </span>
        </div>
        <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "12px", color: "#52525B" }}>
          |
        </span>
        <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "12px", color: "#71717A" }}>
          Last Sync: 1 min ago
        </span>
      </div>
      <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "12px", color: "#52525B" }}>
        v2.4.1
      </span>
    </footer>
  );
}
