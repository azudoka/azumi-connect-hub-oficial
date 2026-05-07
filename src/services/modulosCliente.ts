import { supabase } from "@/lib/supabaseClient";
import {
  CONFIG_DEFAULT,
  type ConfigCliente,
  type ConfigModulo,
  type ConfigPagina,
  type ModuloId,
  type PaginaId,
} from "@/config/modules";

// ---------------------------------------------------------------------------
// Tipos de linha do Supabase
// ---------------------------------------------------------------------------

interface ClienteModuloRow {
  cliente_id: string;
  modulo_id: ModuloId;
  ativo: boolean;
  teste_inicio: string | null;
  teste_fim: string | null;
}

interface ClientePaginaRow {
  cliente_id: string;
  modulo_id: ModuloId;
  pagina_id: PaginaId;
  ativo: boolean;
}

// ---------------------------------------------------------------------------
// Helpers de merge
// ---------------------------------------------------------------------------

function mergePaginas(
  defaults: ConfigPagina[],
  rows: ClientePaginaRow[],
  moduloId: ModuloId
): ConfigPagina[] {
  if (rows.length === 0) return defaults;
  const doModulo = rows.filter((r) => r.modulo_id === moduloId);
  return defaults.map((def) => {
    const row = doModulo.find((r) => r.pagina_id === def.id);
    return row ? { ...def, ativo: row.ativo } : def;
  });
}

function mergeModulos(
  defaults: ConfigModulo[],
  moduloRows: ClienteModuloRow[],
  paginaRows: ClientePaginaRow[]
): ConfigModulo[] {
  return defaults.map((def) => {
    const row = moduloRows.find((r) => r.modulo_id === def.id);
    const merged: ConfigModulo = row
      ? {
          ...def,
          ativo: row.ativo,
          testeInicio: row.teste_inicio ?? undefined,
          testeFim: row.teste_fim ?? undefined,
        }
      : def;
    merged.paginas = mergePaginas(def.paginas, paginaRows, def.id);
    return merged;
  });
}

// ---------------------------------------------------------------------------
// Serviço público
// ---------------------------------------------------------------------------

/**
 * Carrega a configuração de módulos/páginas do cliente a partir do Supabase
 * e mescla com CONFIG_DEFAULT.
 *
 * Regras de merge:
 * - Se não existir nenhuma linha para clienteId → retorna CONFIG_DEFAULT inteiro.
 * - Se existir: sobrescreve ativo/testeInicio/testeFim por módulo e ativo por página.
 * - Qualquer módulo/página ausente no banco mantém o valor do CONFIG_DEFAULT.
 * - Erros de rede → loga e retorna CONFIG_DEFAULT (zero impacto visual na demo).
 */
export async function carregarConfigCliente(
  clienteId: string
): Promise<ConfigCliente> {
  try {
    const [modulosRes, paginasRes] = await Promise.all([
      supabase
        .from("cliente_modulos")
        .select("cliente_id, modulo_id, ativo, teste_inicio, teste_fim")
        .eq("cliente_id", clienteId),
      supabase
        .from("cliente_paginas")
        .select("cliente_id, modulo_id, pagina_id, ativo")
        .eq("cliente_id", clienteId),
    ]);

    if (modulosRes.error) throw modulosRes.error;
    if (paginasRes.error) throw paginasRes.error;

    const moduloRows = (modulosRes.data ?? []) as ClienteModuloRow[];
    const paginaRows = (paginasRes.data ?? []) as ClientePaginaRow[];

    // Nenhum registro → usa o default completo
    if (moduloRows.length === 0 && paginaRows.length === 0) {
      return { ...CONFIG_DEFAULT, clienteId };
    }

    return {
      clienteId,
      modulos: mergeModulos(CONFIG_DEFAULT.modulos, moduloRows, paginaRows),
    };
  } catch (err) {
    console.error("[modulosCliente] falha ao carregar config, usando default:", err);
    return { ...CONFIG_DEFAULT, clienteId };
  }
}
