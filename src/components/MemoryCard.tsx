import { useMemo } from "react";
import { Database, Server } from "lucide-react";

interface MemoryCardProps {
  environment: string;
  usedMB?: number;
  totalMB?: number;
  dumpInfo?: {
    environment: string;
    Data_Ultima_Tramitacao: string;
    Dias_Desatualizado: number;
    Status: string;
  }
}

const MemoryCard = ({ environment, usedMB, totalMB, dumpInfo }: MemoryCardProps) => {
  const isDumpCard = !!dumpInfo;
  const percentage = useMemo(() => {
    if (!usedMB || !totalMB) return 0
    return Math.round((usedMB / totalMB) * 100)
  }, [usedMB, totalMB]);

  const status = useMemo(() => {

  if (dumpInfo) {

    const hoje = new Date()
    const ultimaAtualizacao = new Date(dumpInfo.Data_Ultima_Tramitacao.split("/").reverse().join("-"))

    const diffTime = hoje.getTime() - ultimaAtualizacao.getTime()

    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays >= 1) return "critical"

    return "ok"
  }

    if (percentage >= 70 || percentage === 0) return "critical"
    if (percentage >= 59) return "warning"
    return "ok"

  }, [percentage, dumpInfo]);

  const statusColor = {
    ok: "hsl(var(--status-ok))",
    warning: "hsl(var(--status-warning))",
    critical: "hsl(var(--status-critical))",
  }[status];

  const statusBg = {
    ok: "hsl(var(--status-ok) / 0.1)",
    warning: "hsl(var(--status-warning) / 0.1)",
    critical: "hsl(var(--status-critical) / 0.1)",
  }[status];

  const statusBorder = {
    ok: "hsl(var(--status-ok) / 0.2)",
    warning: "hsl(var(--status-warning) / 0.2)",
    critical: "hsl(var(--status-critical) / 0.3)",
  }[status];

  const statusLabel = {
    ok: "Normal",
    warning: "Atenção",
    critical: "Crítico",
  }[status];

  return (
    <div
      className="rounded-xl border bg-card p-6 transition-all duration-300"
      style={{ borderColor: statusBorder }}
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg"
            style={{ backgroundColor: statusBg }}
          >
            {isDumpCard ? <Database className="h-4 w-4" style={{ color: statusColor }} /> : <Server className="h-4 w-4" style={{ color: statusColor }} />}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {environment}
            </h3>
          </div>
        </div>
        <span
          className="rounded-full px-2.5 py-0.5 text-xs font-medium"
          style={{ backgroundColor: statusBg, color: statusColor }}
        >
          {statusLabel}
        </span>
      </div>

      {/* Progress bar */}
      {!isDumpCard && (
        <div className="mb-3">
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${percentage}%`,
                backgroundColor: statusColor,
              }}
            />
          </div>
        </div>
      )}

      <div className="flex items-end justify-between">

        {isDumpCard ? (
          <div>
            <span
              className="text-2xl font-bold text-foreground"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {dumpInfo?.Data_Ultima_Tramitacao}
            </span>

            <p
              className="text-xs text-muted-foreground mt-1"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {dumpInfo?.Status}
            </p>
          </div>
        ) : (
          <>
            <span
              className="text-2xl font-bold text-foreground"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {percentage}%
            </span>

            <p
              className="text-xs text-muted-foreground"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {usedMB?.toLocaleString()} / {totalMB?.toLocaleString()} MB
            </p>
          </>
        )}

      </div>
    </div>
  );
};

export default MemoryCard;
