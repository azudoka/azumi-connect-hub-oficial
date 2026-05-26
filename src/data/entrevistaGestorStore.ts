/**
 * Store mock — fluxo "Entrevista com Gestor" (Documento Mestre, Etapa 5).
 *
 * Persiste em localStorage para que admin (VagaDetalhe), cliente
 * (VagaDetalheCliente) e a rota pública /confirmar-entrevista compartilhem
 * o mesmo estado de demonstração.
 */

export type StatusAgendamento =
  | "aguardando_resposta_gestor" // consultor enviou as 2 sugestões
  | "aprovado_gestor"            // gestor aprovou um dos horários
  | "nova_sugestao_gestor"       // gestor sugeriu outro horário
  | "aguardando_confirmacao_candidato" // link enviado ao candidato
  | "confirmado"                 // candidato confirmou via link
  | "candidato_recusou";         // candidato pediu outro horário

export type ModoEntrevista = "presencial" | "remoto";

/**
 * Tipo da entrevista agendada.
 * - "gestor": entrevista do candidato com o gestor da área (Etapa 5).
 * - "cliente_final": entrevista final do candidato com o cliente/decisor,
 *   disparada automaticamente quando o cliente dá parecer "avançar"
 *   após a entrevista com gestor.
 */
export type TipoAgendamento = "gestor" | "cliente_final";

export interface SugestaoHorario {
  data: string; // yyyy-mm-dd
  hora: string; // HH:MM
  modo: ModoEntrevista;
  localOuLink: string;
}

export interface AgendamentoEntrevistaGestor {
  id: string;
  vagaId: string;
  candidatoId: string;
  candidatoNome: string;
  candidatoEmail: string; // mock
  gestorId: string;
  gestorNome: string;
  empresaNome: string;
  sugestoes: SugestaoHorario[];
  status: StatusAgendamento;
  /** Definido após gestor aprovar/sugerir e/ou candidato confirmar. */
  escolhido?: SugestaoHorario;
  /** Comentário do gestor quando "Sugerir outro horário". */
  comentarioGestor?: string;
  /** Comentário do candidato quando recusa. */
  comentarioCandidato?: string;
  /** Link público mock para o candidato confirmar. */
  linkConfirmacao?: string;
  criadoEm: string;
  atualizadoEm: string;
  historico: HistoricoEntrada[];
}

export interface HistoricoEntrada {
  quando: string;
  ator: "consultor" | "gestor" | "candidato" | "sistema";
  texto: string;
}

export interface ParecerGestor {
  candidatoId: string;
  vagaId: string;
  agendamentoId?: string;
  compareceu: boolean;
  remarcar?: boolean;
  descontinuar?: boolean;
  pontuacao?: number; // 1..5
  pontoForte?: string;
  pontoAtencao?: string;
  observacoes?: string; // textarea longa (mín 200)
  decisao?: "prosseguir" | "standby" | "reprovar";
  motivoReprovacao?: string;
  criadoEm: string;
}

export interface RealinhamentoLeva {
  vagaId: string;
  expectativa: string;
  perfilDesejado: string;
  ajustesNecessarios: string;
  criadoEm: string;
}

const KEY_AGEND = "azumi_entg_agendamentos";
const KEY_PARECERES = "azumi_entg_pareceres";
const KEY_REALINHA = "azumi_entg_realinhamento";

// ────────────────────────────────────────────────────────────────────
// IO
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
    // ignore
  }
}

const subs = new Set<() => void>();
function notify() {
  subs.forEach((fn) => fn());
}
export function subscribeEntrevistaGestor(fn: () => void): () => void {
  subs.add(fn);
  return () => subs.delete(fn);
}

// ────────────────────────────────────────────────────────────────────
// Agendamentos
// ────────────────────────────────────────────────────────────────────

export function listarAgendamentos(): Record<string, AgendamentoEntrevistaGestor> {
  return readMap<AgendamentoEntrevistaGestor>(KEY_AGEND);
}

export function getAgendamento(id: string): AgendamentoEntrevistaGestor | null {
  return listarAgendamentos()[id] ?? null;
}

