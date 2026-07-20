import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { AzumiLogo } from "@/components/brand/AzumiLogo";
import { NetworkBackground } from "@/components/NetworkBackground";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { useInView } from "@/hooks/useInView";
import azumiLogoBranca from "@/assets/brand/azumi-logo-branca.png";
import {
  ArrowRight, CheckCircle2, Users, MessageCircle,
  Instagram, Mail, Linkedin, Clock, FileText, BarChart3,
  Kanban, Brain, Smartphone, TrendingUp, ChevronRight,
  Calendar, FolderOpen, Star, ShieldCheck,
} from "lucide-react";

const WA = "5541988350743";
const waLink = (texto: string) =>
  `https://wa.me/${WA}?text=${encodeURIComponent(texto)}`;

const WA_DEFAULT = waLink("Olá! Vim pela landing page do Azumi Connect e quero saber mais sobre a consultoria Azumi RH.");

function fireConversion() {
  if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
    (window as any).gtag("event", "conversion", { send_to: "AW-18333141930/YRvRCI-Q4tIcEKqX9qVE" });
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
  "/screenshots/tela-01.png", "/screenshots/tela-02.png",
  "/screenshots/tela-03.png", "/screenshots/tela-04.png",
  "/screenshots/tela-05.png", "/screenshots/tela-06.png",
  "/screenshots/tela-07.png",
];

