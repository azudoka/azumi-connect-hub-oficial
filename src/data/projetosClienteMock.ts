// Mock dos projetos e cronogramas do cliente. Compartilhado entre lista e detalhe
// para que ações em uma tela reflitam (no estado em memória) na outra durante a
// mesma sessão.

import type { CronogramaCliente, ProjetoCliente } from "./projetosCliente";

const HOURS_AGO = (h: number) => new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
const DAYS_AHEAD = (d: number) => new Date(Date.now() + d * 24 * 60 * 60 * 1000).toISOString();
const DAYS_AGO = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString();

export const PROJETOS_MOCK: ProjetoCliente[] = [
  {
    id: "proj-001",
    codigo: "PROJ-2026-0001",
    nome: "Mapeamento de Cargos & Salários",
    empresaId: "kentaki",
    consultor: "Ana Beatriz",
    consultorIniciais: "AB",
    status: "andamento",
    frente: "Estrutura organizacional",
    entregaveis: [
      {
        id: "ent-001",
        codigo: "ENT-2026-0001",
        nome: "Diagnóstico inicial e levantamento de cargos",
        frente: "Estrutura organizacional",
        complexidade: "C1",
        status: "aprovado_cliente",
        prazo: DAYS_AGO(15),
        subtarefas: 4,
        tipoDocumento: true,
        vinculadoDocsOficiais: true,
        nps: {
          nota: 5,
          comentario: "Trabalho impecável, entrega antes do prazo!",
          data: DAYS_AGO(14),
        },
      },
      {
        id: "ent-002",
        codigo: "ENT-2026-0002",
        nome: "Mapa de cargos — versão 1",
        frente: "Estrutura organizacional",
        complexidade: "C2",
        status: "aprovacao_cliente",
        prazo: DAYS_AHEAD(7),
        subtarefas: 6,
        tipoDocumento: true,
        aprovacaoEnviadaEm: HOURS_AGO(36), // 36h atrás → ~36h restantes
      },
      {
        id: "ent-003",
        codigo: "ENT-2026-0003",
        nome: "Política de remuneração",
        frente: "Estrutura organizacional",
        complexidade: "C3",
        status: "em_andamento",
        prazo: DAYS_AHEAD(20),
        subtarefas: 8,
        tipoDocumento: true,
      },
      {
        id: "ent-004",
        codigo: "ENT-2026-0004",
        nome: "Workshop de calibragem com lideranças",
        frente: "Cultura & Pessoas",
        complexidade: "C2",
        status: "nao_iniciado",
        prazo: DAYS_AHEAD(35),
        subtarefas: 3,
        tipoDocumento: false,
      },
    ],
  },
  {
    id: "proj-002",
    codigo: "PROJ-2026-0007",
    nome: "Avaliação de Desempenho 2026",
    empresaId: "kentaki",
    consultor: "Rafael Moura",
    consultorIniciais: "RM",
    status: "vigente",
    frente: "Performance",
    entregaveis: [
      {
        id: "ent-010",
        codigo: "ENT-2026-0010",
        nome: "Modelo de avaliação 360",
        frente: "Performance",
        complexidade: "C2",
        status: "em_andamento",
        prazo: DAYS_AHEAD(12),
        subtarefas: 5,
        tipoDocumento: true,
      },
      {
        id: "ent-011",
        codigo: "ENT-2026-0011",
        nome: "Treinamento de avaliadores",
        frente: "Performance",
        complexidade: "C1",
        status: "nao_iniciado",
        prazo: DAYS_AHEAD(28),
        subtarefas: 2,
        tipoDocumento: false,
      },
    ],
  },
  {
    id: "proj-valore-1",
    codigo: "PROJ-2026-VAL01",
    nome: "Reestruturação do RH",
    empresaId: "valore",
    consultor: "Rafael Moura",
    consultorIniciais: "RM",
    status: "andamento",
    frente: "Estrutura de RH",
    entregaveis: [
      {
        id: "ent-val-001",
        codigo: "ENT-2026-VAL01",
        nome: "Diagnóstico inicial do RH",
        frente: "Estrutura de RH",
        complexidade: "C1",
        status: "aprovado_cliente",
        prazo: DAYS_AGO(20),
        subtarefas: 3,
        tipoDocumento: true,
        vinculadoDocsOficiais: true,
      },
      {
        id: "ent-val-002",
        codigo: "ENT-2026-VAL02",
        nome: "Mapa de cargos — versão 1",
        frente: "Estrutura de RH",
        complexidade: "C2",
        status: "aprovacao_cliente",
        prazo: DAYS_AHEAD(10),
        subtarefas: 5,
        tipoDocumento: true,
        aprovacaoEnviadaEm: HOURS_AGO(24),
      },
      {
        id: "ent-val-003",
        codigo: "ENT-2026-VAL03",
        nome: "Política de remuneração",
        frente: "Estrutura de RH",
        complexidade: "C2",
        status: "em_andamento",
        prazo: DAYS_AHEAD(30),
        subtarefas: 4,
        tipoDocumento: true,
      },
    ],
  },
];


export const CRONOGRAMAS_MOCK: CronogramaCliente[] = [
  {
    id: "cron-001",
    codigo: "CRON-2026-0003",
    nome: "Programa de Liderança 2026",
    empresaId: "kentaki",
    consultor: "Ana Beatriz",
    enviadoEm: DAYS_AGO(2),
    alteracoesUsadas: 0,
    status: "aguardando_aprovacao_cliente",
    entregaveis: [
      {
        id: "cent-001",
        nome: "Kick-off e diagnóstico de lideranças",
        frente: "Liderança",
        complexidade: "C1",
        prazo: DAYS_AHEAD(10),
        tempoEstimado: "8h",
      },
      {
        id: "cent-002",
        nome: "Entrevistas com líderes-chave",
        frente: "Liderança",
        complexidade: "C1",
        prazo: DAYS_AHEAD(18),
        tempoEstimado: "12h",
      },
      {
        id: "cent-003",
        nome: "Trilha de desenvolvimento — desenho",
        frente: "Liderança",
        complexidade: "C2",
        prazo: DAYS_AHEAD(30),
        tempoEstimado: "20h",
      },
      {
        id: "cent-004",
        nome: "Plano de mentoria e PDI",
        frente: "Liderança",
        complexidade: "C2",
        prazo: DAYS_AHEAD(45),
        tempoEstimado: "16h",
      },
    ],
  },
];


