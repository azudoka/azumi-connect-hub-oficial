import { PageHeader } from "@/components/PageHeader";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { boletos } from "@/data/mock";
import { Plus, Download, FileText, AlertTriangle, Check, Clock as ClockIcon, X } from "lucide-react";
import { SectionDivider } from "@/components/SectionDivider";

const tabs = ["Boletos", "Extrato de Horas", "Relatórios Mensais"] as const;

const statusBoleto: Record<string, { label: string; cls: string; icon: any }> = {
  pago: { label: "Pago", cls: "bg-success/15 text-success border-success/30", icon: Check },
  vencendo: { label: "Vencendo", cls: "bg-warning/15 text-warning border-warning/30", icon: ClockIcon },
  atrasado: { label: "Atrasado", cls: "bg-destructive/15 text-destructive border-destructive/30", icon: AlertTriangle },
  cancelado: { label: "Cancelado", cls: "bg-muted text-muted-foreground border-border", icon: X },
};

export default function GestaoConta() {
  const [tab, setTab] = useState<typeof tabs[number]>("Boletos");
  const [novoOpen, setNovoOpen] = useState(false);

  return (
    <div>
      <PageHeader
        title="Gestão de Conta"
        subtitle="Boletos, extratos de horas e relatórios mensais"
      />

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

      {tab === "Boletos" && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <select className="h-9 px-3 rounded-lg border border-border bg-card text-sm">
              <option>Todas as empresas</option>
            </select>
            <select className="h-9 px-3 rounded-lg border border-border bg-card text-sm">
              <option>Todos os status</option>
            </select>
            <button onClick={() => setNovoOpen(true)} className="ml-auto h-9 px-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center gap-1.5">
              <Plus className="h-4 w-4" /> Novo Boleto
            </button>
          </div>

          {boletos.some(b => b.status === "atrasado" || b.status === "vencendo") && (
            <div className="rounded-xl border border-warning/30 bg-warning/10 p-4 mb-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
              <div className="text-sm">
                <span className="font-medium text-warning">Atenção: </span>
                <span className="text-warning/80">Existem boletos vencidos ou próximos do vencimento.</span>
              </div>
            </div>
          )}

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left font-medium px-4 py-3">Empresa</th>
                  <th className="text-right font-medium px-4 py-3">Valor</th>
                  <th className="text-left font-medium px-4 py-3">Vencimento</th>
                  <th className="text-left font-medium px-4 py-3">Status</th>
                  <th className="text-right font-medium px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {boletos.map((b) => {
                  const s = statusBoleto[b.status];
                  return (
                    <tr key={b.id} className="border-t border-border hover:bg-secondary/30">
                      <td className="px-4 py-3 font-medium">{b.empresa}</td>
                      <td className="px-4 py-3 text-right font-data">R$ {b.valor.toLocaleString("pt-BR")}</td>
                      <td className="px-4 py-3 font-data">{b.vencimento}</td>
                      <td className="px-4 py-3">
                        <span className={cn("badge-pill", s.cls)}>
                          <s.icon className="h-3 w-3" /> {s.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button className="text-xs text-primary hover:underline">Detalhes</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "Extrato de Horas" && (
        <div className="space-y-5">
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-display font-semibold">Horas — abril/2025</h3>
                <p className="text-xs text-muted-foreground">80h contratadas · 61h consumidas</p>
              </div>
              <button className="h-8 px-3 rounded-lg border border-border text-xs flex items-center gap-1.5 hover:bg-secondary">
                <Download className="h-3.5 w-3.5" /> Exportar
              </button>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-gradient-brand" style={{ width: "76%" }} />
            </div>
            <div className="mt-2 flex justify-between text-xs font-data text-muted-foreground">
              <span>76% consumido</span>
              <span>19h restantes</span>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left font-medium px-4 py-3">Data</th>
                  <th className="text-left font-medium px-4 py-3">Empresa</th>
                  <th className="text-left font-medium px-4 py-3">Atividade</th>
                  <th className="text-left font-medium px-4 py-3">Consultor</th>
                  <th className="text-right font-medium px-4 py-3">Horas</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { d: "22/04", e: "Kentaki Foods", a: "Triagem de currículos", c: "Ana Beatriz", h: 3.5 },
                  { d: "22/04", e: "Studio Mira", a: "Workshop de cargos", c: "Camila Torres", h: 4.0 },
                  { d: "21/04", e: "Tech Plural", a: "Entrevistas técnicas", c: "Ana Beatriz", h: 5.2 },
                  { d: "21/04", e: "Alvo Digital", a: "Reunião de briefing", c: "Rafael Moura", h: 1.5 },
                  { d: "20/04", e: "Grupo Maverick", a: "Apresentação de perfis", c: "Rafael Moura", h: 2.0 },
                ].map((r, i) => (
                  <tr key={i} className="border-t border-border hover:bg-secondary/30">
                    <td className="px-4 py-3 font-data">{r.d}</td>
                    <td className="px-4 py-3 font-medium">{r.e}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.a}</td>
                    <td className="px-4 py-3">{r.c}</td>
                    <td className="px-4 py-3 text-right font-data">{r.h.toFixed(1)}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "Relatórios Mensais" && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-4 py-3">Período</th>
                <th className="text-left font-medium px-4 py-3">Empresa</th>
                <th className="text-left font-medium px-4 py-3">Status do cliente</th>
                <th className="text-right font-medium px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {[
                { p: "Mar/2025", e: "Kentaki Foods", s: "assinado" },
                { p: "Mar/2025", e: "Studio Mira", s: "assinado" },
                { p: "Mar/2025", e: "Tech Plural", s: "pendente" },
                { p: "Mar/2025", e: "Alvo Digital", s: "atrasado" },
              ].map((r, i) => (
                <tr key={i} className="border-t border-border hover:bg-secondary/30">
                  <td className="px-4 py-3 font-data">{r.p}</td>
                  <td className="px-4 py-3 font-medium">{r.e}</td>
                  <td className="px-4 py-3">
                    <span className={cn("badge-pill",
                      r.s === "assinado" && "bg-success/15 text-success border-success/30",
                      r.s === "pendente" && "bg-warning/15 text-warning border-warning/30",
                      r.s === "atrasado" && "bg-destructive/15 text-destructive border-destructive/30",
                    )}>
                      {r.s}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-xs text-primary hover:underline mr-3">Ver</button>
                    <button className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                      <FileText className="h-3 w-3" /> Gerar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {novoOpen && (
        <div className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm flex justify-end animate-fade-in">
          <div className="h-full w-full max-w-md bg-card border-l border-border shadow-elevated p-6 overflow-y-auto animate-slide-in-right">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-display text-lg font-semibold">Novo boleto</h2>
                <p className="text-xs text-muted-foreground">Preencha os dados para emissão.</p>
              </div>
              <button onClick={() => setNovoOpen(false)} className="h-8 w-8 rounded-md hover:bg-secondary flex items-center justify-center">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form className="space-y-4">
              <Field label="Empresa">
                <select className="w-full h-10 px-3 rounded-lg bg-secondary border border-input focus:border-primary outline-none text-sm">
                  <option>Kentaki Foods</option><option>Grupo Maverick</option><option>Studio Mira</option>
                </select>
              </Field>
              <Field label="Valor (R$)">
                <input type="number" defaultValue={4800} className="w-full h-10 px-3 rounded-lg bg-secondary border border-input focus:border-primary outline-none text-sm font-data" />
              </Field>
              <Field label="Vencimento">
                <input type="date" className="w-full h-10 px-3 rounded-lg bg-secondary border border-input focus:border-primary outline-none text-sm font-data" />
              </Field>
              <Field label="Descrição">
                <textarea rows={3} className="w-full p-3 rounded-lg bg-secondary border border-input focus:border-primary outline-none text-sm" placeholder="Referência do boleto…" />
              </Field>
              <button onClick={(e) => { e.preventDefault(); setNovoOpen(false); }} className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium">Emitir boleto</button>
            </form>
          </div>
        </div>
      )}
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