// ── Componente auxiliar: card com animação de entrada ────────────────
function AnimCard({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(36px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ── Componente auxiliar: container de seção com fade ─────────────────
function AnimSection({ children, className = "" }: {
  children: React.ReactNode; className?: string;
}) {
  const { ref, inView } = useInView(0.08);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(24px)",
        transition: "opacity 0.55s ease, transform 0.55s cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      {children}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { usuario, carregando } = useAuth();

  if (carregando) return (
    <div className="flex items-center justify-center min-h-screen bg-[#0d1a2d]">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#7FA8E8] border-t-transparent" />
    </div>
  );

  if (usuario) return <Navigate to={ROLE_MAP[usuario.role] ?? "/login"} replace />;

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">

      {/* ── Nav ──────────────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-14 h-16 bg-[#0d1a2d]/90 backdrop-blur-sm border-b border-white/10">
        <AzumiLogo product="Connect" light size={20} />
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-white/80 hover:text-white transition-colors"
        >
          Acessar plataforma <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-16"
        style={{ background: "linear-gradient(135deg, #0d1a2d 0%, #264478 55%, #3D63B8 100%)" }}
      >
        <NetworkBackground />
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full bg-[#3D63B8]/20 blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-14 w-full py-20 grid md:grid-cols-2 gap-12 items-center">

          {/* Foto esquerda */}
          <div className="flex justify-center md:justify-start">
            <div className="relative w-72 h-80 md:w-80 md:h-96 rounded-3xl overflow-hidden border-2 border-[#7FA8E8]/40 shadow-2xl shadow-[#264478]/60">
              <img
                src="/fotos/hero.jpg"
                alt="Consultoria Azumi RH"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const el = e.currentTarget;
                  el.style.display = "none";
                  const parent = el.parentElement;
                  if (parent) {
                    parent.style.background = "linear-gradient(160deg, #264478 0%, #3D63B8 60%, #7FA8E8 100%)";
                    parent.innerHTML = `<div class='flex flex-col items-center justify-center h-full gap-4 p-8 text-white/60'><svg xmlns='http://www.w3.org/2000/svg' class='h-16 w-16 opacity-30' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='1' d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z'/></svg><p class='text-xs text-center opacity-50'>Adicionar foto em<br/>public/fotos/hero.jpg</p></div>`;
                  }
                }}
              />
              {/* Borda luminosa */}
              <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10 pointer-events-none" />
            </div>
          </div>

          {/* Texto direita */}
          <div className="flex flex-col gap-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#7FA8E8]/40 bg-[#3D63B8]/15 px-4 py-1.5 text-xs font-semibold text-[#7FA8E8] tracking-wide uppercase w-fit">
              <span className="h-1.5 w-1.5 rounded-full bg-[#7FA8E8] animate-pulse" />
              Azumi Connect · Plataforma de RH
            </span>

            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight tracking-tight">
              <span className="block animate-slide-from-right">
                O legado dos seus clientes
              </span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#7FA8E8] to-[#3D63B8] animate-slide-from-left">
                na palma de suas mãos
              </span>
            </h1>

            <p className="text-base text-white/65 leading-relaxed max-w-md">
              Você contrata a Azumi RH e o Connect é onde trabalhamos juntos. Vagas,
              projetos, horas e relatórios com rastreabilidade completa, em tempo real.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href={WA_DEFAULT}
                target="_blank"
                rel="noopener noreferrer"
                onClick={fireConversion}
                className="inline-flex items-center justify-center gap-2 h-11 px-7 rounded-lg bg-[#3D63B8] text-white text-sm font-semibold hover:bg-[#264478] transition-colors shadow-lg shadow-[#3D63B8]/30"
              >
                <MessageCircle className="h-4 w-4" /> Falar com a equipe
              </a>
              <a
                href="https://azumirh.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-11 px-7 rounded-lg border border-white/20 text-white/80 text-sm font-medium hover:bg-white/10 hover:text-white transition-colors"
              >
                Conhecer a Azumi RH
              </a>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/25 animate-bounce">
          <ChevronRight className="h-4 w-4 rotate-90" />
        </div>
      </section>

      {/* ── Sobre a Azumi ────────────────────────────────────────── */}
      <section className="py-24 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 md:px-14">
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
                A Azumi não é uma plataforma de RH que a sua empresa opera sozinha.
                Somos uma <span className="text-gray-800 font-semibold">consultoria de recursos humanos</span> que
                usa a tecnologia como ferramenta de gestão e entrega do serviço.
              </p>
              <p className="text-gray-500 leading-relaxed mb-6">
                O Azumi Connect é onde sua empresa e os consultores Azumi trabalham
                juntos — vagas abertas, projetos em andamento, horas registradas e
                relatórios sempre disponíveis. Transparência total, em tempo real.
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
                <div key={item.label} className="rounded-xl border border-gray-200 bg-gray-50 p-4 flex items-start gap-3">
                  <span className="text-[#3D63B8] mt-0.5 shrink-0">{item.icon}</span>
                  <span className="text-sm font-medium text-gray-700 leading-snug">{item.label}</span>
                </div>
              ))}
            </div>
          </AnimSection>
        </div>
      </section>

      {/* ── Carrossel de telas ───────────────────────────────────── */}
      <section className="py-16 bg-[#080f1a] overflow-hidden">
        <AnimSection className="text-center mb-10 px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#7FA8E8]/60 mb-2">
            Veja a plataforma em ação
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            O Connect na prática
          </h2>
          <p className="mt-2 text-white/40 text-sm max-w-lg mx-auto">
            A plataforma onde sua empresa e a Azumi trabalham juntas — vagas,
            projetos, horas e relatórios em um só lugar.
          </p>
        </AnimSection>
        <InfiniteSlider gap={32} duration={38}>
          {[...SCREENSHOTS, ...SCREENSHOTS].map((src, i) => (
            <img
              key={i}
              src={src}
              alt="Azumi Connect — tela da plataforma"
              className="h-[280px] md:h-[360px] w-auto object-contain shrink-0 rounded-xl drop-shadow-2xl"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          ))}
        </InfiniteSlider>
      </section>

      {/* ── O que fica visível com o Connect ─────────────────────── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6 md:px-14">
          <AnimSection className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              O que fica visível com o Connect
            </h2>
            <p className="mt-3 text-gray-500 max-w-lg mx-auto">
              Porque a Azumi opera junto com você nessa plataforma, cada etapa do
              serviço fica <span className="text-[#3D63B8] font-semibold">rastreável e transparente</span>.
            </p>
          </AnimSection>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Kanban className="h-6 w-6 text-[#3D63B8]" />,
                title: "Processo seletivo em aberto",
                highlight: "Acompanhamento em tempo real",
                desc: "Cada candidato avança pelas etapas com SLA registrado, avaliações e histórico completo. Sem depender de e-mail ou reunião para saber onde está.",
                delay: 0,
              },
              {
                icon: <Users className="h-6 w-6 text-[#3D63B8]" />,
                title: "Portal exclusivo da sua empresa",
                highlight: "Acesso do gestor, sem intermediário",
                desc: "O responsável na empresa acessa o portal para acompanhar entregas, aprovar candidatos e solicitar serviços diretamente à equipe Azumi.",
                delay: 100,
              },
              {
                icon: <FileText className="h-6 w-6 text-[#3D63B8]" />,
                title: "Histórico completo e exportável",
                highlight: "Rastreabilidade de ponta a ponta",
                desc: "Projetos, horas, relatórios e indicadores sempre disponíveis. Tudo registrado pela Azumi, acessível pela sua empresa a qualquer momento.",
                delay: 200,
              },
            ].map((item) => (
              <AnimCard
                key={item.title}
                delay={item.delay}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#3D63B8]/10">
                  {item.icon}
                </div>
                <p className="text-xs font-semibold text-[#3D63B8] uppercase tracking-widest mb-1">
                  {item.highlight}
                </p>
                <p className="font-semibold text-gray-800 mb-2">{item.title}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </AnimCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── Funcionalidades ──────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6 md:px-14">
          <AnimSection className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Módulos da plataforma</h2>
            <p className="mt-3 text-gray-500">Tudo incluído em qualquer contrato Azumi RH.</p>
          </AnimSection>

          <div className="grid md:grid-cols-2 gap-10">
            {/* Disponível */}
            <div>
              <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-lg bg-[#3D63B8]/10 border border-[#3D63B8]/20">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#3D63B8]" />
                <p className="text-xs font-bold uppercase tracking-widest text-[#3D63B8]">Disponível agora</p>
              </div>
              <ul className="space-y-4">
                {[
                  { name: "Atração e Seleção", sub: "Kanban com funil configurável", desc: "Vagas, candidatos, SLA e histórico completo de cada processo." },
                  { name: "Portal do Cliente", sub: "Acesso exclusivo para o gestor", desc: "Acompanhamento de entregas, aprovações e solicitações em tempo real." },
                  { name: "DISC Integrado", sub: "Perfil comportamental no processo", desc: "Testes enviados e avaliados diretamente dentro da vaga." },
                  { name: "Banco de Talentos", sub: "Histórico centralizado", desc: "Candidatos avaliados disponíveis para futuras oportunidades." },
                  { name: "Relatórios de Processo", sub: "Exportável ao final de cada vaga", desc: "Resumo completo: candidato selecionado, tempo, etapas e avaliações." },
                  { name: "Projetos e Horas", sub: "Registro de entrega por consultor", desc: "Cada hora trabalhada e projeto ativo visível para o cliente." },
                  { name: "Solicitações", sub: "Canal direto com a Azumi", desc: "Novas demandas abertas e acompanhadas dentro da plataforma." },
                  { name: "Agenda e Entrevistas", sub: "Confirmação automatizada", desc: "Agendamentos com candidatos e gestores com notificações integradas." },
                ].map((f) => (
                  <li key={f.name} className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 mt-1 shrink-0 text-[#3D63B8]" />
                    <div>
                      <span className="text-sm font-semibold text-gray-800">{f.name}</span>
                      <span className="block text-xs text-[#3D63B8] font-medium mt-0.5">{f.sub}</span>
                      <span className="block text-xs text-gray-400 mt-0.5 leading-snug">{f.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Em breve */}
            <div>
              <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200">
                <Clock className="h-3.5 w-3.5 text-amber-500" />
                <p className="text-xs font-bold uppercase tracking-widest text-amber-600">Em desenvolvimento</p>
              </div>
              <ul className="space-y-4">
                {[
                  { icon: <Brain className="h-4 w-4" />, name: "IA para Triagem", sub: "Automação inteligente", desc: "Classificação automática de candidatos por aderência ao perfil." },
                  { icon: <Smartphone className="h-4 w-4" />, name: "App Mobile", sub: "iOS e Android", desc: "Acesso completo à plataforma pelo celular para consultoras e gestores." },
                  { icon: <Linkedin className="h-4 w-4" />, name: "Integração LinkedIn", sub: "Captação direta", desc: "Importação de candidatos do LinkedIn Jobs para dentro da vaga." },
                  { icon: <TrendingUp className="h-4 w-4" />, name: "Dashboard Preditivo", sub: "People Analytics avançado", desc: "Indicadores de turnover, clima e performance em tempo real." },
                  { icon: <Calendar className="h-4 w-4" />, name: "Calendário Integrado", sub: "Google e Outlook", desc: "Sincronização de agendamentos com a agenda do gestor." },
                  { icon: <FolderOpen className="h-4 w-4" />, name: "Documentos", sub: "Gestão de contratos e arquivos", desc: "Repositório de documentos vinculados a vagas e projetos." },
                ].map((f) => (
                  <li key={f.name} className="flex items-start gap-3">
                    <span className="mt-1 shrink-0 text-amber-400">{f.icon}</span>
                    <div>
                      <span className="text-sm font-semibold text-gray-500">{f.name}</span>
                      <span className="block text-xs text-amber-500 font-medium mt-0.5">{f.sub}</span>
                      <span className="block text-xs text-gray-400 mt-0.5 leading-snug">{f.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Quem utiliza ─────────────────────────────────────────── */}
      <section className="py-24 bg-[#0d1a2d]">
        <div className="max-w-5xl mx-auto px-6 md:px-14">
          <AnimSection className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Quem utiliza o Connect</h2>
            <p className="mt-3 text-white/50">Três perfis, um único espaço de trabalho compartilhado.</p>
          </AnimSection>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                src: "/fotos/persona-empresa.jpg",
                gradient: "from-[#264478] to-[#3D63B8]",
                role: "Sua empresa (cliente Azumi)",
                sub: "Visibilidade total, sem intermediário",
                desc: "O gestor acessa o portal para acompanhar vagas abertas, aprovar candidatos, solicitar serviços e ver o andamento de projetos em tempo real. Sempre em parceria com o time Azumi.",
                delay: 0,
              },
              {
                src: "/fotos/persona-consultora.jpg",
                gradient: "from-[#3D63B8] to-[#7FA8E8]",
                role: "Consultoras Azumi",
                sub: "Onde a operação acontece",
                desc: "As consultoras registram entregas, gerenciam candidatos, agendam entrevistas e alimentam relatórios diretamente no Connect — tudo visível para o cliente em tempo real.",
                delay: 100,
              },
              {
                src: "/fotos/persona-gestao.jpg",
                gradient: "from-[#1a3a6b] to-[#264478]",
                role: "Liderança Azumi",
                sub: "Qualidade e indicadores consolidados",
                desc: "A liderança monitora indicadores de entrega, SLA por vaga, performance de consultoras e saúde dos contratos ativos em um dashboard unificado.",
                delay: 200,
              },
            ].map((p) => (
              <AnimCard key={p.role} delay={p.delay}
                className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden hover:bg-white/8 transition-colors">
                {/* Foto / placeholder */}
                <div className="h-44 w-full overflow-hidden relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${p.gradient}`} />
                  <img
                    src={p.src}
                    alt={p.role}
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

      {/* ── Como funciona — timeline horizontal ──────────────────── */}
      <section className="py-24 bg-gray-50 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 md:px-14">
          <AnimSection className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Como funciona</h2>
            <p className="mt-3 text-gray-500">Do primeiro contato ao relatório final — 4 etapas.</p>
          </AnimSection>

          {/* Desktop: horizontal */}
          <div className="hidden md:block">
            <div className="relative">
              {/* Linha conectando */}
              <div className="absolute top-6 left-[calc(12.5%)] right-[calc(12.5%)] h-px bg-gradient-to-r from-[#3D63B8] via-[#7FA8E8] to-[#3D63B8]" />
              <div className="grid grid-cols-4 gap-4">
                {[
                  { n: "01", title: "Contratação", desc: "Você contrata a Azumi RH e ganha acesso ao Connect junto com sua consultora dedicada." },
                  { n: "02", title: "Onboarding no Connect", desc: "A Azumi configura o ambiente da sua empresa, cadastra usuários e abre as primeiras demandas." },
                  { n: "03", title: "Operação conjunta", desc: "Vagas, projetos e solicitações gerenciados pela Azumi — tudo registrado e visível pra você no portal." },
                  { n: "04", title: "Relatórios e evolução", desc: "A cada ciclo, indicadores e relatórios consolidados para avaliar resultados e planejar os próximos passos." },
                ].map((step, i) => (
                  <AnimCard key={step.n} delay={i * 120} className="flex flex-col items-center text-center px-2">
                    <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-[#3D63B8] text-white font-bold text-sm shadow-lg shadow-[#3D63B8]/30 mb-5">
                      {step.n}
                    </div>
                    <p className="font-semibold text-gray-900 mb-2 text-sm">{step.title}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
                  </AnimCard>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile: vertical */}
          <div className="md:hidden relative">
            <div className="absolute left-5 top-6 bottom-6 w-px bg-gradient-to-b from-[#3D63B8] via-[#7FA8E8] to-transparent" />
            <div className="space-y-8">
              {[
                { n: "01", title: "Contratação", desc: "Você contrata a Azumi RH e ganha acesso ao Connect junto com sua consultora dedicada." },
                { n: "02", title: "Onboarding no Connect", desc: "A Azumi configura o ambiente da sua empresa, cadastra usuários e abre as primeiras demandas." },
                { n: "03", title: "Operação conjunta", desc: "Vagas, projetos e solicitações gerenciados pela Azumi — tudo registrado e visível pra você no portal." },
                { n: "04", title: "Relatórios e evolução", desc: "A cada ciclo, indicadores e relatórios consolidados para avaliar resultados e planejar os próximos passos." },
              ].map((step) => (
                <div key={step.n} className="relative flex gap-6 items-start">
                  <div className="relative z-10 flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-[#3D63B8] text-white font-bold text-sm shadow-lg shadow-[#3D63B8]/30">
                    {step.n}
                  </div>
                  <div className="pt-1.5">
                    <p className="font-semibold text-gray-900 mb-1">{step.title}</p>
                    <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
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

          {/* Explicação HRaaS */}
          <AnimSection>
            <div className="max-w-2xl mx-auto mb-14 rounded-2xl border border-[#3D63B8]/20 bg-[#3D63B8]/5 p-6 text-center">
              <p className="text-sm font-semibold text-[#3D63B8] uppercase tracking-widest mb-2">O que é HRaaS?</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                <span className="font-semibold text-gray-800">HRaaS (HR as a Service)</span> é o modelo de RH como serviço da Azumi:
                sua empresa contrata a operação completa de recursos humanos — recrutamento, cultura, performance e compliance —
                sem precisar montar um time de RH próprio. O{" "}
                <span className="font-semibold text-[#3D63B8]">Azumi Connect vem incluso em qualquer plano contratado</span>,
                pois é a ferramenta onde a Azumi e o cliente trabalham juntos. Não existe "assinar o Connect" separadamente.
              </p>
            </div>
          </AnimSection>

          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {[
              {
                name: "Start",
                desc: "Para empresas iniciando a estruturação de RH.",
                hours: "15 h/mês",
                frentes: "Até 2 frentes ativas",
                features: ["Diagnóstico de Maturidade (Raio-X)", "Gestão de vagas (até 1/mês)", "Padronização de processos e documentos", "Onboarding estruturado", "SLA de resposta: 48h úteis"],
                highlight: false,
                delay: 0,
                msg: "Olá! Vim pela landing page da Azumi e tenho interesse no plano Start. Pode me contar mais?",
              },
              {
                name: "Ongoing",
                desc: "Para equipes que precisam sustentar padrão e rotina de RH.",
                hours: "25 h/mês",
                frentes: "Até 3 frentes ativas",
                features: ["Tudo do Start +", "Atração e seleção (até 2 vagas/mês)", "Avaliação de Desempenho", "People Analytics básico", "Reuniões quinzenais de alinhamento", "SLA de resposta: 24h úteis"],
                highlight: true,
                delay: 100,
                msg: "Olá! Vim pela landing page da Azumi e tenho interesse no plano Ongoing. Pode me contar mais?",
              },
              {
                name: "Growth",
                desc: "Para empresas em expansão com várias frentes em paralelo.",
                hours: "40 h/mês",
                frentes: "Até 5 frentes ativas",
                features: ["Tudo do Ongoing +", "Business Partner dedicado", "Arquitetura de Cargos e Salários", "Programa de Líderes (PDL)", "Consultoria de Cultura e Employer Branding", "SLA de resposta: 12h úteis"],
                highlight: false,
                delay: 200,
                msg: "Olá! Vim pela landing page da Azumi e tenho interesse no plano Growth. Pode me contar mais?",
              },
            ].map((plan) => (
              <AnimCard key={plan.name} delay={plan.delay}
                className={`rounded-2xl border p-7 flex flex-col gap-5 relative ${
                  plan.highlight
                    ? "border-[#3D63B8] shadow-xl shadow-[#3D63B8]/10"
                    : "border-gray-200 hover:shadow-md transition-shadow"
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-[#3D63B8] px-4 py-1 text-xs font-semibold text-white shadow-md">
                    Mais escolhido
                  </span>
                )}
                <div>
                  <p className="text-xl font-bold text-gray-900">{plan.name}</p>
                  <p className="mt-1 text-sm text-gray-500">{plan.desc}</p>
                </div>
                <div className="flex gap-2">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#3D63B8] bg-[#3D63B8]/10 px-2.5 py-1 rounded-lg">
                    {plan.hours}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg">
                    {plan.frentes}
                  </span>
                </div>
                <ul className="space-y-2.5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-[#3D63B8]" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href={waLink(plan.msg)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={fireConversion}
                  className={`inline-flex items-center justify-center gap-2 h-10 rounded-lg text-sm font-semibold transition-colors ${
                    plan.highlight
                      ? "bg-[#3D63B8] text-white hover:bg-[#264478]"
                      : "border border-[#3D63B8] text-[#3D63B8] hover:bg-[#3D63B8]/5"
                  }`}
                >
                  <MessageCircle className="h-4 w-4" />
                  Falar no WhatsApp
                </a>
              </AnimCard>
            ))}
          </div>

          <p className="text-center mt-8 text-sm text-gray-400 max-w-2xl mx-auto">
            *Os planos são personalizados de acordo com a necessidade da sua empresa.
            Fale com nosso time para uma proposta sob medida.
          </p>
        </div>
      </section>

      {/* ── CTA Final ────────────────────────────────────────────── */}
      <section className="relative py-24 bg-[#0d1a2d] overflow-hidden">
        <NetworkBackground />
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full bg-[#3D63B8]/15 blur-[80px]" />
        </div>
        <AnimSection className="relative z-10 max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
            Quer que a Azumi cuide do seu RH
            <br />com essa transparência?
          </h2>
          <p className="mt-4 text-white/55 text-base">
            Fale com a equipe. Sem fila, sem SDR — direto com quem vai operar o serviço.
          </p>
          <div className="mt-8 flex justify-center">
            <a
              href={WA_DEFAULT}
              target="_blank"
              rel="noopener noreferrer"
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

          {/* Logos */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <div className="flex items-center gap-5">
              <img
                src={azumiLogoBranca}
                alt="Azumi RH"
                style={{ height: 36, width: "auto", objectFit: "contain", filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.3))" }}
              />
              <div className="w-px h-8 bg-white/15" />
              <AzumiLogo product="Connect" light size={32} />
            </div>
            <p className="text-xs text-white/25 mt-1">
              © {new Date().getFullYear()} Azumi RH · Todos os direitos reservados
            </p>
          </div>

          {/* Social */}
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

          {/* Links */}
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
