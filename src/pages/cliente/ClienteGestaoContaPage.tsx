import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import {
  CreditCard, Clock, Calendar, User, Receipt, FileText,
  BarChart3, Users, Boxes, MessageCircle, ChevronRight,
  Check, AlertTriangle, ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const mockEmpresa = {
  id: "emp-001",
  nome: "Kentaki Foods",
  monthly_hours: 25,
  plano: "Ongoing",
  vigencia_inicio: "2026-01-01",
  vigencia_fim: "2026-12-31",
  consultor: "Ana Beatriz",
};

type InvoiceStatus = "pendente" | "pago" | "atrasado" | "cancelado";

const mockInvoices: Array<{
  id: string;
  reference_month: string;
  amount: number;
  due_date: string;
  boleto_url: string | null;
  status: InvoiceStatus;
  paid_at: string | null;
  multa_percent: number;
  mora_percent: number;
}> = [
  { id: "inv-001", reference_month: "2026-05", amount: 3000, due_date: "2026-05-05", boleto_url: null, status: "pendente", paid_at: null, multa_percent: 2, mora_percent: 1 },
  { id: "inv-002", reference_month: "2026-04", amount: 3000, due_date: "2026-04-05", boleto_url: "https://example.com/boleto", status: "pago", paid_at: "2026-04-03", multa_percent: 2, mora_percent: 1 },
  { id: "inv-003", reference_month: "2026-03", amount: 3000, due_date: "2026-03-05", boleto_url: "https://example.com/boleto", status: "atrasado", paid_at: null, multa_percent: 2, mora_percent: 1 },
];

type ReportStatus = "draft" | "pending_approval" | "published";

const mockReports: Array<{
  id: string;
  title: string;
  month_ref: string;
  status: ReportStatus;
  published_at: string | null;
  client_signed_at: string | null;
}> = [
  { id: "rel-001", title: "Relatório HRaaS — Kentaki Foods — Abril/2026", month_ref: "2026-04", status: "published", published_at: "2026-05-02", client_signed_at: null },
  { id: "rel-002", title: "Relatório HRaaS — Kentaki Foods — Maio/2026", month_ref: "2026-05", status: "draft", published_at: null, client_signed_at: null },
];

const mockUsers = [
  { id: "u-001", nome: "Mariana Souza", email: "mariana@kentaki.com", role: "gestor_cliente" },
  { id: "u-002", nome: "Carlos Mendes", email: "carlos@kentaki.com", role: "usuario_cliente" },
];

const mockModulos: Array<{ nome: string; ativo: boolean; em_teste: boolean; dias_restantes?: number }> = [
  { nome: "Atração & Hunting", ativo: true, em_teste: false },
  { nome: "Projetos & Entregáveis", ativo: true, em_teste: false },
  { nome: "Relatórios Mensais", ativo: true, em_teste: false },
  { nome: "People Analytics", ativo: false, em_teste: true, dias_restantes: 12 },
  { nome: "Performance & Avaliações", ativo: false, em_teste: false },
];

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("T")[0].split("-");
  return `${d}/${m}/${y}`;
}

function fmtMonthRef(ref: string): string {
  const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const [y, m] = ref.split("-");
  return `${meses[parseInt(m, 10) - 1] ?? m}/${y}`;
}

