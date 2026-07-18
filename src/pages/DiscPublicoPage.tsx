import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DiscTeste from "@/components/disc/DiscTeste";
import { DiscIntroConsentimento } from "@/components/disc/DiscIntroConsentimento";
import type { DiscDim, DiscScores } from "@/components/disc/discQuestions";
import { AzumiLogo } from "@/components/brand/AzumiLogo";
import { MessageCircle, Mail } from "lucide-react";

const GRAD = "linear-gradient(160deg, #14233F 0%, #264478 55%, #3D63B8 100%)";
const WA_LINK = "https://wa.me/5541988350743";

function Capa({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: GRAD }} className="flex flex-col items-center gap-3 px-6 py-10 text-center text-white">
      <AzumiLogo product="Connect" size={44} light hideSubtitle />
      {children}
    </div>
  );
}

function BotaoContato() {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
      <a
        href={WA_LINK}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:brightness-95"
      >
        <MessageCircle className="h-4 w-4" /> WhatsApp
      </a>
      <a
        href="mailto:contato@azumirh.com.br"
        className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-white/20"
      >
        <Mail className="h-4 w-4" /> E-mail
      </a>
    </div>
  );
}

function BotaoContatoCard() {
  return (
    <div className="flex gap-2 mt-3">
      <a
        href={WA_LINK}
        target="_blank"
        rel="noreferrer"
        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-[#25D366] py-2 text-xs font-semibold text-white"
      >
        <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
      </a>
      <a
        href="mailto:contato@azumirh.com.br"
        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full border border-slate-300 py-2 text-xs font-semibold text-slate-600"
      >
        <Mail className="h-3.5 w-3.5" /> E-mail
      </a>
    </div>
  );
}

export default function DiscPublicoPage() {
  const { candidatoId } = useParams<{ candidatoId: string }>();
  const [nome, setNome] = useState<string | null>(null);
  const [cpfCandidato, setCpfCandidato] = useState<string | null>(null);
  const [jaRespondeu, setJaRespondeu] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [concluido, setConcluido] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [introAceita, setIntroAceita] = useState(false);
  const [cpfConfirmado, setCpfConfirmado] = useState(false);
  const [cpfInput, setCpfInput] = useState("");
  const [cpfErro, setCpfErro] = useState<string | null>(null);

  useEffect(() => {
    if (!candidatoId) { setErro("Link inválido."); setCarregando(false); return; }
    (async () => {
      const { data: cand, error } = await supabase
        .from("candidates")
        .select("nome, cpf")
        .eq("id", candidatoId)
        .single();
      if (error || !cand) { setErro("Candidato não encontrado. Confira o link recebido."); setCarregando(false); return; }
      setNome(cand.nome);
      setCpfCandidato((cand as any).cpf ?? null);

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
    if (error) { setErro("Erro ao salvar sua resposta: " + error.message); return; }
    setConcluido(true);
  }

  function formatarCpf(val: string) {
    const nums = val.replace(/\D/g, "").slice(0, 11);
    return nums
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1-$2");
  }

  function confirmarCpf() {
    const nums = cpfInput.replace(/\D/g, "");
    const cpfNums = (cpfCandidato ?? "").replace(/\D/g, "");
    if (nums.length < 11) { setCpfErro("Digite o CPF completo."); return; }
    if (nums === cpfNums) {
      setCpfConfirmado(true);
      setCpfErro(null);
    } else {
      setCpfErro("CPF incorreto. Verifique e tente novamente.");
    }
  }

  if (carregando) {
    return (
      <div className="min-h-screen bg-[#F0F4FA]">
        <Capa><p className="text-white/70 text-sm">Carregando…</p></Capa>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="min-h-screen bg-[#F0F4FA]">
        <Capa>
          <p className="mt-2 text-lg font-semibold">Algo deu errado</p>
          <p className="text-white/80 text-sm max-w-sm">{erro}</p>
          <p className="text-white/70 text-sm mt-1">Entre em contato com a consultora responsável:</p>
          <BotaoContato />
        </Capa>
      </div>
    );
  }

  if (jaRespondeu || concluido) {
    return (
      <div className="min-h-screen bg-[#F0F4FA]">
        <Capa>
          <p className="mt-2 text-xl font-semibold">
            {concluido ? `Obrigado, ${nome?.split(" ")[0]}!` : "Você já respondeu esse teste."}
          </p>
          <p className="text-white/80 text-sm max-w-sm">
            {concluido
              ? "Seu resultado foi registrado com sucesso. Nossa equipe já tem acesso ao seu perfil."
              : "Se algo parecer errado, entre em contato com a consultora responsável."}
          </p>
          {!concluido && <BotaoContato />}
        </Capa>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F4FA]">
      <Capa>
        <p className="text-white/70 text-sm -mt-1">Perfil Comportamental DISC</p>
      </Capa>

      <div className="max-w-2xl mx-auto py-8 px-4">
        {cpfCandidato && !cpfConfirmado ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
            <p className="text-slate-800 font-semibold text-lg">Confirme sua identidade</p>
            <p className="text-slate-500 text-sm mt-1 mb-6">
              Para acessar o teste DISC, informe seu CPF.
            </p>
            <div className="flex flex-col items-center gap-3 max-w-xs mx-auto">
              <input
                type="text"
                inputMode="numeric"
                placeholder="000.000.000-00"
                value={cpfInput}
                onChange={(e) => setCpfInput(formatarCpf(e.target.value))}
                onKeyDown={(e) => e.key === "Enter" && confirmarCpf()}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-center text-lg font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#264478]/30"
              />
              {cpfErro && (
                <div className="w-full">
                  <p className="text-red-500 text-sm">{cpfErro}</p>
                  <p className="text-slate-400 text-xs mt-2">Precisa de ajuda?</p>
                  <BotaoContatoCard />
                </div>
              )}
              <button
                onClick={confirmarCpf}
                className="w-full rounded-full bg-[#264478] py-3 text-sm font-semibold text-white transition hover:bg-[#1e3560]"
              >
                Confirmar
              </button>
            </div>
          </div>
        ) : !introAceita ? (
          <DiscIntroConsentimento
            nomeCandidato={nome ?? "Candidato"}
            onAceitar={() => setIntroAceita(true)}
          />
        ) : (
          <DiscTeste candidateName={nome ?? "Candidato"} onComplete={handleComplete} />
        )}
      </div>
    </div>
  );
}
