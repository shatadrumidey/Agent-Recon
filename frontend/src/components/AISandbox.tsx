import LogoMark from "./LogoMark";

type Props = {
  data: any;
  onBack: () => void;
  onToDashboard: () => void;
  onPromote: () => void;
  onPoisonPill: () => void;
};

export default function AISandbox({
  data,
  onBack,
  onToDashboard,
  onPromote,
  onPoisonPill,
}: Props) {
  const sandbox = data?.sandbox;

  const truePositives = sandbox?.true_positives ?? 0;
  const falsePositives = sandbox?.false_positives ?? 0;
  const precision = sandbox?.precision ?? 0;
  const candidatePairs = sandbox?.candidate_pairs ?? 0;
  const falseNegatives = sandbox?.false_negatives ?? 0;
  const recall = sandbox?.recall ?? 0;

  const isPoisonPill = data?.threat === "poison_pill";

  const isRejected =
    sandbox?.status === "REJECTED" || isPoisonPill;

  const ruleName = data?.rule?.rule_name ?? sandbox?.rule_name ?? "Unknown Rule";

  const rule = data?.rule ?? {};
  const ruleType: string = rule.rule_type ?? "unknown";
  const merchantField: string = rule.merchant_field ?? "amount_inr";
  const bankField: string = rule.bank_field ?? "settlement_amount";
  const ratio: number | null = rule.ratio ?? null;
  const tolerance: number | null = rule.tolerance ?? null;
  const explanation: string =
    rule.explanation ?? "No explanation returned by the AI Quant Engine.";

  const clusterLabel =
    ruleType === "amount_ratio"
      ? "Fee Mismatches"
      : ruleType === "narration_contains_id"
      ? "Missing Reference IDs"
      : "Exact Amount Mismatches";

  const clusterCount = truePositives + falseNegatives;

  const merchantRows =
    sandbox?.merchant_rows ?? clusterCount;

  const bankRows =
    sandbox?.bank_rows ?? 130;

  function buildRuleCode(): string {
    if (ruleType === "amount_ratio") {
      return [
        `def ${ruleName}(merch, bank):`,
        `    """`,
        `    AI-synthesized reconciliation rule.`,
        `    Matches bank settlements that are ${((ratio ?? 0) * 100).toFixed(2)}%`,
        `    of the merchant ledger amount (tolerance \u00b1${(tolerance ?? 0).toFixed(2)}).`,
        `    """`,
        ``,
        `    RATIO = Decimal("${ratio ?? 0}")`,
        `    TOLERANCE = Decimal("${tolerance ?? 0}")`,
        ``,
        `    expected = merch.${merchantField} * RATIO`,
        `    return abs(expected - bank.${bankField}) <= TOLERANCE`,
      ].join("\n");
    }

    if (ruleType === "narration_contains_id") {
      return [
        `def ${ruleName}(merch, bank):`,
        `    """`,
        `    AI-synthesized reconciliation rule.`,
        `    Matches when the merchant transaction id appears`,
        `    inside the bank settlement narration.`,
        `    """`,
        ``,
        `    return merch.${merchantField} in bank.${bankField}`,
      ].join("\n");
    }

    return [
      `def ${ruleName}(merch, bank):`,
      `    """`,
      `    AI-synthesized reconciliation rule.`,
      `    Matches when merchant and bank values are exactly equal.`,
      `    """`,
      ``,
      `    return merch.${merchantField} == bank.${bankField}`,
    ].join("\n");
  }

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
                Quantitative Anomaly Engine · {clusterLabel} · {clusterCount} transactions
              </div>
            </div>

            {/* Anomaly detection report */}
            <div style={{ backgroundColor: "#18181B", border: "1px solid #27272A", borderRadius: "4px", padding: "18px 20px" }}>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "#B5C7EB", marginBottom: "10px" }}>Anomaly Detection Report</div>
              <p style={{ fontSize: "14px", color: "#E4E4E7", lineHeight: 1.65, margin: 0 }}>
                {explanation}
                {ruleType === "amount_ratio" && ratio != null && (
                  <>
                    {" "}Hypothesis: bank settlement equals{" "}
                    <span style={{ color: "#FBBF24", fontWeight: 600 }}>{(ratio * 100).toFixed(2)}%</span>{" "}
                    of the merchant ledger amount, within a tolerance of{" "}
                    <span style={{ fontFamily: "monospace", fontSize: "13px", color: "#B8E3E9" }}>
                      ±${(tolerance ?? 0).toFixed(2)}
                    </span>
                    .
                  </>
                )}
              </p>
            </div>

            {/* Rule metadata */}
            <div style={{ backgroundColor: "#18181B", border: "1px solid #27272A", borderRadius: "4px", overflow: "hidden" }}>
              <div style={{ padding: "10px 16px", borderBottom: "1px solid #27272A", fontSize: "13px", fontWeight: 600, color: "#C4C4C8" }}>
                Rule Metadata
              </div>
              {[
                { key: "rule_name", value: ruleName },
                { key: "rule_type", value: ruleType },
                { key: "merchant_field", value: merchantField },
                { key: "bank_field", value: bankField },
                ...(ratio != null ? [{ key: "ratio", value: String(ratio) }] : []),
                ...(tolerance != null ? [{ key: "tolerance", value: String(tolerance) }] : []),
                { key: "applies_to", value: `${clusterLabel} (${clusterCount} txns)` },
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
                Bounded DSL · server-validated · ready for promotion
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
                {buildRuleCode()}
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
                    `Loading exception batch · ${merchantRows} merchant rows × ${bankRows} bank rows`,
                    "Loading golden dataset · 870 matched transactions",
                    `Compiling bounded rule DSL · ${ruleName}`,
                    `Simulating ${candidatePairs.toLocaleString()} candidate pairs`,
                    "Checking trusted identity / amount constraints",
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
                  {
                    label: "True Positives",
                    value: String(truePositives),
                    color: "#ADEBB3",
                  },
                  {
                    label: "False Positives",
                    value: String(falsePositives),
                    color: "#E4E4E7",
                  },
                  {
                    label: "Precision",
                    value: precision.toFixed(2),
                    color: "#B5C7EB",
                  },
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

            {/* Sandbox decision */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                borderTop: "1px solid #27272A",
                paddingTop: "16px",
              }}
            >
              <span
                style={{
                  color: isRejected ? "#F87171" : "#ADEBB3",
                  fontSize: "16px",
                  lineHeight: 1.3,
                  flexShrink: 0,
                }}
              >
                {isRejected ? "!" : "✓"}
              </span>

              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  lineHeight: 1.6,
                  color: "#E4E4E7",
                }}
              >
                {isRejected ? (
                  <>
                    <span
                      style={{
                        fontWeight: 700,
                        color: "#F87171",
                      }}
                    >
                      {isPoisonPill
                        ? sandbox?.message ??
                          "DANGER: False Positive Detected. REJECTED"
                        : "Sandbox rejected the candidate rule."}
                    </span>{" "}
                    Promotion is blocked. The candidate must not reach production.

                    {isPoisonPill &&
                      sandbox?.false_positive_pairs?.[0] && (
                        <span
                          style={{
                            display: "block",
                            marginTop: "6px",
                            fontFamily: "monospace",
                            fontSize: "12px",
                            color: "#FCA5A5",
                          }}
                        >
                          Collision detected:{" "}
                          {sandbox.false_positive_pairs[0].merchant_txn_id}
                          {" → "}
                          {sandbox.false_positive_pairs[0].bank_ref_id}
                        </span>
                      )}
                  </>
                ) : (
                  <>
                    <span
                      style={{
                        fontWeight: 700,
                        color: "#ADEBB3",
                      }}
                    >
                      AST Validation Passed.
                    </span>{" "}
                    Zero regressions found in Golden Dataset. All 870
                    previously matched transactions continue to match
                    under the new rule. Safe to promote.
                  </>
                )}
              </p>
            </div>

            {/* Action buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderTop: "1px solid #27272A",
                paddingTop: "16px",
                gap: "12px",
              }}
            >
              {!isRejected &&
                ruleType === "narration_contains_id" && (
                  <button
                    onClick={onPoisonPill}
                    style={{
                      backgroundColor: "transparent",
                      border: "1px solid #7F1D1D",
                      borderRadius: "4px",
                      padding: "12px 20px",
                      cursor: "pointer",
                      fontFamily: "Inter, sans-serif",
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#FCA5A5",
                    }}
                  >
                    Run Poison Pill Attack
                  </button>
                )}

              {!isRejected && (
                <button
                  onClick={onPromote}
                  style={{
                    marginLeft: "auto",
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
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                      "#4F46E5";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                      "#6366F1";
                  }}
                >
                  Approve &amp; Promote to Production
                </button>
              )}
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