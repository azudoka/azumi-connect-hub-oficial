import { PageHeader } from "@/components/PageHeader";
import { useState, useEffect, useCallback } from "react";

import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
  Plus, Download, FileText, AlertTriangle, Check,
  Clock as ClockIcon, X, Loader2, ExternalLink, Eye,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

const tabs = ["Boletos", "Extrato de Horas"] as const;

type InvoiceStatus = "pendente" | "pago" | "atrasado" | "cancelado";

type Invoice = {
  id: string;
  empresa_id: string;
  report_id?: string | null;
  reference_month: string | null;
  amount: number;
  due_date: string;
  boleto_url?: string | null;
  status: InvoiceStatus;
  paid_at?: string | null;
  late_fee_applied?: boolean | null;
  comprovante_url?: string | null;
  notes?: string | null;
  created_by?: string | null;
  created_at: string;
  empresa?: { id: string; nome: string; logo_url: string | null } | null;
};

type Empresa = { id: string; nome: string };

const statusInvoice: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  pago:      { label: "Pago",      cls: "bg-[hsl(var(--success)/0.15)] text-success border-[hsl(var(--success)/0.3)]",            icon: Check },
  pendente:  { label: "Em aberto", cls: "bg-[hsl(var(--warning)/0.15)] text-warning border-[hsl(var(--warning)/0.3)]",             icon: ClockIcon },
  atrasado:  { label: "Atrasado",  cls: "bg-[hsl(var(--destructive)/0.15)] text-destructive border-[hsl(var(--destructive)/0.3)]", icon: AlertTriangle },
  cancelado: { label: "Cancelado", cls: "bg-muted text-muted-foreground border-border",             icon: X },
};

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("T")[0].split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

function fmtMonthRef(ref: string | null | undefined): string {
  if (!ref) return "—";
  const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const [y, m] = ref.split("-");
  const idx = parseInt(m, 10) - 1;
  return `${months[idx] ?? m}/${y}`;
}

function calcularAtraso(invoice: Invoice): { diasAtraso: number; totalDevido: number } | null {
  if (invoice.status === "pago" || invoice.status === "cancelado") return null;
  const hoje = new Date();
  const venc = new Date(invoice.due_date);
  const diasAtraso = Math.floor((hoje.getTime() - venc.getTime()) / 86400000);
  if (diasAtraso <= 0) return null;
  const multa = invoice.amount * 0.02;
  const juros = invoice.amount * 0.000333 * diasAtraso;
  return { diasAtraso, totalDevido: invoice.amount + multa + juros };
}

