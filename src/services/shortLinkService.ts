import { supabase } from "@/integrations/supabase/client";

function gerarCodigo(tamanho = 7): string {
  // sem 0/O/1/l/I pra evitar confusão visual
  const chars = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(
    { length: tamanho },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

export async function criarLinkCurto(destinoUrl: string, tipo?: string): Promise<string> {
  let codigo = gerarCodigo();
  for (let tentativas = 0; tentativas < 3; tentativas++) {
    const { error } = await supabase
      .from("connect_short_links")
      .insert({ codigo, destino_url: destinoUrl, tipo });
    if (!error) return `${window.location.origin}/l/${codigo}`;
    codigo = gerarCodigo();
  }
  console.error("[shortLink] falha ao gerar código único, usando link completo");
  return destinoUrl;
}
