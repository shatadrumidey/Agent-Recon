type MetricCardProps = {
  label: string;
  value: string;
  dot?: string;
  onClick?: () => void;
};

function MetricCard({ label, value, dot, onClick }: MetricCardProps) {
  const clickable = !!onClick;

  return (
    <div
      className="flex-1 flex flex-col gap-4 px-5 py-5"
      onClick={onClick}
      style={{
        backgroundColor: "#18181B",
        border: "1px solid #27272A",
        borderRadius: "4px",
        cursor: clickable ? "pointer" : "default",
        transition: "border-color 0.1s",
      }}
      onMouseEnter={(e) => {
        if (clickable) {
          (e.currentTarget as HTMLDivElement).style.borderColor = "#3F3F46";
        }
      }}
      onMouseLeave={(e) => {
        if (clickable) {
          (e.currentTarget as HTMLDivElement).style.borderColor = "#27272A";
        }
      }}
    >
      <div className="flex items-center gap-2">
        {dot && (
          <span
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              backgroundColor: dot,
              display: "inline-block",
              flexShrink: 0,
            }}
          />
        )}

        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "14px",
            color: "#C4C4C8",
            fontWeight: 400,
          }}
        >
          {label}
        </span>
      </div>

      <div className="flex items-end justify-between">
        <span
          style={{
            fontFamily: "Space Grotesk, sans-serif",
            fontSize: "36px",
            fontWeight: 700,
            color: "#F4F4F5",
            letterSpacing: "-0.04em",
            lineHeight: 1,
          }}
        >
          {value}
        </span>

        {clickable && (
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              fontWeight: 700,
              color: "#F97316",
              border: "1px solid #F97316",
              borderRadius: "20px",
              padding: "4px 12px",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              marginBottom: "2px",
            }}
          >
            Investigate
          </span>
        )}
      </div>
    </div>
  );
}

type Props = {
  onExceptionsClick: () => void;
  totalVolume: number;
  autoCleared: number;
  aiCleared: number;
  actionRequired: number;
};

export default function MetricsRow({
  onExceptionsClick,
  totalVolume,
  autoCleared,
  aiCleared,
  actionRequired,
}: Props) {
  return (
    <div className="flex gap-4">
      <MetricCard
        label="Total Processed"
        value={totalVolume.toLocaleString()}
      />

      <MetricCard
        label="Deterministically Matched"
        value={autoCleared.toLocaleString()}
        dot="#4ADE80"
      />

      <MetricCard
        label="AI Cleared"
        value={aiCleared.toLocaleString()}
        dot="#B5C7EB"
      />

      <MetricCard
        label="Action Required"
        value={actionRequired.toLocaleString()}
        dot="#FBBF24"
        onClick={actionRequired > 0 ? onExceptionsClick : undefined}
      />
    </div>
  );
}