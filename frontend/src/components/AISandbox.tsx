import LogoMark from "./LogoMark";

type Props = {
  onBack: () => void;
  onToDashboard: () => void;
  onPromote: () => void;
};

export default function AISandbox({ onBack, onToDashboard, onPromote }: Props) {
  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#0E0E11", fontFamily: "Inter, sans-serif" }}>

      {/* Header */}
      <header
        className="flex items-center justify-between px-6 shrink-0"
        style={{ height: "60px", backgroundColor: "#18181B", borderBottom: "1px solid #27272A" }}
      >
        <LogoMark />
        <div className="flex items-center gap-3">
          <span style={{ fontSize: "13px", color: "#E4E4E7" }}>Priya Menon</span>
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
        <button onClick={onToDashboard} style={{ fontSize: "14px", color: "#C4C4C8", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          Dashboard
        </button>
        <span style={{ fontSize: "14px", color: "#3F3F46" }}>/</span>
        <button onClick={onBack} style={{ fontSize: "14px", color: "#C4C4C8", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          Exceptions
        </button>
        <span style={{ fontSize: "14px", color: "#3F3F46" }}>/</span>
        <span style={{ fontSize: "14px", color: "#E4E4E7", fontWeight: 500 }}>AI Sandbox</span>
        <span style={{ marginLeft: "8px", fontSize: "12px", fontWeight: 500, color: "#B5C7EB", backgroundColor: "rgba(181,199,235,0.1)", padding: "2px 8px", borderRadius: "3px" }}>
          Live simulation
        </span>
      </div>

      {/* Main content — horizontal layout */}
      <div className="flex-1 flex flex-col" style={{ padding: "28px 28px 0", gap: "20px", overflowY: "auto" }}>

        {/* ── TOP ROW: Proposal (left) + Code (right) ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

          {/* Left: AI Quant Proposal */}
          <div className="flex flex-col" style={{ gap: "16px" }}>
            <div>
              <div style={{ fontSize: "20px", fontWeight: 700, color: "#FFFFFF" }}>AI Quant Proposal</div>
              <div style={{ fontSize: "13px", color: "#C4C4C8", marginTop: "4px" }}>
                Quantitative Anomaly Engine · Fee Mismatches · 70 transactions
              </div>
            </div>

            {/* Anomaly detection report */}
            <div style={{ backgroundColor: "#18181B", border: "1px solid #27272A", borderRadius: "4px", padding: "18px 20px" }}>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "#B5C7EB", marginBottom: "10px" }}>Anomaly Detection Report</div>
              <p style={{ fontSize: "14px", color: "#E4E4E7", lineHeight: 1.65, margin: 0 }}>
                Anomaly detected: Bank settlement is{" "}
                <span style={{ color: "#FBBF24", fontWeight: 600 }}>exactly 98%</span> of the Merchant
                ledger amount across all 70 flagged transactions. Delta distribution is tight — standard
                deviation of <span style={{ fontFamily: "monospace", fontSize: "13px", color: "#B8E3E9" }}>±$0.00</span>.
                Pattern confidence: <span style={{ color: "#ADEBB3", fontWeight: 600 }}>99.97%</span>. Hypothesis: gateway
                applies a fixed <span style={{ fontFamily: "monospace", fontSize: "13px", color: "#B8E3E9" }}>2%</span> processing fee at settlement.
              </p>
            </div>

            {/* Rule metadata */}
            <div style={{ backgroundColor: "#18181B", border: "1px solid #27272A", borderRadius: "4px", overflow: "hidden" }}>
              <div style={{ padding: "10px 16px", borderBottom: "1px solid #27272A", fontSize: "13px", fontWeight: 600, color: "#C4C4C8" }}>
                Rule Metadata
              </div>
              {[
                { key: "rule_id", value: "AI_gateway_fee_0.98" },
                { key: "rule_type", value: "amount_ratio" },
                { key: "ratio", value: "0.98" },
                { key: "tolerance", value: "0.00" },
                { key: "applies_to", value: "Fee Mismatches (70 txns)" },
                { key: "author", value: "AI Quant Engine v2.4" },
              ].map((row, i, arr) => (
                <div
                  key={row.key}
                  style={{ display: "flex", alignItems: "center", padding: "9px 16px", borderBottom: i < arr.length - 1 ? "1px solid #27272A" : "none" }}
                >
                  <span style={{ fontFamily: "monospace", fontSize: "13px", color: "#B5C7EB", width: "180px", flexShrink: 0 }}>
                    {row.key}
                  </span>
                  <span style={{ fontFamily: "monospace", fontSize: "13px", color: "#E4E4E7" }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Code block */}
          <div className="flex flex-col" style={{ gap: "16px" }}>
            <div>
              <div style={{ fontSize: "20px", fontWeight: 700, color: "#FFFFFF" }}>Synthesized Rule</div>
              <div style={{ fontSize: "13px", color: "#C4C4C8", marginTop: "4px" }}>
                Python · AST-validated · ready for promotion
              </div>
            </div>

            <div style={{ backgroundColor: "#111113", border: "1px solid #27272A", borderRadius: "4px", overflow: "hidden", flexGrow: 1 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderBottom: "1px solid #27272A", backgroundColor: "#18181B" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#C4C4C8" }}>synthesized_rule.py</span>
                <span style={{ fontSize: "12px", color: "#ADEBB3", backgroundColor: "rgba(173,235,179,0.08)", padding: "2px 8px", borderRadius: "3px", fontWeight: 500 }}>
                  AST Valid
                </span>
              </div>
              <pre style={{ fontFamily: "monospace", fontSize: "13px", lineHeight: 1.8, color: "#E4E4E7", margin: 0, padding: "20px", overflowX: "auto", whiteSpace: "pre" }}>
                <span style={{ color: "#B5C7EB" }}>{"def "}</span>
                <span style={{ color: "#B8E3E9" }}>{"dynamic_match_fee"}</span>
                <span style={{ color: "#E4E4E7" }}>{"(merch, bank):"}</span>
                {"\n"}
                <span style={{ color: "#C4C4C8" }}>{"    \"\"\""}</span>
                {"\n"}
                <span style={{ color: "#C4C4C8" }}>{"    AI-synthesized reconciliation rule."}</span>
                {"\n"}
                <span style={{ color: "#C4C4C8" }}>{"    Matches bank settlements that are exactly"}</span>
                {"\n"}
                <span style={{ color: "#C4C4C8" }}>{"    98% of the merchant ledger amount."}</span>
                {"\n"}
                <span style={{ color: "#C4C4C8" }}>{"    \"\"\""}</span>
                {"\n"}
                <span style={{ color: "#B5C7EB" }}>{"    RATIO"}</span>
                <span style={{ color: "#E4E4E7" }}>{" = "}</span>
                <span style={{ color: "#B8E3E9" }}>{"Decimal"}</span>
                <span style={{ color: "#E4E4E7" }}>{"(\""}</span>
                <span style={{ color: "#ADEBB3" }}>{"0.98"}</span>
                <span style={{ color: "#E4E4E7" }}>{"\")"}</span>
                {"\n"}
                <span style={{ color: "#B5C7EB" }}>{"    return "}</span>
                <span style={{ color: "#E4E4E7" }}>{"(merch.amount "}</span>
                <span style={{ color: "#FBBF24" }}>{"*"}</span>
                <span style={{ color: "#E4E4E7" }}>{" RATIO).quantize("}</span>
                {"\n"}
                <span style={{ color: "#E4E4E7" }}>{"        "}</span>
                <span style={{ color: "#B8E3E9" }}>{"Decimal"}</span>
                <span style={{ color: "#E4E4E7" }}>{"(\""}</span>
                <span style={{ color: "#ADEBB3" }}>{"0.01"}</span>
                <span style={{ color: "#E4E4E7" }}>{"\")"}</span>
                {"\n"}
                <span style={{ color: "#E4E4E7" }}>{"    ) == bank.amount"}</span>
              </pre>
            </div>
          </div>
        </div>

        {/* ── BOTTOM SECTION: Regression Sandbox ── */}
        <div style={{ backgroundColor: "#18181B", border: "1px solid #27272A", borderRadius: "4px", overflow: "hidden" }}>

          {/* Section header */}
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #27272A" }}>
            <div style={{ fontSize: "20px", fontWeight: 700, color: "#FFFFFF" }}>Regression Sandbox Execution</div>
            <div style={{ fontSize: "13px", color: "#C4C4C8", marginTop: "3px" }}>
              Rule simulated against 130 exception transactions · Golden dataset: 870 matched rows
            </div>
          </div>

          <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Execution trace + metrics side by side */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0" }}>

              {/* Execution trace */}
              <div style={{ flex: 1, paddingRight: "32px" }}>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "#E4E4E7", marginBottom: "12px" }}>Execution Trace</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                  {[
                    "Loading exception batch · 130 transactions",
                    "Loading golden dataset · 870 matched transactions",
                    "Compiling rule AST · dynamic_match_fee",
                    "Simulating against exception batch · 130 / 130",
                    "Checking golden dataset for regressions · 870 / 870",
                    "Generating precision report",
                  ].map((text, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ color: "#ADEBB3", fontSize: "13px", flexShrink: 0 }}>✓</span>
                      <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#E4E4E7" }}>{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metrics — vertical dividers, no boxes */}
              <div style={{ display: "flex", alignItems: "stretch", borderLeft: "1px solid #27272A" }}>
                {[
                  { label: "True Positives", value: "70", color: "#ADEBB3" },
                  { label: "False Positives", value: "0", color: "#E4E4E7" },
                  { label: "Precision", value: "1.00", color: "#B5C7EB" },
                ].map((m, i) => (
                  <div
                    key={m.label}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                      padding: "0 32px",
                      borderLeft: i > 0 ? "1px solid #27272A" : "none",
                      minWidth: "120px",
                    }}
                  >
                    <span style={{ fontSize: "13px", fontWeight: 500, color: "#C4C4C8" }}>{m.label}</span>
                    <span style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "36px", fontWeight: 700, color: m.color, letterSpacing: "-0.04em", lineHeight: 1 }}>
                      {m.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* AST validation — clean inline */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", borderTop: "1px solid #27272A", paddingTop: "16px" }}>
              <span style={{ color: "#ADEBB3", fontSize: "16px", lineHeight: 1.3, flexShrink: 0 }}>✓</span>
              <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.6, color: "#E4E4E7" }}>
                <span style={{ fontWeight: 700, color: "#ADEBB3" }}>AST Validation Passed.</span>{" "}
                Zero regressions found in Golden Dataset. All 870 previously matched transactions continue to match under the new rule. Safe to promote.
              </p>
            </div>

            {/* Promote button */}
            <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid #27272A", paddingTop: "16px" }}>
              <button
                onClick={onPromote}
                style={{
                  backgroundColor: "#6366F1",
                  border: "1px solid #4F46E5",
                  borderRadius: "4px",
                  padding: "12px 28px",
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "#FFFFFF",
                  letterSpacing: "-0.01em",
                  transition: "background-color 0.1s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#4F46E5"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#6366F1"; }}
              >
                Approve &amp; Promote to Production
              </button>
            </div>
          </div>
        </div>

        {/* spacer */}
        <div style={{ height: "8px" }} />
      </div>

      {/* Status bar */}
      <footer
        className="flex items-center justify-between px-6 shrink-0"
        style={{ height: "30px", backgroundColor: "#18181B", borderTop: "1px solid #27272A" }}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#ADEBB3", display: "inline-block" }} />
            <span style={{ fontSize: "12px", color: "#C4C4C8" }}>System: Online</span>
          </div>
          <span style={{ fontSize: "12px", color: "#3F3F46" }}>|</span>
          <span style={{ fontSize: "12px", color: "#C4C4C8" }}>Last Sync: 1 min ago</span>
        </div>
        <span style={{ fontSize: "12px", color: "#C4C4C8" }}>v2.4.1</span>
      </footer>
    </div>
  );
}
