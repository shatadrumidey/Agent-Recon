import { useState } from "react";
import LogoMark from "./LogoMark";

const CLUSTERS = [
  { id: "fee", label: "Fee Mismatches", count: 70 },
  { id: "ref", label: "Missing Reference IDs", count: 60 },
];

type Cluster = "fee" | "ref";

const FEE_EXCEPTIONS = [
  { id: "TXN-00184722", merchantId: "MID-44812", bankId: "BNK-09231", amount: "$1,960.00", expected: "$2,000.00", drift: "+2.1s" },
  { id: "TXN-00184724", merchantId: "MID-55903", bankId: "BNK-11840", amount: "$3,136.00", expected: "$3,200.00", drift: "+0.8s" },
  { id: "TXN-00184726", merchantId: "MID-62047", bankId: "BNK-07714", amount: "$588.00", expected: "$600.00", drift: "+1.4s" },
  { id: "TXN-00184728", merchantId: "MID-30195", bankId: "BNK-22601", amount: "$294.12", expected: "$300.00", drift: "+3.2s" },
  { id: "TXN-00184730", merchantId: "MID-78430", bankId: "BNK-05519", amount: "$980.00", expected: "$1,000.00", drift: "+0.6s" },
  { id: "TXN-00184735", merchantId: "MID-14872", bankId: "BNK-33407", amount: "$4,802.00", expected: "$4,900.00", drift: "+1.9s" },
  { id: "TXN-00184739", merchantId: "MID-91034", bankId: "BNK-18822", amount: "$147.00", expected: "$150.00", drift: "+2.5s" },
  { id: "TXN-00184741", merchantId: "MID-50267", bankId: "BNK-04491", amount: "$784.00", expected: "$800.00", drift: "+0.3s" },
  { id: "TXN-00184748", merchantId: "MID-23910", bankId: "BNK-61234", amount: "$9,604.00", expected: "$9,800.00", drift: "+4.1s" },
  { id: "TXN-00184752", merchantId: "MID-67351", bankId: "BNK-29980", amount: "$1,176.00", expected: "$1,200.00", drift: "+1.1s" },
];

const REF_EXCEPTIONS = [
  { id: "TXN-00184801", merchantId: "MID-30011", bankId: "—", amount: "$520.00", expected: "$520.00", drift: "+0.0s" },
  { id: "TXN-00184803", merchantId: "MID-44102", bankId: "—", amount: "$3,400.00", expected: "$3,400.00", drift: "+0.0s" },
  { id: "TXN-00184807", merchantId: "MID-71890", bankId: "—", amount: "$88.50", expected: "$88.50", drift: "+0.0s" },
  { id: "TXN-00184812", merchantId: "MID-55023", bankId: "—", amount: "$1,750.00", expected: "$1,750.00", drift: "+0.0s" },
  { id: "TXN-00184819", merchantId: "MID-82341", bankId: "—", amount: "$6,200.00", expected: "$6,200.00", drift: "+0.0s" },
  { id: "TXN-00184824", merchantId: "MID-19004", bankId: "—", amount: "$430.00", expected: "$430.00", drift: "+0.0s" },
  { id: "TXN-00184829", merchantId: "MID-63712", bankId: "—", amount: "$2,100.00", expected: "$2,100.00", drift: "+0.0s" },
  { id: "TXN-00184834", merchantId: "MID-47801", bankId: "—", amount: "$995.00", expected: "$995.00", drift: "+0.0s" },
];

const TABLE_HEADERS = ["Transaction Id", "Merchant Id", "Bank Id", "Amount", "Expected", "Time Drift"];

type Props = {
  onBack: () => void;
  onAISandbox: (payload: any) => void;
};

