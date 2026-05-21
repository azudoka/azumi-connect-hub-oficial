// =============================================================================
// MOCK VALORE DATA — exclusivo para Fernanda Albuquerque (empresaId: "valore")
// Real mode (sem banner de demo). Dados consumidos pelas páginas /cliente/*.
// =============================================================================

export const VALORE_EMPRESA_ID = "valore";

export interface ValoreVaga {
  id: string;
  titulo: string;
  status: "andamento" | "finalizada";
  etapa: string;
  perfisEnviados: number;
}

export const vagasValore: ValoreVaga[] = [
  { id: "val-v1", titulo: "Analista RH",          status: "andamento",  etapa: "Triagem",      perfisEnviados: 4 },
  { id: "val-v2", titulo: "Consultora Comercial", status: "finalizada", etapa: "Contratada",   perfisEnviados: 1 },
];

export interface ValoreCandidato {
  id: string;
  vagaId: string;
  nome: string;
  cargo: string;
  disc: { D: number; I: number; S: number; C: number };
}

export const candidatosValore: ValoreCandidato[] = [
  { id: "val-c1", vagaId: "val-v1", nome: "Aline Ribeiro",  cargo: "Analista RH", disc: { D: 35, I: 70, S: 65, C: 50 } },
  { id: "val-c2", vagaId: "val-v1", nome: "Bruno Carvalho", cargo: "Analista RH", disc: { D: 60, I: 45, S: 50, C: 75 } },
];

export type ValoreEntregavelStatus = "aprovado" | "aguardando_parecer" | "em_andamento";

export interface ValoreEntregavel {
  id: string;
  titulo: string;
  status: ValoreEntregavelStatus;
}

export interface ValoreProjeto {
  id: string;
  nome: string;
  progresso: number;
  entregaveis: ValoreEntregavel[];
}

export const projetosValore: ValoreProjeto[] = [
  {
    id: "val-p1",
    nome: "Reestruturação do RH",
    progresso: 55,
    entregaveis: [
      { id: "val-p1-e1", titulo: "Diagnóstico inicial",     status: "aprovado" },
      { id: "val-p1-e2", titulo: "Mapa de cargos",          status: "aguardando_parecer" },
      { id: "val-p1-e3", titulo: "Política de remuneração", status: "em_andamento" },
    ],
  },
];

export interface ValoreSolicitacao {
  id: string;
  codigo: string;
  titulo: string;
  tipo: string;
  status: "aberta" | "andamento" | "aguardando_cliente" | "finalizada" | "cancelada";
  criadaEm: string;
  descricao?: string;
}

export const solicitacoesValore: ValoreSolicitacao[] = [
  { id: "val-s1", codigo: "SOL-VAL-001", titulo: "Suporte para entrevista — Analista RH", tipo: "duvida", status: "andamento", criadaEm: "2026-05-10", descricao: "Suporte da consultora na próxima entrevista." },
  { id: "val-s2", codigo: "SOL-VAL-002", titulo: "Modelo de avaliação de desempenho",     tipo: "duvida", status: "finalizada", criadaEm: "2026-03-15", descricao: "Modelo entregue e aprovado." },
];

export interface ValoreComunicado {
  id: string;
  titulo: string;
  resumo: string;
  data: string;
  tipo: "atualizacao" | "aviso" | "endomarketing" | "alerta" | "evento";
}

export const comunicadosValore: ValoreComunicado[] = [
  { id: "val-cm1", titulo: "Atualização do processo seletivo — Analista RH", resumo: "O processo avançou para shortlist. Em breve enviaremos os perfis para sua avaliação.", data: "2026-05-15", tipo: "atualizacao" },
];

export type ValoreEventoTipo = "reuniao" | "prazo" | "entrevista" | "comunicado" | "ferias" | "feriado";

export interface ValoreEvento {
  id: string;
  titulo: string;
  data: string;
  hora?: string;
  tipo: ValoreEventoTipo;
}

function isoMesAtual(dia: number, hora?: string) {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth(), dia);
  if (hora) {
    const [h, m] = hora.split(":").map(Number);
    d.setHours(h, m, 0, 0);
  }
  return d.toISOString();
}

export const eventosValore: ValoreEvento[] = [
  { id: "val-ev1", titulo: "Reunião com consultora — Rafael", data: isoMesAtual(12, "10:00"), hora: "10:00", tipo: "reuniao" },
  { id: "val-ev2", titulo: "Entrevista — Analista RH",        data: isoMesAtual(18, "15:00"), hora: "15:00", tipo: "entrevista" },
  { id: "val-ev3", titulo: "Prazo — Aprovação shortlist",     data: isoMesAtual(22),                          tipo: "prazo" },
];
