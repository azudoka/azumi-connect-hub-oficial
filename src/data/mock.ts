// Dados mockados centralizados para a plataforma Azumi Connect

export type StatusKey =
  | "ativa"
  | "andamento"
  | "aguardando"
  | "bloqueada"
  | "atrasada"
  | "concluida"
  | "cancelada"
  | "analise";

export const empresas = [
  { id: "kentaki", nome: "Kentaki Foods", segmento: "Alimentação", consultor: "Ana Beatriz", colaboradores: 142 },
  { id: "maverick", nome: "Grupo Maverick", segmento: "Indústria", consultor: "Rafael Moura", colaboradores: 380 },
  { id: "mira", nome: "Studio Mira", segmento: "Design & Mídia", consultor: "Camila Torres", colaboradores: 28 },
  { id: "techplural", nome: "Tech Plural", segmento: "Tecnologia", consultor: "Ana Beatriz", colaboradores: 85 },
  { id: "alvo", nome: "Alvo Digital", segmento: "Marketing", consultor: "Rafael Moura", colaboradores: 47 },
  { id: "valore", nome: "Valore Consultoria", segmento: "Consultoria", consultor: "Rafael Moura", colaboradores: 32 },
  { id: "horizonte", nome: "Construtora Horizonte", segmento: "Construção Civil", consultor: "Rafael Moura", colaboradores: 64 },
  { id: "vita", nome: "Clínica Vita Saúde", segmento: "Saúde", consultor: "Juliana Costa", colaboradores: 110 },
];

export const consultores = [
  { id: "ab", nome: "Ana Beatriz", iniciais: "AB", role: "Consultora Sênior", online: true },
  { id: "rm", nome: "Rafael Moura", iniciais: "RM", role: "Consultor Pleno", online: true },
  { id: "ct", nome: "Camila Torres", iniciais: "CT", role: "Consultora Sênior", online: false },
];

