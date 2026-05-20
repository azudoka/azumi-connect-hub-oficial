import { useMemo } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Sparkles, ArrowUp, Clock, Briefcase, Zap, Users, Check } from "lucide-react";
import { toast } from "sonner";
import type { Plano } from "@/context/AuthContext";

interface UpgradePlanoModalProps {
  open: boolean;
  onClose: () => void;
  /** Plano atual do usuário; "trial" mostra fluxo de contratação inicial. */
  planoAtual: Plano | null | undefined;
}

interface PlanoInfo {
  titulo: string;
  subtitulo: string;
  proximoPlano: string;
  beneficios: { icon: typeof Clock; label: string; valor: string }[];
}

const INFO_POR_PLANO: Record<"trial" | "start" | "ongoing", PlanoInfo> = {
  trial: {
    titulo: "Bem-vindo à Azumi Connect",
    subtitulo: "Explore e depois contrate o plano ideal para você",
    proximoPlano: "plano completo",
    beneficios: [
      { icon: Clock, label: "Horas de consultoria", valor: "A partir de 20h/mês" },
      { icon: Briefcase, label: "Vagas simultâneas", valor: "Até 5 em paralelo" },
      { icon: Zap, label: "Prioridade no atendimento", valor: "SLA dedicado" },
      { icon: Users, label: "Business Partner", valor: "Consultor sênior" },
    ],
  },
  start: {
    titulo: "Evolua sua Operação",
    subtitulo: "Expanda sua capacidade com o plano Ongoing",
    proximoPlano: "Ongoing",
    beneficios: [
      { icon: Clock, label: "Horas Start → Ongoing", valor: "20h → 60h /mês" },
      { icon: Briefcase, label: "Vagas simultâneas", valor: "3 → 8 vagas" },
      { icon: Zap, label: "Prioridade", valor: "Padrão → Alta" },
      { icon: Users, label: "Business Partner", valor: "Compartilhado → Dedicado" },
    ],
  },
  ongoing: {
    titulo: "Evolua sua Operação",
    subtitulo: "Maximize com o plano Growth",
    proximoPlano: "Growth",
    beneficios: [
      { icon: Clock, label: "Horas Ongoing → Growth", valor: "60h → 160h /mês" },
      { icon: Briefcase, label: "Vagas simultâneas", valor: "8 → ilimitadas" },
      { icon: Zap, label: "Prioridade", valor: "Alta → Máxima" },
      { icon: Users, label: "Business Partner", valor: "Dedicado + squad executivo" },
    ],
  },
};

export function UpgradePlanoModal({ open, onClose, planoAtual }: UpgradePlanoModalProps) {
  const key: "trial" | "start" | "ongoing" =
    planoAtual === "start" ? "start" : planoAtual === "ongoing" ? "ongoing" : "trial";
  const info = useMemo(() => INFO_POR_PLANO[key], [key]);
  const ctaLabel = key === "trial" ? "Falar com a Azumi" : `Solicitar ${info.proximoPlano}`;

  function handleSolicitar() {
    toast.success("Solicitação enviada!", {
      description: "Nossa equipe entrará em contato em breve.",
    });
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-2xl p-0 overflow-hidden gap-0 border-0"
        style={{ fontFamily: "'Urbanist', sans-serif" }}
      >
        {/* Header escuro */}
        <div className="px-7 py-6" style={{ background: "#031D38", color: "white" }}>
          <div className="flex items-center gap-2 mb-2 text-xs uppercase tracking-widest opacity-70">
            <Sparkles className="h-3.5 w-3.5" /> Azumi Connect
          </div>
          <h2 className="text-2xl font-bold leading-tight">{info.titulo}</h2>
          <p className="text-sm opacity-80 mt-1">{info.subtitulo}</p>
        </div>

        {/* Benefícios 2x2 */}
        <div className="p-7 grid grid-cols-2 gap-3 bg-background">
          {info.beneficios.map((b) => (
            <div
              key={b.label}
              className="rounded-xl border border-border bg-card p-4 flex gap-3 items-start"
            >
              <div className="h-9 w-9 rounded-lg bg-[#EDE9FE] flex items-center justify-center shrink-0">
                <b.icon className="h-4 w-4 text-[#8B5CF6]" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                  {b.label}
                </div>
                <div className="text-sm font-semibold text-foreground mt-0.5">{b.valor}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Ações */}
        <div className="px-7 pb-6 pt-1 bg-background">
          <button
            type="button"
            onClick={handleSolicitar}
            className="w-full h-11 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold text-white hover:opacity-95 transition-opacity"
            style={{ background: "#031D38" }}
          >
            <Check className="h-4 w-4" /> {ctaLabel} →
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full h-10 mt-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary transition-colors"
          >
            Cancelar
          </button>
          <p className="text-[11px] text-center text-muted-foreground mt-3">
            Nossa equipe entrará em contato para confirmar a mudança.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default UpgradePlanoModal;
