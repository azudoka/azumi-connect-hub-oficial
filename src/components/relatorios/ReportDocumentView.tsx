import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────────────────────

export type ReportType =
  | "hraas_operacao_continua"
  | "atracao"
  | "gotomarket"
  | "encerramento_vaga";

export type ReportStatus =
  | "draft"
  | "pending_approval"
  | "approved"
  | "published";

export type Report = {
  id: string;
  title: string | null;
  status: ReportStatus;
  month_ref: string;
  summary_text: string | null;
  risks_text: string | null;
  next_steps_text: string | null;
  total_hours_minutes: number | null;
  hours_deliverables_minutes: number | null;
  hours_solicitations_minutes: number | null;
  reference_start: string | null;
  reference_end: string | null;
  consultant_name: string | null;
  consultant_job_title: string | null;
  admin_approved_at: string | null;
  admin_name: string | null;
  published_at: string | null;
  client_signed_at: string | null;
  report_type: ReportType | null;
  template_data: Record<string, unknown>;
  company?: {
    nome: string;
    logo_url: string | null;
    monthly_hours: number;
  } | null;
};

export type TaskRow = {
  title: string;
  type: string;
  status: string;
  hours: number;
  isManual?: boolean;
  justificativa?: string;
};

export type SolRow = {
  title: string;
  type: string;
  status: string;
  hours: number;
};

type Props = {
  report: Report;
  taskRows: TaskRow[];
  solicitationRows: SolRow[];
  userRole?: string;
  onAcknowledge?: (reportId: string) => void;
  acknowledged?: boolean;
};

// ── Constants ────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<ReportType, string> = {
  hraas_operacao_continua: "HRaaS — Operação Contínua",
  atracao: "Atração & Hunting",
  gotomarket: "Go-to-Market",
  encerramento_vaga: "Encerramento de Vaga",
};

const TYPE_COLORS: Record<ReportType, string> = {
  hraas_operacao_continua: "#034C8B",
  atracao: "#8B5CF6",
  gotomarket: "#10B981",
  encerramento_vaga: "#F59E0B",
};

const STATUS_LABELS: Record<ReportStatus, string> = {
  draft: "Rascunho",
  pending_approval: "Aguardando aprovação",
  approved: "Aprovado",
  published: "Publicado",
};