export const vagas = [
  {
    id: "v1",
    titulo: "Gerente de TI",
    empresa: "Kentaki Foods",
    empresaId: "kentaki",
    filial: "São Paulo — Matriz",
    status: "ativa" as StatusKey,
    etapa: "Triagem",
    sla: 65,
    diasAbertos: 14,
    diasPrevistos: 30,
    candidatosTotal: 48,
    candidatosTriagem: 18,
    candidatosEntrevista: 7,
    candidatosEnviados: 3,
    candidatosContratados: 0,
    consultor: "Ana Beatriz",
    modalidade: "Híbrido",
    beneficios: ["vale_transporte", "vale_refeicao", "plano_saude", "plano_odontologico", "gympass"],
  },
  {
    id: "v2",
    titulo: "Analista de Marketing",
    empresa: "Grupo Maverick",
    empresaId: "maverick",
    filial: "Curitiba",
    status: "andamento" as StatusKey,
    etapa: "Perfis enviados",
    sla: 82,
    diasAbertos: 22,
    diasPrevistos: 28,
    candidatosTotal: 73,
    candidatosTriagem: 24,
    candidatosEntrevista: 10,
    candidatosEnviados: 4,
    candidatosContratados: 0,
    consultor: "Rafael Moura",
    modalidade: "Presencial",
    beneficios: ["vale_transporte", "vale_refeicao", "plano_saude", "seguro_vida"],
  },
  {
    id: "v3",
    titulo: "Dev Full Stack",
    empresa: "Tech Plural",
    empresaId: "techplural",
    filial: "Remoto",
    status: "atrasada" as StatusKey,
    etapa: "Entrevista",
    sla: 105,
    diasAbertos: 38,
    diasPrevistos: 35,
    candidatosTotal: 92,
    candidatosTriagem: 31,
    candidatosEntrevista: 12,
    candidatosEnviados: 5,
    candidatosContratados: 0,
    consultor: "Ana Beatriz",
    modalidade: "Remoto",
    beneficios: ["vale_refeicao", "plano_saude", "home_office", "auxilio_creche", "gympass", "stock_options"],
  },
  {
    id: "v4",
    titulo: "Coordenador de RH",
    empresa: "Alvo Digital",
    empresaId: "alvo",
    filial: "São Paulo",
    status: "ativa" as StatusKey,
    etapa: "Briefing",
    sla: 25,
    diasAbertos: 5,
    diasPrevistos: 30,
    candidatosTotal: 12,
    candidatosTriagem: 4,
    candidatosEntrevista: 0,
    candidatosEnviados: 0,
    candidatosContratados: 0,
    consultor: "Camila Torres",
    modalidade: "Híbrido",
    beneficios: ["vale_transporte", "vale_refeicao", "plano_saude", "auxilio_educacao"],
  },
  {
    id: "v-hz-1",
    titulo: "Engenheiro Civil Pleno",
    empresa: "Construtora Horizonte",
    empresaId: "horizonte",
    filial: "Curitiba — Matriz",
    status: "ativa" as StatusKey,
    etapa: "Triagem",
    sla: 45,
    diasAbertos: 11,
    diasPrevistos: 35,
    candidatosTotal: 24,
    candidatosTriagem: 10,
    candidatosEntrevista: 3,
    candidatosEnviados: 2,
    candidatosContratados: 0,
    consultor: "Rafael Moura",
    modalidade: "Presencial",
    beneficios: ["vale_transporte", "vale_refeicao", "plano_saude", "seguro_vida"],
  },
  {
    id: "v-vt-1",
    titulo: "Enfermeiro(a) Assistencial",
    empresa: "Clínica Vita Saúde",
    empresaId: "vita",
    filial: "Unidade Centro",
    status: "ativa" as StatusKey,
    etapa: "Perfis enviados",
    sla: 70,
    diasAbertos: 19,
    diasPrevistos: 30,
    candidatosTotal: 56,
    candidatosTriagem: 20,
    candidatosEntrevista: 8,
    candidatosEnviados: 4,
    candidatosContratados: 0,
    consultor: "Juliana Costa",
    modalidade: "Presencial",
    beneficios: ["vale_transporte", "vale_refeicao", "plano_saude", "plano_odontologico"],
  },
  {
    id: "v-vt-2",
    titulo: "Recepcionista Bilíngue",
    empresa: "Clínica Vita Saúde",
    empresaId: "vita",
    filial: "Unidade Norte",
    status: "ativa" as StatusKey,
    etapa: "Triagem",
    sla: 30,
    diasAbertos: 7,
    diasPrevistos: 25,
    candidatosTotal: 19,
    candidatosTriagem: 8,
    candidatosEntrevista: 2,
    candidatosEnviados: 1,
    candidatosContratados: 0,
    consultor: "Juliana Costa",
    modalidade: "Presencial",
    beneficios: ["vale_transporte", "vale_refeicao", "plano_saude"],
  },
  {
    id: "v-valore-1",
    titulo: "Analista RH",
    empresa: "Valore Consultoria",
    empresaId: "valore",
    filial: "Curitiba — Matriz",
    status: "ativa" as StatusKey,
    etapa: "Triagem",
    sla: 40,
    diasAbertos: 8,
    diasPrevistos: 30,
    candidatosTotal: 22,
    candidatosTriagem: 9,
    candidatosEntrevista: 3,
    candidatosEnviados: 4,
    candidatosContratados: 0,
    consultor: "Rafael Moura",
    modalidade: "Híbrido",
    beneficios: ["vale_transporte", "vale_refeicao", "plano_saude"],
  },
  {
    id: "v-valore-2",
    titulo: "Consultora Comercial",
    empresa: "Valore Consultoria",
    empresaId: "valore",
    filial: "Curitiba — Matriz",
    status: "concluida" as StatusKey,
    etapa: "Contratada",
    sla: 100,
    diasAbertos: 35,
    diasPrevistos: 30,
    candidatosTotal: 18,
    candidatosTriagem: 6,
    candidatosEntrevista: 4,
    candidatosEnviados: 3,
    candidatosContratados: 1,
    consultor: "Rafael Moura",
    modalidade: "Presencial",
    beneficios: ["vale_transporte", "vale_refeicao", "plano_saude", "bonus"],
  },
];

// ────────────────────────────────────────────────────────────────────
// Gestor cliente da vaga + janela de disponibilidade
// (mock — em produção viria do cadastro da vaga)
// ────────────────────────────────────────────────────────────────────

export interface JanelaDisponibilidade {
  /** Dias da semana permitidos: 0=dom, 1=seg, ..., 6=sáb */
  diasSemana: number[];
  /** Faixas de horário no dia, ex.: [{inicio:"09:00", fim:"12:00"}] */
  blocos: { inicio: string; fim: string }[];
}

export interface GestorVaga {
  id: string;
  nome: string;
  cargo: string;
  email: string;
  janela: JanelaDisponibilidade;
}

