import { useState } from "react";
import LogoMark from "./LogoMark";

const TRANSACTIONS = [
  { id: "TXN-00184721", counterparty: "Stripe Inc.", amount: "$4,200.00", rule: "exact_match", ruleType: "DETERMINISTIC" },
  { id: "TXN-00184722", counterparty: "Adyen N.V.", amount: "$1,960.00", rule: "ai_gateway_fee_rule", ruleType: "AI_GENERATED" },
  { id: "TXN-00184723", counterparty: "Stripe Inc.", amount: "$850.00", rule: "exact_match", ruleType: "DETERMINISTIC" },
  { id: "TXN-00184724", counterparty: "PayPal Holdings", amount: "$3,136.00", rule: "ai_gateway_fee_rule", ruleType: "AI_GENERATED" },
  { id: "TXN-00184725", counterparty: "Checkout.com", amount: "$720.00", rule: "exact_match", ruleType: "DETERMINISTIC" },
  { id: "TXN-00184726", counterparty: "Braintree LLC", amount: "$588.00", rule: "ai_gateway_fee_rule", ruleType: "AI_GENERATED" },
  { id: "TXN-00184727", counterparty: "Stripe Inc.", amount: "$11,500.00", rule: "exact_match", ruleType: "DETERMINISTIC" },
  { id: "TXN-00184728", counterparty: "Square Inc.", amount: "$294.12", rule: "ai_gateway_fee_rule", ruleType: "AI_GENERATED" },
  { id: "TXN-00184729", counterparty: "Adyen N.V.", amount: "$5,400.00", rule: "exact_match", ruleType: "DETERMINISTIC" },
  { id: "TXN-00184730", counterparty: "Checkout.com", amount: "$980.00", rule: "ai_gateway_fee_rule", ruleType: "AI_GENERATED" },
  { id: "TXN-00184731", counterparty: "Stripe Inc.", amount: "$2,300.00", rule: "exact_match", ruleType: "DETERMINISTIC" },
  { id: "TXN-00184732", counterparty: "Braintree LLC", amount: "$470.00", rule: "ai_gateway_fee_rule", ruleType: "AI_GENERATED" },
  { id: "TXN-00184733", counterparty: "PayPal Holdings", amount: "$8,100.00", rule: "exact_match", ruleType: "DETERMINISTIC" },
  { id: "TXN-00184734", counterparty: "Adyen N.V.", amount: "$1,372.00", rule: "ai_gateway_fee_rule", ruleType: "AI_GENERATED" },
  { id: "TXN-00184735", counterparty: "Checkout.com", amount: "$660.00", rule: "exact_match", ruleType: "DETERMINISTIC" },
];

const AI_AUDIT = {
  matchType: "AI_GENERATED",
  ruleName: "ai_gateway_fee_rule",
  confidence: "100%",
  executedAt: "2026-08-30 09:18 UTC",
  matchLogic: "Matched on Amount × 0.98 == Bank Amount",
  approver: "Priya Menon",
  approverInitials: "PM",
  explanation:
    "The merchant ledger recorded $2,000.00. The bank settled $1,960.00. The AI Quant Engine identified a consistent 2% gateway processing fee applied at settlement across all 70 similar transactions. Rule ai_gateway_fee_rule was promoted to production following human approval and zero-regression sandbox validation.",
};

const DET_AUDIT = {
  matchType: "DETERMINISTIC",
  ruleName: "exact_match",
  confidence: "100%",
  executedAt: "2026-08-30 09:14 UTC",
  matchLogic: "Amount == Bank Amount (exact)",
  approver: "System",
  approverInitials: "SY",
  explanation:
    "Merchant ledger and bank settlement amounts matched exactly to the cent. No discrepancy detected. Rule exact_match is a baseline deterministic rule applied to all transactions before AI analysis.",
};

type Props = { onBack: () => void; onToDashboard: () => void };

