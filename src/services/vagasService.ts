import { supabase } from "@/integrations/supabase/client";

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
  beneficios: string[] | null;
  descricao: string | null;
  status: string;
  etapa: string;
  publicacao: string;
  consultor: string | null;
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
  excluida_em: string | null;
  motivo_exclusao: string | null;
};

export async function listarVagas(): Promise<VagaSupabase[]> {
  const { data, error } = await supabase
    .from("vagas")
    .select("*")
    .is("excluida_em", null)
    .order("criado_em", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function listarVagasPublicadas(): Promise<VagaSupabase[]> {
  const { data, error } = await supabase
    .from("vagas")
    .select("*")
    .eq("publicacao", "publicada")
    .neq("status", "concluida")
    .neq("status", "cancelada")
    .order("criado_em", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getVaga(id: string): Promise<VagaSupabase | null> {
  const { data, error } = await supabase
    .from("vagas")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data;
}

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
  sla_dias?: number;
};

export async function criarVaga(input: CriarVagaInput): Promise<VagaSupabase> {
  const { data, error } = await supabase
    .from("vagas")
    .insert({
      titulo: input.titulo,
      empresa: input.empresa,
      empresa_id: input.empresa_id ?? null,
      filial: input.filial ?? null,
      tipo: input.tipo ?? null,
      modalidade: input.modalidade ?? null,
      posicoes: input.posicoes ?? 1,
      beneficios: input.beneficios ?? [],
      descricao: input.descricao ?? null,
      status: "ativa",
      etapa: "briefing",
      publicacao: "nao_publicada",
      consultor: input.consultor ?? null,
      local_trabalho: input.local_trabalho ?? null,
      nivel: input.nivel ?? null,
      turno: input.turno ?? null,
      tipo_contrato: input.tipo_contrato ?? null,
      carga_horaria: input.carga_horaria ?? null,
      salario_de: input.salario_de ?? null,
      salario_ate: input.salario_ate ?? null,
      nivel_urgencia: input.nivel_urgencia ?? null,
      tem_comissao: input.tem_comissao ?? false,
      sla_dias: input.sla_dias ?? 30,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function publicarVaga(id: string): Promise<void> {
  const { error } = await supabase
    .from("vagas")
    .update({ publicacao: "publicada" })
    .eq("id", id);
  if (error) throw error;
}

export async function despublicarVaga(id: string): Promise<void> {
  const { error } = await supabase
    .from("vagas")
    .update({ publicacao: "nao_publicada" })
    .eq("id", id);
  if (error) throw error;
}

export async function fecharVaga(id: string): Promise<void> {
  const { error } = await supabase
    .from("vagas")
    .update({ status: "concluida", publicacao: "nao_publicada" })
    .eq("id", id);
  if (error) throw error;
}

export async function atualizarEtapa(id: string, etapa: string): Promise<void> {
  const { error } = await supabase
    .from("vagas")
    .update({ etapa })
    .eq("id", id);
  if (error) throw error;
}

export async function atualizarVaga(id: string, input: Partial<CriarVagaInput>): Promise<void> {
  const { error } = await supabase.from("vagas").update(input).eq("id", id);
  if (error) throw error;
}

export async function definirStatusVaga(
  id: string,
  status: "ativa" | "standby" | "cancelada" | "concluida"
): Promise<void> {
  const { error } = await supabase.from("vagas").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function excluirVaga(id: string, justificativa: string): Promise<void> {
  await supabase
    .from("candidaturas")
    .update({ etapa: "Banco de Talentos" })
    .eq("vaga_id", id);
  const { error } = await supabase
    .from("vagas")
    .update({ excluida_em: new Date().toISOString(), motivo_exclusao: justificativa })
    .eq("id", id);
  if (error) throw error;
}
