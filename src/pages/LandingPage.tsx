import { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { AzumiLogo } from "@/components/brand/AzumiLogo";
import { CinematicHero } from "@/components/CinematicHero";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/utils";
import azumiLogoBranca from "@/assets/brand/azumi-logo-branca.png";
import {
  ArrowRight, CheckCircle2, Users, MessageCircle, Instagram,
  Mail, Linkedin, Clock, FileText, BarChart3, Kanban,
  ChevronRight, Calendar, FolderOpen, Star, ShieldCheck,
  ClipboardList, Timer, Brain, TrendingUp, Smartphone,
  LayoutDashboard, Bell, CreditCard, Globe, Zap, BookOpen,
  Scale, UserPlus, Activity, MessageSquare, ChevronLeft,
  GraduationCap,
} from "lucide-react";

// ── Constantes ───────────────────────────────────────────────────────
const WA = "5541988350743";
const waLink = (texto: string) =>
  `https://wa.me/${WA}?text=${encodeURIComponent(texto)}`;
const WA_DEFAULT = waLink(
  "Olá! Vim pela landing page do Azumi Connect e quero saber mais sobre a consultoria Azumi RH."
);

function fireConversion() {
  if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
    (window as any).gtag("event", "conversion", {
      send_to: "AW-18333141930/YRvRCI-Q4tIcEKqX9qVE",
    });
  }
}

const ROLE_MAP: Record<string, string> = {
  admin: "/app/dashboard", consultor: "/app/dashboard",
  rh: "/app/dashboard", rh_operacional: "/app/dashboard",
  cliente: "/cliente/dashboard", cliente_avulso: "/cliente/dashboard",
  trial: "/cliente/dashboard", colaborador: "/hub/colaborador/inicio",
  lider: "/hub/lider/painel", ceo: "/hub/ceo/dashboard",
  dp: "/hub/colaborador/inicio", contador: "/hub/colaborador/inicio",
  juridico: "/hub/colaborador/inicio",
};

const SCREENSHOTS = [
  { src: "/screenshots/tela-01.png", label: "Atração & Seleção" },
  { src: "/screenshots/tela-02.png", label: "Portal do Cliente" },
  { src: "/screenshots/tela-03.png", label: "Projetos" },
  { src: "/screenshots/tela-04.png", label: "Solicitações" },
  { src: "/screenshots/tela-05.png", label: "Dashboard" },
  { src: "/screenshots/tela-06.png", label: "Relatórios" },
  { src: "/screenshots/tela-07.png", label: "Calendário" },
];

const FOTOS_AZUMI = [
  "/screenshots/azumirh/azumirh-01.png",
  "/screenshots/azumirh/azumirh-02.png",
  "/screenshots/azumirh/azumirh-03.png",
  "/screenshots/azumirh/azumirh-04.png",
];

// ── Serviços da Azumi ────────────────────────────────────────────────
const SERVICOS = [
  { icon: GraduationCap, title: "Treinamentos e Capacitação", desc: "Desenvolvimento prático das equipes e lideranças." },
  { icon: ShieldCheck, title: "Compliance", desc: "Adequação às normas trabalhistas e regulatórias." },
  { icon: Activity, title: "Diagnóstico Organizacional", desc: "Raio-X de maturidade de RH para embasar decisões." },
  { icon: Users, title: "Atração e Seleção de Talentos", desc: "Processos seletivos estruturados do briefing à contratação." },
  { icon: TrendingUp, title: "Planejamento de Carreira", desc: "Trilhas de desenvolvimento e planos de sucessão." },
  { icon: Globe, title: "Go to Market", desc: "Estratégias de entrada e posicionamento com o time de RH." },
  { icon: Zap, title: "Programa Impulso para RH", desc: "Aceleração do departamento de RH com metodologia própria." },
  { icon: Scale, title: "Governança e Regulamentação", desc: "Estruturação de políticas, cargos e compliance trabalhista." },
];