export default function AuditTrail({ onBack, onToDashboard }: Props) {
  const [activeId, setActiveId] = useState<string>("TXN-00184722");

  const activeTx = TRANSACTIONS.find((t) => t.id === activeId)!;
  const audit = activeTx.ruleType === "AI_GENERATED" ? AI_AUDIT : DET_AUDIT;

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
        <span style={{ fontSize: "14px", color: "#E4E4E7", fontWeight: 500 }}>Master Ledger</span>
        <span style={{ marginLeft: "8px", fontSize: "12px", fontWeight: 500, color: "#ADEBB3", backgroundColor: "rgba(173,235,179,0.08)", padding: "2px 8px", borderRadius: "3px" }}>
          1,000 transactions · All resolved
        </span>
      </div>

      {/* Body: 60/40 split */}
      <div className="flex flex-1" style={{ minHeight: 0 }}>

        {/* ── LEFT 60%: Master table ── */}
        <div
          className="flex flex-col"
          style={{ flex: "0 0 60%", borderRight: "1px solid #27272A", overflowY: "auto" }}
        >
          {/* Table toolbar */}
          <div
            className="flex items-center justify-between px-5"
            style={{ height: "48px", borderBottom: "1px solid #27272A", backgroundColor: "#18181B", position: "sticky", top: 0, zIndex: 1 }}
          >
            <span style={{ fontSize: "15px", fontWeight: 700, color: "#E4E4E7" }}>Master Ledger</span>
            <span style={{ fontSize: "13px", color: "#C4C4C8" }}>Showing 15 of 1,000 · Click any row for audit trail</span>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ position: "sticky", top: "48px", zIndex: 1 }}>
              <tr style={{ borderBottom: "1px solid #27272A", backgroundColor: "#18181B" }}>
                {["Transaction Id", "Counterparty", "Amount", "Status", "Rule Applied"].map((h) => (
                  <th
                    key={h}
                    style={{ padding: "10px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#E4E4E7", whiteSpace: "nowrap", backgroundColor: "#18181B" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TRANSACTIONS.map((tx, i) => {
                const active = tx.id === activeId;
                const isAI = tx.ruleType === "AI_GENERATED";
                return (
                  <tr
                    key={tx.id}
                    onClick={() => setActiveId(tx.id)}
                    style={{
                      borderBottom: i < TRANSACTIONS.length - 1 ? "1px solid #27272A" : "none",
                      backgroundColor: active ? "#27272A" : "transparent",
                      cursor: "pointer",
                      transition: "background-color 0.1s",
                    }}
                    onMouseEnter={(e) => {
                      if (!active) (e.currentTarget as HTMLTableRowElement).style.backgroundColor = "#1F1F23";
                    }}
                    onMouseLeave={(e) => {
                      if (!active) (e.currentTarget as HTMLTableRowElement).style.backgroundColor = "transparent";
                    }}
                  >
                    {/* Transaction ID */}
                    <td style={{ padding: "11px 16px", whiteSpace: "nowrap" }}>
                      <span style={{ fontFamily: "monospace", fontSize: "13px", color: "#B8E3E9" }}>{tx.id}</span>
                    </td>
                    {/* Counterparty */}
                    <td style={{ padding: "11px 16px", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: "14px", color: "#E4E4E7" }}>{tx.counterparty}</span>
                    </td>
                    {/* Amount */}
                    <td style={{ padding: "11px 16px", whiteSpace: "nowrap" }}>
                      <span style={{ fontFamily: "monospace", fontSize: "13px", color: "#E4E4E7" }}>{tx.amount}</span>
                    </td>
                    {/* Status */}
                    <td style={{ padding: "11px 16px", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: "13px", fontWeight: 500, color: "#ADEBB3", backgroundColor: "rgba(173,235,179,0.08)", padding: "2px 8px", borderRadius: "3px" }}>
                        Matched
                      </span>
                    </td>
                    {/* Rule */}
                    <td style={{ padding: "11px 16px", whiteSpace: "nowrap" }}>
                      <span style={{ fontFamily: "monospace", fontSize: "13px", color: isAI ? "#B5C7EB" : "#C4C4C8" }}>
                        {tx.rule}
                      </span>
                      {isAI && (
                        <span style={{ marginLeft: "8px", fontSize: "11px", fontWeight: 600, color: "#B5C7EB", backgroundColor: "rgba(181,199,235,0.1)", padding: "1px 6px", borderRadius: "3px" }}>
                          AI
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── RIGHT 40%: Audit drawer ── */}
        <div
          className="flex flex-col"
          style={{ flex: "0 0 40%", backgroundColor: "#18181B", overflowY: "auto" }}
        >
          {/* Drawer header */}
          <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #27272A" }}>
            <div style={{ fontSize: "22px", fontWeight: 700, color: "#FFFFFF" }}>Audit Trail Details</div>
            <div style={{ marginTop: "4px", fontSize: "13px", color: "#C4C4C8" }}>
              {activeId}
            </div>
          </div>

          {/* Drawer content */}
          <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "0" }}>

            {/* Data rows */}
            {[
              {
                label: "Match Type",
                content: (
                  <span style={{ fontFamily: "monospace", fontSize: "14px", fontWeight: 600, color: "#B5C7EB" }}>
                    {audit.matchType}
                  </span>
                ),
              },
              {
                label: "Rule Name",
                content: (
                  <span style={{ fontFamily: "monospace", fontSize: "14px", color: "#E4E4E7" }}>
                    {audit.ruleName}
                  </span>
                ),
              },
              {
                label: "Confidence Score",
                content: (
                  <span style={{ fontSize: "14px", fontWeight: 600, color: "#ADEBB3" }}>
                    {audit.confidence}
                  </span>
                ),
              },
              {
                label: "Match Logic",
                content: (
                  <span style={{ fontSize: "14px", color: "#E4E4E7" }}>{audit.matchLogic}</span>
                ),
              },
              {
                label: "Human Approver",
                content: (
                  <div className="flex items-center gap-2">
                    <div style={{ width: "24px", height: "24px", borderRadius: "3px", backgroundColor: "#27272A", border: "1px solid #3F3F46", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "10px", fontWeight: 700, color: "#E4E4E7" }}>{audit.approverInitials}</span>
                    </div>
                    <span style={{ fontSize: "14px", color: "#E4E4E7" }}>{audit.approver}</span>
                  </div>
                ),
              },
            ].map((row, i, arr) => (
              <div
                key={row.label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "5px",
                  padding: "14px 0",
                  borderBottom: i < arr.length - 1 ? "1px solid #27272A" : "none",
                }}
              >
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#C4C4C8" }}>{row.label}</span>
                {row.content}
              </div>
            ))}

            {/* Execution log — terminal block */}
            <div style={{ paddingTop: "14px", borderTop: "1px solid #27272A", marginTop: "0" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#C4C4C8", display: "block", marginBottom: "8px" }}>Execution Log</span>
              <div
                style={{
                  backgroundColor: "#0A0A0C",
                  border: "1px solid #27272A",
                  borderRadius: "4px",
                  padding: "14px 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#C4C4C8" }}>
                  <span style={{ color: "#ADEBB3" }}>{">"}</span> Executed at {audit.executedAt}
                </span>
                <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#C4C4C8" }}>
                  <span style={{ color: "#ADEBB3" }}>{">"}</span> {audit.matchLogic}
                </span>
                <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#C4C4C8" }}>
                  <span style={{ color: "#ADEBB3" }}>{">"}</span> Result: <span style={{ color: "#ADEBB3" }}>MATCH</span>
                </span>
              </div>
            </div>

            {/* AI Explanation — only for AI rules */}
            {activeTx.ruleType === "AI_GENERATED" && (
              <div style={{ paddingTop: "14px", borderTop: "1px solid #27272A", marginTop: "14px" }}>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#C4C4C8", display: "block", marginBottom: "8px" }}>AI Explanation</span>
                <p style={{ margin: 0, fontSize: "14px", color: "#E4E4E7", lineHeight: 1.65 }}>{audit.explanation}</p>
              </div>
            )}

            {/* View Database Record button */}
            <div style={{ paddingTop: "20px", marginTop: "4px" }}>
              <button
                style={{
                  width: "100%",
                  padding: "11px 20px",
                  backgroundColor: "transparent",
                  border: "1px solid #3F3F46",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#FFFFFF",
                  textAlign: "center",
                  transition: "border-color 0.1s, background-color 0.1s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "#71717A";
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#1F1F23";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "#3F3F46";
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                }}
              >
                View Database Record
              </button>
            </div>
          </div>
        </div>
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
