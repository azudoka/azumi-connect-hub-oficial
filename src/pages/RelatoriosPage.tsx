import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Loader2, Plus, BarChart2, FileText, CheckCircle, Clock, AlertTriangle,
  Eye, Trash2, ChevronRight, ExternalLink, Upload, Edit2, X, Send, Info,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { Report, ReportType, ReportStatus } from "@/components/relatorios/ReportDocumentView";

const TYPE_LABELS: Record<ReportType, string> = {
  hraas_operacao_continua: "HRaaS",
  atracao: "Atração",
  gotomarket: "GoToMarket",
  encerramento_vaga: "Enc. Vaga",
};

const TYPE_COLORS: Record<ReportType, string> = {
  hraas_operacao_continua: "bg-blue-500/15 text-blue-600 border-blue-400/30",
  atracao: "bg-violet-500/15 text-violet-600 border-violet-400/30",
  gotomarket: "bg-emerald-500/15 text-emerald-600 border-emerald-400/30",
  encerramento_vaga: "bg-amber-500/15 text-amber-600 border-amber-400/30",
};

const STATUS_LABELS: Record<ReportStatus, string> = {
  draft: "Rascunho",
  pending_approval: "Ag. aprovação",
  approved: "Aprovado",
  published: "Publicado",
};

const STATUS_COLORS: Record<ReportStatus, string> = {
  draft: "bg-muted text-muted-foreground border-border",
  pending_approval: "bg-amber-500/15 text-amber-600 border-amber-400/30",
  approved: "bg-blue-500/15 text-blue-600 border-blue-400/30",
  published: "bg-emerald-500/15 text-emerald-600 border-emerald-400/30",
};

type Company = { id: string; nome: string; logo_url?: string | null; monthly_hours?: number | null };

type ReportRow = Report & {
  empresa_id?: string;
  client_opened_at?: string | null;
  boleto_url?: string | null;
  boleto_vencimento?: string | null;
  boleto_valor?: number | null;
  comprovante_url?: string | null;
  comprovante_uploaded_at?: string | null;
};

type FunnelRow = {
  vaga: string; inscritos: number; triagem: number;
  entrevista: number; finalistas: number; aprovados: number;
};

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("T")[0].split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