// ── O que tem na plataforma ──────────────────────────────────────────
const MODULOS_CLIENTE = [
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    desc: "Controle do contrato em tempo real: projetos, entregáveis, cronograma e toda comunicação rastreada.",
  },
  {
    icon: Clock,
    title: "Horas",
    desc: "Acompanhe quantas horas do seu pacote já foram consumidas e o que está sendo feito com elas.",
  },
  {
    icon: MessageSquare,
    title: "Solicitações",
    desc: "Abra pedidos de dúvidas, reuniões, ajustes, novos usuários, relatórios e mudanças de plano — tudo rastreável.",
  },
  {
    icon: Kanban,
    title: "Atração & Vagas",
    desc: "Acompanhe e solicite vagas, receba relatórios de perfil comportamental e questionário técnico de cada candidato.",
  },
  {
    icon: CreditCard,
    title: "Gestão de Conta",
    desc: "Acompanhe seus boletos e solicite segunda via sem precisar entrar em contato por e-mail.",
  },
  {
    icon: BarChart3,
    title: "Relatórios",
    desc: "Relatórios mensais e de cada serviço disponíveis para leitura direto na plataforma.",
  },
  {
    icon: FolderOpen,
    title: "Documentos",
    desc: "Tudo guardado na nuvem, organizado e pronto para auditoria quando precisar.",
  },
  {
    icon: Calendar,
    title: "Calendário",
    desc: "Eventos de marketing e reuniões internas organizados num só lugar, compartilhado com a Azumi.",
  },
  {
    icon: Bell,
    title: "Comunicados",
    desc: "Feed de notícias com as atualizações da Azumi para a sua empresa — sem depender de e-mail.",
  },
];

// ── Features técnicas ────────────────────────────────────────────────
type Feature = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  descricaoCompleta: string;
  available: boolean;
};

const FEATURES: Feature[] = [
  {
    icon: Kanban,
    title: "Atração e Seleção",
    description: "Kanban com funil configurável e SLA.",
    descricaoCompleta:
      "Gerencie todo o ciclo de recrutamento com funil visual: vagas abertas, candidatos em triagem, agendamentos e aprovações — com SLA definido por vaga e histórico completo de cada etapa registrado pela equipe Azumi.",
    available: true,
  },
  {
    icon: Users,
    title: "Portal do Cliente",
    description: "Acesso exclusivo para o gestor da empresa.",
    descricaoCompleta:
      "O responsável na empresa acessa o portal para acompanhar vagas em aberto, aprovar candidatos indicados e abrir novas solicitações — sem depender de reunião ou e-mail para saber o status do processo.",
    available: true,
  },
  {
    icon: BarChart3,
    title: "Projetos e Horas",
    description: "Registro de entregas e horas por projeto.",
    descricaoCompleta:
      "Cada hora trabalhada pela consultora Azumi fica registrada e vinculada ao projeto correspondente. O cliente acompanha o consumo de horas e o avanço dos projetos em tempo real, com total transparência.",
    available: true,
  },
  {
    icon: ClipboardList,
    title: "Solicitações",
    description: "Canal direto com a equipe Azumi.",
    descricaoCompleta:
      "O cliente abre solicitações diretamente na plataforma — novas demandas, ajustes de escopo ou dúvidas pontuais. O time Azumi recebe, responde e registra tudo, mantendo histórico completo de cada interação.",
    available: true,
  },
  {
    icon: FileText,
    title: "Relatórios de Processo",
    description: "Exportável ao final de cada vaga ou projeto.",
    descricaoCompleta:
      "Ao encerrar uma vaga ou ciclo de projeto, a Azumi gera um relatório completo: candidato selecionado, tempo de processo, etapas percorridas, avaliações DISC e feedbacks — tudo documentado e exportável.",
    available: true,
  },
  {
    icon: Star,
    title: "DISC Integrado",
    description: "Perfil comportamental dentro do processo seletivo.",
    descricaoCompleta:
      "Testes DISC são enviados e avaliados diretamente dentro da vaga — sem sistemas externos. Os resultados ficam vinculados ao candidato e acessíveis para consultor e gestor, com interpretação incluída.",
    available: true,
  },
  {
    icon: Timer,
    title: "SLA e Alertas",
    description: "Prazo por vaga com monitoramento automático.",
    descricaoCompleta:
      "Cada vaga tem um prazo de entrega definido no briefing. O sistema monitora o SLA automaticamente e alerta a equipe quando o processo está próximo do limite — garantindo compromisso com as entregas.",
    available: true,
  },
  {
    icon: Calendar,
    title: "Agenda e Entrevistas",
    description: "Agendamentos com confirmação automatizada.",
    descricaoCompleta:
      "Agendamentos de entrevistas são gerenciados dentro da plataforma, com envio de links e confirmações automáticas para candidatos e gestores. O histórico de cada entrevista fica vinculado ao candidato.",
    available: true,
  },
  {
    icon: Brain,
    title: "IA para Triagem",
    description: "Classificação automática de candidatos.",
    descricaoCompleta:
      "Em desenvolvimento: a IA vai analisar currículos e respostas dos candidatos para indicar automaticamente os perfis mais aderentes ao briefing da vaga — reduzindo o tempo de triagem manual da consultora.",
    available: false,
  },
  {
    icon: Smartphone,
    title: "App Mobile",
    description: "Acesso completo pelo celular.",
    descricaoCompleta:
      "Em desenvolvimento: aplicativo para iOS e Android que permite que consultoras e gestores acompanhem vagas, aprovem candidatos e respondam solicitações de qualquer lugar, sem abrir o computador.",
    available: false,
  },
  {
    icon: TrendingUp,
    title: "Dashboard Preditivo",
    description: "People Analytics avançado.",
    descricaoCompleta:
      "Em desenvolvimento: painel consolidado com indicadores preditivos de turnover, clima organizacional e performance — transformando os dados de RH coletados pela Azumi em inteligência estratégica para o cliente.",
    available: false,
  },
  {
    icon: FolderOpen,
    title: "Documentos",
    description: "Repositório de arquivos e contratos.",
    descricaoCompleta:
      "Em desenvolvimento: gestão centralizada de documentos vinculados a vagas, colaboradores e projetos — contratos, políticas internas, descrições de cargo e templates acessíveis por consultoras e clientes.",
    available: false,
  },
];

