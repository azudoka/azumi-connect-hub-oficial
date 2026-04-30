/**
 * Funil único de Atração & Hunting (Azumi Connect).
 *
 * Fonte de verdade: Handoff Técnico — Azumi Connect Hub (seção AtracaoHuntPage).
 * Qualquer tela que renderize colunas/etapas do funil DEVE importar daqui;
 * NÃO duplicar arrays/labels em outros arquivos.
 */

export type FunilEtapa =
  | "briefing"
  | "triagem"
  | "entrevista"
  | "perfis_enviados"
  | "decisao";

export const FUNIL_ETAPAS: FunilEtapa[] = [
  "briefing",
  "triagem",
  "entrevista",
  "perfis_enviados",
  "decisao",
];

export const FUNIL_ETAPA_LABEL: Record<FunilEtapa, string> = {
  briefing: "Briefing",
  triagem: "Triagem",
  entrevista: "Entrevista",
  perfis_enviados: "Perfis enviados",
  decisao: "Decisão",
};

/** Mapeamento legacy <-> novo: o mock usa labels antigos como `etapa` da vaga. */
export const LEGACY_ETAPA_TO_FUNIL: Record<string, FunilEtapa> = {
  Briefing: "briefing",
  Triagem: "triagem",
  Entrevista: "entrevista",
  "Perfis enviados": "perfis_enviados",
  Decisão: "decisao",
};

// ────────────────────────────────────────────────────────────────────
// Regras de negócio centralizadas (Handoff)
// ────────────────────────────────────────────────────────────────────

/** Máximo de candidatos por envio ao cliente. Acima exige justificativa. */
export const MAX_CANDIDATOS_POR_ENVIO = 3;

/** Tipos de vaga que NÃO podem ser abertos no plano Ongoing. */
export const TIPOS_VAGA_BLOQUEADOS_ONGOING = ["hunt_executivo"] as const;

export function podeAbrirVaga(plano: string, tipoVaga: string): { ok: boolean; motivo?: string } {
  if (plano === "ongoing" && (TIPOS_VAGA_BLOQUEADOS_ONGOING as readonly string[]).includes(tipoVaga)) {
    return {
      ok: false,
      motivo: "Plano Ongoing não permite abertura de Hunt Executivo. Faça upgrade para Hunt Premium.",
    };
  }
  return { ok: true };
}
