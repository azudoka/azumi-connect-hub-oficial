import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { CheckCircle2, MessageCircle, Mail } from "lucide-react";

const GRAD = "linear-gradient(160deg, #14233F 0%, #264478 55%, #3D63B8 100%)";
const WA_LINK = "https://wa.me/5541988350743";

const SETORES_INTERESSE = [
  "Administrativo", "Comercial/Vendas", "Financeiro", "RH",
  "Tecnologia", "Operações", "Marketing", "Atendimento",
  "Logística", "Produção/Industrial",
];

interface Candidato {
  id: string;
  nome: string;
  email: string | null;
  interesses_setores: string[] | null;
  interesses_cargos: string[] | null;
}

type Step = "loading" | "erro" | "confirmacao" | "formulario" | "nao_reconheceu" | "concluido";

export default function AtualizarCadastroPage() {
  const { token } = useParams<{ token: string }>();
  const [step, setStep] = useState<Step>("loading");
  const [candidato, setCandidato] = useState<Candidato | null>(null);
  const [setoresSelecionados, setSetoresSelecionados] = useState<string[]>([]);
  const [cargos, setCargos] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    const hadMidnight = html.classList.contains("theme-midnight");
    html.classList.remove("theme-midnight");
    return () => { if (hadMidnight) html.classList.add("theme-midnight"); };
  }, []);

  useEffect(() => {
    if (!token) { setStep("erro"); return; }
    supabase
      .from("candidates")
      .select("id, nome, email, interesses_setores, interesses_cargos")
      .eq("token_atualizar_cadastro" as any, token)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) { setStep("erro"); return; }
        const cand = data as unknown as Candidato;
        setCandidato(cand);
        // Pré-preencher com valores existentes
        if (cand.interesses_setores?.length) setSetoresSelecionados(cand.interesses_setores);
        if (cand.interesses_cargos?.length) setCargos(cand.interesses_cargos.join(", "));
        setStep("confirmacao");
      });
  }, [token]);

  function toggleSetor(s: string) {
    setSetoresSelecionados((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  async function salvarAtualizacao() {
    if (!token) return;
    setSalvando(true);
    const cargosArray = cargos.split(",").map((c) => c.trim()).filter(Boolean);
    await supabase
      .from("candidates")
      .update({
        interesses_setores: setoresSelecionados.length ? setoresSelecionados : null,
        interesses_cargos: cargosArray.length ? cargosArray : null,
      } as any)
      .eq("token_atualizar_cadastro" as any, token);
    setSalvando(false);
    setStep("concluido");
  }

  // ── Renders ───────────────────────────────────────────────────────────────

  if (step === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: GRAD }}>
        <div className="h-8 w-8 rounded-full border-4 border-white/30 border-t-white animate-spin" />
      </div>
    );
  }

  if (step === "erro") {
    return (
      <Shell>
        <h1 className="text-xl font-bold mb-2">Link inválido</h1>
        <p className="text-white/80 text-sm mb-6">
          Este link de atualização não foi encontrado ou já expirou.
          Entre em contato com a equipe Azumi.
        </p>
        <Contatos />
      </Shell>
    );
  }

  if (step === "concluido") {
    return (
      <Shell>
        <CheckCircle2 className="h-14 w-14 text-emerald-300 mx-auto mb-4" />
        <h1 className="text-xl font-bold mb-2">Cadastro atualizado!</h1>
        <p className="text-white/80 text-sm">
          Obrigado, <strong>{candidato?.nome.split(" ")[0]}</strong>!
          Agora ficará mais fácil pra gente te avisar quando surgir uma oportunidade certa pra você.
        </p>
      </Shell>
    );
  }

  if (step === "nao_reconheceu") {
    return (
      <Shell>
        <h1 className="text-xl font-bold mb-2">Ops!</h1>
        <p className="text-white/80 text-sm mb-6">
          Se você recebeu esse e-mail por engano, entre em contato com nossa equipe.
        </p>
        <Contatos />
      </Shell>
    );
  }

  if (step === "confirmacao") {
    return (
      <Shell>
        <h1 className="text-xl font-bold mb-1">
          Oi, {candidato?.nome.split(" ")[0]}!
        </h1>
        <p className="text-white/80 text-sm mb-6">
          E-mail cadastrado: <strong>{candidato?.email ?? "—"}</strong>
        </p>
        <Card>
          <p className="text-[#14233F] text-sm font-medium mb-4">Esse é o seu cadastro?</p>
          <div className="flex gap-2">
            <BtnCard onClick={() => setStep("formulario")}>Sim, sou eu</BtnCard>
            <BtnCard secondary onClick={() => setStep("nao_reconheceu")}>Não reconheço</BtnCard>
          </div>
        </Card>
      </Shell>
    );
  }

  // step === "formulario"
  return (
    <Shell>
      <h1 className="text-xl font-bold mb-1">
        Olá, {candidato?.nome.split(" ")[0]}!
      </h1>
      <p className="text-white/80 text-sm mb-6">Selecione seus interesses.</p>
      <Card>
        <div className="space-y-5">
          <div>
            <p className="text-sm font-medium text-[#14233F] mb-2">Setores de interesse</p>
            <div className="flex flex-wrap gap-2">
              {SETORES_INTERESSE.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSetor(s)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs border transition-colors",
                    setoresSelecionados.includes(s)
                      ? "bg-[#264478] text-white border-[#264478]"
                      : "border-slate-300 text-slate-500 hover:border-[#264478]/50"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-[#14233F] mb-1">Cargos de interesse</p>
            <p className="text-xs text-slate-400 mb-2">Separados por vírgula</p>
            <input
              value={cargos}
              onChange={(e) => setCargos(e.target.value)}
              placeholder="Ex.: Analista de RH, Coordenador Administrativo"
              className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#264478]/30"
            />
          </div>

          <button
            type="button"
            onClick={salvarAtualizacao}
            disabled={salvando}
            className="w-full rounded-full bg-[#264478] py-3 text-sm font-semibold text-white transition hover:bg-[#1e3560] disabled:opacity-60"
          >
            {salvando ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </Card>
    </Shell>
  );
}

// ── Primitivos ────────────────────────────────────────────────────────────────

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-start justify-center px-4 py-14" style={{ background: GRAD }}>
      <div className="w-full max-w-md text-center text-white">
        <img
          src="https://raw.githubusercontent.com/azudoka/azumi-connect-hub-oficial/main/public/azumi-logo.png"
          alt="Azumi RH"
          height={32}
          className="mx-auto mb-2"
          style={{ height: 32 }}
        />
        <img
          src="https://raw.githubusercontent.com/azudoka/azumi-connect-hub-oficial/main/public/connect-logo.png"
          alt="Connect"
          height={40}
          className="mx-auto mb-8"
          style={{ height: 40 }}
        />
        {children}
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-6 text-left shadow-lg">{children}</div>
  );
}

function BtnCard({ onClick, children, secondary }: { onClick: () => void; children: React.ReactNode; secondary?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 rounded-full py-2.5 text-sm font-semibold transition",
        secondary
          ? "border border-slate-300 text-slate-600 hover:bg-slate-50"
          : "bg-[#264478] text-white hover:bg-[#1e3560]"
      )}
    >
      {children}
    </button>
  );
}

function Contatos() {
  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      <a
        href={WA_LINK}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white"
      >
        <MessageCircle className="h-4 w-4" /> WhatsApp
      </a>
      <a
        href="mailto:contato@azumirh.com.br"
        className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/20"
      >
        <Mail className="h-4 w-4" /> E-mail
      </a>
    </div>
  );
}
