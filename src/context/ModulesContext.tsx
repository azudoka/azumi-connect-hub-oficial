import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  CONFIG_DEFAULT,
  type ConfigCliente,
  type ModuloId,
  type PaginaId,
} from "@/config/modules";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface ModulesContextValue {
  config: ConfigCliente;
  /** Módulo ativo E dentro do período de teste (se houver). */
  isModuloAtivo: (id: ModuloId) => boolean;
  /** Página ativa dentro de um módulo ativo. */
  isPaginaAtiva: (moduloId: ModuloId, paginaId: PaginaId) => boolean;
  /** Módulo com testeInicio/testeFim válidos para hoje. */
  isEmTrial: (id: ModuloId) => boolean;
  /** Dias restantes de trial (null se não estiver em trial). */
  diasRestantesTrial: (id: ModuloId) => number | null;
  /** Troca o config — usado ao fazer login com dados reais do Supabase. */
  setConfig: (c: ConfigCliente) => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const ModulesContext = createContext<ModulesContextValue | null>(null);

export function ModulesProvider({ children }: { children: ReactNode }) {
  // TODO: substituir CONFIG_DEFAULT por fetch do Supabase ao fazer login.
  // Exemplo:
  //   const { data } = await supabase
  //     .from("cliente_modulos")
  //     .select("*, cliente_paginas(*)")
  //     .eq("cliente_id", clienteId);
  //   setConfig(mapSupabaseToConfig(data));
  const [config, setConfig] = useState<ConfigCliente>(CONFIG_DEFAULT);

  const value = useMemo<ModulesContextValue>(() => {
    function getModulo(id: ModuloId) {
      return config.modulos.find((m) => m.id === id);
    }

    function isTrialValido(id: ModuloId): boolean {
      const m = getModulo(id);
      if (!m?.testeInicio || !m?.testeFim) return false;
      const now = new Date();
      return now >= new Date(m.testeInicio) && now <= new Date(m.testeFim + "T23:59:59");
    }

    function isModuloAtivo(id: ModuloId): boolean {
      const m = getModulo(id);
      if (!m) return false;
      if (m.ativo) return true;
      // Inativo mas dentro do período de teste → tratado como ativo
      return isTrialValido(id);
    }

    function isPaginaAtiva(moduloId: ModuloId, paginaId: PaginaId): boolean {
      if (!isModuloAtivo(moduloId)) return false;
      const m = getModulo(moduloId);
      if (!m || m.paginas.length === 0) return true;
      const p = m.paginas.find((pg) => pg.id === paginaId);
      return p?.ativo ?? true;
    }

    function isEmTrial(id: ModuloId): boolean {
      const m = getModulo(id);
      if (!m) return false;
      return isTrialValido(id);
    }

    function diasRestantesTrial(id: ModuloId): number | null {
      if (!isEmTrial(id)) return null;
      const m = getModulo(id)!;
      const fim = new Date(m.testeFim! + "T23:59:59");
      const diff = fim.getTime() - Date.now();
      return Math.max(0, Math.ceil(diff / 86_400_000));
    }

    return {
      config,
      isModuloAtivo,
      isPaginaAtiva,
      isEmTrial,
      diasRestantesTrial,
      setConfig,
    };
  }, [config]);

  return (
    <ModulesContext.Provider value={value}>{children}</ModulesContext.Provider>
  );
}

export function useModulos(): ModulesContextValue {
  const ctx = useContext(ModulesContext);
  if (!ctx) throw new Error("useModulos deve ser usado dentro de <ModulesProvider>");
  return ctx;
}