export default function ExceptionQueue({ onBack, onAISandbox }: Props) {
  const [selected, setSelected] = useState<Cluster>("fee");
  const [isGenerating, setIsGenerating] = useState(false);

  const rows = selected === "fee" ? FEE_EXCEPTIONS : REF_EXCEPTIONS;

  const handleSynthesize = async () => {
    setIsGenerating(true);

    try {
      const response = await fetch(
        `https://agent-recon.onrender.com/api/v1/recon/ai-propose-and-evaluate?anomaly_type=${
            selected === "ref" ? "narration" : selected
          }`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `Backend request failed (${response.status}): ${errorBody}`
        );
      }

      const payload = await response.json();

      console.log("AI Sandbox payload:", payload);

      onAISandbox(payload);
    } catch (error) {
      console.error("Failed to synthesize rule:", error);

      const message =
        error instanceof Error ? error.message : String(error);

      alert(`Failed to synthesize rule:\n${message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#0E0E11", fontFamily: "Inter, sans-serif" }}>

      {/* Header */}
      <header
        className="flex items-center justify-between px-6 shrink-0"
        style={{ height: "60px", backgroundColor: "#18181B", borderBottom: "1px solid #27272A" }}
      >
        <LogoMark />
        <div className="flex items-center gap-3">
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#E4E4E7" }}>Priya Menon</span>
          <div
            className="flex items-center justify-center"
            style={{ width: "32px", height: "32px", borderRadius: "4px", backgroundColor: "#27272A", border: "1px solid #3F3F46" }}
          >
            <span style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "12px", fontWeight: 600, color: "#E4E4E7" }}>PM</span>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div
        className="flex items-center gap-2 px-6"
        style={{ height: "40px", borderBottom: "1px solid #27272A", backgroundColor: "#18181B" }}
      >
        <button
          onClick={onBack}
          style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: "#C4C4C8", background: "none", border: "none", cursor: "pointer", padding: 0 }}
        >
          Dashboard
        </button>
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: "#3F3F46" }}>/</span>
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: "#E4E4E7", fontWeight: 500 }}>Exceptions</span>
        <span
          style={{
            marginLeft: "8px",
            fontFamily: "Inter, sans-serif",
            fontSize: "12px",
            fontWeight: 500,
            color: "#FBBF24",
            backgroundColor: "rgba(251,191,36,0.1)",
            padding: "2px 8px",
            borderRadius: "3px",
          }}
        >
          130 unresolved
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1" style={{ minHeight: 0 }}>

        {/* Sidebar */}
        <aside
          style={{
            width: "250px",
            flexShrink: 0,
            borderRight: "1px solid #27272A",
            backgroundColor: "#18181B",
            padding: "24px 0",
          }}
        >
          <div style={{ padding: "0 16px 14px" }}>
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", fontWeight: 700, color: "#E4E4E7" }}>
              Anomaly Clusters
            </span>
          </div>

          {CLUSTERS.map((c) => {
            const active = selected === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelected(c.id as Cluster)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 16px",
                  backgroundColor: active ? "#27272A" : "transparent",
                  border: "none",
                  borderLeft: active
                    ? "2px solid #6366F1"
                    : "2px solid transparent",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background-color 0.1s",
                }}
                onMouseEnter={(e) => {
                  if (!active) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#1F1F23";
                }}
                onMouseLeave={(e) => {
                  if (!active) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                }}
              >
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: active ? "#E4E4E7" : "#C4C4C8", fontWeight: active ? 500 : 400 }}>
                  {c.label}
                </span>
                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: active ? "#FBBF24" : "#C4C4C8",
                    backgroundColor: active ? "rgba(251,191,36,0.1)" : "rgba(196,196,200,0.1)",
                    padding: "1px 7px",
                    borderRadius: "3px",
                  }}
                >
                  {c.count}
                </span>
              </button>
            );
          })}

          {/* Ratio analysis stats */}
          <div style={{ margin: "24px 16px 0", borderTop: "1px solid #27272A", paddingTop: "20px" }}>
            <div style={{ marginBottom: "14px" }}>
              <span style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", fontWeight: 700, color: "#E4E4E7" }}>
                Ratio Analysis
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { label: "Avg delta", value: "−2.0%" },
                { label: "Mode ratio", value: "0.980" },
                { label: "Precision est.", value: "100%" },
              ].map((stat) => (
                <div key={stat.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#C4C4C8" }}>{stat.label}</span>
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#E4E4E7" }}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 flex flex-col" style={{ minWidth: 0, padding: "20px 24px", gap: "16px" }}>

          {/* Toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span style={{ fontFamily: "Inter, sans-serif", fontSize: "16px", fontWeight: 600, color: "#E4E4E7" }}>
                {selected === "fee" ? "Fee Mismatches" : "Missing Reference IDs"}
              </span>
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "13px",
                  color: "#C4C4C8",
                  backgroundColor: "rgba(196,196,200,0.08)",
                  padding: "2px 8px",
                  borderRadius: "3px",
                }}
              >
                {rows.length} of {selected === "fee" ? 70 : 60} shown
              </span>
            </div>

            <button
              disabled={isGenerating}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: isGenerating ? "#4338CA" : "#6366F1",
                border: "1px solid #4F46E5",
                borderRadius: "4px",
                padding: "9px 18px",
                cursor: isGenerating ? "wait" : "pointer",
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
                fontWeight: 700,
                color: isGenerating ? "#A5B4FC" : "#FFFFFF",
                letterSpacing: "0.01em",
                transition: "background-color 0.1s",
              }}
              onClick={handleSynthesize}
            >
              {!isGenerating && (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M7 1L8.5 5.5H13L9.5 8L11 12.5L7 10L3 12.5L4.5 8L1 5.5H5.5L7 1Z"
                    fill="white"
                    fillOpacity="0.9"
                  />
                </svg>
              )}

              {isGenerating
                ? "Synthesizing & Simulating..."
                : "Synthesize Rule via AI Quant"}
            </button>
          </div>

          {/* Table */}
          <div
            style={{
              backgroundColor: "#18181B",
              border: "1px solid #27272A",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #27272A" }}>
                    {TABLE_HEADERS.map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "10px 16px",
                          textAlign: "left",
                          fontFamily: "Inter, sans-serif",
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "#E4E4E7",
                          whiteSpace: "nowrap",
                          backgroundColor: "#18181B",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((tx, i) => (
                    <tr
                      key={tx.id}
                      style={{
                        borderBottom: i < rows.length - 1 ? "1px solid #27272A" : "none",
                        transition: "background-color 0.1s",
                        cursor: "default",
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = "#1F1F23"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.backgroundColor = "transparent"; }}
                    >
                      <td style={{ padding: "10px 16px", whiteSpace: "nowrap" }}>
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#B8E3E9" }}>{tx.id}</span>
                      </td>
                      <td style={{ padding: "10px 16px", whiteSpace: "nowrap" }}>
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#E4E4E7" }}>{tx.merchantId}</span>
                      </td>
                      <td style={{ padding: "10px 16px", whiteSpace: "nowrap" }}>
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: tx.bankId === "—" ? "#3F3F46" : "#E4E4E7" }}>{tx.bankId}</span>
                      </td>
                      <td style={{ padding: "10px 16px", whiteSpace: "nowrap" }}>
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#E4E4E7" }}>{tx.amount}</span>
                      </td>
                      <td style={{ padding: "10px 16px", whiteSpace: "nowrap" }}>
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#C4C4C8" }}>{tx.expected}</span>
                      </td>
                      <td style={{ padding: "10px 16px", whiteSpace: "nowrap" }}>
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: selected === "fee" ? "#FBBF24" : "#C4C4C8" }}>{tx.drift}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Status bar */}
      <footer
        className="flex items-center justify-between px-6 shrink-0"
        style={{ height: "30px", backgroundColor: "#18181B", borderTop: "1px solid #27272A" }}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#4ADE80", display: "inline-block" }} />
            <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#C4C4C8" }}>System: Online</span>
          </div>
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#3F3F46" }}>|</span>
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#C4C4C8" }}>Last Sync: 1 min ago</span>
        </div>
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#C4C4C8" }}>v2.4.1</span>
      </footer>
    </div>
  );
}