export const gestorPorVaga: Record<string, GestorVaga> = {
  v1: {
    id: "g-v1",
    nome: "Helena Sato",
    cargo: "Diretora de TI — Kentaki Foods",
    email: "helena.sato@kentaki.com",
    janela: {
      diasSemana: [1, 2, 3, 4, 5],
      blocos: [
        { inicio: "09:00", fim: "12:00" },
        { inicio: "14:00", fim: "18:00" },
      ],
    },
  },
  v2: {
    id: "g-v2",
    nome: "Rafael Pinheiro",
    cargo: "Head de Marketing — Grupo Maverick",
    email: "rafael.pinheiro@maverick.com",
    janela: {
      diasSemana: [2, 3, 4],
      blocos: [
        { inicio: "10:00", fim: "12:30" },
        { inicio: "15:00", fim: "17:00" },
      ],
    },
  },
  v3: {
    id: "g-v3",
    nome: "Camila Werneck",
    cargo: "CTO — Tech Plural",
    email: "camila.werneck@techplural.com",
    janela: {
      diasSemana: [1, 2, 3, 4, 5],
      blocos: [{ inicio: "13:00", fim: "19:00" }],
    },
  },
  v4: {
    id: "g-v4",
    nome: "Diego Alencar",
    cargo: "Head de RH — Alvo Digital",
    email: "diego.alencar@alvo.com",
    janela: {
      diasSemana: [1, 3, 5],
      blocos: [{ inicio: "09:00", fim: "11:30" }],
    },
  },
};

export function getGestorDaVaga(vagaId: string): GestorVaga | null {
  return gestorPorVaga[vagaId] ?? null;
}


// Mapa de labels legíveis em PT-BR para benefícios (B06)
export const beneficiosLabels: Record<string, string> = {
  vale_transporte: "Vale-transporte",
  vale_refeicao: "Vale-refeição",
  vale_alimentacao: "Vale-alimentação",
  plano_saude: "Plano de saúde",
  plano_odontologico: "Plano odontológico",
  seguro_vida: "Seguro de vida",
  gympass: "Gympass",
  home_office: "Home office",
  auxilio_creche: "Auxílio-creche",
  auxilio_educacao: "Auxílio-educação",
  stock_options: "Stock options",
  ppr: "PPR",
};

// Mapa defensivo de cores por status de etapa (B04)
export type EtapaStyle = { color: string; bg: string; ring: string; label: string };
export const etapaStyles: Record<string, EtapaStyle> = {
  concluida:  { color: "text-success",      bg: "bg-success",      ring: "ring-success/30",      label: "Concluída" },
  andamento:  { color: "text-primary",      bg: "bg-primary",      ring: "ring-primary/30",      label: "Em andamento" },
  aguardando: { color: "text-muted-foreground", bg: "bg-muted",    ring: "ring-border",          label: "Aguardando" },
  bloqueada:  { color: "text-destructive",  bg: "bg-destructive",  ring: "ring-destructive/30",  label: "Bloqueada" },
  atrasada:   { color: "text-destructive",  bg: "bg-destructive",  ring: "ring-destructive/30",  label: "Atrasada" },
  cancelada:  { color: "text-muted-foreground", bg: "bg-muted",    ring: "ring-border",          label: "Cancelada" },
  analise:    { color: "text-info",         bg: "bg-info",         ring: "ring-info/30",         label: "Em análise" },
  ativa:      { color: "text-success",      bg: "bg-success",      ring: "ring-success/30",      label: "Ativa" },
};
export const etapaStyleFallback: EtapaStyle = {
  color: "text-muted-foreground",
  bg: "bg-muted",
  ring: "ring-border",
  label: "—",
};
export function getEtapaStyle(status?: string): EtapaStyle {
  if (!status) return etapaStyleFallback;
  return etapaStyles[status] ?? etapaStyleFallback;
}

export const projetos = [
  {
    id: "p1",
    titulo: "Estruturação de RH",
    empresa: "Studio Mira",
    empresaId: "mira",
    status: "andamento" as StatusKey,
    progresso: 62,
    horasContratadas: 80,
    horasConsumidas: 49,
    consultor: "Camila Torres",
    npsAtual: 81,
  },
  {
    id: "p2",
    titulo: "Go to Market",
    empresa: "Alvo Digital",
    empresaId: "alvo",
    status: "andamento" as StatusKey,
    progresso: 35,
    horasContratadas: 120,
    horasConsumidas: 42,
    consultor: "Rafael Moura",
    npsAtual: 78,
  },
  {
    id: "p3",
    titulo: "Mapeamento de Cargos",
    empresa: "Kentaki Foods",
    empresaId: "kentaki",
    status: "concluida" as StatusKey,
    progresso: 100,
    horasContratadas: 60,
    horasConsumidas: 58,
    consultor: "Ana Beatriz",
    npsAtual: 86,
  },
  {
    id: "p-horizonte-1",
    titulo: "Plano de Cargos & Salários",
    empresa: "Construtora Horizonte",
    empresaId: "horizonte",
    status: "andamento" as StatusKey,
    progresso: 35,
    horasContratadas: 15,
    horasConsumidas: 6,
    consultor: "Rafael Moura",
    npsAtual: 80,
  },
  {
    id: "p-vita-1",
    titulo: "Programa de Líderes",
    empresa: "Clínica Vita Saúde",
    empresaId: "vita",
    status: "andamento" as StatusKey,
    progresso: 58,
    horasContratadas: 80,
    horasConsumidas: 46,
    consultor: "Juliana Costa",
    npsAtual: 84,
  },
  {
    id: "p-vita-2",
    titulo: "Onboarding Clínico",
    empresa: "Clínica Vita Saúde",
    empresaId: "vita",
    status: "andamento" as StatusKey,
    progresso: 72,
    horasContratadas: 80,
    horasConsumidas: 58,
    consultor: "Juliana Costa",
    npsAtual: 84,
  },
];

