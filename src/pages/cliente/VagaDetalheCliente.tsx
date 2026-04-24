import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { SectionDivider } from "@/components/SectionDivider";
import { SlaBar } from "@/components/SlaBar";
import { DiscBars } from "@/components/DiscBars";
import { Link, useParams } from "react-router-dom";
import { vagas, candidatos, etapasVaga, comentariosVaga } from "@/data/mock";
import {
  ArrowLeft, Building2, MapPin, Lock, Send, AlertTriangle, CheckCircle2,
  PauseCircle, XCircle, FileText, Info, Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function VagaDetalheCliente() {
  const { id } = useParams();
  const vaga = vagas.find((v) => v.id === id) ?? vagas[0];
  const candidatosEnviados = candidatos.filter((c) => c.vagaId === vaga.id && c.enviado);
  const [decisao, setDecisao] = useState<{ open: boolean; tipo: "aprovar" | "standby" | "reprovar" | null }>({ open: false, tipo: null });
  const [justificativa, setJustificativa] = useState("");

  const funilResumido = [
    { etapa: "Triagem", n: vaga.candidatosTriagem },
    { etapa: "Entrevista", n: vaga.candidatosEntrevista },
    { etapa: "Enviados", n: vaga.candidatosEnviados },
  ];
  const max = Math.max(...funilResumido.map(f => f.n), 1);
  const atrasado = vaga.sla > 90;

  return (
    <div>
      <Link to="/cliente/atracao" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3">
        <ArrowLeft className="h-3.5 w-3.5" /> Voltar para minhas vagas
      </Link>

      <PageHeader
        title={vaga.titulo}
        subtitle={`${vaga.empresa} · ${vaga.filial}` as any}
        actions={<StatusBadge status={vaga.status} />}
      />

      {atrasado && (
        <div className="mb-5 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-medium text-warning">Parecer pendente — prazo excedido</div>
            <div className="text-xs text-warning/80 mt-0.5">
              O parecer da última rodada está em atraso. O SLA da vaga foi atualizado.
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Timeline com mini-chat */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <h3 className="font-display font-semibold mb-4">Etapas da vaga</h3>
          <ol className="space-y-3">
            {etapasVaga.map((e, idx) => {
              const done = e.status === "concluida";
              const active = e.status === "andamento";
              return (
                <li key={idx} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-background/40">
                  <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center font-data text-xs shrink-0",
                    done && "bg-success text-success-foreground",
                    active && "bg-primary text-primary-foreground animate-soft-pulse",
                    !done && !active && "bg-muted text-muted-foreground"
                  )}>
                    {done ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">{e.nome}</span>
                      <StatusBadge status={e.status} />
                    </div>
                    <div className="text-[11px] text-muted-foreground font-data mt-0.5">
                      {e.inicio} → {e.fim}
                    </div>
                    {active && (
                      <button className="mt-2 text-xs text-primary hover:underline inline-flex items-center gap-1">
                        <Send className="h-3 w-3" /> Comentar nesta etapa
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Funil resumido */}
        <div className="space-y-5">
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-display font-semibold mb-3">Funil (resumo)</h3>
            <ul className="space-y-3">
              {funilResumido.map((f) => {
                const w = (f.n / max) * 100;
                return (
                  <li key={f.etapa}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{f.etapa}</span>
                      <span className="font-data">{f.n}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${w}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
            <SlaBar percent={vaga.sla} className="mt-4" label="SLA" />
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-info mt-0.5" />
              <div>
                <h4 className="font-display font-semibold text-sm">Informações importantes</h4>
                <ul className="mt-2 text-xs text-muted-foreground space-y-1.5 list-disc pl-4">
                  <li>É proibida a contratação direta de candidatos sem intermediação Azumi.</li>
                  <li>SLA padrão: 30 dias úteis para fechamento.</li>
                  <li>Após 3 reprovações consecutivas, será necessário realinhamento obrigatório.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SectionDivider>Perfis apresentados</SectionDivider>

      {candidatosEnviados.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-10 text-center">
          <p className="text-muted-foreground text-sm">Nenhum perfil apresentado ainda. Você será notificado quando os candidatos forem enviados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {candidatosEnviados.map((c) => (
            <div key={c.id} className="bg-card border border-border rounded-xl p-5 card-hover">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-brand flex items-center justify-center text-xs font-semibold text-white">
                  {c.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{c.nome}</div>
                  <div className="text-[11px] text-muted-foreground">DISC: {c.perfilDom} dominante</div>
                </div>
                <Lock className="h-3.5 w-3.5 text-muted-foreground" aria-label="Contato bloqueado" />
              </div>

              <div className="mt-3">
                <DiscBars values={c.disc} compact />
              </div>

              <p className="mt-3 text-xs text-muted-foreground line-clamp-2">{c.parecer}</p>

              <button className="mt-3 w-full h-8 rounded-lg border border-border hover:bg-secondary text-xs font-medium flex items-center justify-center gap-1.5">
                <FileText className="h-3.5 w-3.5" /> Ver relatório completo
              </button>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <button onClick={() => setDecisao({ open: true, tipo: "aprovar" })} className="h-8 rounded-lg bg-success/15 hover:bg-success/25 text-success text-xs font-medium flex items-center justify-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Aprovar
                </button>
                <button onClick={() => setDecisao({ open: true, tipo: "standby" })} className="h-8 rounded-lg bg-warning/15 hover:bg-warning/25 text-warning text-xs font-medium flex items-center justify-center gap-1">
                  <PauseCircle className="h-3.5 w-3.5" /> Standby
                </button>
                <button onClick={() => setDecisao({ open: true, tipo: "reprovar" })} className="h-8 rounded-lg bg-destructive/15 hover:bg-destructive/25 text-destructive text-xs font-medium flex items-center justify-center gap-1">
                  <XCircle className="h-3.5 w-3.5" /> Reprovar
                </button>
              </div>

              <div className="mt-3 pt-3 border-t border-border">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Parecer do gestor</div>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map((n) => (
                    <Star key={n} className="h-4 w-4 text-muted-foreground hover:text-warning hover:fill-warning cursor-pointer" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mini-chat */}
      <SectionDivider>Conversa com o consultor</SectionDivider>
      <div className="bg-card border border-border rounded-xl p-5 max-w-3xl">
        <ul className="space-y-3 mb-4">
          {comentariosVaga.map((c) => (
            <li key={c.id} className={cn("flex gap-3", c.azumi ? "" : "flex-row-reverse")}>
              <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0",
                c.azumi ? "bg-gradient-brand text-white" : "bg-secondary text-foreground"
              )}>
                {c.azumi ? "A" : "EU"}
              </div>
              <div className={cn("max-w-md", c.azumi ? "" : "text-right")}>
                <div className="text-[11px] text-muted-foreground mb-1">{c.autor} · <span className="font-data">{c.quando}</span></div>
                <div className={cn(
                  "rounded-xl px-3 py-2 text-sm border",
                  c.azumi ? "bg-primary/10 border-primary/20" : "bg-secondary border-border"
                )}>{c.texto}</div>
              </div>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <input type="text" placeholder="Escreva uma mensagem para o consultor…" className="flex-1 h-10 px-3 rounded-lg bg-secondary border border-input focus:border-primary outline-none text-sm" />
          <button className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center gap-1.5">
            <Send className="h-4 w-4" /> Enviar
          </button>
        </div>
      </div>

      {/* Modal decisão */}
      {decisao.open && (
        <div className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-card border border-border rounded-2xl shadow-elevated w-full max-w-md p-6 animate-scale-in">
            <h3 className="font-display text-lg font-semibold capitalize">
              {decisao.tipo === "aprovar" ? "Aprovar candidato" :
               decisao.tipo === "standby" ? "Colocar em standby" : "Reprovar candidato"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Justifique brevemente sua decisão para que o consultor possa dar continuidade ao processo.
            </p>
            <textarea
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
              placeholder="Sua justificativa…"
              className="mt-3 w-full h-28 p-3 rounded-lg bg-secondary border border-input focus:border-primary outline-none text-sm resize-none"
            />
            <div className="mt-4 flex items-center justify-end gap-2">
              <button onClick={() => setDecisao({ open: false, tipo: null })} className="h-9 px-4 rounded-lg border border-border hover:bg-secondary text-sm">Cancelar</button>
              <button
                disabled={!justificativa.trim()}
                onClick={() => { setDecisao({ open: false, tipo: null }); setJustificativa(""); }}
                className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
