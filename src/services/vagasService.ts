import { supabase } from "@/integrations/supabase/client";

// ── Tipo público retornado por todas as funções ──────────────────────────────
// Os nomes de campo aqui são os mesmos da era "vagas" para minimizar mudanças
// no código de UI. O mapeamento pro schema real (job_solicitations) fica só
// neste arquivo.
export type VagaSupabase = {
  id: string;
  criado_em: string;
  titulo: string;
  empresa: string;
  empresa_id: string | null;
  filial: string | null;
  tipo: string | null;
  modalidade: string | null;
  posicoes: number | null;
  beneficios: string[] | null;   // text no banco → array aqui
  descricao: string | null;
  status: string;                // mapeado: em_processo→ativa, finalizada→concluida
  etapa: string;                 // de job_solicitations.etapa_connect
  publicacao: string;            // "publicada" | "nao_publicada" ← public_visible bool
  consultor: string | null;
  consultor_avatar_url: string | null;
  candidatosTotal: number;
  local_trabalho: string | null;
  nivel: string | null;
  turno: string | null;
  tipo_contrato: string | null;
  carga_horaria: string | null;
  salario_de: number | null;
  salario_ate: number | null;
  nivel_urgencia: string | null;
  tem_comissao: boolean | null;
  sla_dias: number | null;
  sla_urgente: boolean | null;
  sla_taxa_urgencia: number | null;
  sla_nivel: string | null;
  sla_modulo: string | null;
  confidencial: boolean;
  salario_fixo: boolean;
  is_avulsa: boolean;
  avulsa_solicitante_nome: string | null;
  avulsa_solicitante_cargo: string | null;
  avulsa_solicitante_telefone: string | null;
  avulsa_solicitante_email: string | null;
  disc_habilitado: boolean;
  perguntas_customizadas_habilitado: boolean;
  responsavel_id: string | null;
  excluida_em: string | null;    // ← encerrada_em
  motivo_exclusao: string | null;// ← motivo_encerramento
  etapaAtualizadoEm: string | null;
  questionnaire_id: string | null;
};