export const candidatos = [
  {
    id: "c1",
    nome: "Pedro Alves",
    cargo: "Gerente de TI",
    vagaId: "v1",
    disc: { D: 78, I: 42, S: 35, C: 60 },
    perfilDom: "D",
    parecer: "Perfil executivo, forte em tomada de decisão. Recomendado para entrevista final.",
    enviado: true,
    status: "contratado" as "novo" | "em_analise" | "aprovado" | "standby" | "reprovado" | "contratado",
  },
  {
    id: "c2",
    nome: "Marina Costa",
    cargo: "Analista de Marketing",
    vagaId: "v2",
    disc: { D: 38, I: 82, S: 55, C: 42 },
    perfilDom: "I",
    parecer: "Comunicação excepcional, criativa. Forte fit cultural com Maverick.",
    enviado: true,
    status: "em_analise" as const,
  },
  {
    id: "c3",
    nome: "Lucas Ferreira",
    cargo: "Dev Full Stack",
    vagaId: "v3",
    disc: { D: 45, I: 30, S: 50, C: 88 },
    perfilDom: "C",
    parecer: "Técnico exemplar, atento a detalhes. Excelente em arquitetura.",
    enviado: true,
    status: "em_analise" as const,
  },
  {
    id: "c4",
    nome: "Beatriz Lins",
    cargo: "Coordenadora de RH",
    vagaId: "v4",
    disc: { D: 35, I: 55, S: 80, C: 48 },
    perfilDom: "S",
    parecer: "Liderança colaborativa, ótima para times em estruturação.",
    enviado: false,
    status: "novo" as const,
  },
];

export const horasSemana = [
  { dia: "Seg", horas: 7.5, meta: 8 },
  { dia: "Ter", horas: 8.2, meta: 8 },
  { dia: "Qua", horas: 6.8, meta: 8 },
  { dia: "Qui", horas: 9.1, meta: 8 },
  { dia: "Sex", horas: 7.9, meta: 8 },
  { dia: "Sáb", horas: 2.4, meta: 4 },
  { dia: "Dom", horas: 0, meta: 0 },
];

export const npsHistorico = [
  { mes: "Fev", nps: 72 },
  { mes: "Mar", nps: 78 },
  { mes: "Abr", nps: 81 },
];

export const atividades = [
  { id: 1, empresa: "Kentaki Foods", tipo: "Vaga atualizada", responsavel: "Ana Beatriz", status: "ativa" as StatusKey, tempo: "há 4 min" },
  { id: 2, empresa: "Studio Mira", tipo: "Parecer enviado", responsavel: "Camila Torres", status: "andamento" as StatusKey, tempo: "há 22 min" },
  { id: 3, empresa: "Alvo Digital", tipo: "Boleto gerado", responsavel: "Rafael Moura", status: "aguardando" as StatusKey, tempo: "há 1h" },
  { id: 4, empresa: "Tech Plural", tipo: "SLA em risco", responsavel: "Ana Beatriz", status: "atrasada" as StatusKey, tempo: "há 2h" },
  { id: 5, empresa: "Grupo Maverick", tipo: "Perfil aprovado", responsavel: "Cliente", status: "concluida" as StatusKey, tempo: "há 3h" },
];

export const eventos = [
  { id: 1, titulo: "Briefing — Coord. RH Alvo", quando: "Hoje, 14:00", empresa: "Alvo Digital" },
  { id: 2, titulo: "Devolutiva — Pedro Alves", quando: "Amanhã, 09:30", empresa: "Kentaki Foods" },
  { id: 3, titulo: "Reunião mensal — Studio Mira", quando: "Sex, 16:00", empresa: "Studio Mira" },
];