export default function GestaoConta() {
  const { usuario } = useAuth();
  
  const isAdmin = ["admin", "admin_azumi"].includes(usuario?.role ?? "");

  const [tab, setTab] = useState<typeof tabs[number]>("Boletos");
  const [novoOpen, setNovoOpen] = useState(false);
  const [detalhesOpen, setDetalhesOpen] = useState(false);
  const [detalhesInvoice, setDetalhesInvoice] = useState<Invoice | null>(null);

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [filtroEmpresa, setFiltroEmpresa] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");

  const [empresas, setEmpresas] = useState<Empresa[]>([]);

  const [formEmpresaId, setFormEmpresaId] = useState("");
  const [formValor, setFormValor] = useState("");
  const [formMes, setFormMes] = useState("");
  const [formVenc, setFormVenc] = useState("");
  const [formObs, setFormObs] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formSaving, setFormSaving] = useState(false);

  const fetchInvoices = useCallback(async () => {
    setLoadingInvoices(true);
    const { data, error } = await supabase
      .from("invoices")
      .select("*, empresa:empresas(id, nome, logo_url)")
      .order("due_date", { ascending: false });
    if (error) { toast.error("Erro ao carregar faturas."); }
    else { setInvoices((data ?? []) as Invoice[]); }
    setLoadingInvoices(false);
  }, []);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  useEffect(() => {
    supabase.from("empresas").select("id, nome").order("nome")
      .then(({ data }) => { if (data) setEmpresas(data as Empresa[]); });
  }, []);

  const filtered = invoices.filter((inv) => {
    const empNome = (inv.empresa as { nome: string } | null)?.nome ?? "";
    if (filtroEmpresa && empNome !== filtroEmpresa) return false;
    if (filtroStatus) {
      const hoje = new Date();
      const venc = new Date(inv.due_date);
      const displayStatus = inv.status !== "pago" && inv.status !== "cancelado" && venc < hoje
        ? "atrasado"
        : inv.status;
      if (displayStatus !== filtroStatus) return false;
    }
    return true;
  });

  const temAtrasado = filtered.some((inv) => {
    if (inv.status === "pago" || inv.status === "cancelado") return false;
    return new Date(inv.due_date) < new Date();
  });

  async function handleMarcarPago(invoiceId: string) {
    const { error } = await supabase
      .from("invoices")
      .update({ status: "pago", paid_at: new Date().toISOString() })
      .eq("id", invoiceId);
    if (error) { toast.error("Erro ao atualizar."); return; }
    toast.success("Boleto marcado como pago.");
    fetchInvoices();
  }

  async function handleCriarBoleto(e: React.FormEvent) {
    e.preventDefault();
    if (!formEmpresaId || !formValor || !formVenc) {
      toast.error("Preencha empresa, valor e vencimento."); return;
    }
    setFormSaving(true);
    const { error } = await supabase.from("invoices").insert({
      empresa_id: formEmpresaId,
      amount: parseFloat(formValor),
      reference_month: formMes || null,
      due_date: formVenc,
      notes: formObs || null,
      boleto_url: formUrl || null,
      status: "pendente",
      created_by: usuario?.id ?? null,
    });
    setFormSaving(false);
    if (error) { toast.error("Erro ao criar boleto."); return; }
    toast.success("Boleto criado.");
    setNovoOpen(false);
    setFormEmpresaId(""); setFormValor(""); setFormMes("");
    setFormVenc(""); setFormObs(""); setFormUrl("");
    fetchInvoices();
  }

  return (
    <div>
      <PageHeader title="Gestão de Conta" subtitle="Boletos, extratos de horas e relatórios mensais" />

      <div className="flex items-center gap-1 border-b border-border mb-5 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap",
              tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Aba Boletos ──────────────────────────────────────────────── */}
      {tab === "Boletos" && (
        <div>
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <select
              value={filtroEmpresa}
              onChange={(e) => setFiltroEmpresa(e.target.value)}
              className="h-9 px-3 rounded-lg border border-border bg-card text-sm"
            >
              <option value="">Todas as empresas</option>
              {[...new Set(
                invoices.map((i) => (i.empresa as { nome: string } | null)?.nome).filter(Boolean)
              )].map((n) => <option key={n} value={n!}>{n}</option>)}
            </select>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="h-9 px-3 rounded-lg border border-border bg-card text-sm"
            >
              <option value="">Todos os status</option>
              <option value="pendente">Em aberto</option>
              <option value="pago">Pago</option>
              <option value="atrasado">Atrasado</option>
              <option value="cancelado">Cancelado</option>
            </select>
            {isAdmin && (
              <button
                onClick={() => setNovoOpen(true)}
                className="ml-auto h-9 px-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" /> Novo Boleto
              </button>
            )}
          </div>

          {temAtrasado && (
            <div className="rounded-xl border border-[hsl(var(--warning)/0.3)] bg-[hsl(var(--warning)/0.1)] p-4 mb-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
              <div className="text-sm">
                <span className="font-medium text-warning">Atenção: </span>
                <span className="text-[hsl(var(--warning)/0.8)]">Existem boletos vencidos ou próximos do vencimento.</span>
              </div>
            </div>
          )}

          {loadingInvoices ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-10 text-center">
              <FileText className="h-7 w-7 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Nenhuma fatura encontrada.</p>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[hsl(var(--secondary)/0.4)] text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="text-left font-medium px-4 py-3">Empresa</th>
                    <th className="text-left font-medium px-4 py-3">Período</th>
                    <th className="text-right font-medium px-4 py-3">Valor</th>
                    <th className="text-left font-medium px-4 py-3">Vencimento</th>
                    <th className="text-left font-medium px-4 py-3">Status</th>
                    <th className="text-right font-medium px-4 py-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((inv) => {
                    const hoje = new Date();
                    const venc = new Date(inv.due_date);
                    const diffDias = Math.floor((venc.getTime() - hoje.getTime()) / 86400000);
                    const isPago = inv.status === "pago";
                    const isCancelado = inv.status === "cancelado";
                    const isAtrasado = !isPago && !isCancelado && venc < hoje;
                    const displayStatus: string = isAtrasado ? "atrasado" : inv.status;
                    const s = statusInvoice[displayStatus] ?? statusInvoice["pendente"];
                    const empNome = (inv.empresa as { nome: string } | null)?.nome ?? "—";

                    return (
                      <tr key={inv.id} className="border-t border-border hover:bg-[hsl(var(--secondary)/0.3)]">
                        <td className="px-4 py-3 font-medium">{empNome}</td>
                        <td className="px-4 py-3 text-xs tabular-nums">{fmtMonthRef(inv.reference_month)}</td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          R$ {inv.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 tabular-nums">
                          <div>{fmtDate(inv.due_date)}</div>
                          {!isPago && !isCancelado && diffDias === 0 && (
                            <span className="text-[10px] bg-[hsl(var(--destructive)/0.15)] text-destructive px-1.5 py-0.5 rounded-full">Vence hoje</span>
                          )}
                          {!isPago && !isCancelado && diffDias > 0 && diffDias <= 5 && (
                            <span className="text-[10px] bg-[hsl(var(--warning)/0.15)] text-warning px-1.5 py-0.5 rounded-full">Vence em {diffDias}d</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn("badge-pill", s.cls)}>
                            <s.icon className="h-3 w-3" /> {s.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isAdmin && !isPago && !isCancelado && (
                              <button
                                onClick={() => handleMarcarPago(inv.id)}
                                className="text-xs text-emerald-600 hover:underline flex items-center gap-0.5"
                              >
                                <Check className="h-3 w-3" /> Pago
                              </button>
                            )}
                            {inv.boleto_url && (
                              <button
                                onClick={() => window.open(inv.boleto_url!, "_blank")}
                                className="text-xs text-primary hover:underline flex items-center gap-0.5"
                              >
                                <ExternalLink className="h-3 w-3" /> 2ª via
                              </button>
                            )}
                            <button
                              onClick={() => { setDetalhesInvoice(inv); setDetalhesOpen(true); }}
                              className="text-xs text-primary hover:underline flex items-center gap-0.5"
                            >
                              <Eye className="h-3 w-3" /> Detalhes
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Aba Extrato de Horas ──────────────────────────────────────── */}
      {tab === "Extrato de Horas" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <select disabled className="h-9 px-3 rounded-lg border border-border bg-card text-sm opacity-50 cursor-not-allowed">
              <option>Todas as empresas</option>
            </select>
            <select disabled className="h-9 px-3 rounded-lg border border-border bg-card text-sm opacity-50 cursor-not-allowed">
              <option>Período atual</option>
            </select>
            <button disabled className="ml-auto h-8 px-3 rounded-lg border border-border text-xs flex items-center gap-1.5 opacity-50 cursor-not-allowed">
              <Download className="h-3.5 w-3.5" /> Exportar
            </button>
          </div>
          <div className="bg-card border border-border rounded-xl p-10 flex flex-col items-center text-center gap-3">
            <ClockIcon className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="font-medium text-sm">Extrato de horas disponível em breve</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                As entradas de tempo serão registradas aqui quando o módulo de timer for integrado ao banco.
              </p>
            </div>
          </div>
        </div>
      )}


      {/* ── Modal Detalhes ────────────────────────────────────────────── */}
      {detalhesOpen && detalhesInvoice && (
        <div className="fixed inset-0 z-50 bg-[hsl(var(--background)/0.7)] backdrop-blur-sm flex items-center justify-center animate-fade-in p-4">
          <div className="bg-card border border-border rounded-2xl shadow-elevated p-6 w-full max-w-md">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-display text-base font-semibold">Detalhes da fatura</h2>
                <p className="text-xs text-muted-foreground">
                  {(detalhesInvoice.empresa as { nome: string } | null)?.nome ?? "—"}
                </p>
              </div>
              <button
                onClick={() => setDetalhesOpen(false)}
                className="h-8 w-8 rounded-md hover:bg-secondary flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              {([
                ["Período",       fmtMonthRef(detalhesInvoice.reference_month)],
                ["Valor",         `R$ ${detalhesInvoice.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`],
                ["Vencimento",    fmtDate(detalhesInvoice.due_date)],
                ["Status",        detalhesInvoice.status],
                ["Pago em",       fmtDate(detalhesInvoice.paid_at)],
                ["Multa aplicada", detalhesInvoice.late_fee_applied ? "Sim" : "Não"],
              ] as [string, string][]).map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs text-muted-foreground">{k}</dt>
                  <dd className="font-medium tabular-nums">{v}</dd>
                </div>
              ))}
              {detalhesInvoice.notes && (
                <div className="col-span-2">
                  <dt className="text-xs text-muted-foreground">Observação</dt>
                  <dd className="text-sm">{detalhesInvoice.notes}</dd>
                </div>
              )}
              {(() => {
                const atr = calcularAtraso(detalhesInvoice);
                if (!atr) return null;
                return (
                  <div className="col-span-2 rounded-lg bg-[hsl(var(--destructive)/0.1)] border border-[hsl(var(--destructive)/0.2)] p-3">
                    <p className="text-xs text-destructive font-medium">
                      {atr.diasAtraso}d de atraso — Total devido estimado:{" "}
                      R$ {atr.totalDevido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                );
              })()}
            </dl>
          </div>
        </div>
      )}

      {/* ── Sheet Novo Boleto ─────────────────────────────────────────── */}
      <Dialog open={novoOpen} onOpenChange={setNovoOpen}>
        <DialogContent className="sm:max-w-md w-full max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo boleto</DialogTitle>
            <DialogDescription>Preencha os dados para emissão.</DialogDescription>
          </DialogHeader>
          <div className="mt-6">
            <form onSubmit={handleCriarBoleto} className="space-y-4">
              <Field label="Empresa *">
                <select
                  value={formEmpresaId}
                  onChange={(e) => setFormEmpresaId(e.target.value)}
                  required
                  className="w-full h-10 px-3 rounded-lg bg-secondary border border-input focus:border-primary outline-none text-sm"
                >
                  <option value="">Selecione...</option>
                  {empresas.map((e) => <option key={e.id} value={e.id}>{e.nome}</option>)}
                </select>
              </Field>
              <Field label="Valor (R$) *">
                <input
                  type="number"
                  value={formValor}
                  onChange={(e) => setFormValor(e.target.value)}
                  required
                  step="0.01"
                  min="0"
                  className="w-full h-10 px-3 rounded-lg bg-secondary border border-input focus:border-primary outline-none text-sm"
                />
              </Field>
              <Field label="Mês de referência">
                <input
                  type="month"
                  value={formMes}
                  onChange={(e) => setFormMes(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-secondary border border-input focus:border-primary outline-none text-sm"
                />
              </Field>
              <Field label="Vencimento *">
                <input
                  type="date"
                  value={formVenc}
                  onChange={(e) => setFormVenc(e.target.value)}
                  required
                  className="w-full h-10 px-3 rounded-lg bg-secondary border border-input focus:border-primary outline-none text-sm"
                />
              </Field>
              <Field label="URL do boleto">
                <input
                  type="url"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full h-10 px-3 rounded-lg bg-secondary border border-input focus:border-primary outline-none text-sm"
                />
              </Field>
              <Field label="Observação">
                <textarea
                  value={formObs}
                  onChange={(e) => setFormObs(e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-lg bg-secondary border border-input focus:border-primary outline-none text-sm"
                  placeholder="Referência do boleto…"
                />
              </Field>
              <button
                type="submit"
                disabled={formSaving}
                className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {formSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                Emitir boleto
              </button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