function fmtCurrency(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function diasAteVencimento(iso: string): number {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const venc = new Date(iso);
  return Math.floor((venc.getTime() - hoje.getTime()) / 86400000);
}

function calcAtraso(inv: typeof mockInvoices[number]) {
  const dias = -diasAteVencimento(inv.due_date);
  if (dias <= 0) return { dias: 0, total: inv.amount };
  const multa = inv.amount * (inv.multa_percent / 100);
  const juros = inv.amount * (inv.mora_percent / 100) / 30 * dias;
  return { dias, total: inv.amount + multa + juros };
}

const STATUS_INV: Record<InvoiceStatus, { label: string; cls: string; icon: React.ElementType }> = {
  pago:      { label: "Pago",      cls: "bg-success/15 text-success border-success/30",            icon: Check },
  pendente:  { label: "Em aberto", cls: "bg-warning/15 text-warning border-warning/30",            icon: Clock },
  atrasado:  { label: "Atrasado",  cls: "bg-destructive/15 text-destructive border-destructive/30", icon: AlertTriangle },
  cancelado: { label: "Cancelado", cls: "bg-muted text-muted-foreground border-border",            icon: AlertTriangle },
};

const STATUS_REL: Record<ReportStatus, { label: string; cls: string }> = {
  published:         { label: "Publicado",     cls: "bg-success/15 text-success border-success/30" },
  draft:             { label: "Rascunho",      cls: "bg-muted text-muted-foreground border-border" },
  pending_approval:  { label: "Ag. aprovação", cls: "bg-warning/15 text-warning border-warning/30" },
};

const ROLE_LABELS: Record<string, string> = {
  gestor_cliente:  "Gestor",
  usuario_cliente: "Usuário",
};

const badgePill = "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border";

export default function ClienteGestaoContaPage() {
  const navigate = useNavigate();

  const proximaFatura = [...mockInvoices]
    .filter((i) => i.status === "pendente")
    .sort((a, b) => a.due_date.localeCompare(b.due_date))[0];
  const proxVencDias = proximaFatura ? diasAteVencimento(proximaFatura.due_date) : null;

  const resumoCards = [
    {
      label: "Plano",
      value: mockEmpresa.plano,
      icon: CreditCard,
      badgeCls: "bg-primary/10 text-primary border-primary/30",
      badge: "Ativo",
    },
    {
      label: "Horas contratadas",
      value: `${mockEmpresa.monthly_hours}h / mês`,
      icon: Clock,
      badgeCls: "bg-muted text-muted-foreground border-border",
      badge: "Mensal",
    },
    {
      label: "Próximo vencimento",
      value: proximaFatura ? fmtDate(proximaFatura.due_date) : "—",
      icon: Calendar,
      badgeCls: proxVencDias !== null && proxVencDias < 10
        ? "bg-warning/15 text-warning border-warning/30"
        : "bg-muted text-muted-foreground border-border",
      badge: proxVencDias !== null
        ? proxVencDias < 0 ? `${-proxVencDias}d em atraso`
        : proxVencDias === 0 ? "Vence hoje"
        : `Em ${proxVencDias}d`
        : "—",
    },
    {
      label: "Consultor responsável",
      value: mockEmpresa.consultor,
      icon: User,
      badgeCls: "bg-muted text-muted-foreground border-border",
      badge: "Azumi",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Gestão da Conta"
        subtitle="Plano, faturamento, contratos e módulos da sua conta Azumi."
      />

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {resumoCards.map((c) => (
          <div key={c.label} className="bg-card border border-border rounded-2xl shadow-card p-5">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <c.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs text-muted-foreground">{c.label}</div>
                <div className="font-display font-semibold text-lg truncate font-data">{c.value}</div>
              </div>
              <span className={cn(badgePill, c.badgeCls, "shrink-0")}>{c.badge}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Faturamento */}
      <div className="bg-card border border-border rounded-2xl shadow-card p-5 mb-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display font-semibold">Faturamento</h3>
            <p className="text-xs text-muted-foreground">Faturas recentes da sua conta.</p>
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-4 py-3">Período</th>
                <th className="text-right font-medium px-4 py-3">Valor</th>
                <th className="text-left font-medium px-4 py-3">Vencimento</th>
                <th className="text-left font-medium px-4 py-3">Status</th>
                <th className="text-left font-medium px-4 py-3">Multa/Mora</th>
                <th className="text-left font-medium px-4 py-3">Boleto</th>
              </tr>
            </thead>
            <tbody>
              {mockInvoices.map((f) => {
                const s = STATUS_INV[f.status];
                const atraso = f.status === "atrasado" ? calcAtraso(f) : null;
                return (
                  <tr key={f.id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium">{fmtMonthRef(f.reference_month)}</td>
                    <td className="px-4 py-3 text-right font-data">
                      <div>{fmtCurrency(f.amount)}</div>
                      {atraso && (
                        <div className="text-[10px] text-destructive">
                          Total: {fmtCurrency(atraso.total)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-data">
                      <div>{fmtDate(f.due_date)}</div>
                      {atraso && (
                        <div className="text-[10px] text-destructive">{atraso.dias} dias em atraso</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(badgePill, s.cls)}>
                        <s.icon className="h-3 w-3" /> {s.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-data text-xs text-muted-foreground">
                      {f.multa_percent}% / {f.mora_percent}% a.m.
                    </td>
                    <td className="px-4 py-3">
                      {f.boleto_url ? (
                        <a
                          href={f.boleto_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" /> Ver boleto
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contratos */}
      <div className="bg-card border border-border rounded-2xl shadow-card p-5 mb-6">
        <div className="flex items-start gap-3 mb-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display font-semibold">Contratos</h3>
            <p className="text-xs text-muted-foreground">Documentos firmados com a Azumi.</p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-secondary/20 px-4 py-5 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Para acessar seus contratos ou solicitar documentos, entre em contato com seu consultor Azumi.
          </p>
          <a
            href="#"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-600 text-sm font-medium hover:bg-emerald-500/20 transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            Falar com consultor
          </a>
        </div>
      </div>

      {/* Relatórios Mensais */}
      <div className="bg-card border border-border rounded-2xl shadow-card p-5 mb-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display font-semibold">Relatórios Mensais</h3>
              <p className="text-xs text-muted-foreground">Acompanhamento e ciência mensal.</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/app/relatorios")}
            className="text-xs text-primary hover:underline inline-flex items-center gap-1 shrink-0"
          >
            Ver todos <ChevronRight className="h-3 w-3" />
          </button>
        </div>
        <ul className="divide-y divide-border">
          {mockReports.map((r) => {
            const s = STATUS_REL[r.status];
            const assinado = !!r.client_signed_at;
            return (
              <li key={r.id} className="py-3 flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="text-sm font-medium">{r.title}</div>
                  <div className="text-xs text-muted-foreground font-data">
                    {r.published_at ? `Publicado em ${fmtDate(r.published_at)}` : `Ref. ${fmtMonthRef(r.month_ref)}`}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={cn(badgePill, s.cls)}>{s.label}</span>
                  {assinado && (
                    <span className={cn(badgePill, "bg-success/15 text-success border-success/30")}>
                      Assinado ✓
                    </span>
                  )}
                  {r.status === "published" && !assinado && (
                    <button
                      onClick={() => toast.info("Funcionalidade disponível em breve")}
                      className="text-xs px-3 py-1 rounded-full border border-border hover:bg-secondary"
                    >
                      Assinar ciência
                    </button>
                  )}
                  {r.status === "published" && (
                    <button
                      onClick={() => navigate(`/app/relatorios/${r.id}/documento`)}
                      className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Abrir <ChevronRight className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Usuários */}
      <div className="bg-card border border-border rounded-2xl shadow-card p-5 mb-6">
        <div className="flex items-start gap-3 mb-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display font-semibold">Usuários</h3>
            <p className="text-xs text-muted-foreground">Pessoas com acesso ao painel de {mockEmpresa.nome}.</p>
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-4 py-3">Nome</th>
                <th className="text-left font-medium px-4 py-3">E-mail</th>
                <th className="text-left font-medium px-4 py-3">Papel</th>
              </tr>
            </thead>
            <tbody>
              {mockUsers.map((u) => (
                <tr key={u.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{u.nome}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={cn(badgePill, "bg-muted text-foreground border-border")}>
                      {ROLE_LABELS[u.role] ?? u.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Módulos */}
      <div className="bg-card border border-border rounded-2xl shadow-card p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Boxes className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display font-semibold">Módulos contratados</h3>
            <p className="text-xs text-muted-foreground">Situação atual de cada módulo Azumi.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {mockModulos.map((m) => {
            let label = "Inativo";
            let cls = "bg-muted text-muted-foreground border-border";
            if (m.ativo) { label = "Ativo"; cls = "bg-success/15 text-success border-success/30"; }
            else if (m.em_teste) {
              label = `Em teste · ${m.dias_restantes ?? 0}d restantes`;
              cls = "bg-warning/15 text-warning border-warning/30";
            }
            return (
              <div key={m.nome} className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3 bg-secondary/20">
                <span className="text-sm font-medium truncate">{m.nome}</span>
                <span className={cn(badgePill, cls, "shrink-0")}>{label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
