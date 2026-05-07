// Configuração de módulos e páginas por cliente.
// ModuloId identifica blocos de produto; PaginaId identifica páginas dentro deles.
// A ConfigCliente é carregada no login (hoje: default estático, depois: Supabase).

export type ModuloId =
  | "hub_wiki"        // Políticas, Guias, Treinamentos
  | "hub_comunicacao" // Comunicados / Mural
  | "hub_pessoas"     // Termômetro, Benefícios, Onboarding
  | "hub_dp"          // Holerites, Férias
  | "atracao"
  | "performance"
  | "governanca"
  | "regulamentacao"
  | "engenharia_pessoas"
  | "endomarketing"
  | "dp"
  | "contabilidade"
  | "juridico";

export type PaginaId =
  // hub_wiki
  | "politicas"
  | "guias"
  | "treinamentos"
  // hub_comunicacao
  | "mural"
  // hub_pessoas
  | "termometro"
  | "beneficios"
  | "onboarding"
  // hub_dp
  | "holerites"
  | "ferias"
  // extensível por módulos pagos
  | string;

export interface ConfigPagina {
  id: PaginaId;
  ativo: boolean;
}

export interface ConfigModulo {
  id: ModuloId;
  ativo: boolean;
  testeInicio?: string; // ISO date (YYYY-MM-DD)
  testeFim?: string;    // ISO date
  paginas: ConfigPagina[];
}

export interface ConfigCliente {
  clienteId: string;
  modulos: ConfigModulo[];
}

// Configuração padrão: módulos Hub core todos ativos; módulos pagos inativos.
// Reflete o comportamento atual da demo sem nenhuma regressão visível.
// TODO: substituir por fetch de `supabase.from("cliente_modulos")` no login.
export const CONFIG_DEFAULT: ConfigCliente = {
  clienteId: "demo",
  modulos: [
    {
      id: "hub_wiki",
      ativo: true,
      paginas: [
        { id: "politicas", ativo: true },
        { id: "guias", ativo: true },
        { id: "treinamentos", ativo: true },
      ],
    },
    {
      id: "hub_comunicacao",
      ativo: true,
      paginas: [{ id: "mural", ativo: true }],
    },
    {
      id: "hub_pessoas",
      ativo: true,
      paginas: [
        { id: "termometro", ativo: true },
        { id: "beneficios", ativo: true },
        { id: "onboarding", ativo: true },
      ],
    },
    {
      id: "hub_dp",
      ativo: true,
      paginas: [
        { id: "holerites", ativo: true },
        { id: "ferias", ativo: true },
      ],
    },
    { id: "atracao",            ativo: false, paginas: [] },
    { id: "performance",        ativo: false, paginas: [] },
    { id: "governanca",         ativo: false, paginas: [] },
    { id: "regulamentacao",     ativo: false, paginas: [] },
    { id: "engenharia_pessoas", ativo: false, paginas: [] },
    { id: "endomarketing",      ativo: false, paginas: [] },
    { id: "dp",                 ativo: false, paginas: [] },
    { id: "contabilidade",      ativo: false, paginas: [] },
    { id: "juridico",           ativo: false, paginas: [] },
  ],
};

// SQL de referência para a tabela Supabase (não executar aqui — rodar no painel):
//
// create table cliente_modulos (
//   id            uuid primary key default gen_random_uuid(),
//   cliente_id    text not null,
//   modulo_id     text not null,
//   ativo         boolean not null default false,
//   teste_inicio  date,
//   teste_fim     date,
//   created_at    timestamptz default now(),
//   unique (cliente_id, modulo_id)
// );
//
// create table cliente_paginas (
//   id          uuid primary key default gen_random_uuid(),
//   cliente_id  text not null,
//   modulo_id   text not null,
//   pagina_id   text not null,
//   ativo       boolean not null default true,
//   unique (cliente_id, modulo_id, pagina_id)
// );
