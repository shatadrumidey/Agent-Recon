const TRANSACTIONS = [
  { id: "TXN-00184721", counterparty: "Stripe Inc.", amount: "$4,200.00", expected: "$4,200.00", status: "Matched", rule: "exact_match", timestamp: "2026-08-30 09:14:02" },
  { id: "TXN-00184722", counterparty: "Adyen N.V.", amount: "$1,960.00", expected: "$2,000.00", status: "Exception", rule: "—", timestamp: "2026-08-30 09:14:15" },
  { id: "TXN-00184723", counterparty: "Stripe Inc.", amount: "$850.00", expected: "$850.00", status: "Matched", rule: "exact_match", timestamp: "2026-08-30 09:14:31" },
  { id: "TXN-00184724", counterparty: "PayPal Holdings", amount: "$3,136.00", expected: "$3,200.00", status: "Exception", rule: "—", timestamp: "2026-08-30 09:15:04" },
  { id: "TXN-00184725", counterparty: "Checkout.com", amount: "$720.00", expected: "$720.00", status: "Matched", rule: "exact_match", timestamp: "2026-08-30 09:15:22" },
  { id: "TXN-00184726", counterparty: "Braintree LLC", amount: "$588.00", expected: "$600.00", status: "Exception", rule: "—", timestamp: "2026-08-30 09:15:49" },
  { id: "TXN-00184727", counterparty: "Stripe Inc.", amount: "$11,500.00", expected: "$11,500.00", status: "Matched", rule: "exact_match", timestamp: "2026-08-30 09:16:03" },
  { id: "TXN-00184728", counterparty: "Square Inc.", amount: "$294.12", expected: "$300.00", status: "Exception", rule: "—", timestamp: "2026-08-30 09:16:30" },
  { id: "TXN-00184729", counterparty: "Adyen N.V.", amount: "$5,400.00", expected: "$5,400.00", status: "Matched", rule: "exact_match", timestamp: "2026-08-30 09:16:55" },
  { id: "TXN-00184730", counterparty: "Checkout.com", amount: "$980.00", expected: "$1,000.00", status: "Exception", rule: "—", timestamp: "2026-08-30 09:17:12" },
];

const STATUS_STYLES: Record<string, { color: string; bg: string }> = {
  Matched: { color: "#4ADE80", bg: "rgba(74,222,128,0.08)" },
  Exception: { color: "#FBBF24", bg: "rgba(251,191,36,0.08)" },
};

const HEADERS: { label: string; mono: boolean }[] = [
  { label: "Transaction Id", mono: false },
  { label: "Counterparty", mono: false },
  { label: "Amount", mono: false },
  { label: "Expected", mono: false },
  { label: "Status", mono: false },
  { label: "Rule Applied", mono: false },
  { label: "Timestamp", mono: false },
];

export default function TransactionTable() {
  return (
    <div
      style={{
        backgroundColor: "#18181B",
        border: "1px solid #27272A",
        borderRadius: "4px",
        overflow: "hidden",
      }}
    >
      <div
        className="flex items-center justify-between px-5"
        style={{ height: "48px", borderBottom: "1px solid #27272A" }}
      >
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 500, color: "#E4E4E7" }}>
          Transaction Ledger
        </span>
        <span style={{ fontFamily: "Fira Code, monospace", fontSize: "12px", color: "#52525B" }}>
          Showing 10 of 1,000
        </span>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #27272A" }}>
              {HEADERS.map((h) => (
                <th
                  key={h.label}
                  style={{
                    padding: "10px 16px",
                    textAlign: "left",
                    fontFamily: h.mono ? "Fira Code, monospace" : "Inter, sans-serif",
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "#D4D4D8",
                    whiteSpace: "nowrap",
                    backgroundColor: "#18181B",
                  }}
                >
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TRANSACTIONS.map((tx, i) => {
              const s = STATUS_STYLES[tx.status];
              return (
                <tr
                  key={tx.id}
                  style={{
                    borderBottom: i < TRANSACTIONS.length - 1 ? "1px solid #27272A" : "none",
                    transition: "background-color 0.1s",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.backgroundColor = "#1F1F23";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.backgroundColor = "transparent";
                  }}
                >
                  <td style={{ padding: "11px 16px", whiteSpace: "nowrap" }}>
                    <span style={{ fontFamily: "Fira Code, monospace", fontSize: "13px", color: "#B8E3E9" }}>
                      {tx.id}
                    </span>
                  </td>
                  <td style={{ padding: "11px 16px", whiteSpace: "nowrap" }}>
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: "#E4E4E7" }}>
                      {tx.counterparty}
                    </span>
                  </td>
                  <td style={{ padding: "11px 16px", whiteSpace: "nowrap" }}>
                    <span style={{ fontFamily: "Fira Code, monospace", fontSize: "13px", color: "#E4E4E7" }}>
                      {tx.amount}
                    </span>
                  </td>
                  <td style={{ padding: "11px 16px", whiteSpace: "nowrap" }}>
                    <span style={{ fontFamily: "Fira Code, monospace", fontSize: "13px", color: "#E4E4E7" }}>
                      {tx.expected}
                    </span>
                  </td>
                  <td style={{ padding: "11px 16px", whiteSpace: "nowrap" }}>
                    <span
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "13px",
                        fontWeight: 500,
                        color: s.color,
                        backgroundColor: s.bg,
                        padding: "2px 8px",
                        borderRadius: "3px",
                        display: "inline-block",
                      }}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td style={{ padding: "11px 16px", whiteSpace: "nowrap" }}>
                    <span style={{ fontFamily: "Fira Code, monospace", fontSize: "13px", color: "#B8E3E9" }}>
                      {tx.rule}
                    </span>
                  </td>
                  <td style={{ padding: "11px 16px", whiteSpace: "nowrap" }}>
                    <span style={{ fontFamily: "Fira Code, monospace", fontSize: "13px", color: "#E4E4E7" }}>
                      {tx.timestamp}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
