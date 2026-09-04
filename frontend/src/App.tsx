const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

import { useEffect, useState } from "react";

import Header from "./components/Header";
import MetricsRow from "./components/MetricsRow";
import TransactionTable from "./components/TransactionTable";
import StatusBar from "./components/StatusBar";
import ExceptionQueue from "./components/ExceptionQueue";
import AISandbox from "./components/AISandbox";
import AuditTrail from "./components/AuditTrail";

export type Screen = "dashboard" | "exceptions" | "ai-sandbox" | "audit";

export default function App() {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [sandboxData, setSandboxData] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);

  const [status, setStatus] = useState({
    total_volume: 0,
    auto_cleared: 0,
    ai_cleared: 0,
    action_required: 0,
  });

  const fetchStatus = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/api/v1/recon/status`
      );

      if (!response.ok) {
        throw new Error(`Status request failed: ${response.status}`);
      }

      const data = await response.json();

      console.log("[UI] Recon status:", data);

      setStatus(data);
    } catch (error) {
      console.error("[UI] Failed to fetch recon status:", error);
    }
  };

  const fetchMatches = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/api/v1/recon/matches`
      );

      if (!response.ok) {
        throw new Error(`Matches request failed: ${response.status}`);
      }

      const data = await response.json();

      console.log("[UI] Recon matches:", data);

      setMatches(data.matches ?? []);
    } catch (error) {
      console.error("[UI] Failed to fetch recon matches:", error);
    }
  };

useEffect(() => {
  fetchStatus();
  fetchMatches();
}, []);

  const handlePoisonPill = async () => {
    if (!sandboxData?.rule) {
      console.error("No rule available for poison-pill test.");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/api/v1/recon/poison-pill`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rule: sandboxData.rule,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        console.error("[UI] Poison Pill failed:", result);

        alert(
          result?.detail
            ? `Poison Pill test failed: ${result.detail}`
            : "Poison Pill test failed."
        );

        return;
      }

      console.log("[UI] Poison Pill result:", result);

      setSandboxData(result);
    } catch (error) {
      console.error("[UI] Poison Pill request failed:", error);

      alert("Could not connect to the backend.");
    }
  };

  const handlePromote = async () => {
    if (!sandboxData?.rule) {
      console.error("No rule available for promotion.");
      return;
    }

    try {
      console.log("[UI] Promoting rule:", sandboxData.rule);

      const response = await fetch(
        `${API_BASE}/api/v1/recon/promote`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rule: sandboxData.rule,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        console.error("[UI] Promotion failed:", result);
        alert(
          result?.detail
            ? `Promotion failed: ${result.detail}`
            : "Promotion failed."
        );
        return;
      }

      console.log("[UI] Promotion successful:", result);
      await fetchStatus();
      await fetchMatches();

      setScreen("audit");
    } catch (error) {
      console.error("[UI] Promotion request failed:", error);
      alert("Could not connect to the backend.");
    }
  };

  if (screen === "audit") {
    return (
      <AuditTrail
        matches={matches}
        onBack={() => setScreen("ai-sandbox")}
        onToDashboard={() => setScreen("dashboard")}
      />
    );
  }

  if (screen === "ai-sandbox") {
    return (
      <AISandbox
        data={sandboxData}
        onBack={() => setScreen("exceptions")}
        onToDashboard={() => setScreen("dashboard")}
        onPromote={handlePromote}
        onPoisonPill={handlePoisonPill}
      />
    );
  }

  if (screen === "exceptions") {
    return (
      <ExceptionQueue
        onBack={() => setScreen("dashboard")}
        onAISandbox={(payload) => {
          setSandboxData(payload);
          setScreen("ai-sandbox");
        }}
      />
    );
  }

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{
        backgroundColor: "#0E0E11",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <Header />

      <main className="flex-1 px-6 py-6 flex flex-col gap-6">
        <MetricsRow
          onExceptionsClick={() => setScreen("exceptions")}
          totalVolume={status.total_volume}
          autoCleared={status.auto_cleared}
          aiCleared={status.ai_cleared}
          actionRequired={status.action_required}
        />

        <TransactionTable />
      </main>

      <StatusBar />
    </div>
  );
}