import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Lock,
  CheckCircle2,
  FileText,
  Info,
  AlertTriangle,
  CalendarCheck,
  ClipboardList,
  X,
  ThumbsUp,
  ThumbsDown,
  PauseCircle,
  CalendarClock,
  Star,
  MapPin,
  Video,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { SectionDivider } from "@/components/SectionDivider";
import { DiscBars } from "@/components/DiscBars";
import { cn } from "@/lib/utils";
import { vagas, candidatos, getGestorDaVaga } from "@/data/mock";
import {
  getRelatorioEnviado,
  candidatosComRelatorioPorVaga,
  entrevistaRealizada,
  getParecerCliente,
  salvarParecerCliente,
  getFeedback1aLeva,
  salvarFeedback1aLeva,
  reprovadosNaPrimeiraLeva,
  type ParecerCliente,
} from "@/data/atracaoClienteStore";
import {
  listarAgendamentosDaVaga,
  getAgendamentoDoCandidato,
  gestorAprovarSugestao,
  gestorSugerirOutro,
  formatarSugestao,
  statusAgendamentoLabel,
  subscribeEntrevistaGestor,
  getParecerGestor,
  salvarParecerGestor,
  reprovadosNaPrimeiraLevaGestor,
  type AgendamentoEntrevistaGestor,
  type SugestaoHorario,
  type ParecerGestor,
} from "@/data/entrevistaGestorStore";

type DecisaoCliente = "avancar" | "standby" | "reprovar";

// ────────────────────────────────────────────────────────────────────
// Página
// ────────────────────────────────────────────────────────────────────

