// Store em memória — único para projetos/cronogramas/entregáveis do cliente.
// Permite que ações no detalhe (aprovar, NPS, ajuste, drag) reflitam na lista.
// Sem persistência. Em uma próxima fase será trocado por queries Supabase.

import { CRONOGRAMAS_MOCK, PROJETOS_MOCK } from "@/data/projetosClienteMock";
import type {
  CronogramaCliente,
  EntregavelItem,
  EntregavelStatus,
  NpsRegistro,
  ProjetoCliente,
} from "@/data/projetosCliente";
import { useEffect, useSyncExternalStore } from "react";

interface State {
  projetos: ProjetoCliente[];
  cronogramas: CronogramaCliente[];
}

let state: State = {
  projetos: PROJETOS_MOCK.map((p) => ({ ...p, entregaveis: p.entregaveis.map((e) => ({ ...e })) })),
  cronogramas: CRONOGRAMAS_MOCK.map((c) => ({
    ...c,
    entregaveis: c.entregaveis.map((e) => ({ ...e })),
  })),
};

const listeners = new Set<() => void>();
function notify() {
  for (const l of listeners) l();
}
function setState(updater: (s: State) => State) {
  state = updater(state);
  notify();
}

export function useProjetosClienteStore<T>(selector: (s: State) => T): T {
  const subscribe = (cb: () => void) => {
    listeners.add(cb);
    return () => listeners.delete(cb);
  };
  const getSnapshot = () => selector(state);
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

// Reseta dados quando troca de empresa (em sessão real seria refetch).
export function useResetOnEmpresaChange(empresaId: string | null | undefined) {
  useEffect(() => {
    // intencionalmente sem-op — mantemos mock fixo no escopo da sessão.
  }, [empresaId]);
}

// ----- Projetos / Entregáveis -----

export function getProjetoById(id: string): ProjetoCliente | undefined {
  return state.projetos.find((p) => p.id === id || p.codigo === id);
}

export function aprovarEntregavel(projetoId: string, entregavelId: string) {
  setState((s) => ({
    ...s,
    projetos: s.projetos.map((p) =>
      p.id !== projetoId
        ? p
        : {
            ...p,
            entregaveis: p.entregaveis.map((e) =>
              e.id !== entregavelId
                ? e
                : { ...e, status: "aprovado_cliente" as EntregavelStatus }
            ),
          }
    ),
  }));
}

export function solicitarAjusteEntregavel(
  projetoId: string,
  entregavelId: string,
  observacao: string
) {
  setState((s) => ({
    ...s,
    projetos: s.projetos.map((p) =>
      p.id !== projetoId
        ? p
        : {
            ...p,
            entregaveis: p.entregaveis.map((e) =>
              e.id !== entregavelId
                ? e
                : {
                    ...e,
                    status: "ajuste_solicitado" as EntregavelStatus,
                    ajusteObservacao: observacao,
                  }
            ),
          }
    ),
  }));
}

export function registrarNps(
  projetoId: string,
  entregavelId: string,
  nps: NpsRegistro
) {
  setState((s) => ({
    ...s,
    projetos: s.projetos.map((p) =>
      p.id !== projetoId
        ? p
        : {
            ...p,
            entregaveis: p.entregaveis.map((e) => (e.id !== entregavelId ? e : { ...e, nps })),
          }
    ),
  }));
}

export function vincularDocsOficiais(
  projetoId: string,
  entregavelId: string,
  vincular: boolean
) {
  setState((s) => ({
    ...s,
    projetos: s.projetos.map((p) =>
      p.id !== projetoId
        ? p
        : {
            ...p,
            entregaveis: p.entregaveis.map((e) =>
              e.id !== entregavelId ? e : { ...e, vinculadoDocsOficiais: vincular }
            ),
          }
    ),
  }));
}

// ----- Cronogramas -----

export function reordenarCronograma(
  cronogramaId: string,
  novaOrdem: string[],
  consumeAlteracao: boolean
) {
  setState((s) => ({
    ...s,
    cronogramas: s.cronogramas.map((c) => {
      if (c.id !== cronogramaId) return c;
      const map = new Map(c.entregaveis.map((e) => [e.id, e]));
      const reorder = novaOrdem
        .map((id) => map.get(id))
        .filter((x): x is NonNullable<typeof x> => !!x);
      return {
        ...c,
        entregaveis: reorder,
        alteracoesUsadas: consumeAlteracao ? c.alteracoesUsadas + 1 : c.alteracoesUsadas,
      };
    }),
  }));
}

export function solicitarAjusteCronograma(cronogramaId: string, _observacao: string) {
  setState((s) => ({
    ...s,
    cronogramas: s.cronogramas.map((c) =>
      c.id !== cronogramaId ? c : { ...c, status: "ajuste_solicitado" }
    ),
  }));
}

export function aprovarCronograma(cronogramaId: string): {
  novoCodigo: string;
} | null {
  const cron = state.cronogramas.find((c) => c.id === cronogramaId);
  if (!cron) return null;

  const ano = new Date().getFullYear();
  const sufixo = String(Math.floor(Math.random() * 9000) + 1000);
  const novoCodigo = `PROJ-${ano}-${sufixo}`;

  const novoProjeto: ProjetoCliente = {
    id: `proj-${Date.now()}`,
    codigo: novoCodigo,
    nome: cron.nome,
    empresaId: cron.empresaId,
    consultor: cron.consultor,
    consultorIniciais: cron.consultor
      .split(" ")
      .map((s) => s[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    status: "vigente",
    frente: cron.entregaveis[0]?.frente ?? "—",
    entregaveis: cron.entregaveis.map<EntregavelItem>((e, i) => ({
      id: `${cron.id}-ent-${i}`,
      codigo: `ENT-${ano}-${String(8000 + i).padStart(4, "0")}`,
      nome: e.nome,
      frente: e.frente,
      complexidade: e.complexidade,
      status: "nao_iniciado",
      prazo: e.prazo,
      subtarefas: 0,
      tipoDocumento: false,
    })),
  };

  setState((s) => ({
    cronogramas: s.cronogramas.filter((c) => c.id !== cronogramaId),
    projetos: [novoProjeto, ...s.projetos],
  }));

  return { novoCodigo };
}