function fmtMonthRef(ref: string): string {
  if (!ref) return "—";
  const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const [y, m] = ref.split("-");
  const idx = parseInt(m, 10) - 1;
  return `${months[idx] ?? m}/${y}`;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_COMPANIES: Company[] = [
  { id: "emp-001", nome: "Kentaki Foods" },
  { id: "emp-002", nome: "Tech Corp" },
];

const MOCK_REPORTS: ReportRow[] = [
  {
    id: "rel-001",
    title: "Relatório HRaaS — Kentaki Foods — Abril/2026",
    status: "published",
    month_ref: "2026-04",
    report_type: "hraas_operacao_continua",
    total_hours_minutes: 960,
    hours_deliverables_minutes: 600,
    hours_solicitations_minutes: 360,
    reference_start: "2026-04-01",
    reference_end: "2026-04-30",
    summary_text: "Mês de alta produtividade com foco em processos de R&S.",
    risks_text: null,
    next_steps_text: "Iniciar mapeamento de cargos em maio.",
    consultant_name: "Ana Beatriz",
    consultant_job_title: "Consultora Sênior",
    admin_approved_at: "2026-05-01T10:00:00Z",
    admin_name: "Patricia Lima",
    published_at: "2026-05-02T09:00:00Z",
    client_signed_at: null,
    template_data: {
      objectives: ["Mapear processos internos", "Apoiar recrutamento de 3 vagas"],
      deliveries: ["Processo seletivo Dev Pleno concluído", "Treinamento onboarding realizado"],
      pendencies: ["Revisão da política de férias pendente"],
    },
    empresa_id: "emp-001",
    company: { nome: "Kentaki Foods", logo_url: null, monthly_hours: 25 },
    client_opened_at: null,
    boleto_url: null, boleto_vencimento: null, boleto_valor: null,
    comprovante_url: null, comprovante_uploaded_at: null,
  },
  {
    id: "rel-002",
    title: "Relatório HRaaS — Kentaki Foods — Maio/2026",
    status: "draft",
    month_ref: "2026-05",
    report_type: "hraas_operacao_continua",
    total_hours_minutes: 0,
    hours_deliverables_minutes: 0,
    hours_solicitations_minutes: 0,
    reference_start: "2026-05-01",
    reference_end: "2026-05-31",
    summary_text: null,
    risks_text: null,
    next_steps_text: null,
    consultant_name: "Ana Beatriz",
    consultant_job_title: "Consultora Sênior",
    admin_approved_at: null,
    admin_name: null,
    published_at: null,
    client_signed_at: null,
    template_data: {},
    empresa_id: "emp-001",
    company: { nome: "Kentaki Foods", logo_url: null, monthly_hours: 25 },
    client_opened_at: null,
    boleto_url: null, boleto_vencimento: null, boleto_valor: null,
    comprovante_url: null, comprovante_uploaded_at: null,
  },
] as unknown as ReportRow[];

// ─────────────────────────────────────────────────────────────────────────────

export default function RelatoriosPage() {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const isAdmin = ["admin", "admin_azumi"].includes(usuario?.role ?? "");
  const isConsultant = ["consultor"].includes(usuario?.role ?? "");
  const isClient = ["cliente", "gestor_cliente"].includes(usuario?.role ?? "");
  const canCreate = isAdmin || isConsultant;

  const [reports, setReports] = useState<ReportRow[]>(MOCK_REPORTS);
  const [companies] = useState<Company[]>(MOCK_COMPANIES);
  const loading = false;

  const [filterCompany, setFilterCompany] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterType, setFilterType] = useState<ReportType | "">("");
  const [filterStatus, setFilterStatus] = useState<ReportStatus | "">("");

  const [createOpen, setCreateOpen] = useState(false);
  const [boletoOpen, setBoletoOpen] = useState(false);
  const [boletoReportId, setBoletoReportId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);

  const [boletoUrl, setBoletoUrl] = useState("");
  const [boletoVenc, setBoletoVenc] = useState("");
  const [boletoValor, setBoletoValor] = useState("");

  const [autoLoading, setAutoLoading] = useState(false);

  const [formEmpresa, setFormEmpresa] = useState("");
  const [formTipo, setFormTipo] = useState<ReportType>("hraas_operacao_continua");
  const [formTitulo, setFormTitulo] = useState("");
  const [formMonthRef, setFormMonthRef] = useState("");
  const [formStart, setFormStart] = useState("");
  const [formEnd, setFormEnd] = useState("");
  const [formSummary, setFormSummary] = useState("");
  const [formRisks, setFormRisks] = useState("");
  const [formNextSteps, setFormNextSteps] = useState("");
  const [formObjectives, setFormObjectives] = useState("");
  const [formDeliveries, setFormDeliveries] = useState("");
  const [formPendencies, setFormPendencies] = useState("");
  const [formPipeline, setFormPipeline] = useState("");
  const [formPositions, setFormPositions] = useState("");
  const [formFunnel, setFormFunnel] = useState<FunnelRow[]>([]);
  const [formAvgTime, setFormAvgTime] = useState("");
  const [formRejections, setFormRejections] = useState("");
  const [formPhases, setFormPhases] = useState("");
  const [formHorasEntregaveis, setFormHorasEntregaveis] = useState("");
  const [formHorasSolicitacoes, setFormHorasSolicitacoes] = useState("");
  const [formSaving, setFormSaving] = useState(false);

  const [contextoRelatorios, setContextoRelatorios] = useState<{ month_ref: string; total_hours_minutes: number | null }[]>([]);
  const [contextoEmpresaHoras, setContextoEmpresaHoras] = useState(0);
  const [atracaoVagas] = useState<{ id: string; titulo: string; status: string }[]>([]);
  const [atracaoCandidatos] = useState<{ id: string; nome: string; status: string }[]>([]);

  // Deriva contexto do período a partir dos relatórios locais — sem Supabase
  useEffect(() => {
    if (!createOpen) {
      setContextoRelatorios([]);
      setContextoEmpresaHoras(0);
      return;
    }
    if (!formEmpresa) return;

    setAutoLoading(true);
    const timer = setTimeout(() => {
      const empReports = reports
        .filter((r) => r.empresa_id === formEmpresa && r.status === "published")
        .sort((a, b) => (b.month_ref ?? "").localeCompare(a.month_ref ?? ""))
        .slice(0, 3);
      setContextoRelatorios(empReports.map((r) => ({
        month_ref: r.month_ref ?? "",
        total_hours_minutes: r.total_hours_minutes ?? 0,
      })));
      const comp = (empReports[0]?.company as { monthly_hours?: number | null } | null);
      setContextoEmpresaHoras(comp?.monthly_hours ?? 0);
      setAutoLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [createOpen, formEmpresa, formTipo, reports]);

  const filtered = reports.filter((r) => {
    if (filterCompany && (r.company as { nome: string } | null)?.nome !== filterCompany) return false;
    if (filterMonth && r.month_ref !== filterMonth) return false;
    if (filterType && r.report_type !== filterType) return false;
    if (filterStatus && r.status !== filterStatus) return false;
    return true;
  });

  const kpiPublished = reports.filter((r) => r.status === "published").length;
  const kpiPending = reports.filter((r) => r.status === "pending_approval").length;
  const kpiDraft = reports.filter((r) => r.status === "draft").length;
  const kpiTotalHours = reports.reduce((s, r) => s + (r.total_hours_minutes ?? 0) / 60, 0);

  const chartData = (() => {
    const published = reports
      .filter((r) => r.status === "published")
      .slice(0, 18);
    const byMonth: Record<string, { used: number; contracted: number }> = {};
    for (const r of published) {
      const key = r.month_ref ?? "";
      if (!byMonth[key]) byMonth[key] = { used: 0, contracted: 0 };
      byMonth[key].used += (r.total_hours_minutes ?? 0) / 60;
      byMonth[key].contracted = Math.max(byMonth[key].contracted, (r.company as { monthly_hours?: number } | null)?.monthly_hours ?? 0);
    }
    return Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, v]) => ({
        mes: key.replace(/(\d{4})-(\d{2})/, (_, y, m) => {
          const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
          return `${months[parseInt(m,10)-1]}/${y.slice(2)}`;
        }),
        usado: Math.round(v.used * 10) / 10,
        contratado: v.contracted,
      }));
  })();

  function handleStatusChange(id: string, newStatus: ReportStatus) {
    const now = new Date().toISOString();
    setReports((prev) => prev.map((r) => {
      if (r.id !== id) return r;
      const updates: Partial<ReportRow> = { status: newStatus };
      if (newStatus === "approved") {
        updates.admin_approved_at = now;
        updates.admin_name = usuario?.nome ?? "Admin";
      }
      if (newStatus === "published") {
        updates.published_at = now;
      }
      return { ...r, ...updates };
    }));
    toast.success(newStatus === "published" ? "Relatório publicado." : "Status atualizado.");
  }

  function handleDelete(id: string) {
    setReports((prev) => prev.filter((r) => r.id !== id));
    toast.success("Relatório excluído.");
    setDeleteId(null);
  }

  function handleSaveBoleto() {
    if (!boletoReportId) return;
    setReports((prev) => prev.map((r) =>
      r.id === boletoReportId
        ? {
            ...r,
            boleto_url: boletoUrl || null,
            boleto_vencimento: boletoVenc || null,
            boleto_valor: boletoValor ? parseFloat(boletoValor) : null,
          }
        : r
    ));
    toast.success("Boleto salvo.");
    setBoletoOpen(false);
  }

  function handleUploadComprovante(reportId: string, _file: File, _companyId: string) {
    setUploading(reportId);
    setTimeout(() => {
      setUploading(null);
      toast.success("Comprovante enviado (modo demo).");
    }, 800);
  }

  function handleCreate() {
    if (!formEmpresa || !formTipo || !formTitulo || !formMonthRef) {
      toast.error("Preencha os campos obrigatórios."); return;
    }
    setFormSaving(true);

    const delivMins = formTipo === "hraas_operacao_continua"
      ? Math.round((parseFloat(formHorasEntregaveis) || 0) * 60)
      : 0;
    const solMins = formTipo === "hraas_operacao_continua"
      ? Math.round((parseFloat(formHorasSolicitacoes) || 0) * 60)
      : 0;
    const totalMins = delivMins + solMins;

    let template_data: Record<string, unknown> = {};
    if (formTipo === "hraas_operacao_continua") {
      template_data = {
        objectives: formObjectives.split("\n").filter(Boolean),
        deliveries: formDeliveries.split("\n").filter(Boolean),
        pendencies: formPendencies.split("\n").filter(Boolean),
      };
    } else if (formTipo === "atracao" || formTipo === "encerramento_vaga") {
      const candidatosPorStatus = atracaoCandidatos.reduce<Record<string, number>>((acc, c) => {
        acc[c.status] = (acc[c.status] ?? 0) + 1;
        return acc;
      }, {});
      template_data = {
        pipeline_summary: formPipeline,
        positions_worked: formPositions.split("\n").filter(Boolean),
        funnel: formFunnel,
        avg_time_per_stage: formAvgTime,
        rejection_reasons: formRejections,
        auto_vagas: atracaoVagas.length,
        auto_candidatos: atracaoCandidatos.length,
        auto_candidatos_por_status: candidatosPorStatus,
      };
    } else if (formTipo === "gotomarket") {
      template_data = {
        phases_completed: formPhases.split("\n").filter(Boolean),
        deliveries: formDeliveries.split("\n").filter(Boolean),
        pendencies: formPendencies.split("\n").filter(Boolean),
      };
    }

    const empresa = companies.find((c) => c.id === formEmpresa);

    const novoRelatorio = {
      id: "rel-" + Date.now(),
      title: formTitulo,
      status: "draft" as ReportStatus,
      month_ref: formMonthRef,
      report_type: formTipo,
      total_hours_minutes: totalMins || null,
      hours_deliverables_minutes: delivMins || null,
      hours_solicitations_minutes: solMins || null,
      reference_start: formStart || null,
      reference_end: formEnd || null,
      summary_text: formSummary || null,
      risks_text: formRisks || null,
      next_steps_text: formNextSteps || null,
      consultant_name: usuario?.nome ?? null,
      consultant_job_title: null,
      admin_approved_at: null,
      admin_name: null,
      published_at: null,
      client_signed_at: null,
      template_data,
      empresa_id: formEmpresa,
      company: empresa
        ? { nome: empresa.nome, logo_url: empresa.logo_url ?? null, monthly_hours: empresa.monthly_hours ?? null }
        : null,
      client_opened_at: null,
      boleto_url: null,
      boleto_vencimento: null,
      boleto_valor: null,
      comprovante_url: null,
      comprovante_uploaded_at: null,
    } as unknown as ReportRow;

    setReports((prev) => [novoRelatorio, ...prev]);
    setFormSaving(false);
    toast.success("Relatório criado como rascunho.");
    setCreateOpen(false);
    setFormHorasEntregaveis("");
    setFormHorasSolicitacoes("");
  }


  if (isClient) return (
    <div>
      <PageHeader
        title="Relatórios"
        subtitle="Relatórios mensais de prestação de serviços da Azumi."
      />

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <input
          type="month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="h-9 px-3 rounded-lg border border-border bg-card text-sm"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as ReportType | "")}
          className="h-9 px-3 rounded-lg border border-border bg-card text-sm"
        >
          <option value="">Todos os tipos</option>
          {(Object.entries(TYPE_LABELS) as [ReportType, string][]).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        {(filterMonth || filterType) && (
          <button
            onClick={() => { setFilterMonth(""); setFilterType(""); }}
            className="h-9 px-3 rounded-lg border border-border bg-card text-sm text-muted-foreground"
          >
            Limpar
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Nenhum relatório publicado ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r) => {
            const typeColor = r.report_type ? {
              hraas_operacao_continua: "#034C8B", atracao: "#8B5CF6",
              gotomarket: "#10B981", encerramento_vaga: "#F59E0B",
            }[r.report_type] : "#034C8B";
            const comp = r.company as { nome: string; logo_url: string | null; monthly_hours: number } | null;
            const contractedH = comp?.monthly_hours ?? 0;
            const usedH = (r.total_hours_minutes ?? 0) / 60;
            const pct = contractedH > 0 ? Math.min((usedH / contractedH) * 100, 100) : 0;

            return (
              <div key={r.id} className="bg-card border border-border rounded-xl overflow-hidden flex flex-col">
                <div style={{ height: 4, background: typeColor }} />
                <div className="p-4 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="text-[10px] font-data font-semibold bg-secondary px-2 py-0.5 rounded-full">{fmtMonthRef(r.month_ref)}</span>
                    {r.report_type && (
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium border", TYPE_COLORS[r.report_type])}>
                        {TYPE_LABELS[r.report_type]}
                      </span>
                    )}
                    {r.client_signed_at && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-emerald-500/15 text-emerald-600 border border-emerald-400/30">Assinado</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{r.title ?? fmtMonthRef(r.month_ref)}</h3>
                  {r.consultant_name && (
                    <p className="text-xs text-muted-foreground mb-3">{r.consultant_name}</p>
                  )}
                  <div className="text-2xl font-bold font-data" style={{ color: typeColor }}>{usedH.toFixed(1)}h</div>
                  <div className="text-xs text-muted-foreground mb-2">consumidas</div>
                  {contractedH > 0 && (
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden mb-3">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                  )}
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => navigate(`/app/relatorios/${r.id}/documento`)}
                      className="h-8 px-3 rounded-md bg-primary text-primary-foreground text-xs font-medium flex items-center gap-1"
                    >
                      <Eye className="h-3.5 w-3.5" /> Abrir
                    </button>
                    {!r.client_signed_at && (
                      <button
                        onClick={() => {
                          const now = new Date().toISOString();
                          setReports((prev) => prev.map((rep) =>
                            rep.id === r.id ? { ...rep, client_signed_at: now } : rep
                          ));
                          toast.success("Ciência registrada.");
                        }}
                        className="h-8 px-3 rounded-md border border-border text-xs font-medium hover:bg-secondary flex items-center gap-1"
                      >
                        ✍️ Assinar
                      </button>
                    )}
                    {r.client_signed_at && (
                      <span className="text-xs text-emerald-600 flex items-center gap-1 self-center">
                        <CheckCircle className="h-3 w-3" /> {fmtDate(r.client_signed_at)}
                      </span>
                    )}
                  </div>
                </div>

                {r.boleto_url && (
                  <div className="border-t border-border bg-secondary/20 p-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div>
                        {r.boleto_valor != null && (
                          <div className="text-sm font-data font-semibold">R$ {r.boleto_valor.toLocaleString("pt-BR")}</div>
                        )}
                        {r.boleto_vencimento && (
                          <div className="text-xs text-muted-foreground">Venc: {fmtDate(r.boleto_vencimento)}</div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => window.open(r.boleto_url!, "_blank")}
                          className="h-7 px-2.5 rounded-md bg-primary/10 text-primary text-xs font-medium flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" /> Boleto
                        </button>
                        {r.comprovante_url ? (
                          <button
                            onClick={() => window.open(r.comprovante_url!, "_blank")}
                            className="h-7 px-2.5 rounded-md border border-border text-xs hover:bg-secondary flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" /> Comprovante
                          </button>
                        ) : (
                          <label className="h-7 px-2.5 rounded-md border border-border text-xs hover:bg-secondary flex items-center gap-1 cursor-pointer">
                            {uploading === r.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <><Upload className="h-3 w-3" /> Enviar comprovante</>
                            )}
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              className="hidden"
                              disabled={uploading === r.id}
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f && r.empresa_id) handleUploadComprovante(r.id, f, r.empresa_id);
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Relatórios"
        subtitle="Gestão de relatórios mensais de prestação de serviços."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Publicados", value: kpiPublished, icon: CheckCircle, color: "text-emerald-600" },
          { label: "Ag. aprovação", value: kpiPending, icon: Clock, color: "text-amber-600" },
          { label: "Rascunhos", value: kpiDraft, icon: FileText, color: "text-muted-foreground" },
          { label: "Horas registradas", value: `${kpiTotalHours.toFixed(0)}h`, icon: BarChart2, color: "text-primary" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className={cn("h-9 w-9 rounded-lg bg-secondary flex items-center justify-center", color)}>
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">{label}</div>
              <div className="text-xl font-bold font-data">{value}</div>
            </div>
          </div>
        ))}
      </div>

      {chartData.length >= 2 && (
        <div className="bg-card border border-border rounded-xl p-5 mb-6">
          <div className="text-sm font-semibold mb-4">Consumo de Horas — últimos 6 meses</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} barGap={4}>
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => `${v}h`} />
              <Legend />
              <Bar dataKey="usado" name="Usado" fill="#034C8B" radius={[4,4,0,0]} />
              <Bar dataKey="contratado" name="Contratado" fill="#93C5FD" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <select
          value={filterCompany}
          onChange={(e) => setFilterCompany(e.target.value)}
          className="h-9 px-3 rounded-lg border border-border bg-card text-sm"
        >
          <option value="">Todas as empresas</option>
          {[...new Set(reports.map((r) => (r.company as { nome: string } | null)?.nome).filter(Boolean))].map((n) => (
            <option key={n} value={n!}>{n}</option>
          ))}
        </select>
        <input
          type="month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="h-9 px-3 rounded-lg border border-border bg-card text-sm"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as ReportType | "")}
          className="h-9 px-3 rounded-lg border border-border bg-card text-sm"
        >
          <option value="">Todos os tipos</option>
          {(Object.entries(TYPE_LABELS) as [ReportType, string][]).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as ReportStatus | "")}
          className="h-9 px-3 rounded-lg border border-border bg-card text-sm"
        >
          <option value="">Todos os status</option>
          {(Object.entries(STATUS_LABELS) as [ReportStatus, string][]).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        {(filterCompany || filterMonth || filterType || filterStatus) && (
          <button
            onClick={() => { setFilterCompany(""); setFilterMonth(""); setFilterType(""); setFilterStatus(""); }}
            className="h-9 px-3 rounded-lg border border-border bg-card text-sm flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" /> Limpar
          </button>
        )}
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} relatório(s)</span>
        {canCreate && (
          <Button size="sm" onClick={() => setCreateOpen(true)} className="ml-2">
            <Plus className="h-4 w-4 mr-1" /> Gerar relatório
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Nenhum relatório encontrado.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-4 py-3">Relatório</th>
                <th className="text-left font-medium px-4 py-3">Empresa</th>
                <th className="text-left font-medium px-4 py-3">Mês</th>
                <th className="text-left font-medium px-4 py-3">Tipo</th>
                <th className="text-left font-medium px-4 py-3">Status</th>
                <th className="text-left font-medium px-4 py-3">Horas</th>
                <th className="text-left font-medium px-4 py-3">Ciência</th>
                <th className="text-left font-medium px-4 py-3">Boleto</th>
                <th className="text-right font-medium px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const comp = r.company as { nome: string; logo_url: string | null; monthly_hours: number } | null;
                const contractedH = comp?.monthly_hours ?? 0;
                const usedH = (r.total_hours_minutes ?? 0) / 60;
                const pct = contractedH > 0 ? Math.min((usedH / contractedH) * 100, 100) : 0;
                return (
                  <tr
                    key={r.id}
                    className="border-t border-border hover:bg-secondary/20 cursor-pointer"
                    onClick={() => navigate(`/app/relatorios/${r.id}/documento`)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium">{r.title ?? fmtMonthRef(r.month_ref)}</div>
                      {r.client_opened_at && (
                        <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Eye className="h-2.5 w-2.5" /> Visto em {fmtDate(r.client_opened_at)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {comp?.logo_url ? (
                          <img src={comp.logo_url} alt={comp.nome} className="h-6 w-6 rounded-md object-contain bg-secondary" />
                        ) : (
                          <div className="h-6 w-6 rounded-md bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                            {(comp?.nome ?? "?").charAt(0)}
                          </div>
                        )}
                        <span className="text-sm">{comp?.nome ?? "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-data text-xs">{fmtMonthRef(r.month_ref)}</td>
                    <td className="px-4 py-3">
                      {r.report_type && (
                        <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border", TYPE_COLORS[r.report_type])}>
                          {TYPE_LABELS[r.report_type]}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border", STATUS_COLORS[r.status])}>
                        {STATUS_LABELS[r.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-data">{usedH.toFixed(1)}h</div>
                      {contractedH > 0 && (
                        <div className="mt-1 h-1.5 w-20 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      {r.client_signed_at ? (
                        <span className="text-[10px] text-emerald-600 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> {fmtDate(r.client_signed_at)}
                        </span>
                      ) : r.client_opened_at ? (
                        <span className="text-[10px] text-amber-600 flex items-center gap-1">
                          <Eye className="h-3 w-3" /> Visto, não assinado
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">Não visualizado</span>
                      )}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      {r.boleto_url ? (
                        <div className="text-xs">
                          {r.boleto_valor != null && (
                            <div className="font-data">R$ {r.boleto_valor.toLocaleString("pt-BR")}</div>
                          )}
                          {r.boleto_vencimento && (
                            <div className="text-muted-foreground">{fmtDate(r.boleto_vencimento)}</div>
                          )}
                          {canCreate && (
                            <button
                              onClick={() => {
                                setBoletoReportId(r.id);
                                setBoletoUrl(r.boleto_url ?? "");
                                setBoletoVenc(r.boleto_vencimento ?? "");
                                setBoletoValor(String(r.boleto_valor ?? ""));
                                setBoletoOpen(true);
                              }}
                              className="text-primary hover:underline flex items-center gap-0.5 mt-0.5"
                            >
                              <Edit2 className="h-2.5 w-2.5" /> editar
                            </button>
                          )}
                        </div>
                      ) : canCreate ? (
                        <button
                          onClick={() => {
                            setBoletoReportId(r.id);
                            setBoletoUrl(""); setBoletoVenc(""); setBoletoValor("");
                            setBoletoOpen(true);
                          }}
                          className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                        >
                          <Plus className="h-3 w-3" /> Adicionar
                        </button>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/app/relatorios/${r.id}/documento`)}
                          className="h-7 px-2 rounded-md border border-border text-xs hover:bg-secondary flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" /> Abrir
                        </button>
                        {r.status === "draft" && canCreate && (
                          <button
                            onClick={() => handleStatusChange(r.id, "pending_approval")}
                            className="h-7 px-2 rounded-md border border-border text-xs hover:bg-secondary flex items-center gap-1"
                          >
                            <Send className="h-3 w-3" /> Aprovação
                          </button>
                        )}
                        {r.status === "pending_approval" && isAdmin && (
                          <button
                            onClick={() => handleStatusChange(r.id, "approved")}
                            className="h-7 px-2 rounded-md bg-blue-500/10 border border-blue-400/30 text-blue-600 text-xs hover:bg-blue-500/20 flex items-center gap-1"
                          >
                            <CheckCircle className="h-3 w-3" /> Aprovar
                          </button>
                        )}
                        {r.status === "approved" && isAdmin && (
                          <button
                            onClick={() => handleStatusChange(r.id, "published")}
                            className="h-7 px-2 rounded-md bg-emerald-500/10 border border-emerald-400/30 text-emerald-600 text-xs hover:bg-emerald-500/20 flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" /> Publicar
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            onClick={() => setDeleteId(r.id)}
                            className="h-7 px-2 rounded-md border border-destructive/30 text-destructive text-xs hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={boletoOpen} onOpenChange={setBoletoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dados do boleto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>URL do boleto</Label>
              <Input value={boletoUrl} onChange={(e) => setBoletoUrl(e.target.value)} placeholder="https://..." className="mt-1.5" />
            </div>
            <div>
              <Label>Valor (R$)</Label>
              <Input type="number" value={boletoValor} onChange={(e) => setBoletoValor(e.target.value)} placeholder="4800" className="mt-1.5" />
            </div>
            <div>
              <Label>Vencimento</Label>
              <Input type="date" value={boletoVenc} onChange={(e) => setBoletoVenc(e.target.value)} className="mt-1.5" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBoletoOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveBoleto}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir relatório?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gerar relatório</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Empresa *</Label>
                <select
                  value={formEmpresa}
                  onChange={(e) => setFormEmpresa(e.target.value)}
                  className="w-full h-9 mt-1.5 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="">Selecione...</option>
                  {companies.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
              <div>
                <Label>Tipo *</Label>
                <select
                  value={formTipo}
                  onChange={(e) => setFormTipo(e.target.value as ReportType)}
                  className="w-full h-9 mt-1.5 px-3 rounded-md border border-input bg-background text-sm"
                >
                  {(Object.entries(TYPE_LABELS) as [ReportType, string][]).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <Label>Título *</Label>
              <Input value={formTitulo} onChange={(e) => setFormTitulo(e.target.value)} placeholder="Ex: Relatório HRaaS — Kentaki Foods — Maio/2025" className="mt-1.5" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Mês de referência *</Label>
                <Input type="month" value={formMonthRef} onChange={(e) => setFormMonthRef(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label>Período início</Label>
                <Input type="date" value={formStart} onChange={(e) => setFormStart(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label>Período fim</Label>
                <Input type="date" value={formEnd} onChange={(e) => setFormEnd(e.target.value)} className="mt-1.5" />
              </div>
            </div>
            <div>
              <Label>Síntese executiva</Label>
              <Textarea value={formSummary} onChange={(e) => setFormSummary(e.target.value)} rows={3} className="mt-1.5" />
            </div>

            {formTipo === "hraas_operacao_continua" && (
              <>
                {/* Contexto do período */}
                {autoLoading && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Carregando contexto…
                  </div>
                )}
                {!autoLoading && formEmpresa && (
                  <div className="rounded-lg border border-border bg-secondary/30 p-4 space-y-3">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Contexto do período</div>
                    {contextoEmpresaHoras > 0 && (
                      <div className="text-sm">
                        <span className="font-medium">Franquia contratada:</span>{" "}
                        <span className="font-data">{contextoEmpresaHoras}h/mês</span>
                      </div>
                    )}
                    {contextoRelatorios.length > 0 ? (
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground mb-1">Últimos relatórios publicados:</div>
                        {contextoRelatorios.map((r) => {
                          const h = ((r.total_hours_minutes ?? 0) / 60).toFixed(1);
                          return (
                            <div key={r.month_ref} className="flex items-center justify-between text-xs">
                              <span>{fmtMonthRef(r.month_ref ?? "")}</span>
                              <span className="font-data font-medium">{h}h</span>
                            </div>
                          );
                        })}
                        {(() => {
                          const avg = contextoRelatorios.reduce((s, r) => s + (r.total_hours_minutes ?? 0), 0) / contextoRelatorios.length / 60;
                          return (
                            <div className="pt-1 border-t border-border text-xs text-muted-foreground">
                              Média: <span className="font-data font-medium">{avg.toFixed(1)}h/mês</span>
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">Nenhum relatório anterior encontrado.</p>
                    )}
                    <p className="text-xs text-muted-foreground italic">Registre as horas manualmente nos campos abaixo.</p>
                  </div>
                )}

                {/* Apuração de Horas */}
                <div className="rounded-lg border border-border bg-secondary/20 p-4 space-y-3">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Apuração de Horas</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Horas em entregáveis</Label>
                      <Input
                        type="number"
                        step="0.5"
                        min="0"
                        value={formHorasEntregaveis}
                        onChange={(e) => setFormHorasEntregaveis(e.target.value)}
                        placeholder="0"
                        className="mt-1.5 font-data"
                      />
                    </div>
                    <div>
                      <Label>Horas em solicitações</Label>
                      <Input
                        type="number"
                        step="0.5"
                        min="0"
                        value={formHorasSolicitacoes}
                        onChange={(e) => setFormHorasSolicitacoes(e.target.value)}
                        placeholder="0"
                        className="mt-1.5 font-data"
                      />
                    </div>
                  </div>
                  {(() => {
                    const totalH = (parseFloat(formHorasEntregaveis) || 0) + (parseFloat(formHorasSolicitacoes) || 0);
                    const pct = contextoEmpresaHoras > 0 ? (totalH / contextoEmpresaHoras) * 100 : null;
                    const colorCls = pct === null ? "text-muted-foreground"
                      : pct >= 100 ? "text-destructive"
                      : pct >= 80 ? "text-warning"
                      : "text-success";
                    return (
                      <div className={cn("text-sm font-medium", colorCls)}>
                        Total: <span className="font-data">{totalH.toFixed(1)}h</span>
                        {pct !== null && (
                          <span className="ml-1 font-data">
                            ({pct.toFixed(0)}% do pacote de {contextoEmpresaHoras}h/mês)
                          </span>
                        )}
                      </div>
                    );
                  })()}
                </div>

                <div>
                  <Label>Objetivos do período (um por linha)</Label>
                  <Textarea value={formObjectives} onChange={(e) => setFormObjectives(e.target.value)} rows={3} className="mt-1.5" />
                </div>
                <div>
                  <Label>Entregas realizadas (uma por linha)</Label>
                  <Textarea value={formDeliveries} onChange={(e) => setFormDeliveries(e.target.value)} rows={3} className="mt-1.5" />
                </div>
                <div>
                  <Label>Pendências (uma por linha)</Label>
                  <Textarea value={formPendencies} onChange={(e) => setFormPendencies(e.target.value)} rows={2} className="mt-1.5" />
                </div>
              </>
            )}

            {(formTipo === "atracao" || formTipo === "encerramento_vaga") && (
              <>
                <div className="rounded-md bg-secondary p-3 flex items-start gap-2 text-xs text-muted-foreground">
                  <Info className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>Preencha os dados manualmente abaixo. Dados automáticos estarão disponíveis quando o banco estiver conectado.</span>
                </div>
                <div>
                  <Label>Síntese do pipeline</Label>
                  <Textarea value={formPipeline} onChange={(e) => setFormPipeline(e.target.value)} rows={2} className="mt-1.5" />
                </div>
                <div>
                  <Label>Vagas trabalhadas (uma por linha)</Label>
                  <Textarea value={formPositions} onChange={(e) => setFormPositions(e.target.value)} rows={2} className="mt-1.5" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label>Funil por vaga</Label>
                    <button
                      type="button"
                      onClick={() => setFormFunnel((prev) => [...prev, { vaga: "", inscritos: 0, triagem: 0, entrevista: 0, finalistas: 0, aprovados: 0 }])}
                      className="text-xs text-primary hover:underline flex items-center gap-0.5"
                    >
                      <Plus className="h-3 w-3" /> Linha
                    </button>
                  </div>
                  {formFunnel.map((row, i) => (
                    <div key={i} className="flex gap-2 mb-2 items-center">
                      <Input
                        placeholder="Vaga" value={row.vaga}
                        onChange={(e) => setFormFunnel((p) => p.map((r, j) => j === i ? { ...r, vaga: e.target.value } : r))}
                        className="flex-1"
                      />
                      {(["inscritos", "triagem", "entrevista", "finalistas", "aprovados"] as const).map((field) => (
                        <Input
                          key={field} type="number" placeholder={field.slice(0,3)} value={String(row[field])}
                          onChange={(e) => setFormFunnel((p) => p.map((r, j) => j === i ? { ...r, [field]: parseInt(e.target.value) || 0 } : r))}
                          className="w-16 text-center"
                        />
                      ))}
                      <button type="button" onClick={() => setFormFunnel((p) => p.filter((_, j) => j !== i))} className="text-destructive hover:text-destructive/80">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div>
                  <Label>Tempo médio por etapa</Label>
                  <Textarea value={formAvgTime} onChange={(e) => setFormAvgTime(e.target.value)} rows={2} className="mt-1.5" />
                </div>
                <div>
                  <Label>Motivos de reprovação</Label>
                  <Textarea value={formRejections} onChange={(e) => setFormRejections(e.target.value)} rows={2} className="mt-1.5" />
                </div>
              </>
            )}

            {formTipo === "gotomarket" && (
              <>
                <div>
                  <Label>Fases concluídas (uma por linha)</Label>
                  <Textarea value={formPhases} onChange={(e) => setFormPhases(e.target.value)} rows={2} className="mt-1.5" />
                </div>
                <div>
                  <Label>Entregas (uma por linha)</Label>
                  <Textarea value={formDeliveries} onChange={(e) => setFormDeliveries(e.target.value)} rows={2} className="mt-1.5" />
                </div>
                <div>
                  <Label>Pendências (uma por linha)</Label>
                  <Textarea value={formPendencies} onChange={(e) => setFormPendencies(e.target.value)} rows={2} className="mt-1.5" />
                </div>
              </>
            )}

            <div>
              <Label>Riscos e pontos de atenção</Label>
              <Textarea value={formRisks} onChange={(e) => setFormRisks(e.target.value)} rows={2} className="mt-1.5" />
            </div>
            <div>
              <Label>Considerações finais / Próximos passos</Label>
              <Textarea value={formNextSteps} onChange={(e) => setFormNextSteps(e.target.value)} rows={2} className="mt-1.5" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={formSaving}>
              {formSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Criar rascunho
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