export const boletos = [
  { id: "b1", empresa: "Kentaki Foods", valor: 6800, vencimento: "12/05/2025", status: "pago" as const },
  { id: "b2", empresa: "Studio Mira", valor: 4200, vencimento: "15/05/2025", status: "pago" as const },
  { id: "b3", empresa: "Tech Plural", valor: 9500, vencimento: "20/05/2025", status: "pago" as const },
  { id: "b4", empresa: "Grupo Maverick", valor: 4800, vencimento: "27/04/2025", status: "vencendo" as const },
  { id: "b5", empresa: "Alvo Digital", valor: 3200, vencimento: "18/04/2025", status: "atrasado" as const },
];

export const solicitacoes = [
  { id: "s1", titulo: "Revisão de política de férias", empresa: "Kentaki Foods", status: "andamento" as StatusKey, prazo: "30/04", autor: "RH Cliente" },
  { id: "s2", titulo: "Modelo de contrato CLT", empresa: "Studio Mira", status: "aguardando" as StatusKey, prazo: "02/05", autor: "Cliente ADM" },
  { id: "s3", titulo: "Reunião extra — clima", empresa: "Tech Plural", status: "concluida" as StatusKey, prazo: "20/04", autor: "Líder" },
  { id: "s4", titulo: "Apoio em demissão", empresa: "Alvo Digital", status: "analise" as StatusKey, prazo: "28/04", autor: "Cliente ADM" },
];

export const etapasVaga = [
  { nome: "Briefing", inicio: "01/04", fim: "02/04", status: "concluida" as StatusKey },
  { nome: "Divulgação", inicio: "02/04", fim: "06/04", status: "concluida" as StatusKey },
  { nome: "Triagem", inicio: "06/04", fim: "12/04", status: "andamento" as StatusKey },
  { nome: "Quest/Entrevista", inicio: "—", fim: "—", status: "aguardando" as StatusKey },
  { nome: "Perfis enviados", inicio: "—", fim: "—", status: "aguardando" as StatusKey },
  { nome: "Decisão final", inicio: "—", fim: "—", status: "aguardando" as StatusKey },
];

export const comentariosVaga = [
  { id: 1, autor: "Ana Beatriz", role: "Consultora", texto: "Iniciamos a triagem com 48 currículos. Foco em perfil executivo.", quando: "06/04 14:20", azumi: true },
  { id: 2, autor: "RH Kentaki", role: "Cliente", texto: "Podemos priorizar quem tenha vivência em multinacional?", quando: "07/04 09:10", azumi: false },
  { id: 3, autor: "Ana Beatriz", role: "Consultora", texto: "Anotado. Vamos sinalizar essa prioridade no parecer.", quando: "07/04 09:42", azumi: true },
];

export const headcountDept = [
  { dept: "Comercial", n: 42 },
  { dept: "Operações", n: 68 },
  { dept: "TI", n: 24 },
  { dept: "Marketing", n: 18 },
  { dept: "Financeiro", n: 12 },
  { dept: "RH", n: 9 },
];

export const humorHistorico = [
  { dia: "01", v: 4 }, { dia: "05", v: 5 }, { dia: "08", v: 3 },
  { dia: "12", v: 4 }, { dia: "15", v: 4 }, { dia: "18", v: 5 },
  { dia: "22", v: 3 }, { dia: "25", v: 4 }, { dia: "28", v: 5 },
];

// Notificações de consumo de horas (B08): cada uma referencia empresa+empresaId
// para que o componente possa montar um link direto para /app/empresas/:id ou
// /cliente/gestao-conta conforme o contexto.
export type ConsumoNotificacao = {
  id: string;
  empresa: string;
  empresaId: string;
  consumido: number;       // horas consumidas
  contratadas: number;     // horas contratadas no mês
  percent: number;         // 0-100
  severidade: "info" | "warning" | "critical";
  quando: string;
};

export const consumoNotificacoes: ConsumoNotificacao[] = [
  { id: "cn1", empresa: "Grupo Maverick",  empresaId: "maverick",   consumido: 92,  contratadas: 100, percent: 92, severidade: "critical", quando: "há 12 min" },
  { id: "cn2", empresa: "Tech Plural",     empresaId: "techplural", consumido: 68,  contratadas: 80,  percent: 85, severidade: "warning",  quando: "há 1h" },
  { id: "cn3", empresa: "Kentaki Foods",   empresaId: "kentaki",    consumido: 61,  contratadas: 80,  percent: 76, severidade: "info",     quando: "há 3h" },
  { id: "cn4", empresa: "Studio Mira",     empresaId: "mira",       consumido: 49,  contratadas: 80,  percent: 61, severidade: "info",     quando: "ontem" },
];