export default function VagaDetalheCliente() {
  const { id } = useParams();
  const vaga = vagas.find((v) => v.id === id) ?? vagas[0];

  // Re-render trigger quando o store é atualizado (parecer salvo etc).
  const [versao, setVersao] = useState(0);
  function bump() {
    setVersao((v) => v + 1);
  }

  // Sincroniza com store de entrevista do gestor (admin pode disparar)
  useEffect(() => {
    return subscribeEntrevistaGestor(() => bump());
  }, []);

  // Apenas candidatos com relatório enviado para esta vaga aparecem ao cliente.
  const candidatosVisiveis = useMemo(() => {
    const idsComRelatorio = candidatosComRelatorioPorVaga(vaga.id);
    return idsComRelatorio
      .map((cid) => candidatos.find((c) => c.id === cid))
      .filter((c): c is (typeof candidatos)[number] => !!c);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vaga.id, versao]);

  // Agendamentos da vaga (entrevistas com gestor — Etapa 5)
  const agendamentos = useMemo(
    () => listarAgendamentosDaVaga(vaga.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [vaga.id, versao]
  );

  // Estado de modais
  const [fichaCandId, setFichaCandId] = useState<string | null>(null);
  const [relatorioCandId, setRelatorioCandId] = useState<string | null>(null);
  const [parecerCandId, setParecerCandId] = useState<string | null>(null);
  const [feedback1aLevaOpen, setFeedback1aLevaOpen] = useState(false);
  const [respostaGestorAgId, setRespostaGestorAgId] = useState<string | null>(null);
  const [parecerGestorCandId, setParecerGestorCandId] = useState<string | null>(null);

  const fichaCand = candidatosVisiveis.find((c) => c.id === fichaCandId) ?? null;

  // Após salvar parecer, verifica se acionou a regra dos 3 reprovados.
  function aposSalvarParecer() {
    bump();
    const fb = getFeedback1aLeva(vaga.id);
    if (fb) return;
    const { totalLeva, reprovados } = reprovadosNaPrimeiraLeva(vaga.id);
    if (totalLeva >= 3 && reprovados >= 3) {
      setFeedback1aLevaOpen(true);
    }
  }

  // Regra dos 3 reprovados via Parecer do Gestor (Etapa 5)
  function aposSalvarParecerGestor() {
    bump();
    const fb = getFeedback1aLeva(vaga.id);
    if (fb) return;
    const primeiraLevaIds = candidatosVisiveis.slice(0, 3).map((c) => c.id);
    const { totalLeva, reprovados } = reprovadosNaPrimeiraLevaGestor(vaga.id, primeiraLevaIds);
    if (totalLeva >= 3 && reprovados >= 3) {
      setFeedback1aLevaOpen(true);
    }
  }

  return (
    <div>
      <Link
        to="/cliente/atracao"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Voltar para minhas vagas
      </Link>

      <PageHeader
        title={vaga.titulo}
        subtitle={`${vaga.empresa} · ${vaga.filial} · Consultora Azumi: Camila Torres`}
        actions={<StatusBadge status={vaga.status} />}
      />

      {/* Aviso quando ainda não há perfis enviados */}
      {candidatosVisiveis.length === 0 && (
        <div className="mb-5 rounded-xl border border-info/30 bg-info/10 px-4 py-3 flex items-start gap-3">
          <Lock className="h-5 w-5 text-info shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-medium text-info">
              Vaga em andamento — perfis ainda não foram enviados
            </div>
            <div className="text-xs text-info/80 mt-0.5">
              A consultoria está conduzindo a triagem. Você poderá visualizar
              os candidatos e dar seu parecer assim que os relatórios forem
              enviados pela Azumi.
            </div>
          </div>
        </div>
      )}

      {/* Resumo da vaga */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-2">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <h3 className="font-display font-semibold mb-2">Resumo da vaga</h3>
          <p className="text-sm text-muted-foreground">
            {vaga.titulo} para {vaga.empresa} ({vaga.filial}). O processo segue
            conduzido pela consultoria Azumi. Para qualquer ajuste no perfil
            desejado, fale com sua consultora.
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-info mt-0.5" />
            <div>
              <h4 className="font-display font-semibold text-sm">
                Como funciona
              </h4>
              <ul className="mt-2 text-xs text-muted-foreground space-y-1.5 list-disc pl-4">
                <li>A Azumi envia até 3 perfis com relatório.</li>
                <li>Você visualiza cada relatório e realiza a entrevista.</li>
                <li>Após a entrevista, registra o parecer pelo botão da ficha.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Painel: Entrevistas com gestor pendentes (Etapa 5) */}
      {agendamentos.length > 0 && (
        <>
          <SectionDivider>Entrevistas com gestor</SectionDivider>
          <div className="mb-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {agendamentos.map((ag) => (
              <AgendamentoGestorCard
                key={ag.id}
                ag={ag}
                onResponder={() => setRespostaGestorAgId(ag.id)}
              />
            ))}
          </div>
        </>
      )}

      <SectionDivider>Candidatos enviados</SectionDivider>

      {candidatosVisiveis.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-10 text-center">
          <p className="text-muted-foreground text-sm">
            Nenhum perfil apresentado ainda. Você será notificado quando os
            candidatos forem enviados.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {candidatosVisiveis.map((c) => {
            const parecer = getParecerCliente(c.id);
            const podeEntrevista = entrevistaRealizada(c.id);
            return (
              <div
                key={c.id}
                className="bg-card border border-border rounded-xl p-5 card-hover"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-brand flex items-center justify-center text-xs font-semibold text-white">
                    {c.nome
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{c.nome}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {parecer
                        ? "Parecer registrado"
                        : podeEntrevista
                        ? "Aguardando seu parecer"
                        : "Aguardando entrevista"}
                    </div>
                  </div>
                  <Lock
                    className="h-3.5 w-3.5 text-muted-foreground"
                    aria-label="Contato bloqueado"
                  />
                </div>

                {parecer && (
                  <div className="mt-3">
                    <StatusPillParecer decisao={parecer.decisao} compareceu={parecer.compareceu} />
                  </div>
                )}

                <div className="mt-3">
                  <DiscBars values={c.disc} compact />
                </div>

                <button
                  onClick={() => setFichaCandId(c.id)}
                  className="mt-4 w-full h-8 rounded-lg border border-border hover:bg-secondary text-xs font-medium flex items-center justify-center gap-1.5"
                >
                  <FileText className="h-3.5 w-3.5" /> Ver candidato
                </button>
                {(() => {
                  const ag = getAgendamentoDoCandidato(c.id);
                  const pg = getParecerGestor(c.id);
                  if (pg) {
                    return (
                      <div className="mt-2 text-[11px] text-muted-foreground inline-flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-success" /> Parecer do gestor registrado
                      </div>
                    );
                  }
                  if (ag?.status === "confirmado") {
                    return (
                      <button
                        onClick={() => setParecerGestorCandId(c.id)}
                        className="mt-2 w-full h-8 rounded-lg bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center gap-1.5"
                      >
                        <Star className="h-3.5 w-3.5" /> Parecer do gestor
                      </button>
                    );
                  }
                  return null;
                })()}
              </div>
            );
          })}
        </div>
      )}

      {/* Ficha simplificada do candidato */}
      {fichaCand && (
        <FichaCandidatoModal
          candidato={fichaCand}
          onClose={() => setFichaCandId(null)}
          onAbrirRelatorio={(cid) => setRelatorioCandId(cid)}
          onGerarParecer={(cid) => setParecerCandId(cid)}
          parecerExistente={getParecerCliente(fichaCand.id)}
          podeGerarParecer={entrevistaRealizada(fichaCand.id)}
        />
      )}

      {/* Visualização do relatório (modo leitura) */}
      {relatorioCandId && (
        <RelatorioVisualizacaoModal
          candidatoId={relatorioCandId}
          onClose={() => setRelatorioCandId(null)}
        />
      )}

      {/* Modal de parecer pós-entrevista */}
      {parecerCandId && (
        <ParecerEntrevistaModal
          candidatoId={parecerCandId}
          vagaId={vaga.id}
          onClose={() => setParecerCandId(null)}
          onSaved={() => {
            setParecerCandId(null);
            aposSalvarParecer();
          }}
        />
      )}

      {/* Modal especial: 3 perfis reprovados na 1ª leva */}
      {feedback1aLevaOpen && (
        <Feedback1aLevaModal
          vagaId={vaga.id}
          onClose={() => setFeedback1aLevaOpen(false)}
          onSaved={() => {
            setFeedback1aLevaOpen(false);
            bump();
          }}
        />
      )}

      {/* Modal: gestor responde sugestões de horário */}
      {respostaGestorAgId && (
        <RespostaGestorModal
          agendamentoId={respostaGestorAgId}
          onClose={() => setRespostaGestorAgId(null)}
          onSaved={() => {
            setRespostaGestorAgId(null);
            bump();
          }}
        />
      )}

      {/* Modal: parecer do gestor pós-entrevista */}
      {parecerGestorCandId && (
        <ParecerGestorModal
          candidatoId={parecerGestorCandId}
          vagaId={vaga.id}
          onClose={() => setParecerGestorCandId(null)}
          onSaved={() => {
            setParecerGestorCandId(null);
            aposSalvarParecerGestor();
          }}
        />
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Subcomponentes
// ────────────────────────────────────────────────────────────────────

function StatusPillParecer({
  decisao,
  compareceu,
}: {
  decisao?: DecisaoCliente;
  compareceu: boolean;
}) {
  if (!compareceu) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border bg-muted text-muted-foreground border-border">
        <AlertTriangle className="h-3 w-3" /> Não compareceu
      </span>
    );
  }
  if (decisao === "avancar") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border bg-success/15 text-success border-success/30">
        <ThumbsUp className="h-3 w-3" /> Avançar
      </span>
    );
  }
  if (decisao === "standby") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border bg-warning/15 text-warning border-warning/30">
        <PauseCircle className="h-3 w-3" /> Stand by
      </span>
    );
  }
  if (decisao === "reprovar") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border bg-destructive/15 text-destructive border-destructive/30">
        <ThumbsDown className="h-3 w-3" /> Reprovado
      </span>
    );
  }
  return null;
}