export function getAgendamentoDoCandidato(
  candidatoId: string
): AgendamentoEntrevistaGestor | null {
  const all = Object.values(listarAgendamentos());
  // pega o mais recente (por atualizadoEm)
  const ordenado = all
    .filter((a) => a.candidatoId === candidatoId)
    .sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm));
  return ordenado[0] ?? null;
}

export function listarAgendamentosDaVaga(vagaId: string): AgendamentoEntrevistaGestor[] {
  return Object.values(listarAgendamentos()).filter((a) => a.vagaId === vagaId);
}

function persistirAgendamento(ag: AgendamentoEntrevistaGestor): void {
  const all = listarAgendamentos();
  all[ag.id] = ag;
  writeMap(KEY_AGEND, all);
  notify();
}

export function criarAgendamento(input: {
  vagaId: string;
  candidatoId: string;
  candidatoNome: string;
  candidatoEmail: string;
  gestorId: string;
  gestorNome: string;
  empresaNome: string;
  sugestoes: SugestaoHorario[];
}): AgendamentoEntrevistaGestor {
  const id = `ag-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const agora = new Date().toISOString();
  const ag: AgendamentoEntrevistaGestor = {
    id,
    vagaId: input.vagaId,
    candidatoId: input.candidatoId,
    candidatoNome: input.candidatoNome,
    candidatoEmail: input.candidatoEmail,
    gestorId: input.gestorId,
    gestorNome: input.gestorNome,
    empresaNome: input.empresaNome,
    sugestoes: input.sugestoes,
    status: "aguardando_resposta_gestor",
    criadoEm: agora,
    atualizadoEm: agora,
    historico: [
      {
        quando: agora,
        ator: "consultor",
        texto: `Sugestões de entrevista enviadas ao gestor (${input.gestorNome}).`,
      },
    ],
  };
  persistirAgendamento(ag);
  return ag;
}

/** Gestor aprova uma das sugestões. */
export function gestorAprovarSugestao(
  agendamentoId: string,
  sugestaoIndex: number
): AgendamentoEntrevistaGestor | null {
  const ag = getAgendamento(agendamentoId);
  if (!ag) return null;
  const escolha = ag.sugestoes[sugestaoIndex];
  if (!escolha) return null;
  const agora = new Date().toISOString();
  const novo: AgendamentoEntrevistaGestor = {
    ...ag,
    status: "aprovado_gestor",
    escolhido: escolha,
    atualizadoEm: agora,
    historico: [
      ...ag.historico,
      {
        quando: agora,
        ator: "gestor",
        texto: `Gestor aprovou o horário ${formatarSugestao(escolha)}.`,
      },
    ],
  };
  persistirAgendamento(novo);
  return novo;
}

/** Gestor sugere outro horário. */
export function gestorSugerirOutro(
  agendamentoId: string,
  sugestao: SugestaoHorario,
  comentario?: string
): AgendamentoEntrevistaGestor | null {
  const ag = getAgendamento(agendamentoId);
  if (!ag) return null;
  const agora = new Date().toISOString();
  const novo: AgendamentoEntrevistaGestor = {
    ...ag,
    status: "nova_sugestao_gestor",
    escolhido: sugestao,
    comentarioGestor: comentario,
    atualizadoEm: agora,
    historico: [
      ...ag.historico,
      {
        quando: agora,
        ator: "gestor",
        texto: `Gestor sugeriu novo horário: ${formatarSugestao(sugestao)}.${
          comentario ? ` (${comentario})` : ""
        }`,
      },
    ],
  };
  persistirAgendamento(novo);
  return novo;
}

/** Consultor envia o link de confirmação ao candidato. */
export function enviarParaCandidatoConfirmar(
  agendamentoId: string,
  origem: string = "https://azumi.jobs"
): AgendamentoEntrevistaGestor | null {
  const ag = getAgendamento(agendamentoId);
  if (!ag) return null;
  const link = `${origem}/confirmar-entrevista/${ag.id}?cand=${ag.candidatoId}`;
  const agora = new Date().toISOString();
  const novo: AgendamentoEntrevistaGestor = {
    ...ag,
    status: "aguardando_confirmacao_candidato",
    linkConfirmacao: link,
    atualizadoEm: agora,
    historico: [
      ...ag.historico,
      {
        quando: agora,
        ator: "consultor",
        texto: `Link de confirmação enviado ao candidato.`,
      },
    ],
  };
  persistirAgendamento(novo);
  return novo;
}

/** Candidato confirma a entrevista via link. */
export function candidatoConfirmar(
  agendamentoId: string
): AgendamentoEntrevistaGestor | null {
  const ag = getAgendamento(agendamentoId);
  if (!ag || !ag.escolhido) return null;
  const agora = new Date().toISOString();
  const novo: AgendamentoEntrevistaGestor = {
    ...ag,
    status: "confirmado",
    atualizadoEm: agora,
    historico: [
      ...ag.historico,
      {
        quando: agora,
        ator: "candidato",
        texto: `Entrevista confirmada para ${formatarSugestao(ag.escolhido)}.`,
      },
    ],
  };
  persistirAgendamento(novo);
  return novo;
}

/** Candidato recusa o horário. */
export function candidatoRecusar(
  agendamentoId: string,
  comentario?: string
): AgendamentoEntrevistaGestor | null {
  const ag = getAgendamento(agendamentoId);
  if (!ag) return null;
  const agora = new Date().toISOString();
  const novo: AgendamentoEntrevistaGestor = {
    ...ag,
    status: "candidato_recusou",
    comentarioCandidato: comentario,
    atualizadoEm: agora,
    historico: [
      ...ag.historico,
      {
        quando: agora,
        ator: "candidato",
        texto: `Candidato não pôde nesse horário.${
          comentario ? ` Comentário: ${comentario}` : ""
        }`,
      },
    ],
  };
  persistirAgendamento(novo);
  return novo;
}

// ────────────────────────────────────────────────────────────────────
// Pareceres do Gestor
// ────────────────────────────────────────────────────────────────────

export function listarPareceresGestor(): Record<string, ParecerGestor> {
  return readMap<ParecerGestor>(KEY_PARECERES);
}

export function getParecerGestor(candidatoId: string): ParecerGestor | null {
  return listarPareceresGestor()[candidatoId] ?? null;
}

export function salvarParecerGestor(p: ParecerGestor): void {
  const all = listarPareceresGestor();
  all[p.candidatoId] = p;
  writeMap(KEY_PARECERES, all);
  notify();
}

/** Conta reprovados do tipo "Reprovar" entre os 3 primeiros candidatos da vaga. */
export function reprovadosNaPrimeiraLevaGestor(
  vagaId: string,
  primeiraLevaIds: string[]
): { totalLeva: number; reprovados: number } {
  const ids = primeiraLevaIds.slice(0, 3);
  const pareceres = listarPareceresGestor();
  const reprovados = ids.filter((id) => {
    const p = pareceres[id];
    return p && p.vagaId === vagaId && p.decisao === "reprovar";
  }).length;
  return { totalLeva: ids.length, reprovados };
}

// ────────────────────────────────────────────────────────────────────
// Realinhamento (3 perfis reprovados)
// ────────────────────────────────────────────────────────────────────

export function listarRealinhamentos(): Record<string, RealinhamentoLeva> {
  return readMap<RealinhamentoLeva>(KEY_REALINHA);
}

export function getRealinhamento(vagaId: string): RealinhamentoLeva | null {
  return listarRealinhamentos()[vagaId] ?? null;
}

export function salvarRealinhamento(r: RealinhamentoLeva): void {
  const all = listarRealinhamentos();
  all[r.vagaId] = r;
  writeMap(KEY_REALINHA, all);
  notify();
}

// ────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────

export function formatarSugestao(s: SugestaoHorario): string {
  const [y, m, d] = s.data.split("-");
  return `${d}/${m}/${y} às ${s.hora} (${s.modo === "remoto" ? "remoto" : "presencial"})`;
}

export function statusAgendamentoLabel(s: StatusAgendamento): string {
  switch (s) {
    case "aguardando_resposta_gestor":
      return "Aguardando resposta do gestor";
    case "aprovado_gestor":
      return "Gestor aprovou — enviar ao candidato";
    case "nova_sugestao_gestor":
      return "Gestor sugeriu novo horário";
    case "aguardando_confirmacao_candidato":
      return "Aguardando confirmação do candidato";
    case "confirmado":
      return "Entrevista confirmada";
    case "candidato_recusou":
      return "Candidato pediu outro horário";
  }
}
