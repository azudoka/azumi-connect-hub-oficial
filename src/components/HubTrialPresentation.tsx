import { ClipboardList, MessageSquare, Star, BarChart3, Calendar, Lock, ArrowRight, Sparkles } from "lucide-react";

const WHATSAPP_URL =
  "https://wa.me/5541999999999?text=" + encodeURIComponent("Olá! Quero conhecer o Azumi Hub.");

const MODULOS = [
  { icon: ClipboardList, titulo: "Onboarding", desc: "Estruture a chegada de novos colaboradores" },
  { icon: MessageSquare, titulo: "Comunicados", desc: "Mantenha sua equipe informada e engajada" },
  { icon: Star, titulo: "Destaque do Mês", desc: "Reconheça os melhores talentos" },
  { icon: BarChart3, titulo: "Performance", desc: "Avaliações e feedbacks contínuos" },
  { icon: Calendar, titulo: "Calendário", desc: "Eventos, aniversários e datas importantes" },
  { icon: Lock, titulo: "E muito mais...", desc: "Canal de denúncias, DP, jurídico e governança" },
];

export function HubTrialPresentation() {
  return (
    <div
      className="max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-sm border border-border bg-card"
      style={{ fontFamily: "'Urbanist', sans-serif" }}
    >
      {/* Header gradiente */}
      <div
        className="px-8 py-12 text-white text-center"
        style={{ background: "linear-gradient(135deg, #031D38 0%, #8B5CF6 100%)" }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs uppercase tracking-widest mb-4">
          <Sparkles className="h-3.5 w-3.5" /> Azumi Hub
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Conheça o Azumi Hub</h1>
        <p className="text-base md:text-lg opacity-90 max-w-2xl mx-auto">
          A plataforma de RH completa para sua equipe — comunicação, performance, engajamento e muito mais.
        </p>
      </div>

      {/* Grid de módulos */}
      <div className="p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MODULOS.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.titulo}
              className="rounded-xl border border-border bg-background p-5 hover:border-[#8B5CF6]/40 hover:shadow-md transition-all"
            >
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center mb-3"
                style={{ background: "#EDE9FE" }}
              >
                <Icon className="h-5 w-5" style={{ color: "#8B5CF6" }} />
              </div>
              <h3 className="font-bold text-foreground mb-1">{m.titulo}</h3>
              <p className="text-sm text-muted-foreground">{m.desc}</p>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div className="px-6 md:px-8 pb-8 pt-2 text-center">
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-lg text-sm font-semibold text-white hover:opacity-95 transition-opacity"
          style={{ background: "#8B5CF6" }}
        >
          Quero conhecer o Hub <ArrowRight className="h-4 w-4" />
        </a>
        <p className="text-xs text-muted-foreground mt-3">
          Nossa equipe entrará em contato pelo WhatsApp para apresentar o Azumi Hub.
        </p>
      </div>
    </div>
  );
}

export default HubTrialPresentation;