// ────────────────────────────────────────────────────────────────────
// Shell de modal padrão (centro da tela, z-50, scroll lock)
// ────────────────────────────────────────────────────────────────────

function ModalShell({
  title,
  subtitle,
  onClose,
  children,
  footer,
  maxWidth = "max-w-xl",
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}) {
  useEffect(() => {
    document.body.classList.add("modal-open");
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        className={cn(
          "relative w-full bg-card border border-border rounded-2xl shadow-2xl flex flex-col max-h-[90vh]",
          maxWidth
        )}
      >
        <div className="flex items-start justify-between gap-3 p-5 border-b border-border">
          <div className="min-w-0">
            <h3 className="font-display font-semibold text-base">{title}</h3>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">{children}</div>

        {footer && (
          <div className="border-t border-border p-4 flex flex-wrap items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Ficha simplificada do candidato (visão cliente)
// ────────────────────────────────────────────────────────────────────

interface CandidatoMock {
  id: string;
  nome: string;
  cargo: string;
  vagaId: string;
  disc: { D: number; I: number; S: number; C: number };
  perfilDom: string;
  parecer: string;
}

function FichaCandidatoModal({
  candidato,
  onClose,
  onAbrirRelatorio,
  onGerarParecer,
  parecerExistente,
  podeGerarParecer,
}: {
  candidato: CandidatoMock;
  onClose: () => void;
  onAbrirRelatorio: (candidatoId: string) => void;
  onGerarParecer: (candidatoId: string) => void;
  parecerExistente: ParecerCliente | null;
  podeGerarParecer: boolean;
}) {
  const relatorio = getRelatorioEnviado(candidato.id);
  const parecerSalvo = !!parecerExistente;

  return (
    <ModalShell
      title={candidato.nome}
      subtitle={candidato.cargo}
      onClose={onClose}
      footer={
        <>
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-lg border border-border text-sm font-medium hover:bg-secondary"
          >
            Fechar
          </button>
          <button
            onClick={() => onAbrirRelatorio(candidato.id)}
            className="h-9 px-4 rounded-lg border border-border text-sm font-medium hover:bg-secondary inline-flex items-center gap-1.5"
          >
            <FileText className="h-3.5 w-3.5" /> Visualizar relatório
          </button>
          {parecerSalvo ? (
            <button
              disabled
              className="h-9 px-4 rounded-lg bg-muted text-muted-foreground text-sm font-medium inline-flex items-center gap-1.5 cursor-not-allowed"
              title="Parecer já registrado para este candidato"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Parecer registrado
            </button>
          ) : (
            <button
              disabled={!podeGerarParecer}
              onClick={() => onGerarParecer(candidato.id)}
              className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              title={
                podeGerarParecer
                  ? "Registrar parecer pós-entrevista"
                  : "O botão será liberado após a entrevista com o cliente"
              }
            >
              <CalendarCheck className="h-3.5 w-3.5" /> Gerar parecer da entrevista
            </button>
          )}
        </>
      }
    >
      <div className="space-y-5">
        <section>
          <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Dados básicos
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-[11px] text-muted-foreground">
                Cargo atual
              </div>
              <div>{candidato.cargo}</div>
            </div>
            <div>
              <div className="text-[11px] text-muted-foreground">Cidade/UF</div>
              <div>São Paulo / SP</div>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground italic">
            <Lock className="h-3 w-3 inline mr-1" />
            Contato direto bloqueado — fale com sua consultora Azumi.
          </p>
        </section>

        <section>
          <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Resumo profissional
          </h4>
          <p className="text-sm text-muted-foreground">
            {relatorio?.resumo ?? candidato.parecer}
          </p>
        </section>

        <section>
          <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            DISC
          </h4>
          <DiscBars values={candidato.disc} />
          {relatorio?.discResumo && (
            <p className="mt-2 text-xs text-muted-foreground">
              {relatorio.discResumo}
            </p>
          )}
        </section>

        {parecerExistente && (
          <section className="bg-background/40 border border-border rounded-xl p-4">
            <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Seu parecer registrado
            </h4>
            <ResumoParecer parecer={parecerExistente} />
          </section>
        )}
      </div>
    </ModalShell>
  );
}

function ResumoParecer({ parecer }: { parecer: ParecerCliente }) {
  return (
    <div className="space-y-2 text-sm">
      <div className="flex items-center gap-2">
        <StatusPillParecer
          decisao={parecer.decisao}
          compareceu={parecer.compareceu}
        />
        <span className="text-[11px] text-muted-foreground">
          {new Date(parecer.criadoEm).toLocaleString("pt-BR")}
        </span>
      </div>
      {!parecer.compareceu && (
        <div className="text-xs text-muted-foreground">
          {parecer.remarcar
            ? "Cliente solicitou remarcação."
            : "Cliente não solicitou remarcação."}
          {parecer.justificativaNaoCompareceu && (
            <div className="mt-1 italic">
              "{parecer.justificativaNaoCompareceu}"
            </div>
          )}
        </div>
      )}
      {parecer.compareceu && (
        <>
          {parecer.pontosPositivos && (
            <div>
              <div className="text-[11px] text-muted-foreground">
                Pontos positivos
              </div>
              <div className="text-xs">{parecer.pontosPositivos}</div>
            </div>
          )}
          {parecer.pontosAtencao && (
            <div>
              <div className="text-[11px] text-muted-foreground">
                Pontos de atenção
              </div>
              <div className="text-xs">{parecer.pontosAtencao}</div>
            </div>
          )}
          {parecer.proximaFasePlanejada && (
            <div>
              <div className="text-[11px] text-muted-foreground">
                Próxima fase planejada
              </div>
              <div className="text-xs">{parecer.proximaFasePlanejada}</div>
            </div>
          )}
          {parecer.decisao === "reprovar" && parecer.motivoReprovacao && (
            <div>
              <div className="text-[11px] text-muted-foreground">
                Motivo da reprovação
              </div>
              <div className="text-xs">{parecer.motivoReprovacao}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Visualização de relatório (modo leitura)
// ────────────────────────────────────────────────────────────────────

function RelatorioVisualizacaoModal({
  candidatoId,
  onClose,
}: {
  candidatoId: string;
  onClose: () => void;
}) {
  const cand = candidatos.find((c) => c.id === candidatoId);
  const relatorio = getRelatorioEnviado(candidatoId);

  return (
    <ModalShell
      title="Relatório do candidato"
      subtitle={cand?.nome}
      onClose={onClose}
      maxWidth="max-w-2xl"
      footer={
        <button
          onClick={onClose}
          className="h-9 px-4 rounded-lg border border-border text-sm font-medium hover:bg-secondary"
        >
          Fechar
        </button>
      }
    >
      {!relatorio ? (
        <p className="text-sm text-muted-foreground">
          Relatório indisponível.
        </p>
      ) : (
        <div className="space-y-5">
          <section>
            <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
              Síntese de carreira
            </h4>
            <p className="text-sm">{relatorio.resumo}</p>
          </section>
          <section>
            <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
              Perfil DISC
            </h4>
            {cand && <DiscBars values={cand.disc} />}
            <p className="mt-2 text-sm text-muted-foreground">
              {relatorio.discResumo}
            </p>
          </section>
          {relatorio.fasePlanejada && (
            <section>
              <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                Próxima fase prevista pela Azumi
              </h4>
              <p className="text-sm">{relatorio.fasePlanejada}</p>
            </section>
          )}
          <p className="text-[11px] text-muted-foreground italic">
            Enviado em {new Date(relatorio.enviadoEm).toLocaleString("pt-BR")}
          </p>
        </div>
      )}
    </ModalShell>
  );
}

// ────────────────────────────────────────────────────────────────────
// Modal de parecer pós-entrevista
// ────────────────────────────────────────────────────────────────────

function ParecerEntrevistaModal({
  candidatoId,
  vagaId,
  onClose,
  onSaved,
}: {
  candidatoId: string;
  vagaId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const cand = candidatos.find((c) => c.id === candidatoId);

  const [compareceu, setCompareceu] = useState<"sim" | "nao" | "">("");
  const [remarcar, setRemarcar] = useState<"sim" | "nao" | "">("");
  const [justNaoCompareceu, setJustNaoCompareceu] = useState("");
  const [pontosPositivos, setPontosPositivos] = useState("");
  const [pontosAtencao, setPontosAtencao] = useState("");
  const [proximaFase, setProximaFase] = useState("");
  const [decisao, setDecisao] = useState<DecisaoCliente | "">("");
  const [motivoReprovacao, setMotivoReprovacao] = useState("");

  // Step de confirmação para "Não compareceu + Não remarcar"
  const [confirmandoDesclassif, setConfirmandoDesclassif] = useState(false);

  const podeSalvar = useMemo(() => {
    if (compareceu === "") return false;
    if (compareceu === "nao") {
      return remarcar !== "";
    }
    if (compareceu === "sim") {
      if (decisao === "") return false;
      if (decisao === "reprovar" && !motivoReprovacao.trim()) return false;
      return true;
    }
    return false;
  }, [compareceu, remarcar, decisao, motivoReprovacao]);

  function persistir() {
    const parecer: ParecerCliente = {
      candidatoId,
      vagaId,
      compareceu: compareceu === "sim",
      ...(compareceu === "nao"
        ? {
            remarcar: remarcar === "sim",
            justificativaNaoCompareceu: justNaoCompareceu.trim() || undefined,
          }
        : {
            pontosPositivos: pontosPositivos.trim() || undefined,
            pontosAtencao: pontosAtencao.trim() || undefined,
            proximaFasePlanejada: proximaFase.trim() || undefined,
            decisao: (decisao || undefined) as DecisaoCliente | undefined,
            motivoReprovacao:
              decisao === "reprovar" ? motivoReprovacao.trim() : undefined,
          }),
      criadoEm: new Date().toISOString(),
    };
    salvarParecerCliente(parecer);

    if (compareceu === "nao" && remarcar === "sim") {
      toast.success("Solicitação de remarcação enviada à consultora.");
    } else if (compareceu === "nao") {
      toast.warning("Candidato marcado como não compareceu.");
    } else {
      toast.success("Parecer registrado com sucesso.");
    }
    onSaved();
  }

  function handleSalvar() {
    if (!podeSalvar) return;
    if (compareceu === "nao" && remarcar === "nao" && !confirmandoDesclassif) {
      setConfirmandoDesclassif(true);
      return;
    }
    persistir();
  }

  return (
    <ModalShell
      title="Parecer do cliente sobre o candidato"
      subtitle={`Preencha após a entrevista para registrar sua avaliação${
        cand ? ` — ${cand.nome}` : ""
      }.`}
      onClose={onClose}
      maxWidth="max-w-2xl"
      footer={
        <>
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-lg border border-border text-sm font-medium hover:bg-secondary"
          >
            Cancelar
          </button>
          <button
            onClick={handleSalvar}
            disabled={!podeSalvar}
            className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {confirmandoDesclassif
              ? "Confirmar desclassificação"
              : "Salvar parecer"}
          </button>
        </>
      }
    >
      {confirmandoDesclassif ? (
        <div className="space-y-3">
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-destructive">
                Confirmar desclassificação?
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                O candidato será marcado como{" "}
                <strong>"Desclassificado — não compareceu"</strong> sem
                possibilidade de remarcação. Essa ação será registrada para a
                consultora.
              </p>
            </div>
          </div>
          <button
            onClick={() => setConfirmandoDesclassif(false)}
            className="text-xs text-primary hover:underline"
          >
            ← Voltar e revisar
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {/* 1. Compareceu? */}
          <Field label="Candidato compareceu à entrevista?" required>
            <RadioRow
              name="compareceu"
              value={compareceu}
              onChange={(v) => setCompareceu(v as "sim" | "nao")}
              options={[
                { value: "sim", label: "Sim" },
                { value: "nao", label: "Não" },
              ]}
            />
          </Field>

          {/* 2. Não compareceu */}
          {compareceu === "nao" && (
            <>
              <Field label="Deseja remarcar a entrevista?" required>
                <RadioRow
                  name="remarcar"
                  value={remarcar}
                  onChange={(v) => setRemarcar(v as "sim" | "nao")}
                  options={[
                    { value: "sim", label: "Sim" },
                    { value: "nao", label: "Não" },
                  ]}
                />
              </Field>
              <Field label="Justificativa do não comparecimento">
                <textarea
                  value={justNaoCompareceu}
                  onChange={(e) => setJustNaoCompareceu(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Ex.: avisou em cima da hora, sem retorno…"
                />
              </Field>
            </>
          )}

          {/* 3. Compareceu — bloco principal */}
          {compareceu === "sim" && (
            <>
              <Field label="Pontos positivos">
                <textarea
                  value={pontosPositivos}
                  onChange={(e) => setPontosPositivos(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="O que mais gostou no candidato?"
                />
              </Field>
              <Field label="Pontos de atenção / negativos">
                <textarea
                  value={pontosAtencao}
                  onChange={(e) => setPontosAtencao(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Lacunas, dúvidas, pontos a aprofundar…"
                />
              </Field>
              <Field label="Próxima fase planejada">
                <input
                  value={proximaFase}
                  onChange={(e) => setProximaFase(e.target.value)}
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Ex.: Segunda entrevista com diretoria, proposta…"
                />
              </Field>
              <Field label="Decisão do cliente" required>
                <RadioRow
                  name="decisao"
                  value={decisao}
                  onChange={(v) => setDecisao(v as DecisaoCliente)}
                  options={[
                    { value: "avancar", label: "Avançar para próxima fase" },
                    { value: "standby", label: "Stand by" },
                    { value: "reprovar", label: "Reprovar" },
                  ]}
                  vertical
                />
              </Field>
              {decisao === "reprovar" && (
                <Field label="Motivo da reprovação" required>
                  <textarea
                    value={motivoReprovacao}
                    onChange={(e) => setMotivoReprovacao(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Descreva o motivo principal da reprovação…"
                  />
                </Field>
              )}
            </>
          )}
        </div>
      )}
    </ModalShell>
  );
}

// ────────────────────────────────────────────────────────────────────
// Modal especial — 3 perfis reprovados na 1ª leva
// ────────────────────────────────────────────────────────────────────

function Feedback1aLevaModal({
  vagaId,
  onClose,
  onSaved,
}: {
  vagaId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [motivo, setMotivo] = useState("");
  const [direcionamentos, setDirecionamentos] = useState("");
  const podeEnviar = motivo.trim().length > 0;

  function handleConfirmar() {
    if (!podeEnviar) return;
    salvarFeedback1aLeva({
      vagaId,
      motivoPrincipal: motivo.trim(),
      direcionamentos: direcionamentos.trim(),
      criadoEm: new Date().toISOString(),
    });
    toast.success("Feedback enviado à Azumi.", {
      description: "Sua consultora preparará a próxima leva de perfis.",
    });
    onSaved();
  }

  return (
    <ModalShell
      title="Nenhum candidato aprovado até o momento"
      subtitle="Vamos ajustar o direcionamento da próxima leva."
      onClose={onClose}
      maxWidth="max-w-2xl"
      footer={
        <>
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-lg border border-border text-sm font-medium hover:bg-secondary"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            disabled={!podeEnviar}
            className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirmar e enviar à Azumi
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm text-warning/90 space-y-2">
          <p>
            Que pena que não aprovamos nenhum candidato desta primeira leva.
            Por favor, nos conte o motivo principal da desclassificação e novos
            direcionamentos para ajustarmos o perfil.
          </p>
          <p>
            Enviaremos, conforme nossa política, mais três perfis. Caso nenhum
            dos seis perfis (3 iniciais + 3 adicionais) seja aprovado e não
            haja reaproveitamento de candidatos, o processo será encerrado
            automaticamente.
          </p>
        </div>

        <Field
          label="Principal motivo da não aprovação dos 3 perfis"
          required
        >
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Ex.: senioridade técnica abaixo do esperado, fit cultural baixo…"
          />
        </Field>

        <Field label="Direcionamentos adicionais para ajustar o perfil desejado">
          <textarea
            value={direcionamentos}
            onChange={(e) => setDirecionamentos(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Ex.: priorizar candidatos com vivência em fintech, faixa salarial flexível…"
          />
        </Field>
      </div>
    </ModalShell>
  );
}

// ────────────────────────────────────────────────────────────────────
// Pequenos blocos de form
// ────────────────────────────────────────────────────────────────────

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium flex items-center gap-1">
        {label}
        {required && <span className="text-destructive">*</span>}
      </label>
      {children}
    </div>
  );
}

function RadioRow({
  name,
  value,
  onChange,
  options,
  vertical,
}: {
  name: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  vertical?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex gap-2",
        vertical ? "flex-col" : "flex-row flex-wrap"
      )}
    >
      {options.map((opt) => {
        const checked = value === opt.value;
        return (
          <label
            key={opt.value}
            className={cn(
              "inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer",
              checked
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:bg-secondary"
            )}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={checked}
              onChange={() => onChange(opt.value)}
              className="sr-only"
            />
            <span className="h-3.5 w-3.5 rounded-full border border-current flex items-center justify-center">
              {checked && (
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
              )}
            </span>
            {opt.label}
          </label>
        );
      })}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Card resumo do agendamento de entrevista com gestor (visão cliente)
// ────────────────────────────────────────────────────────────────────

function AgendamentoGestorCard({
  ag,
  onResponder,
}: {
  ag: AgendamentoEntrevistaGestor;
  onResponder: () => void;
}) {
  const podeResponder =
    ag.status === "aguardando_resposta_gestor" ||
    ag.status === "candidato_recusou";
  const statusCor =
    ag.status === "confirmado"
      ? "bg-success/15 text-success border-success/30"
      : ag.status === "aguardando_resposta_gestor"
      ? "bg-warning/15 text-warning border-warning/30"
      : "bg-info/15 text-info border-info/30";

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-sm font-medium truncate">
            {ag.candidatoNome}
          </div>
          <div className="text-[11px] text-muted-foreground">
            Gestor: {ag.gestorNome}
          </div>
        </div>
        <span
          className={cn(
            "text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border",
            statusCor
          )}
        >
          {statusAgendamentoLabel(ag.status)}
        </span>
      </div>

      <div className="text-xs space-y-1">
        {ag.escolhido ? (
          <div className="text-success font-medium">
            ✓ {formatarSugestao(ag.escolhido)}
          </div>
        ) : (
          ag.sugestoes.map((s, i) => (
            <div key={i} className="text-muted-foreground">
              <span className="font-data">#{i + 1}</span>{" "}
              {formatarSugestao(s)}
            </div>
          ))
        )}
      </div>

      {podeResponder && (
        <button
          onClick={onResponder}
          className="w-full h-9 rounded-lg bg-primary text-primary-foreground text-xs font-medium inline-flex items-center justify-center gap-1.5"
        >
          <CalendarClock className="h-3.5 w-3.5" />
          {ag.status === "candidato_recusou"
            ? "Sugerir novo horário"
            : "Responder ao agendamento"}
        </button>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Modal: gestor responde sugestões (escolhe ou sugere outro)
// ────────────────────────────────────────────────────────────────────

function RespostaGestorModal({
  agendamentoId,
  onClose,
  onSaved,
}: {
  agendamentoId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const ag = useMemo(
    () => listarAgendamentosDaVaga("").find((a) => a.id === agendamentoId)
      ?? listarAgendamentosDaVaga(
        listarAgendamentosDaVaga("").find((a) => a.id === agendamentoId)?.vagaId ?? ""
      ).find((a) => a.id === agendamentoId)
      ?? null,
    [agendamentoId]
  );
  // Mais simples: pegamos por outro caminho
  const all = useMemo(() => {
    const map: Record<string, AgendamentoEntrevistaGestor> = {};
    return map;
  }, []);
  void all;

  // Releitura direta via store helper
  const agendamento = useMemo(() => {
    // import local evitando cycle
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require("@/data/entrevistaGestorStore") as typeof import("@/data/entrevistaGestorStore");
    return mod.getAgendamento(agendamentoId);
  }, [agendamentoId]);
  void ag;

  const [modo, setModo] = useState<"escolher" | "sugerir">("escolher");
  const [escolha, setEscolha] = useState<number | null>(null);
  const [sugData, setSugData] = useState("");
  const [sugHora, setSugHora] = useState("");
  const [sugModo, setSugModo] = useState<"presencial" | "remoto">("remoto");
  const [sugLocal, setSugLocal] = useState("");
  const [comentario, setComentario] = useState("");

  if (!agendamento) {
    return (
      <ModalShell title="Agendamento" onClose={onClose}>
        <p className="text-sm text-muted-foreground">
          Agendamento não encontrado.
        </p>
      </ModalShell>
    );
  }

  function podeSalvar() {
    if (modo === "escolher") return escolha !== null;
    return !!(sugData && sugHora && sugLocal.trim());
  }

  function salvar() {
    if (!podeSalvar()) return;
    if (modo === "escolher" && escolha !== null) {
      gestorAprovarSugestao(agendamentoId, escolha);
      toast.success("Horário aprovado. A consultora enviará o link ao candidato.");
    } else {
      const nova: SugestaoHorario = {
        data: sugData,
        hora: sugHora,
        modo: sugModo,
        localOuLink: sugLocal.trim(),
      };
      gestorSugerirOutro(agendamentoId, nova, comentario.trim() || undefined);
      toast.success("Nova sugestão enviada à consultora.");
    }
    onSaved();
  }

  return (
    <ModalShell
      title="Responder sugestões de entrevista"
      subtitle={`Candidato: ${agendamento.candidatoNome}`}
      onClose={onClose}
      maxWidth="max-w-2xl"
      footer={
        <>
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-lg border border-border text-sm font-medium hover:bg-secondary"
          >
            Cancelar
          </button>
          <button
            onClick={salvar}
            disabled={!podeSalvar()}
            className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {modo === "escolher" ? "Aprovar horário" : "Enviar nova sugestão"}
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <RadioRow
          name="modo-resposta"
          value={modo}
          onChange={(v) => setModo(v as "escolher" | "sugerir")}
          options={[
            { value: "escolher", label: "Escolher uma das sugestões" },
            { value: "sugerir", label: "Sugerir outro horário" },
          ]}
        />

        {modo === "escolher" && (
          <div className="space-y-2">
            {agendamento.sugestoes.map((s, i) => {
              const checked = escolha === i;
              return (
                <label
                  key={i}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border p-3 cursor-pointer text-sm",
                    checked
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-secondary"
                  )}
                >
                  <input
                    type="radio"
                    name="sug"
                    checked={checked}
                    onChange={() => setEscolha(i)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{formatarSugestao(s)}</div>
                    <div className="text-[11px] text-muted-foreground inline-flex items-center gap-1 mt-0.5">
                      {s.modo === "remoto" ? (
                        <Video className="h-3 w-3" />
                      ) : (
                        <MapPin className="h-3 w-3" />
                      )}
                      {s.localOuLink}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        )}

        {modo === "sugerir" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Data" required>
                <input
                  type="date"
                  value={sugData}
                  onChange={(e) => setSugData(e.target.value)}
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
                />
              </Field>
              <Field label="Horário" required>
                <input
                  type="time"
                  value={sugHora}
                  onChange={(e) => setSugHora(e.target.value)}
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
                />
              </Field>
            </div>
            <Field label="Modo" required>
              <RadioRow
                name="sug-modo"
                value={sugModo}
                onChange={(v) => setSugModo(v as "presencial" | "remoto")}
                options={[
                  { value: "remoto", label: "Remoto" },
                  { value: "presencial", label: "Presencial" },
                ]}
              />
            </Field>
            <Field
              label={sugModo === "remoto" ? "Link da reunião" : "Endereço"}
              required
            >
              <input
                value={sugLocal}
                onChange={(e) => setSugLocal(e.target.value)}
                placeholder={
                  sugModo === "remoto"
                    ? "https://meet.google.com/..."
                    : "Av. Paulista, 1000 — 12º andar"
                }
                className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
              />
            </Field>
            <Field label="Comentário para a consultora">
              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none"
                placeholder="Ex.: prefiro pela manhã, evitar sextas…"
              />
            </Field>
          </div>
        )}
      </div>
    </ModalShell>
  );
}

// ────────────────────────────────────────────────────────────────────
// Modal: parecer do gestor pós-entrevista (Etapa 5)
// ────────────────────────────────────────────────────────────────────

function ParecerGestorModal({
  candidatoId,
  vagaId,
  onClose,
  onSaved,
}: {
  candidatoId: string;
  vagaId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const cand = candidatos.find((c) => c.id === candidatoId);
  const ag = getAgendamentoDoCandidato(candidatoId);

  const [compareceu, setCompareceu] = useState<"sim" | "nao" | "">("");
  const [remarcar, setRemarcar] = useState<"sim" | "nao" | "">("");
  const [pontuacao, setPontuacao] = useState<number>(0);
  const [pontoForte, setPontoForte] = useState("");
  const [pontoAtencao, setPontoAtencao] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [decisao, setDecisao] = useState<"prosseguir" | "standby" | "reprovar" | "">("");
  const [motivoReprovacao, setMotivoReprovacao] = useState("");

  const obsValida = observacoes.trim().length >= 200;

  const podeSalvar = (() => {
    if (compareceu === "") return false;
    if (compareceu === "nao") return remarcar !== "";
    if (compareceu === "sim") {
      if (pontuacao < 1 || pontuacao > 5) return false;
      if (!pontoForte.trim() || !pontoAtencao.trim()) return false;
      if (!obsValida) return false;
      if (!decisao) return false;
      if (decisao === "reprovar" && !motivoReprovacao.trim()) return false;
      return true;
    }
    return false;
  })();

  function salvar() {
    if (!podeSalvar) return;
    const parecer: ParecerGestor = {
      candidatoId,
      vagaId,
      agendamentoId: ag?.id,
      compareceu: compareceu === "sim",
      ...(compareceu === "nao"
        ? {
            remarcar: remarcar === "sim",
            descontinuar: remarcar === "nao",
          }
        : {
            pontuacao,
            pontoForte: pontoForte.trim(),
            pontoAtencao: pontoAtencao.trim(),
            observacoes: observacoes.trim(),
            decisao: decisao as "prosseguir" | "standby" | "reprovar",
            motivoReprovacao:
              decisao === "reprovar" ? motivoReprovacao.trim() : undefined,
          }),
      criadoEm: new Date().toISOString(),
    };
    salvarParecerGestor(parecer);
    toast.success("Parecer do gestor registrado.");
    onSaved();
  }

  return (
    <ModalShell
      title="Parecer do gestor sobre o candidato"
      subtitle={cand ? `${cand.nome} · ${cand.cargo}` : undefined}
      onClose={onClose}
      maxWidth="max-w-2xl"
      footer={
        <>
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-lg border border-border text-sm font-medium hover:bg-secondary"
          >
            Cancelar
          </button>
          <button
            onClick={salvar}
            disabled={!podeSalvar}
            className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Salvar parecer
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <Field label="O candidato compareceu à entrevista?" required>
          <RadioRow
            name="pg-compareceu"
            value={compareceu}
            onChange={(v) => setCompareceu(v as "sim" | "nao")}
            options={[
              { value: "sim", label: "Sim" },
              { value: "nao", label: "Não" },
            ]}
          />
        </Field>

        {compareceu === "nao" && (
          <Field label="Deseja remarcar?" required>
            <RadioRow
              name="pg-remarcar"
              value={remarcar}
              onChange={(v) => setRemarcar(v as "sim" | "nao")}
              options={[
                { value: "sim", label: "Sim, remarcar" },
                { value: "nao", label: "Não, descontinuar" },
              ]}
            />
          </Field>
        )}

        {compareceu === "sim" && (
          <>
            <Field label="Pontuação geral (1 a 5)" required>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPontuacao(n)}
                    className={cn(
                      "h-10 w-10 rounded-lg border flex items-center justify-center",
                      pontuacao >= n
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:bg-secondary"
                    )}
                    aria-label={`${n} estrelas`}
                  >
                    <Star
                      className={cn(
                        "h-4 w-4",
                        pontuacao >= n ? "fill-current" : ""
                      )}
                    />
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Principal ponto forte" required>
              <textarea
                value={pontoForte}
                onChange={(e) => setPontoForte(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none"
                placeholder="Ex.: experiência sólida em liderança…"
              />
            </Field>

            <Field label="Principal ponto de atenção" required>
              <textarea
                value={pontoAtencao}
                onChange={(e) => setPontoAtencao(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none"
                placeholder="Ex.: pouca vivência com o stack…"
              />
            </Field>

            <Field label="Observações detalhadas (mínimo 200 caracteres)" required>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={6}
                className={cn(
                  "w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none",
                  obsValida ? "border-input" : "border-warning/50"
                )}
                placeholder="Descreva a entrevista em detalhes — responsabilidades futuras, fit cultural, expectativas etc."
              />
              <div
                className={cn(
                  "text-[11px] mt-1",
                  obsValida ? "text-muted-foreground" : "text-warning"
                )}
              >
                {observacoes.trim().length}/200
              </div>
            </Field>

            <Field label="Decisão" required>
              <RadioRow
                name="pg-decisao"
                value={decisao}
                onChange={(v) =>
                  setDecisao(v as "prosseguir" | "standby" | "reprovar")
                }
                options={[
                  { value: "prosseguir", label: "Prosseguir" },
                  { value: "standby", label: "Stand by" },
                  { value: "reprovar", label: "Reprovar" },
                ]}
                vertical
              />
            </Field>

            {decisao === "reprovar" && (
              <Field label="Motivo da reprovação" required>
                <textarea
                  value={motivoReprovacao}
                  onChange={(e) => setMotivoReprovacao(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none"
                  placeholder="Descreva o motivo principal…"
                />
              </Field>
            )}
          </>
        )}
      </div>
    </ModalShell>
  );
}

// Suprime warning de import não usado quando módulo é tree-shaken
void ClipboardList;
void getGestorDaVaga;