// ── Mapeamento DB → VagaSupabase ─────────────────────────────────────────────
const STATUS_DB_TO_UI: Record<string, string> = {
  em_processo: "ativa",
  finalizada: "concluida",
  cancelada: "cancelada",
  standby: "standby",
};
const STATUS_UI_TO_DB: Record<string, string> = {
  ativa: "em_processo",
  concluida: "finalizada",
  cancelada: "cancelada",
  standby: "standby",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function jsToVaga(row: any): VagaSupabase {
  return {
    id: row.id,
    criado_em: row.created_at,
    titulo: row.public_titulo ?? row.cargo,
    empresa: row.avulsa_empresa_nome ?? "—",
    empresa_id: row.company_id ?? null,
    filial: row.branch_id ?? null,
    tipo: row.tipo_vaga ?? null,
    modalidade: row.modalidade ?? null,
    posicoes: row.quantidade_vagas ?? null,
    beneficios: row.beneficios
      ? (row.beneficios as string).split(",").map((s: string) => s.trim()).filter(Boolean)
      : [],
    descricao: row.public_descricao ?? null,
    status: STATUS_DB_TO_UI[row.status] ?? row.status,
    etapa: row.etapa_connect ?? "briefing",
    publicacao: row.public_visible ? "publicada" : "nao_publicada",
    consultor: (row as any).responsavel?.full_name ?? row.responsavel_interno ?? null,
    consultor_avatar_url: (row as any).responsavel?.avatar_url ?? null,
    candidatosTotal: (row as any).candidates?.[0]?.count ?? 0,
    local_trabalho: row.local_trabalho ?? null,
    nivel: row.nivel ?? null,
    turno: row.turno ?? null,
    tipo_contrato: row.tipo_contrato ?? null,
    carga_horaria: row.carga_horaria ?? null,
    salario_de: row.salario_de != null ? Number(row.salario_de) : null,
    salario_ate: row.salario_ate != null ? Number(row.salario_ate) : null,
    nivel_urgencia: row.nivel_urgencia ?? null,
    tem_comissao: row.tem_comissao ?? null,
    sla_dias: row.prazo_entrega_dias ?? null,
    sla_urgente: row.sla_urgente ?? null,
    sla_taxa_urgencia: row.sla_taxa_urgencia != null ? Number(row.sla_taxa_urgencia) : null,
    sla_nivel: row.sla_nivel ?? null,
    sla_modulo: row.sla_modulo ?? null,
    confidencial: row.confidencial ?? false,
    salario_fixo: row.salario_fixo ?? false,
    disc_habilitado: row.disc_habilitado ?? true,
    perguntas_customizadas_habilitado: row.perguntas_customizadas_habilitado ?? false,
    responsavel_id: row.responsavel_id ?? null,
    is_avulsa: row.is_avulsa ?? true,
    avulsa_solicitante_nome: row.avulsa_solicitante_nome ?? null,
    avulsa_solicitante_cargo: row.avulsa_solicitante_cargo ?? null,
    avulsa_solicitante_telefone: row.avulsa_solicitante_telefone ?? null,
    avulsa_solicitante_email: row.avulsa_solicitante_email ?? null,
    excluida_em: row.encerrada_em ?? null,
    motivo_exclusao: row.motivo_encerramento ?? null,
    etapaAtualizadoEm: row.etapa_connect_atualizado_em ?? null,
    questionnaire_id: row.questionnaire_id ?? null,
  };
}

// ── Input de criação/edição (mesmos nomes de campo de antes) ─────────────────
export type CriarVagaInput = {
  titulo: string;
  empresa: string;
  empresa_id?: string;
  filial?: string;
  tipo?: string;
  modalidade?: string;
  posicoes?: number;
  beneficios?: string[];
  descricao?: string;
  consultor?: string;
  local_trabalho?: string;
  nivel?: string;
  turno?: string;
  tipo_contrato?: string;
  carga_horaria?: string;
  salario_de?: number;
  salario_ate?: number;
  nivel_urgencia?: string;
  tem_comissao?: boolean;
  sla_dias?: number | null;
  sla_urgente?: boolean;
  sla_taxa_urgencia?: number | null;
  sla_nivel?: string | null;
  sla_modulo?: string | null;
  confidencial?: boolean;
  salario_fixo?: boolean;
  is_avulsa?: boolean;
  avulsa_solicitante_nome?: string | null;
  avulsa_solicitante_cargo?: string | null;
  avulsa_solicitante_telefone?: string | null;
  avulsa_solicitante_email?: string | null;
  responsavel_id?: string | null;
  disc_habilitado?: boolean;
  perguntas_customizadas_habilitado?: boolean;
};

// Converte CriarVagaInput → colunas de job_solicitations
function inputToJs(input: Partial<CriarVagaInput>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (input.titulo !== undefined) { out.cargo = input.titulo; out.public_titulo = input.titulo; }
  if (input.empresa !== undefined) out.avulsa_empresa_nome = input.empresa;
  if (input.empresa_id !== undefined) out.company_id = input.empresa_id ?? null;
  if (input.filial !== undefined) out.branch_id = input.filial ?? null;
  if (input.tipo !== undefined) out.tipo_vaga = input.tipo ?? null;
  if (input.modalidade !== undefined) out.modalidade = input.modalidade;
  if (input.posicoes !== undefined) out.quantidade_vagas = input.posicoes;
  if (input.beneficios !== undefined) out.beneficios = (input.beneficios ?? []).join(",");
  if (input.descricao !== undefined) out.public_descricao = input.descricao ?? null;
  if (input.consultor !== undefined) out.responsavel_interno = input.consultor ?? null;
  if (input.local_trabalho !== undefined) out.local_trabalho = input.local_trabalho ?? null;
  if (input.nivel !== undefined) out.nivel = input.nivel;
  if (input.turno !== undefined) out.turno = input.turno ?? null;
  if (input.tipo_contrato !== undefined) out.tipo_contrato = input.tipo_contrato ?? null;
  if (input.carga_horaria !== undefined) out.carga_horaria = input.carga_horaria ?? null;
  if (input.salario_de !== undefined) out.salario_de = input.salario_de ?? null;
  if (input.salario_ate !== undefined) out.salario_ate = input.salario_ate ?? null;
  if (input.nivel_urgencia !== undefined) out.nivel_urgencia = input.nivel_urgencia ?? null;
  if (input.tem_comissao !== undefined) out.tem_comissao = input.tem_comissao;
  if (input.sla_dias !== undefined) out.prazo_entrega_dias = input.sla_dias;
  if (input.sla_urgente !== undefined) out.sla_urgente = input.sla_urgente;
  if (input.sla_taxa_urgencia !== undefined) out.sla_taxa_urgencia = input.sla_taxa_urgencia ?? null;
  if (input.sla_nivel !== undefined) out.sla_nivel = input.sla_nivel ?? null;
  if (input.sla_modulo !== undefined) out.sla_modulo = input.sla_modulo ?? null;
  if (input.confidencial !== undefined) out.confidencial = input.confidencial;
  if (input.salario_fixo !== undefined) out.salario_fixo = input.salario_fixo;
  if (input.is_avulsa !== undefined) out.is_avulsa = input.is_avulsa;
  if (input.avulsa_solicitante_nome !== undefined) out.avulsa_solicitante_nome = input.avulsa_solicitante_nome ?? null;
  if (input.avulsa_solicitante_cargo !== undefined) out.avulsa_solicitante_cargo = input.avulsa_solicitante_cargo ?? null;
  if (input.avulsa_solicitante_telefone !== undefined) out.avulsa_solicitante_telefone = input.avulsa_solicitante_telefone ?? null;
  if (input.avulsa_solicitante_email !== undefined) out.avulsa_solicitante_email = input.avulsa_solicitante_email ?? null;
  if (input.responsavel_id !== undefined) out.responsavel_id = input.responsavel_id ?? null;
  if (input.disc_habilitado !== undefined) out.disc_habilitado = input.disc_habilitado;
  if (input.perguntas_customizadas_habilitado !== undefined) out.perguntas_customizadas_habilitado = input.perguntas_customizadas_habilitado;
  return out;
}

// ── Funções exportadas (mesmos nomes de antes) ───────────────────────────────

export async function listarVagas(): Promise<VagaSupabase[]> {
  const { data, error } = await supabase
    .from("job_solicitations")
    .select("*, responsavel:users_profile!job_solicitations_responsavel_id_fkey(full_name, avatar_url), candidates(count)")
    .is("encerrada_em", null)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(jsToVaga);
}

export async function listarVagasPublicadas(): Promise<VagaSupabase[]> {
  const { data, error } = await supabase
    .from("job_solicitations")
    .select("*, responsavel:users_profile!job_solicitations_responsavel_id_fkey(full_name, avatar_url)")
    .eq("public_visible", true)
    .neq("status", "finalizada")
    .neq("status", "cancelada")
    .is("encerrada_em", null)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(jsToVaga);
}

export async function getVaga(id: string): Promise<VagaSupabase | null> {
  const { data, error } = await supabase
    .from("job_solicitations")
    .select("*, responsavel:users_profile!job_solicitations_responsavel_id_fkey(full_name, avatar_url)")
    .eq("id", id)
    .single();
  if (error) return null;
  return jsToVaga(data);
}

export async function criarVaga(input: CriarVagaInput): Promise<VagaSupabase> {
  const { data, error } = await supabase
    .from("job_solicitations")
    .insert({
      cargo: input.titulo,
      public_titulo: input.titulo,
      is_avulsa: input.is_avulsa ?? true,
      avulsa_empresa_nome: (input.is_avulsa ?? true) ? (input.empresa ?? null) : null,
      company_id: (input.is_avulsa ?? true) ? null : (input.empresa_id ?? null),
      branch_id: input.filial ?? null,
      tipo_vaga: input.tipo ?? null,
      modalidade: input.modalidade ?? "presencial",
      quantidade_vagas: input.posicoes ?? 1,
      beneficios: (input.beneficios ?? []).join(","),
      public_descricao: input.descricao ?? null,
      status: "em_processo",
      etapa_connect: "briefing",
      public_visible: false,
      responsavel_interno: input.consultor ?? null,
      local_trabalho: input.local_trabalho ?? null,
      nivel: input.nivel ?? "pleno",
      turno: input.turno ?? null,
      tipo_contrato: input.tipo_contrato ?? null,
      carga_horaria: input.carga_horaria ?? null,
      salario_de: input.salario_de ?? null,
      salario_ate: input.salario_ate ?? null,
      nivel_urgencia: input.nivel_urgencia ?? null,
      tem_comissao: input.tem_comissao ?? false,
      prazo_entrega_dias: input.sla_dias ?? null,
      sla_urgente: input.sla_urgente ?? false,
      sla_taxa_urgencia: input.sla_taxa_urgencia ?? null,
      sla_nivel: input.sla_nivel ?? null,
      sla_modulo: input.sla_modulo ?? null,
      confidencial: input.confidencial ?? false,
      salario_fixo: input.salario_fixo ?? false,
      avulsa_solicitante_nome: input.avulsa_solicitante_nome ?? null,
      avulsa_solicitante_cargo: input.avulsa_solicitante_cargo ?? null,
      avulsa_solicitante_telefone: input.avulsa_solicitante_telefone ?? null,
      avulsa_solicitante_email: input.avulsa_solicitante_email ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return jsToVaga(data);
}

export async function publicarVaga(id: string): Promise<void> {
  const { error } = await supabase
    .from("job_solicitations")
    .update({ public_visible: true })
    .eq("id", id);
  if (error) throw error;
}

export async function despublicarVaga(id: string): Promise<void> {
  const { error } = await supabase
    .from("job_solicitations")
    .update({ public_visible: false })
    .eq("id", id);
  if (error) throw error;
}

export async function fecharVaga(id: string): Promise<void> {
  const { error } = await supabase
    .from("job_solicitations")
    .update({ status: "finalizada", public_visible: false, encerrada_em: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function atualizarEtapa(id: string, etapa: string): Promise<void> {
  const { error } = await supabase
    .from("job_solicitations")
    .update({ etapa_connect: etapa, etapa_connect_atualizado_em: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function atualizarVaga(id: string, input: Partial<CriarVagaInput>): Promise<void> {
  const { error } = await supabase
    .from("job_solicitations")
    .update(inputToJs(input))
    .eq("id", id);
  if (error) throw error;
}

export async function definirStatusVaga(
  id: string,
  status: "ativa" | "standby" | "cancelada" | "concluida"
): Promise<void> {
  const { error } = await supabase
    .from("job_solicitations")
    .update({ status: STATUS_UI_TO_DB[status] ?? status })
    .eq("id", id);
  if (error) throw error;
}

export async function excluirVaga(id: string, justificativa: string): Promise<void> {
  // Move candidatos ligados para Banco de Talentos
  await supabase
    .from("candidates")
    .update({ banco_talentos: true })
    .eq("job_id", id);
  const { error } = await supabase
    .from("job_solicitations")
    .update({ encerrada_em: new Date().toISOString(), motivo_encerramento: justificativa })
    .eq("id", id);
  if (error) throw error;
}