// ── Componentes de animação ──────────────────────────────────────────
function AnimCard({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} className={className} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(36px)",
      transition: `opacity 0.6s ease ${delay}ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

function AnimSection({ children, className = "" }: {
  children: React.ReactNode; className?: string;
}) {
  const { ref, inView } = useInView(0.08);
  return (
    <div ref={ref} className={className} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(24px)",
      transition: "opacity 0.55s ease, transform 0.55s cubic-bezier(0.16,1,0.3,1)",
    }}>
      {children}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { usuario, carregando } = useAuth();
  const [moduloAtivo, setModuloAtivo] = useState<string | null>(null);
  const [slideAtivo, setSlideAtivo] = useState(0);
  const [slidePausado, setSlidePausado] = useState(false);

  // Autoplay do carrossel de screenshots
  useEffect(() => {
    if (slidePausado) return;
    const t = setInterval(() => {
      setSlideAtivo(p => (p + 1) % SCREENSHOTS.length);
    }, 4000);
    return () => clearInterval(t);
  }, [slidePausado]);

  if (carregando) return (
    <div className="flex items-center justify-center min-h-screen bg-[#0d1a2d]">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#7FA8E8] border-t-transparent" />
    </div>
  );

  if (usuario) return <Navigate to={ROLE_MAP[usuario.role] ?? "/login"} replace />;

  return (
    <div className="bg-white text-gray-900">

      {/* ── Nav ──────────────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-14 h-16 bg-[#0d1a2d]/90 backdrop-blur-sm border-b border-white/10">
        <AzumiLogo product="Connect" light size={20} />
        <Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-medium text-white/80 hover:text-white transition-colors">
          Acessar plataforma <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </header>

      {/* ── Hero Cinemático ───────────────────────────────────────── */}
      <CinematicHero
        tagline1="O legado dos seus clientes"
        tagline2="na palma de suas mãos"
        cardHeading="RH como serviço, do jeito certo."
        cardDescription={
          <>
            A <span className="text-white font-semibold">Azumi RH</span> opera como
            o seu departamento de RH — e o Connect é o espaço compartilhado onde
            tudo fica{" "}
            <span className="text-[#7FA8E8] font-semibold">visível, rastreável e documentado</span>{" "}
            em tempo real.
          </>
        }
        ctaHeading="Quer que a Azumi cuide do seu RH?"
        ctaDescription="Fale direto com a equipe — sem fila, sem SDR."
        screenshotSrc="/screenshots/tela-01.png"
        ctaPrimaryLabel="Falar com a equipe"
        ctaPrimaryHref={WA_DEFAULT}
        ctaSecondaryLabel="Conhecer a Azumi RH"
        ctaSecondaryHref="https://azumirh.com.br"
        onCTAPrimary={fireConversion}
      />

      {/* ── Sobre a Azumi + carrossel de fotos ───────────────────── */}
      <section className="pt-24 pb-0 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 md:px-14 mb-14">
          <AnimSection className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#3D63B8] block mb-4">
                Sobre a Azumi RH
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-6">
                Uma consultoria de RH que opera{" "}
                <span className="text-[#3D63B8]">junto com você</span>
              </h2>
              <p className="text-gray-500 leading-relaxed mb-4">
                A Azumi não é uma plataforma que a sua empresa opera sozinha.
                Somos uma <span className="text-gray-800 font-semibold">consultoria de recursos humanos</span> que
                usa a tecnologia como{" "}
                <span className="text-gray-800 font-semibold">ferramenta de gestão e entrega</span> do serviço.
              </p>
              <p className="text-gray-500 leading-relaxed mb-6">
                O Azumi Connect é onde sua empresa e os consultores Azumi trabalham
                juntos: vagas abertas, projetos em andamento, horas registradas e
                relatórios{" "}
                <span className="text-[#3D63B8] font-semibold">sempre disponíveis, em tempo real</span>.
              </p>
              <a
                href="https://azumirh.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#3D63B8] hover:text-[#264478] transition-colors"
              >
                Conheça a Azumi RH <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: <ShieldCheck className="h-5 w-5" />, label: "RH como serviço contínuo" },
                { icon: <Users className="h-5 w-5" />, label: "Consultores dedicados" },
                { icon: <BarChart3 className="h-5 w-5" />, label: "Indicadores em tempo real" },
                { icon: <Star className="h-5 w-5" />, label: "Metodologia própria" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-gray-200 bg-gray-50 p-4 flex items-start gap-3 shadow-sm">
                  <span className="text-[#3D63B8] mt-0.5 shrink-0">{item.icon}</span>
                  <span className="text-sm font-medium text-gray-700 leading-snug">{item.label}</span>
                </div>
              ))}
            </div>
          </AnimSection>
        </div>

        {/* Carrossel de fotos institucionais */}
        <div className="overflow-hidden pb-10">
          <InfiniteSlider gap={20} duration={45}>
            {[...FOTOS_AZUMI, ...FOTOS_AZUMI].map((src, i) => (
              <div key={i} className="h-56 w-80 shrink-0 rounded-2xl overflow-hidden shadow-md">
                <div className="w-full h-full bg-gradient-to-br from-[#264478] to-[#3D63B8]">
                  <img
                    src={src}
                    alt="Azumi RH"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
              </div>
            ))}
          </InfiniteSlider>
        </div>
      </section>

      {/* ── Serviços da Azumi RH ─────────────────────────────────── */}
      <section className="py-24 bg-[#0d1a2d]">
        <div className="max-w-5xl mx-auto px-6 md:px-14">
          <AnimSection className="mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-[#7FA8E8]/60 block mb-3">
              O que a Azumi faz
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight max-w-xl">
              Frentes de atuação da{" "}
              <span className="text-[#7FA8E8]">consultoria</span>
            </h2>
            <p className="mt-3 text-white/45 max-w-lg text-sm leading-relaxed">
              Cada frente de serviço é operada <span className="text-white/70 font-medium">dentro do Connect</span> —
              rastreável, documentada e visível para o cliente em tempo real.
            </p>
          </AnimSection>

          <div className="grid md:grid-cols-2 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/8">
            {SERVICOS.map((s, i) => {
              const Icon = s.icon;
              return (
                <AnimCard key={s.title} delay={i * 60}
                  className="flex items-start gap-4 p-6 bg-[#0d1a2d] hover:bg-white/3 transition-colors group">
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-[#3D63B8]/15 border border-[#3D63B8]/20 flex items-center justify-center group-hover:bg-[#3D63B8]/25 transition-colors mt-0.5">
                    <Icon className="h-5 w-5 text-[#7FA8E8]" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm mb-1">{s.title}</p>
                    <p className="text-white/40 text-xs leading-relaxed">{s.desc}</p>
                  </div>
                </AnimCard>
              );
            })}
          </div>

          <AnimSection className="mt-10 text-center">
            <a
              href={WA_DEFAULT}
              target="_blank"
              rel="noopener noreferrer"
              onClick={fireConversion}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#7FA8E8] hover:text-white transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              Saber quais frentes fazem sentido pra minha empresa
            </a>
          </AnimSection>
        </div>
      </section>

      {/* ── O que tem na plataforma ──────────────────────────────── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6 md:px-14">
          <AnimSection className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-[#3D63B8] block mb-3">
              Visão do cliente
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              O que você encontra dentro do Connect
            </h2>
            <p className="mt-3 text-gray-500 max-w-lg mx-auto">
              Quando você contrata a Azumi, ganha acesso ao portal do cliente com{" "}
              <span className="text-[#3D63B8] font-semibold">visibilidade total</span> sobre o serviço.
            </p>
          </AnimSection>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {MODULOS_CLIENTE.map((m, i) => {
              const Icon = m.icon;
              return (
                <AnimCard key={m.title} delay={i * 60}
                  className="rounded-xl bg-white border border-gray-200 p-5 hover:shadow-md hover:border-[#3D63B8]/20 transition-all group">
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#3D63B8]/8 group-hover:bg-[#3D63B8]/15 transition-colors">
                    <Icon className="h-5 w-5 text-[#3D63B8]" />
                  </div>
                  <p className="font-semibold text-gray-900 text-sm mb-1.5">{m.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{m.desc}</p>
                </AnimCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Módulos técnicos — cards horizontais interativos ─────── */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 md:px-14">
          <AnimSection className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#3D63B8] block mb-3">
              Dentro da plataforma
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Módulos técnicos</h2>
            <p className="mt-3 text-gray-500">
              Tudo incluído em{" "}
              <span className="text-[#3D63B8] font-semibold">qualquer contrato Azumi RH</span>.
              Passe o mouse para ver os detalhes de cada módulo.
            </p>
          </AnimSection>

          <AnimSection>
            <div className="flex gap-4 mb-5">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3D63B8]">
                <CheckCircle2 className="h-3.5 w-3.5" /> Disponível agora
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-500">
                <Clock className="h-3.5 w-3.5" /> Em desenvolvimento
              </span>
            </div>

            {/* Scroll container with padding to allow scale-105 without clipping */}
            <div className="overflow-x-auto pb-8 -mx-2 px-2"
              style={{ scrollbarWidth: "thin", scrollbarColor: "#3D63B8 #f1f5f9" }}>
              <div className="flex gap-4" style={{ minWidth: "max-content" }}>
                {FEATURES.map((f) => {
                  const ativo = moduloAtivo === f.title;
                  const Icon = f.icon;
                  return (
                    <button
                      key={f.title}
                      onMouseEnter={() => setModuloAtivo(f.title)}
                      onMouseLeave={() => setModuloAtivo(null)}
                      onClick={() => setModuloAtivo(ativo ? null : f.title)}
                      style={{ minHeight: ativo ? "220px" : "160px" }}
                      className={cn(
                        "shrink-0 w-56 rounded-2xl p-5 text-left transition-all duration-300 border",
                        ativo
                          ? "bg-[#3D63B8] text-white border-[#3D63B8] shadow-xl scale-105 z-10 relative"
                          : f.available
                            ? "bg-white text-gray-900 border-gray-200 shadow-sm hover:shadow-md hover:border-[#3D63B8]/30"
                            : "bg-gray-50 text-gray-600 border-gray-200 shadow-sm hover:shadow-md opacity-80"
                      )}
                    >
                      <Icon className={cn(
                        "h-6 w-6 mb-3 transition-colors",
                        ativo ? "text-white" : f.available ? "text-[#3D63B8]" : "text-amber-500"
                      )} />
                      <h4 className={cn("font-bold mb-2 text-sm", ativo ? "text-white" : "text-gray-900")}>
                        {f.title}
                      </h4>
                      <p className={cn(
                        "text-xs leading-relaxed transition-all duration-300",
                        ativo ? "text-white/90" : "text-gray-500"
                      )}>
                        {ativo ? f.descricaoCompleta : f.description}
                      </p>
                      {!f.available && !ativo && (
                        <span className="mt-3 inline-flex items-center gap-1 text-xs text-amber-500 font-semibold">
                          <Clock className="h-3 w-3" /> Em breve
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </AnimSection>
        </div>
      </section>

      {/* ── Carrossel de telas com autoplay + dots ───────────────── */}
      <section className="py-16 bg-[#080f1a]">
        <AnimSection className="text-center mb-10 px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#7FA8E8]/60 mb-2">
            Veja a plataforma em ação
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-white">O Connect na prática</h2>
          <p className="mt-2 text-white/40 text-sm max-w-lg mx-auto">
            A plataforma onde sua empresa e a Azumi{" "}
            <span className="text-white/70 font-medium">trabalham juntas</span> — vagas,
            projetos, horas e relatórios em um só lugar.
          </p>
        </AnimSection>

        <div
          className="relative max-w-4xl mx-auto px-6"
          onMouseEnter={() => setSlidePausado(true)}
          onMouseLeave={() => setSlidePausado(false)}
        >
          {/* Contador */}
          <div className="flex items-center justify-between mb-4 px-1">
            <span className="text-xs font-semibold text-[#7FA8E8]/50 uppercase tracking-widest">
              {SCREENSHOTS[slideAtivo]?.label}
            </span>
            <span className="text-xs text-white/30 font-medium tabular-nums">
              {slideAtivo + 1} de {SCREENSHOTS.length}
            </span>
          </div>

          {/* Imagem principal */}
          <div className="relative rounded-2xl overflow-hidden bg-[#0d1a2d] border border-white/8 shadow-2xl"
            style={{ aspectRatio: "16/9" }}>
            {SCREENSHOTS.map((s, i) => (
              <img
                key={s.src}
                src={s.src}
                alt={s.label}
                className="absolute inset-0 w-full h-full object-contain transition-opacity duration-700"
                style={{ opacity: i === slideAtivo ? 1 : 0, pointerEvents: i === slideAtivo ? "auto" : "none" }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            ))}
          </div>

          {/* Botões prev/next */}
          <button
            onClick={() => setSlideAtivo(p => (p - 1 + SCREENSHOTS.length) % SCREENSHOTS.length)}
            className="absolute left-2 md:-left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/8 border border-white/12 flex items-center justify-center text-white/60 hover:bg-white/16 hover:text-white transition-all"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setSlideAtivo(p => (p + 1) % SCREENSHOTS.length)}
            className="absolute right-2 md:-right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/8 border border-white/12 flex items-center justify-center text-white/60 hover:bg-white/16 hover:text-white transition-all"
            aria-label="Próximo"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Dots */}
          <div className="flex items-center justify-center gap-2 mt-5">
            {SCREENSHOTS.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlideAtivo(i)}
                className={cn(
                  "transition-all duration-300 rounded-full",
                  i === slideAtivo
                    ? "w-6 h-2 bg-[#3D63B8]"
                    : "w-2 h-2 bg-white/20 hover:bg-white/40"
                )}
                aria-label={`Ir para tela ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Quem utiliza ─────────────────────────────────────────── */}
      <section className="py-24 bg-[#0d1a2d]">
        <div className="max-w-5xl mx-auto px-6 md:px-14">
          <AnimSection className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Quem utiliza o Connect</h2>
            <p className="mt-3 text-white/50">
              Três perfis, um único espaço de{" "}
              <span className="text-white/80 font-semibold">trabalho compartilhado</span>.
            </p>
          </AnimSection>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                src: "/fotos/persona-empresa.jpg",
                gradient: "from-[#264478] to-[#3D63B8]",
                role: "Sua empresa (cliente Azumi)",
                sub: "Visibilidade total, sem intermediário",
                desc: <>O gestor acessa o portal para <span className="text-white/90 font-semibold">acompanhar vagas e projetos</span>, aprovar candidatos e abrir solicitações — em parceria com o time Azumi, não sozinho.</>,
                delay: 0,
              },
              {
                src: "/fotos/persona-consultora.jpg",
                gradient: "from-[#3D63B8] to-[#7FA8E8]",
                role: "Consultoras Azumi",
                sub: "Onde a operação acontece",
                desc: <>As consultoras <span className="text-white/90 font-semibold">registram entregas e gerenciam candidatos</span> diretamente no Connect — tudo visível para o cliente em tempo real, sem planilha paralela.</>,
                delay: 100,
              },
              {
                src: "/fotos/persona-gestao.jpg",
                gradient: "from-[#1a3a6b] to-[#264478]",
                role: "Liderança Azumi",
                sub: "Qualidade e indicadores consolidados",
                desc: <>A liderança monitora <span className="text-white/90 font-semibold">indicadores de SLA, performance e saúde dos contratos</span> ativos em um dashboard unificado.</>,
                delay: 200,
              },
            ].map((p) => (
              <AnimCard key={p.role} delay={p.delay}
                className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden hover:bg-white/8 transition-colors">
                <div className="h-44 w-full overflow-hidden relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${p.gradient}`} />
                  <img src={p.src} alt={p.role}
                    className="w-full h-full object-cover relative z-10"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
                <div className="p-6">
                  <p className="text-xs font-semibold text-[#7FA8E8] uppercase tracking-widest mb-1">{p.sub}</p>
                  <p className="font-semibold text-white mb-2">{p.role}</p>
                  <p className="text-sm text-white/55 leading-relaxed">{p.desc}</p>
                </div>
              </AnimCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── Como funciona — com ícones ────────────────────────────── */}
      <section className="py-24 bg-gray-50 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 md:px-14">
          <AnimSection className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Como funciona</h2>
            <p className="mt-3 text-gray-500">
              Do primeiro contato ao{" "}
              <span className="text-[#3D63B8] font-semibold">relatório final</span> — 4 etapas.
            </p>
          </AnimSection>

          {/* Desktop: horizontal */}
          <div className="hidden md:block">
            <div className="relative">
              <div className="absolute top-[30px] left-[calc(12.5%)] right-[calc(12.5%)] h-px bg-gradient-to-r from-[#3D63B8] via-[#7FA8E8] to-[#3D63B8]" />
              <div className="grid grid-cols-4 gap-4">
                {[
                  {
                    n: "01", icon: FileText,
                    title: "Contratação",
                    desc: "Você contrata a Azumi RH e ganha acesso ao Connect junto com sua consultora dedicada.",
                  },
                  {
                    n: "02", icon: UserPlus,
                    title: "Onboarding no Connect",
                    desc: "A Azumi configura o ambiente da sua empresa, cadastra usuários e abre as primeiras demandas.",
                  },
                  {
                    n: "03", icon: Activity,
                    title: "Operação conjunta",
                    desc: "Vagas, projetos e solicitações gerenciados pela Azumi — registrados e visíveis para você no portal.",
                  },
                  {
                    n: "04", icon: BarChart3,
                    title: "Relatórios e evolução",
                    desc: "A cada ciclo, indicadores e relatórios consolidados para avaliar resultados e planejar os próximos passos.",
                  },
                ].map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <AnimCard key={step.n} delay={i * 120} className="flex flex-col items-center text-center px-2">
                      <div className="relative z-10 flex flex-col items-center mb-5">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#3D63B8] text-white shadow-lg shadow-[#3D63B8]/30 mb-1">
                          <Icon className="h-6 w-6" />
                        </div>
                        <span className="text-[10px] font-bold text-[#7FA8E8]/60 uppercase tracking-widest">{step.n}</span>
                      </div>
                      <p className="font-semibold text-gray-900 mb-2 text-sm">{step.title}</p>
                      <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
                    </AnimCard>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Mobile: vertical */}
          <div className="md:hidden relative">
            <div className="absolute left-5 top-6 bottom-6 w-px bg-gradient-to-b from-[#3D63B8] via-[#7FA8E8] to-transparent" />
            <div className="space-y-8">
              {[
                { n: "01", icon: FileText, title: "Contratação", desc: "Você contrata a Azumi RH e ganha acesso ao Connect junto com sua consultora dedicada." },
                { n: "02", icon: UserPlus, title: "Onboarding no Connect", desc: "A Azumi configura o ambiente da sua empresa, cadastra usuários e abre as primeiras demandas." },
                { n: "03", icon: Activity, title: "Operação conjunta", desc: "Vagas, projetos e solicitações gerenciados pela Azumi — registrados e visíveis para você no portal." },
                { n: "04", icon: BarChart3, title: "Relatórios e evolução", desc: "A cada ciclo, indicadores e relatórios consolidados para avaliar resultados e planejar os próximos passos." },
              ].map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.n} className="relative flex gap-6 items-start">
                    <div className="relative z-10 flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-[#3D63B8] text-white shadow-lg shadow-[#3D63B8]/30">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="pt-1.5">
                      <span className="text-[10px] font-bold text-[#7FA8E8]/60 uppercase tracking-widest">{step.n}</span>
                      <p className="font-semibold text-gray-900 mb-1">{step.title}</p>
                      <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Planos ───────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6 md:px-14">
          <AnimSection className="text-center mb-5">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Planos de contratação da Azumi RH
            </h2>
          </AnimSection>

          <AnimSection>
            <div className="max-w-2xl mx-auto mb-14 rounded-2xl border border-[#3D63B8]/20 bg-[#3D63B8]/5 p-6 text-center">
              <p className="text-sm font-semibold text-[#3D63B8] uppercase tracking-widest mb-2">O que é HRaaS?</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                <span className="font-semibold text-gray-800">HRaaS (HR as a Service)</span> é o modelo de
                RH como serviço da Azumi: sua empresa contrata a{" "}
                <span className="font-semibold text-gray-800">operação completa de recursos humanos</span> sem
                precisar montar um time de RH próprio. O{" "}
                <span className="font-semibold text-[#3D63B8]">Azumi Connect vem incluso em qualquer plano</span> — é
                a ferramenta onde Azumi e cliente trabalham juntos, não um produto separado.
              </p>
            </div>
          </AnimSection>

          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {[
              {
                name: "Start",
                desc: "Para empresas iniciando a estruturação de RH.",
                hours: "15 h/mês", frentes: "Até 2 frentes",
                features: ["Diagnóstico de Maturidade (Raio-X)", "Gestão de vagas (até 1/mês)", "Padronização de processos e documentos", "Onboarding estruturado", "SLA de resposta: 48h úteis"],
                highlight: false, delay: 0,
                msg: "Olá! Vim pela landing page da Azumi e tenho interesse no plano Start. Pode me contar mais?",
              },
              {
                name: "Ongoing",
                desc: "Para equipes que precisam sustentar padrão e rotina de RH.",
                hours: "25 h/mês", frentes: "Até 3 frentes",
                features: ["Tudo do Start +", "Atração e seleção (até 2 vagas/mês)", "Avaliação de Desempenho", "People Analytics básico", "Reuniões quinzenais de alinhamento", "SLA de resposta: 24h úteis"],
                highlight: true, delay: 100,
                msg: "Olá! Vim pela landing page da Azumi e tenho interesse no plano Ongoing. Pode me contar mais?",
              },
              {
                name: "Growth",
                desc: "Para empresas em expansão com várias frentes em paralelo.",
                hours: "40 h/mês", frentes: "Até 5 frentes",
                features: ["Tudo do Ongoing +", "Business Partner dedicado", "Arquitetura de Cargos e Salários", "Programa de Líderes (PDL)", "Cultura e Employer Branding", "SLA de resposta: 12h úteis"],
                highlight: false, delay: 200,
                msg: "Olá! Vim pela landing page da Azumi e tenho interesse no plano Growth. Pode me contar mais?",
              },
            ].map((plan) => (
              <AnimCard key={plan.name} delay={plan.delay}
                className={cn(
                  "rounded-2xl border p-7 flex flex-col gap-5 relative",
                  plan.highlight
                    ? "border-[#3D63B8] shadow-xl shadow-[#3D63B8]/10"
                    : "border-gray-200 hover:shadow-md transition-shadow"
                )}>
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-[#3D63B8] px-4 py-1 text-xs font-semibold text-white shadow-md">
                    Mais escolhido
                  </span>
                )}
                <div>
                  <p className="text-xl font-bold text-gray-900">{plan.name}</p>
                  <p className="mt-1 text-sm text-gray-500">{plan.desc}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <span className="inline-flex items-center text-xs font-semibold text-[#3D63B8] bg-[#3D63B8]/10 px-2.5 py-1 rounded-lg">
                    {plan.hours}
                  </span>
                  <span className="inline-flex items-center text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg">
                    {plan.frentes}
                  </span>
                </div>
                <ul className="space-y-2.5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-[#3D63B8]" />{f}
                    </li>
                  ))}
                </ul>
                <a
                  href={waLink(plan.msg)}
                  target="_blank" rel="noopener noreferrer"
                  onClick={fireConversion}
                  className={cn(
                    "inline-flex items-center justify-center gap-2 h-10 rounded-lg text-sm font-semibold transition-colors",
                    plan.highlight
                      ? "bg-[#3D63B8] text-white hover:bg-[#264478]"
                      : "border border-[#3D63B8] text-[#3D63B8] hover:bg-[#3D63B8]/5"
                  )}
                >
                  <MessageCircle className="h-4 w-4" /> Falar no WhatsApp
                </a>
              </AnimCard>
            ))}
          </div>

          <AnimSection>
            <p className="text-center mt-8 text-sm text-gray-400 max-w-2xl mx-auto">
              *Os planos são personalizados de acordo com a necessidade da sua empresa.
              Fale com nosso time para uma{" "}
              <span className="text-gray-500 font-medium">proposta sob medida</span>.
            </p>
          </AnimSection>
        </div>
      </section>

      {/* ── CTA Final ────────────────────────────────────────────── */}
      <section className="relative py-24 bg-[#0d1a2d] overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full bg-[#3D63B8]/15 blur-[80px]" />
        </div>
        <AnimSection className="relative z-10 max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
            Quer que a Azumi cuide do seu RH
            <br />com essa transparência?
          </h2>
          <p className="mt-4 text-white/55 text-base">
            Fale com a equipe.{" "}
            <span className="text-white/80 font-semibold">Sem fila, sem SDR</span> — direto com quem vai operar o serviço.
          </p>
          <div className="mt-8 flex justify-center">
            <a
              href={WA_DEFAULT}
              target="_blank" rel="noopener noreferrer"
              onClick={fireConversion}
              className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-lg bg-[#3D63B8] text-white text-sm font-semibold hover:bg-[#264478] transition-colors shadow-lg shadow-[#3D63B8]/30"
            >
              <MessageCircle className="h-4 w-4" /> Falar com a equipe
            </a>
          </div>
        </AnimSection>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="bg-[#080f1a] py-12 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-3">
            <div className="flex items-center gap-5">
              <img
                src={azumiLogoBranca}
                alt="Azumi RH"
                style={{ height: 42, width: "auto", objectFit: "contain", filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.3))" }}
              />
              <div className="w-px h-10 bg-white/15" />
              <AzumiLogo product="Connect" light size={14} />
            </div>
            <p className="text-xs text-white/25 mt-1">
              © {new Date().getFullYear()} Azumi RH · Todos os direitos reservados
            </p>
          </div>

          <div className="flex items-center gap-5">
            <a href="https://instagram.com/azumirh" target="_blank" rel="noopener noreferrer"
              className="text-white/35 hover:text-white/80 transition-colors" aria-label="Instagram">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="https://linkedin.com/company/azumirh" target="_blank" rel="noopener noreferrer"
              className="text-white/35 hover:text-white/80 transition-colors" aria-label="LinkedIn">
              <Linkedin className="h-5 w-5" />
            </a>
            <a href="mailto:contato@azumirh.com.br"
              className="text-white/35 hover:text-white/80 transition-colors" aria-label="E-mail">
              <Mail className="h-5 w-5" />
            </a>
          </div>

          <div className="flex items-center gap-5 text-xs text-white/30">
            <a href="https://azumirh.com.br" target="_blank" rel="noopener noreferrer"
              className="hover:text-white/60 transition-colors">azumirh.com.br</a>
            <Link to="/login" className="hover:text-white/60 transition-colors">Login</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
