import { PageHeader } from "@/components/PageHeader";
import { CreditCard, FileText, Receipt, Users, Check, Clock as ClockIcon, AlertTriangle, Download } from "lucide-react";
import { cn } from "@/lib/utils";

const plano = {
  nome: "Ongoing Premium",
  vigencia: "01/02/2025 → 31/01/2026",
  ciclo: "Mensal",
  valor: "R$ 4.800,00 / mês",
};

const faturas = [
  { id: "f1", periodo: "Abr/2025", valor: "R$ 4.800,00", venc: "10/04/2025", status: "pago" as const },
  { id: "f2", periodo: "Mar/2025", valor: "R$ 4.800,00", venc: "10/03/2025", status: "pago" as const },
  { id: "f3", periodo: "Mai/2025", valor: "R$ 4.800,00", venc: "10/05/2025", status: "aberto" as const },
];

const contratos = [
  { id: "c1", tipo: "Contrato de prestação de serviços", data: "01/02/2025" },
  { id: "c2", tipo: "Termo aditivo — Atração de Talentos", data: "10/03/2025" },
  { id: "c3", tipo: "NDA — Confidencialidade", data: "01/02/2025" },
];

const usuarios = [
  { nome: "Mariana Souza", email: "mariana@kentaki.com", papel: "Admin" },
  { nome: "João Pereira", email: "joao@kentaki.com", papel: "Gestor" },
  { nome: "Lucas Tavares", email: "lucas@kentaki.com", papel: "Financeiro" },
];

const statusFatura: Record<string, { label: string; cls: string; icon: any }> = {
  pago: { label: "Pago", cls: "bg-success/15 text-success border-success/30", icon: Check },
  aberto: { label: "Em aberto", cls: "bg-warning/15 text-warning border-warning/30", icon: ClockIcon },
  atrasado: { label: "Atrasado", cls: "bg-destructive/15 text-destructive border-destructive/30", icon: AlertTriangle },
};

export default function ClienteGestaoContaPage() {
  return (
    <div>
      <PageHeader
        title="Gestão da conta"
        subtitle="Plano, faturamento, contratos e usuários da sua conta com a Azumi."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Plano */}
        <div className="bg-card border border-border rounded-2xl shadow-card p-5">
          <div className="flex items-start gap-3 mb-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><CreditCard className="h-5 w-5" /></div>
            <div>
              <h3 className="font-display font-semibold">Plano contratado</h3>
              <p className="text-xs text-muted-foreground">Detalhes da sua assinatura atual.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><div className="text-xs text-muted-foreground">Plano</div><div className="font-medium">{plano.nome}</div></div>
            <div><div className="text-xs text-muted-foreground">Ciclo</div><div className="font-medium">{plano.ciclo}</div></div>
            <div className="col-span-2"><div className="text-xs text-muted-foreground">Vigência</div><div className="font-medium font-data">{plano.vigencia}</div></div>
            <div className="col-span-2"><div className="text-xs text-muted-foreground">Valor</div><div className="font-medium font-data">{plano.valor}</div></div>
          </div>
        </div>

        {/* Contratos */}
        <div className="bg-card border border-border rounded-2xl shadow-card p-5">
          <div className="flex items-start gap-3 mb-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><FileText className="h-5 w-5" /></div>
            <div>
              <h3 className="font-display font-semibold">Contratos</h3>
              <p className="text-xs text-muted-foreground">Documentos firmados com a Azumi.</p>
            </div>
          </div>
          <ul className="divide-y divide-border">
            {contratos.map((c) => (
              <li key={c.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{c.tipo}</div>
                  <div className="text-xs text-muted-foreground font-data">{c.data}</div>
                </div>
                <button className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                  <Download className="h-3 w-3" /> ver
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Faturamento */}
      <div className="bg-card border border-border rounded-2xl shadow-card p-5 mb-6">
        <div className="flex items-start gap-3 mb-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Receipt className="h-5 w-5" /></div>
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
              </tr>
            </thead>
            <tbody>
              {faturas.map((f) => {
                const s = statusFatura[f.status];
                return (
                  <tr key={f.id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium">{f.periodo}</td>
                    <td className="px-4 py-3 text-right font-data">{f.valor}</td>
                    <td className="px-4 py-3 font-data">{f.venc}</td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border", s.cls)}>
                        <s.icon className="h-3 w-3" /> {s.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Usuários */}
      <div className="bg-card border border-border rounded-2xl shadow-card p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Users className="h-5 w-5" /></div>
          <div>
            <h3 className="font-display font-semibold">Usuários da conta</h3>
            <p className="text-xs text-muted-foreground">Pessoas com acesso ao painel da Kentaki Foods.</p>
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
              {usuarios.map((u) => (
                <tr key={u.email} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{u.nome}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-foreground border border-border">{u.papel}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
