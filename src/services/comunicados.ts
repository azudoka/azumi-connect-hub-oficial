import { supabase } from "@/lib/supabaseClient";

export interface Comunicado {
  id: string;
  cliente_id: string;
  categoria: string;
  titulo: string;
  conteudo: string;
  autor: string;
  cargo_autor: string | null;
  data: string;         // ISO: "YYYY-MM-DD"
  curtidas: number;
  comentarios: number;
  visualizacoes: number;
  imagem_url: string | null;
}

/**
 * Lista os comunicados do cliente ordenados por data (mais recente primeiro).
 * Retorna [] em caso de erro — a página exibe estado vazio amigável.
 */
export async function listarComunicados(clienteId: string): Promise<Comunicado[]> {
  const { data, error } = await supabase
    .from("hub_comunicados")
    .select("*")
    .eq("cliente_id", clienteId)
    .order("data", { ascending: false })
    .order("criado_em", { ascending: false });

  if (error) {
    console.error("[comunicados] erro ao carregar:", error.message);
    return [];
  }

  return data ?? [];
}