const STATUS_COLORS: Record<ReportStatus, string> = {
  draft: "#6B7280",
  pending_approval: "#F59E0B",
  approved: "#3B82F6",
  published: "#10B981",
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("T")[0].split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

function fmtMonthRef(ref: string): string {
  if (!ref) return "—";
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const [y, m] = ref.split("-");
  const idx = parseInt(m, 10) - 1;
  return `${months[idx] ?? m}/${y}`;
}

function fmtMinutes(mins: number | null | undefined): string {
  if (mins == null) return "—";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

function toArray(val: unknown): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(String);
  if (typeof val === "string") return val.split("\n").map((s) => s.trim()).filter(Boolean);
  return [];
}

function protocolo(report: Report): string {
  const date = (report.published_at ?? report.admin_approved_at ?? new Date().toISOString()).slice(0, 10).replace(/-/g, "");
  const short = report.id.replace(/-/g, "").slice(0, 8).toUpperCase();
  return `AZ-REL-${date}-${short}`;
}

// ── Internal sub-components ──────────────────────────────────────────────────

function DocSection({ title, children, style }: { title: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ marginBottom: 28, ...style }}>
      <div style={{
        fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
        color: "#034C8B", borderBottom: "2px solid #034C8B", paddingBottom: 6, marginBottom: 14,
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function FCell({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ padding: "10px 14px" }}>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.65)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", fontFamily: mono ? "JetBrains Mono, monospace" : undefined }}>{value}</div>
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  if (!items.length) return <p style={{ color: "#9CA3AF", fontSize: 13 }}>Nenhum item.</p>;
  return (
    <ul style={{ margin: 0, paddingLeft: 18, listStyle: "disc" }}>
      {items.map((item, i) => (
        <li key={i} style={{ fontSize: 13, color: "#374151", lineHeight: 1.6, marginBottom: 4 }}>{item}</li>
      ))}
    </ul>
  );
}

function AzDataTable({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  return (
    <div style={{ overflowX: "auto", borderRadius: 8, border: "1px solid #E5E7EB" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ background: "#F3F4F6" }}>
            {headers.map((h, i) => (
              <th key={i} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, color: "#6B7280", textTransform: "uppercase", fontSize: 10, letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ borderTop: "1px solid #E5E7EB", background: ri % 2 === 0 ? "#fff" : "#F9FAFB" }}>
              {row.map((cell, ci) => (
                <td key={ci} style={{ padding: "8px 12px", color: "#374151" }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AssinaturaBlock({ nome, cargo, dataLabel, data }: { nome: string; cargo: string; dataLabel: string; data: string }) {
  return (
    <div style={{
      flex: 1, minWidth: 180,
      border: "1px solid #E5E7EB", borderRadius: 10,
      padding: "16px 20px", background: "#FAFAFA"
    }}>
      <div style={{ borderTop: "2px solid #CBD5E1", paddingTop: 10, marginTop: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{nome}</div>
        <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>{cargo}</div>
        <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 6 }}>{dataLabel}: {data}</div>
      </div>
    </div>
  );
}

// ── Logo SVG ─────────────────────────────────────────────────────────────────

function AzumiLogoSvg({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="azGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#034C8B" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      <circle cx="15" cy="20" r="13" fill="url(#azGrad)" fillOpacity="0.9" />
      <circle cx="25" cy="20" r="13" fill="#fff" fillOpacity="0.25" />
      <circle cx="25" cy="20" r="10" fill="url(#azGrad)" fillOpacity="0.7" />
    </svg>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ReportDocumentView({ report, taskRows, solicitationRows, userRole, onAcknowledge, acknowledged }: Props) {
  const isClient = userRole === "cliente";
  const type = report.report_type;
  const td = report.template_data ?? {};
  const typeColor = type ? TYPE_COLORS[type] : "#034C8B";

  // Hours
  const totalMins = report.total_hours_minutes ?? 0;
  const delivMins = report.hours_deliverables_minutes ?? 0;
  const solMins = report.hours_solicitations_minutes ?? 0;
  const contractedH = report.company?.monthly_hours ?? 0;
  const usedH = totalMins / 60;
  const exceeded = contractedH > 0 && usedH > contractedH;
  const pct = contractedH > 0 ? Math.min((usedH / contractedH) * 100, 100) : 0;

  // Subtotals from rows
  const delivSubtotal = taskRows.reduce((s, r) => s + r.hours, 0);
  const solSubtotal = solicitationRows.reduce((s, r) => s + r.hours, 0);
  const hasManuals = taskRows.some((r) => r.isManual);

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          @page { margin: 15mm; }
        }
      `}</style>

      <div style={{
        fontFamily: "'Urbanist', 'Segoe UI', sans-serif",
        color: "#111827",
        maxWidth: 860,
        margin: "0 auto",
        background: "#fff",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
      }}>

        {/* ── 1. Faixa gradiente + Header ─────────────────────────────── */}
        <div style={{ height: 4, background: "linear-gradient(90deg, #031D38 0%, #034C8B 50%, #8B5CF6 100%)" }} />
        <div style={{
          background: "linear-gradient(135deg, #031D38 0%, #034C8B 60%, #8B5CF6 100%)",
          padding: "32px 40px 28px",
          display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <AzumiLogoSvg size={36} />
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Relatório de Prestação de Serviços
              </span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", lineHeight: 1.25 }}>
              {report.title ?? `Relatório — ${fmtMonthRef(report.month_ref)}`}
            </div>
          </div>
          {/* Logo do cliente */}
          <div style={{ shrink: 0 } as React.CSSProperties}>
            {report.company?.logo_url ? (
              <img
                src={report.company.logo_url}
                alt={report.company.nome}
                style={{ height: 52, width: 52, borderRadius: 10, objectFit: "contain", background: "#fff", padding: 4 }}
              />
            ) : (
              <div style={{
                height: 52, width: 52, borderRadius: 10,
                background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, fontWeight: 800, color: "#fff"
              }}>
                {(report.company?.nome ?? "?").charAt(0).toUpperCase()}
              </div>
            )}
            {report.company?.nome && (
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", textAlign: "center", marginTop: 4 }}>
                {report.company.nome}
              </div>
            )}
          </div>
        </div>

        {/* ── 2. Ficha de identificação ────────────────────────────────── */}
        {(() => {
          const showPacote = type === "hraas_operacao_continua";
          const monthlyH = report.company?.monthly_hours ?? null;
          const pacoteLabel = (() => {
            if (monthlyH == null || monthlyH === 0) return "—";
            if (monthlyH === 15) return "Start";
            if (monthlyH === 25) return "Ongoing";
            if (monthlyH === 40) return "Growth";
            return "Personalizado";
          })();
          const cols = 5 + (showPacote ? 1 : 0);
          return (
            <div style={{
              background: "#031D38",
              display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`,
              borderBottom: "3px solid " + typeColor
            }}>
              <FCell label="Mês de referência" value={fmtMonthRef(report.month_ref)} mono />
              <FCell
                label="Período apurado"
                value={report.reference_start && report.reference_end
                  ? `${fmtDate(report.reference_start)} → ${fmtDate(report.reference_end)}`
                  : "—"}
                mono
              />
              <FCell label="Status" value={STATUS_LABELS[report.status]} />
              <FCell label="Data de emissão" value={fmtDate(report.published_at ?? new Date().toISOString())} mono />
              {showPacote && <FCell label="Pacote" value={pacoteLabel} />}
              <div style={{ padding: "10px 14px" }}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.65)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>Protocolo</div>
                <div style={{ fontSize: 10, fontWeight: 600, color: "#fff", fontFamily: "JetBrains Mono, monospace" }}>{protocolo(report)}</div>
              </div>
            </div>
          );
        })()}

        {/* ── Aviso de confidencialidade ────────────────────────────────── */}
        <div style={{ padding: "8px 40px", background: "#F8FAFC", borderBottom: "1px solid #E5E7EB", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13 }}>🔒</span>
          <span style={{ fontSize: 11, color: "#6B7280", lineHeight: 1.5 }}>
            Documento confidencial — uso exclusivo de {report.company?.nome ?? "contratante"}. Protegido pela Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018). Vedada a reprodução ou compartilhamento sem autorização da Azumi RH.
          </span>
        </div>

        {/* ── Conteúdo do documento ─────────────────────────────────────── */}
        <div style={{ padding: "32px 40px" }}>


          {/* 3. Síntese executiva */}
          {report.summary_text && (
            <DocSection title="Síntese Executiva">
              <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.7, margin: 0 }}>{report.summary_text}</p>
            </DocSection>
          )}

          {/* 4. Seções por tipo */}
          {type === "hraas_operacao_continua" && (
            <>
              {toArray(td.objectives).length > 0 && (
                <DocSection title="Objetivos do Período">
                  <BulletList items={toArray(td.objectives)} />
                </DocSection>
              )}
              {toArray(td.deliveries).length > 0 && (
                <DocSection title="Entregas Realizadas">
                  <BulletList items={toArray(td.deliveries)} />
                </DocSection>
              )}
              {toArray(td.pendencies).length > 0 && (
                <DocSection title="Pendências">
                  <BulletList items={toArray(td.pendencies)} />
                </DocSection>
              )}
            </>
          )}

          {(type === "atracao" || type === "encerramento_vaga") && (
            <>
              {/* Métricas automáticas */}
              {(td.auto_vagas != null || td.auto_candidatos != null || td.auto_aprovacao != null || td.auto_horas != null) && (
                <DocSection title="Métricas do Período">
                  <div style={{ display: "grid", gridTemplateColumns: type === "encerramento_vaga" ? "repeat(3,1fr)" : "repeat(4,1fr)", gap: 12 }}>
                    {[
                      { label: "Vagas trabalhadas", value: String(td.auto_vagas ?? "—") },
                      { label: "Candidatos avaliados", value: String(td.auto_candidatos ?? "—") },
                      { label: "Taxa de aprovação", value: td.auto_aprovacao != null ? `${td.auto_aprovacao}%` : "—" },
                      ...(type !== "encerramento_vaga" ? [{ label: "Horas consumidas", value: td.auto_horas != null ? `${td.auto_horas}h` : "—" }] : []),
                    ].map((card, i) => (
                      <div key={i} style={{
                        border: "1px solid #E5E7EB", borderRadius: 10, padding: "14px 16px",
                        background: "#F9FAFB"
                      }}>
                        <div style={{ fontSize: 10, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{card.label}</div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: typeColor }}>{card.value}</div>
                      </div>
                    ))}
                  </div>
                </DocSection>
              )}

              {/* Funil por etapa */}
              {Array.isArray(td.auto_funnel_etapas) && (td.auto_funnel_etapas as unknown[]).length > 0 && (
                <DocSection title="Funil por Etapa">
                  <AzDataTable
                    headers={["Etapa", "Candidatos"]}
                    rows={(td.auto_funnel_etapas as Array<{ etapa: string; count: number }>).map((e) => [e.etapa, String(e.count)])}
                  />
                </DocSection>
              )}

              {/* Pipeline */}
              {td.pipeline_summary && (
                <DocSection title="Síntese do Pipeline">
                  <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.7, margin: 0 }}>{String(td.pipeline_summary)}</p>
                </DocSection>
              )}

              {/* Vagas trabalhadas */}
              {toArray(td.positions_worked).length > 0 && (
                <DocSection title="Vagas Trabalhadas">
                  <BulletList items={toArray(td.positions_worked)} />
                </DocSection>
              )}

              {/* Funil por vaga */}
              {Array.isArray(td.funnel) && (td.funnel as unknown[]).length > 0 && (
                <DocSection title="Funil por Vaga">
                  <AzDataTable
                    headers={["Vaga", "Inscritos", "Triagem", "Entrevista", "Finalistas", "Aprovados"]}
                    rows={(td.funnel as Array<Record<string, unknown>>).map((row) => [
                      String(row.vaga ?? ""), String(row.inscritos ?? 0), String(row.triagem ?? 0),
                      String(row.entrevista ?? 0), String(row.finalistas ?? 0), String(row.aprovados ?? 0),
                    ])}
                  />
                </DocSection>
              )}

              {/* Tempo médio por etapa */}
              {td.avg_time_per_stage && (
                <DocSection title="Tempo Médio por Etapa">
                  <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.7, margin: 0 }}>{String(td.avg_time_per_stage)}</p>
                </DocSection>
              )}

              {/* Motivos de reprovação */}
              {td.rejection_reasons && (
                <DocSection title="Motivos de Reprovação">
                  <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.7, margin: 0 }}>{String(td.rejection_reasons)}</p>
                </DocSection>
              )}
            </>
          )}

          {type === "gotomarket" && (
            <>
              {toArray(td.phases_completed).length > 0 && (
                <DocSection title="Fases Concluídas">
                  <BulletList items={toArray(td.phases_completed)} />
                </DocSection>
              )}
              {toArray(td.deliveries).length > 0 && (
                <DocSection title="Entregas">
                  <BulletList items={toArray(td.deliveries)} />
                </DocSection>
              )}
              {toArray(td.pendencies).length > 0 && (
                <DocSection title="Pendências">
                  <BulletList items={toArray(td.pendencies)} />
                </DocSection>
              )}
            </>
          )}

          {/* 5. Riscos */}
          {report.risks_text && (
            <DocSection title="Riscos e Pontos de Atenção">
              <div style={{
                background: "#FFFBEB", border: "1px solid #FCD34D",
                borderRadius: 10, padding: "14px 18px",
                display: "flex", gap: 12
              }}>
                <span style={{ fontSize: 18 }}>⚠️</span>
                <p style={{ fontSize: 13, color: "#92400E", lineHeight: 1.7, margin: 0 }}>{report.risks_text}</p>
              </div>
            </DocSection>
          )}

          {/* 6. Entregáveis */}
          {taskRows.length > 0 && (
            <DocSection title="Apuração de Tempo — Entregáveis">
              <AzDataTable
                headers={["Entregável", "Frente", "Status", "Horas"]}
                rows={taskRows.map((r) => [
                  <span key="t">
                    {r.title}
                    {r.isManual && (
                      <span style={{
                        marginLeft: 6, fontSize: 10, background: "#FEF3C7", color: "#92400E",
                        border: "1px solid #FCD34D", borderRadius: 4, padding: "1px 5px", fontWeight: 600
                      }}>
                        manual ✱
                      </span>
                    )}
                  </span>,
                  r.type,
                  r.status,
                  `${r.hours.toFixed(1)}h`,
                ])}
              />
              <div style={{
                marginTop: 8, textAlign: "right", fontSize: 13, fontWeight: 700, color: "#111827"
              }}>
                Subtotal: {delivSubtotal.toFixed(1)}h
              </div>
              {hasManuals && (
                <p style={{ fontSize: 11, color: "#92400E", marginTop: 8, fontStyle: "italic" }}>
                  ✱ Horas marcadas como "manual" foram lançadas diretamente pelo consultor e podem não ter origem em uma tarefa vinculada ao sistema.
                </p>
              )}
            </DocSection>
          )}

          {/* 7. Solicitações */}
          {solicitationRows.length > 0 && (
            <DocSection title="Apuração de Tempo — Solicitações">
              <AzDataTable
                headers={["Solicitação", "Tipo", "Status", "Horas"]}
                rows={solicitationRows.map((r) => [r.title, r.type, r.status, `${r.hours.toFixed(1)}h`])}
              />
              <div style={{
                marginTop: 8, textAlign: "right", fontSize: 13, fontWeight: 700, color: "#111827"
              }}>
                Subtotal: {solSubtotal.toFixed(1)}h
              </div>
            </DocSection>
          )}

          {/* 8. Resumo analítico de horas */}
          <DocSection title="Resumo Analítico de Horas">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              {contractedH > 0 && (
                <div style={{ border: "1px solid #E5E7EB", borderRadius: 10, padding: "14px 18px", background: "#F9FAFB" }}>
                  <div style={{ fontSize: 10, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Pacote Contratado</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: "#034C8B" }}>{contractedH}h</div>
                </div>
              )}
              <div style={{
                border: `1px solid ${exceeded ? "#FCA5A5" : "#A7F3D0"}`,
                borderRadius: 10, padding: "14px 18px",
                background: exceeded ? "#FEF2F2" : "#ECFDF5"
              }}>
                <div style={{ fontSize: 10, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Total Consumido</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: exceeded ? "#DC2626" : "#059669" }}>{usedH.toFixed(1)}h</div>
              </div>
            </div>

            {/* Alerta de ultrapassagem / ok */}
            {contractedH > 0 && (
              <div style={{
                background: exceeded ? "#FEF2F2" : "#ECFDF5",
                border: `1px solid ${exceeded ? "#FCA5A5" : "#A7F3D0"}`,
                borderRadius: 8, padding: "10px 16px", marginBottom: 14, fontSize: 12,
                color: exceeded ? "#991B1B" : "#065F46"
              }}>
                {exceeded
                  ? `⚠️ O pacote contratado de ${contractedH}h foi ultrapassado em ${(usedH - contractedH).toFixed(1)}h. As horas excedentes serão cobradas conforme contrato.`
                  : `✅ Consumo dentro do pacote contratado. As horas não utilizadas não são cumulativas para o próximo mês.`}
              </div>
            )}

            {/* Barra de progresso */}
            {contractedH > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#6B7280", marginBottom: 4 }}>
                  <span>0h</span>
                  <span>{contractedH}h (contratado)</span>
                </div>
                <div style={{ height: 10, background: "#E5E7EB", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${pct}%`, borderRadius: 99,
                    background: exceeded
                      ? "linear-gradient(90deg, #034C8B, #EF4444)"
                      : "linear-gradient(90deg, #034C8B, #8B5CF6)"
                  }} />
                </div>
              </div>
            )}

            {/* Breakdown */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ border: "1px solid #E5E7EB", borderRadius: 8, padding: "10px 14px" }}>
                <div style={{ fontSize: 10, color: "#9CA3AF", textTransform: "uppercase", marginBottom: 4 }}>Entregáveis</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#034C8B" }}>{(delivMins / 60).toFixed(1)}h</div>
              </div>
              <div style={{ border: "1px solid #E5E7EB", borderRadius: 8, padding: "10px 14px" }}>
                <div style={{ fontSize: 10, color: "#9CA3AF", textTransform: "uppercase", marginBottom: 4 }}>Solicitações</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#8B5CF6" }}>{(solMins / 60).toFixed(1)}h</div>
              </div>
            </div>
          </DocSection>

          {/* 9. Considerações finais */}
          {report.next_steps_text && (
            <DocSection title="Considerações Finais / Próximos Passos">
              <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.7, margin: 0 }}>{report.next_steps_text}</p>
            </DocSection>
          )}

          {/* 10. Assinaturas */}
          <DocSection title="Assinaturas">
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {report.consultant_name && (
                <AssinaturaBlock
                  nome={report.consultant_name}
                  cargo={report.consultant_job_title ?? "Consultor Azumi"}
                  dataLabel="Emitido em"
                  data={fmtDate(report.published_at ?? new Date().toISOString())}
                />
              )}
              {report.admin_approved_at && report.admin_name && (
                <AssinaturaBlock
                  nome={report.admin_name}
                  cargo="Aprovador Azumi"
                  dataLabel="Aprovado em"
                  data={fmtDate(report.admin_approved_at)}
                />
              )}
            </div>
          </DocSection>

          {/* 11. Protocolo */}
          <div style={{ textAlign: "center", marginTop: 24, marginBottom: 8 }}>
            <span style={{
              display: "inline-block",
              background: "#F3F4F6", border: "1px solid #E5E7EB",
              borderRadius: 99, padding: "5px 18px",
              fontSize: 11, color: "#6B7280",
              fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.05em"
            }}>
              {protocolo(report)}
            </span>
          </div>

          {/* 12. Ciência do cliente */}
          {isClient && report.status === "published" && (
            <div style={{
              marginTop: 32, border: "1px solid #E5E7EB", borderRadius: 12,
              padding: "24px", background: "#FAFAFA", textAlign: "center"
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                De acordo do Contratante
              </div>
              <p style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 16 }}>
                Ao assinar, você confirma que leu e está de acordo com este relatório.
              </p>
              {(acknowledged || report.client_signed_at) ? (
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: "#ECFDF5", border: "1px solid #A7F3D0",
                  borderRadius: 99, padding: "6px 18px",
                  fontSize: 12, fontWeight: 600, color: "#059669"
                }}>
                  ✅ Ciência registrada em {fmtDate(report.client_signed_at ?? new Date().toISOString())}
                </span>
              ) : (
                <button
                  className="no-print"
                  onClick={() => onAcknowledge?.(report.id)}
                  style={{
                    background: "linear-gradient(90deg, #034C8B, #8B5CF6)",
                    border: "none", borderRadius: 99,
                    padding: "10px 28px", cursor: "pointer",
                    fontSize: 13, fontWeight: 600, color: "#fff",
                    display: "inline-flex", alignItems: "center", gap: 8
                  }}
                >
                  ✍️ Assinar ciência do relatório
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}
