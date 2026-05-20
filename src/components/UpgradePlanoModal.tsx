import { useMemo } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Sparkles, Check, Star } from "lucide-react";
import type { Plano } from "@/context/AuthContext";

interface UpgradePlanoModalProps {
  open: boolean;
  onClose: () => void;
  planoAtual: Plano | null | undefined;
}

type PlanoKey = "start" | "ongoing" | "growth";

interface PlanoDef {
  key: PlanoKey;
  nome: string;
  tagline: string;
  features: string[];
  porte: string;
}

const PLANOS: PlanoDef[] = [
  {
    key: "start",
    nome: "Start",
    tagline: "Para começar a estruturar seu RH",
    features: [
      "15 horas/mês",
      "Até 2 frentes ativas",
      "Diagnóstico de Maturidade (Raio-X)",
      "Gestão de vagas (até 1/mês)",
      "Padronização de processos e documentos",
      "Onboarding estruturado",
      "SLA de resposta: 48h úteis",
      "2 usuários Azumi Connect",
    ],
    porte: "15–45 colaboradores · 1 unidade",
  },
  {
    key: "ongoing",
    nome: "Ongoing",
    tagline: "O mais escolhido por empresas em crescimento",
    features: [
      "25 horas/mês",
      "Até 3 frentes ativas",
      "Tudo do Start +",
      "Atração e seleção (até 2 vagas/mês)",
      "Avaliação de Desempenho",
      "People Analytics básico",
      "Reuniões quinzenais de alinhamento",
      "1 visita presencial/mês",
      "SLA de resposta: 24h úteis",
      "3 usuários Azumi Connect",
    ],
    porte: "40–120 colaboradores · até 2 unidades",
  },
  {
    key: "growth",
    nome: "Growth",
    tagline: "Para operações maduras e escaláveis",
    features: [
      "40 horas/mês",
      "Até 5 frentes ativas",
      "Tudo do Ongoing +",
      "Business Partner dedicado",
      "Arquitetura de Cargos e Salários",
      "Programa de Líderes (PDL)",
      "Consultoria de Cultura e Employer Branding",
      "Até 2 visitas presenciais/mês",
      "SLA de resposta: 12h úteis",
      "4 usuários Azumi Connect",
    ],
    porte: "100–250 colaboradores · até 4 unidades",
  },
];

const WHATSAPP = "5541999999999";

function whatsappUrl(nome: string) {
  const texto = `Olá! Tenho interesse no plano ${nome} da Azumi Connect.`;
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`;
}

export function UpgradePlanoModal({ open, onClose, planoAtual }: UpgradePlanoModalProps) {
  const planosVisiveis = useMemo(() => {
    if (planoAtual === "ongoing") return PLANOS.filter((p) => p.key === "growth");
    if (planoAtual === "start") return PLANOS.filter((p) => p.key === "ongoing" || p.key === "growth");
    return PLANOS;
  }, [planoAtual]);

  const titulo =
    planoAtual === "ongoing"
      ? "Evolua para o Growth"
      : planoAtual === "start"
      ? "Faça upgrade do seu plano"
      : "Conheça os planos Azumi Connect";

  const subtitulo =
    planoAtual === "trial" || !planoAtual
      ? "Escolha o plano ideal para o momento da sua empresa"
      : "Expanda sua operação com mais horas, frentes e benefícios";

  const gradientByKey: Record<PlanoKey, string> = {
    start: "bg-gradient-to-br from-[#031D38] to-[#1e3a5f]",
    ongoing: "bg-gradient-to-br from-[#1D4E89] to-[#3B82F6]",
    growth: "bg-gradient-to-br from-[#5B21B6] to-[#8B5CF6]",
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-0"
        style={{ fontFamily: "'Urbanist', sans-serif" }}
      >
        {/* Header escuro */}
        <div className="px-6 py-5" style={{ background: "#031D38", color: "white" }}>
          <div className="flex items-center gap-2 mb-1.5 text-[11px] uppercase tracking-widest opacity-70">
            <Sparkles className="h-3 w-3" /> Azumi Connect
          </div>
          <h2 className="text-xl md:text-2xl font-bold leading-tight">{titulo}</h2>
          <p className="text-xs opacity-80 mt-1">{subtitulo}</p>
        </div>

        {/* Cards de planos */}
        <div className="p-5 bg-background">
          <div
            className={`grid gap-4 ${
              planosVisiveis.length === 1
                ? "grid-cols-1 max-w-sm mx-auto"
                : planosVisiveis.length === 2
                ? "grid-cols-1 sm:grid-cols-2"
                : "grid-cols-1 sm:grid-cols-3"
            }`}
          >
            {planosVisiveis.map((p) => {
              const destaque = p.key === "ongoing";
              return (
                <div
                  key={p.key}
                  className={`relative rounded-2xl p-4 flex flex-col text-white ${gradientByKey[p.key]} ${
                    destaque ? "ring-2 ring-[#8B5CF6] shadow-lg sm:-mt-2 sm:mb-2" : ""
                  }`}
                >
                  {destaque && (
                    <div
                      className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white flex items-center gap-1"
                      style={{ background: "#8B5CF6" }}
                    >
                      <Star className="h-2.5 w-2.5 fill-white" /> Mais escolhido
                    </div>
                  )}

                  <div className="mb-3">
                    <div className="text-[10px] font-bold uppercase tracking-widest mb-0.5 opacity-80">
                      Plano
                    </div>
                    <h3 className="text-xl font-bold">{p.nome}</h3>
                    <p className="text-[11px] opacity-80 mt-0.5">{p.tagline}</p>
                  </div>

                  <ul className="space-y-1.5 mb-4 flex-1">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-1.5 text-[12px] leading-snug">
                        <Check className="h-3.5 w-3.5 shrink-0 mt-0.5 opacity-90" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="text-[10px] opacity-75 border-t border-white/20 pt-2 mb-3">
                    {p.porte}
                  </div>

                  <a
                    href={whatsappUrl(p.nome)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onClose}
                    className="w-full h-10 rounded-lg flex items-center justify-center gap-2 text-xs font-semibold bg-white text-[#031D38] hover:bg-white/90 transition-colors"
                  >
                    Contratar {p.nome} →
                  </a>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full h-9 mt-4 rounded-lg text-xs text-muted-foreground hover:bg-secondary transition-colors"
          >
            Fechar
          </button>
          <p className="text-[10px] text-center text-muted-foreground mt-1.5">
            Ao contratar, nossa equipe entrará em contato pelo WhatsApp para confirmar os detalhes.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default UpgradePlanoModal;
