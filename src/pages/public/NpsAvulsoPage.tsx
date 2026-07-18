import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AZUMI_LOGO_URL =
  "https://raw.githubusercontent.com/azudoka/azumi-connect-hub-oficial/main/public/azumi-logo.png";

export default function NpsAvulsoPage() {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [invalido, setInvalido] = useState(false);
  const [jaRespondido, setJaRespondido] = useState(false);
  const [nota, setNota] = useState(0);
  const [justificativa, setJustificativa] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setInvalido(true);
      setLoading(false);
      return;
    }
    supabase
      .from("nps_avaliacoes")
      .select("respondido")
      .eq("token", token)
      .single()
      .then(({ data, error }) => {
        if (error || !data) setInvalido(true);
        else if ((data as any).respondido) setJaRespondido(true);
        setLoading(false);
      });
  }, [token]);

  async function enviarResposta() {
    if (!token) return;
    setEnviando(true);
    setErro(null);
    const { error } = await supabase
      .from("nps_avaliacoes")
      .update({ nota, justificativa: justificativa.trim() || null, respondido: true } as any)
      .eq("token", token);
    if (error) {
      setErro("Erro ao enviar. Tente novamente.");
      setEnviando(false);
      return;
    }
    setEnviado(true);
    setEnviando(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#264478" }}>
        <div className="h-8 w-8 rounded-full border-2 border-white/30 border-t-white animate-spin" />
      </div>
    );
  }

  if (invalido) {
    return (
      <PageShell>
        <div className="bg-white rounded-2xl p-6 text-center space-y-2">
          <p className="font-semibold text-gray-800">Link inválido ou expirado</p>
          <p className="text-sm text-gray-500">Fale com seu consultor Azumi.</p>
        </div>
      </PageShell>
    );
  }

  if (jaRespondido || enviado) {
    return (
      <PageShell>
        <div className="bg-white rounded-2xl p-8 text-center space-y-3">
          <div className="text-4xl">🙏</div>
          <p className="font-bold text-gray-800">
            {enviado ? "Obrigado pelo seu feedback!" : "Avaliação já enviada"}
          </p>
          <p className="text-sm text-gray-500">
            {enviado
              ? "Sua avaliação foi registrada com sucesso. Isso nos ajuda a melhorar continuamente."
              : "Você já enviou uma avaliação para este processo."}
          </p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="bg-white rounded-2xl p-6 space-y-4">
        <p className="text-sm font-semibold text-gray-700 text-center">Avalie sua experiência</p>

        <div className="flex gap-1 justify-center">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setNota(n)}
              className="p-1 transition-transform hover:scale-110 active:scale-95"
            >
              <Star
                className="h-10 w-10 transition-colors"
                style={{
                  fill: n <= nota ? "#f59e0b" : "none",
                  color: n <= nota ? "#f59e0b" : "#d1d5db",
                  strokeWidth: 1.5,
                }}
              />
            </button>
          ))}
        </div>

        {nota > 0 && nota <= 3 && (
          <textarea
            value={justificativa}
            onChange={(e) => setJustificativa(e.target.value)}
            placeholder="Conte o que podemos melhorar (obrigatório)"
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
          />
        )}

        {erro && <p className="text-xs text-red-500 text-center">{erro}</p>}

        <button
          disabled={nota === 0 || (nota <= 3 && !justificativa.trim()) || enviando}
          onClick={enviarResposta}
          className="w-full h-11 rounded-xl text-white font-semibold text-sm transition-opacity disabled:opacity-40"
          style={{ background: "#264478" }}
        >
          {enviando ? "Enviando…" : "Enviar avaliação"}
        </button>
      </div>
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: "#264478" }}
    >
      <img src={AZUMI_LOGO_URL} alt="Azumi RH" style={{ height: 36, marginBottom: 28 }} />
      <h1 className="text-white text-xl font-bold text-center mb-6 leading-snug">
        Como foi sua experiência
        <br />
        com o candidato indicado?
      </h1>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
