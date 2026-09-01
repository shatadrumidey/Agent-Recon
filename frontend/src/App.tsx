import { useState } from "react";
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

  if (screen === "audit") {
    return (
      <AuditTrail
        onBack={() => setScreen("ai-sandbox")}
        onToDashboard={() => setScreen("dashboard")}
      />
    );
  }

  if (screen === "ai-sandbox") {
    return (
      <AISandbox
        onBack={() => setScreen("exceptions")}
        onToDashboard={() => setScreen("dashboard")}
        onPromote={() => setScreen("audit")}
      />
    );
  }

  if (screen === "exceptions") {
    return (
      <ExceptionQueue
        onBack={() => setScreen("dashboard")}
        onAISandbox={() => setScreen("ai-sandbox")}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#0E0E11", fontFamily: "Inter, sans-serif" }}>
      <Header />
      <main className="flex-1 px-6 py-6 flex flex-col gap-6">
        <MetricsRow onExceptionsClick={() => setScreen("exceptions")} />
        <TransactionTable />
      </main>
      <StatusBar />
    </div>
  );
}
