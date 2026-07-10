import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DiscTeste from "@/components/disc/DiscTeste";
import type { DiscDim, DiscScores } from "@/components/disc/discQuestions";

const NAVY = "#031D38";

export default function DiscPublicoPage() {
  const { candidatoId } = useParams<{ candidatoId: string }>();
  const [nome, setNome] = useState<string | null>(null);
  const [jaRespondeu, setJaRespondeu] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [concluido, setConcluido] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!candidatoId) { setErro("Link inválido."); setCarregando(false); return; }
    (async () => {
      const { data: cand, error } = await supabase
        .from("candidates")
        .select("nome")
        .eq("id", candidatoId)
        .single();
      if (error || !cand) { setErro("Candidato não encontrado. Confira o link recebido."); setCarregando(false); return; }
      setNome(cand.nome);

      const { data: discExistente } = await supabase
        .from("disc_resultado_candidato")
        .select("id")
        .eq("candidato_id", candidatoId)
        .maybeSingle();
      if (discExistente) setJaRespondeu(true);

      setCarregando(false);
    })();
  }, [candidatoId]);

  async function handleComplete(scores: DiscScores, perfilDim: DiscDim) {
    const entries = (["D", "I", "S", "C"] as const)
      .map((k) => ({ k, v: scores[k] }))
      .sort((a, b) => b.v - a.v);
    const fatorSecundario = entries[1]?.k ?? null;

    const { error } = await supabase.from("disc_resultado_candidato").insert({
      candidato_id: candidatoId,
      score_d: scores.D,
      score_i: scores.I,
      score_s: scores.S,
      score_c: scores.C,
      fator_predominante: perfilDim,
      fator_secundario: fatorSecundario,
    });
    if (error) {
      setErro("Erro ao salvar sua resposta: " + error.message);
      return;
    }
    setConcluido(true);
  }

  if (carregando) {
    return (
      <div style={{ background: "#F5F7FA", minHeight: "100vh" }} className="flex items-center justify-center text-slate-500">
        Carregando…
      </div>
    );
  }

  if (erro) {
    return (
      <div style={{ background: "#F5F7FA", minHeight: "100vh" }} className="flex flex-col items-center justify-center gap-2 text-center px-6">
        <p className="text-slate-800 font-medium">{erro}</p>
      </div>
    );
  }

  if (jaRespondeu || concluido) {
    return (
      <div style={{ background: "#F5F7FA", minHeight: "100vh" }} className="flex flex-col items-center justify-center gap-3 text-center px-6">
        <h1 className="text-xl font-semibold text-slate-800">
          {concluido ? `Obrigado, ${nome}!` : "Você já respondeu esse teste."}
        </h1>
        <p className="text-slate-600">
          {concluido
            ? "Seu resultado foi registrado com sucesso. Nossa equipe já tem acesso."
            : "Se algo parecer errado, entre em contato com o consultor responsável pela sua candidatura."}
        </p>
      </div>
    );
  }

  return (
    <div style={{ background: "#F5F7FA", minHeight: "100vh" }}>
      <header style={{ background: NAVY }} className="py-4 px-6">
        <span className="text-white text-lg font-semibold">azumi </span>
        <span style={{ color: "#93C5FD" }} className="text-lg font-semibold">RH</span>
      </header>
      <div className="max-w-2xl mx-auto py-8 px-4">
        <DiscTeste candidateName={nome ?? "Candidato"} onComplete={handleComplete} />
      </div>
    </div>
  );
}
