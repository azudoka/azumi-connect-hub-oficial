/**
 * Store mock de Atração — visão Cliente.
 *
 * Persiste em localStorage para que admin (VagaDetalhe) e cliente
 * (VagaDetalheCliente) compartilhem o mesmo estado de demonstração.
 *
 * Conteúdo:
 *  - relatoriosEnviados[candidatoId] — relatório que a Azumi enviou ao cliente.
 *    Só candidatos presentes aqui aparecem na visão do cliente.
 *  - entrevistasRealizadas[candidatoId] — flag/data de quando a entrevista
 *    com o cliente ocorreu (libera o botão "Gerar parecer da entrevista").
 *  - pareceresCliente[candidatoId] — parecer do cliente pós-entrevista.
 *  - feedbacks1aLeva[vagaId] — feedback amplo quando o cliente reprova
 *    todos os 3 perfis da 1ª leva.
 *
 * Não usar para regras de negócio reais — é apenas demo.
 */

export interface RelatorioEnviado {
  candidatoId: string;
  vagaId: string;
  // Resumo profissional/career synthesis que vai para o cliente.
  resumo: string;
  // Resumo DISC textual (nada técnico demais, conforme handoff).
  discResumo: string;
  // Próxima fase prevista para o candidato (mock para liberar o parecer).
  fasePlanejada?: string;
  enviadoEm: string;
}

export interface ParecerCliente {
  candidatoId: string;
  vagaId: string;
  compareceu: boolean;
  remarcar?: boolean;
  justificativaNaoCompareceu?: string;
  pontosPositivos?: string;
  pontosAtencao?: string;
  proximaFasePlanejada?: string;
  decisao?: "avancar" | "standby" | "reprovar";
  motivoReprovacao?: string;
  criadoEm: string;
}

export interface FeedbackPrimeiraLeva {
  vagaId: string;
  motivoPrincipal: string;
  direcionamentos: string;
  criadoEm: string;
}

const KEY_RELATORIOS = "azumi_atrac_relatorios_enviados";
const KEY_ENTREVISTAS = "azumi_atrac_entrevistas";
const KEY_PARECERES = "azumi_atrac_pareceres_cliente";
const KEY_FEEDBACKS = "azumi_atrac_feedbacks_1aleva";

// ────────────────────────────────────────────────────────────────────
// Helpers de IO
// ────────────────────────────────────────────────────────────────────

function readMap<T>(key: string): Record<string, T> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, T>) : {};
  } catch {
    return {};
  }
}

function writeMap<T>(key: string, value: Record<string, T>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignora quota / modo privado
  }
}

// ────────────────────────────────────────────────────────────────────
// Seed para a demo (uma única vez por navegador)
// ────────────────────────────────────────────────────────────────────

const SEED_FLAG_KEY = "azumi_atrac_seed_v1";

function seedDemoOnce() {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(SEED_FLAG_KEY)) return;

  // Para a demo: candidatos do mock c1, c2, c3 já têm relatório enviado
  // em suas respectivas vagas (v1, v2, v3). Entrevistas marcadas como
  // realizadas para que o botão de parecer apareça imediatamente.
  const relatorios: Record<string, RelatorioEnviado> = {
    c1: {
      candidatoId: "c1",
      vagaId: "v1",
      resumo:
        "Profissional sênior em TI com 12 anos de experiência liderando squads multidisciplinares. Última passagem como Head de Tecnologia em fintech de médio porte.",
      discResumo:
        "Perfil dominante (D) com forte orientação a resultados e tomada de decisão rápida.",
      fasePlanejada: "Entrevista com cliente",
      enviadoEm: new Date().toISOString(),
    },
    c2: {
      candidatoId: "c2",
      vagaId: "v2",
      resumo:
        "Analista de marketing com foco em performance digital e branding. Atuação prévia em consumer goods e marketplaces.",
      discResumo: "Perfil influente (I), comunicação forte e ótimo fit cultural.",
      fasePlanejada: "Entrevista com cliente",
      enviadoEm: new Date().toISOString(),
    },
    c3: {
      candidatoId: "c3",
      vagaId: "v3",
      resumo:
        "Desenvolvedor Full Stack sênior, especialista em React/Node, com experiência em arquiteturas distribuídas.",
      discResumo: "Perfil consciencioso (C), alta atenção a detalhes e qualidade técnica.",
      fasePlanejada: "Entrevista com cliente",
      enviadoEm: new Date().toISOString(),
    },
  };

  const entrevistas: Record<string, { realizadaEm: string }> = {
    c1: { realizadaEm: new Date().toISOString() },
    c2: { realizadaEm: new Date().toISOString() },
    c3: { realizadaEm: new Date().toISOString() },
  };

  writeMap(KEY_RELATORIOS, relatorios);
  writeMap(KEY_ENTREVISTAS, entrevistas);
  window.localStorage.setItem(SEED_FLAG_KEY, "1");
}

seedDemoOnce();

// ────────────────────────────────────────────────────────────────────
// API pública
// ────────────────────────────────────────────────────────────────────

export function listarRelatoriosEnviados(): Record<string, RelatorioEnviado> {
  return readMap<RelatorioEnviado>(KEY_RELATORIOS);
}

export function getRelatorioEnviado(candidatoId: string): RelatorioEnviado | null {
  return listarRelatoriosEnviados()[candidatoId] ?? null;
}

export function candidatosComRelatorioPorVaga(vagaId: string): string[] {
  const all = listarRelatoriosEnviados();
  return Object.values(all)
    .filter((r) => r.vagaId === vagaId)
    .map((r) => r.candidatoId);
}

export function entrevistaRealizada(candidatoId: string): boolean {
  const map = readMap<{ realizadaEm: string }>(KEY_ENTREVISTAS);
  return !!map[candidatoId];
}

export function listarPareceres(): Record<string, ParecerCliente> {
  return readMap<ParecerCliente>(KEY_PARECERES);
}

export function getParecerCliente(candidatoId: string): ParecerCliente | null {
  return listarPareceres()[candidatoId] ?? null;
}

export function salvarParecerCliente(parecer: ParecerCliente): void {
  const all = listarPareceres();
  all[parecer.candidatoId] = parecer;
  writeMap(KEY_PARECERES, all);
}

export function listarFeedbacks1aLeva(): Record<string, FeedbackPrimeiraLeva> {
  return readMap<FeedbackPrimeiraLeva>(KEY_FEEDBACKS);
}

export function getFeedback1aLeva(vagaId: string): FeedbackPrimeiraLeva | null {
  return listarFeedbacks1aLeva()[vagaId] ?? null;
}

export function salvarFeedback1aLeva(fb: FeedbackPrimeiraLeva): void {
  const all = listarFeedbacks1aLeva();
  all[fb.vagaId] = fb;
  writeMap(KEY_FEEDBACKS, all);
}

/**
 * Conta quantos candidatos da 1ª leva (até 3 primeiros com relatório enviado
 * em ordem do candidatoId, mock) foram reprovados pelo cliente.
 */
export function reprovadosNaPrimeiraLeva(vagaId: string): {
  totalLeva: number;
  reprovados: number;
} {
  const ids = candidatosComRelatorioPorVaga(vagaId).slice(0, 3);
  const pareceres = listarPareceres();
  const reprovados = ids.filter(
    (id) => pareceres[id]?.decisao === "reprovar"
  ).length;
  return { totalLeva: ids.length, reprovados };
}
