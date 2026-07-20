import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { AzumiLogo } from "@/components/brand/AzumiLogo";
import { NetworkBackground } from "@/components/NetworkBackground";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import {
  ArrowRight, CheckCircle2, Users, FileText, Star,
  BarChart3, Kanban, Brain, Smartphone, Linkedin, TrendingUp,
  ChevronRight, MessageCircle, Instagram, Mail,
} from "lucide-react";

const SCREENSHOTS = [
  "/screenshots/tela-01.png",
  "/screenshots/tela-02.png",
  "/screenshots/tela-03.png",
  "/screenshots/tela-04.png",
  "/screenshots/tela-05.png",
  "/screenshots/tela-06.png",
  "/screenshots/tela-07.png",
];

const WA = "5541988350743";
function waLink(texto: string) {
  return `https://wa.me/${WA}?text=${encodeURIComponent(texto)}`;
}

const ROLE_MAP: Record<string, string> = {
  admin:          "/app/dashboard",
  consultor:      "/app/dashboard",
  rh:             "/app/dashboard",
  rh_operacional: "/app/dashboard",
  cliente:        "/cliente/dashboard",
  cliente_avulso: "/cliente/dashboard",
  trial:          "/cliente/dashboard",
  colaborador:    "/hub/colaborador/inicio",
  lider:          "/hub/lider/painel",
  ceo:            "/hub/ceo/dashboard",
  dp:             "/hub/colaborador/inicio",
  contador:       "/hub/colaborador/inicio",
  juridico:       "/hub/colaborador/inicio",
};

export default function LandingPage() {
  const { usuario, carregando } = useAuth();

  if (carregando) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0d1a2d]">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#7FA8E8] border-t-transparent" />
      </div>
    );
  }

  if (usuario) {
    return <Navigate to={ROLE_MAP[usuario.role] ?? "/login"} replace />;
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">

      {/* ── Nav ────────────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-12 h-16 bg-[#0d1a2d]/90 backdrop-blur-sm border-b border-white/10">
        <AzumiLogo product="Connect" light size={14} />
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-white/90 hover:text-white transition-colors"
        >
          Acessar plataforma <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </header>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center bg-[#0d1a2d] overflow-hidden pt-16">
        <NetworkBackground />

        {/* Radial glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-[#3D63B8]/20 blur-[100px]" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-6 max-w-3xl mx-auto px-6">
          {/* Badge */}
          <span className="inline-flex items-center gap-2 rounded-full border border-[#3D63B8]/50 bg-[#3D63B8]/10 px-4 py-1.5 text-xs font-medium text-[#7FA8E8] tracking-wide uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-[#7FA8E8] animate-pulse" />
            Azumi Connect · Plataforma de RH
          </span>

          {/* Logo */}
          <div className="mt-2">
            <AzumiLogo product="Connect" light size={24} />
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight tracking-tight">
            O RH dos seus clientes,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7FA8E8] to-[#3D63B8]">
              na palma da sua mão
            </span>
          </h1>

          <p className="text-base md:text-lg text-white/65 max-w-xl leading-relaxed">
            Gerencie processos seletivos, acompanhe entregas e conecte-se com
            empresas — tudo em um só lugar, com rastreabilidade completa.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 h-11 px-7 rounded-lg bg-[#3D63B8] text-white text-sm font-semibold hover:bg-[#264478] transition-colors shadow-lg shadow-[#3D63B8]/30"
            >
              Acessar plataforma <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://azumirh.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-11 px-7 rounded-lg border border-white/20 text-white/80 text-sm font-medium hover:bg-white/10 hover:text-white transition-colors"
            >
              Conhecer a Azumi RH
            </a>
          </div>

          {/* Scroll hint */}
          <div className="mt-10 flex flex-col items-center gap-1.5 text-white/30 text-xs animate-bounce">
            <ChevronRight className="h-4 w-4 rotate-90" />
          </div>
        </div>
      </section>

      {/* ── Carrossel de telas ──────────────────────────────────── */}
      <section className="py-16 bg-[#080f1a] overflow-hidden">
        <div className="text-center mb-10 px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#7FA8E8]/60 mb-2">
            Veja a plataforma em ação
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Telas do Connect
          </h2>
        </div>
        <InfiniteSlider gap={32} duration={38}>
          {[...SCREENSHOTS, ...SCREENSHOTS].map((src, i) => (
            <img
              key={i}
              src={src}
              alt="Azumi Connect — tela da plataforma"
              className="h-[280px] md:h-[360px] w-auto object-contain shrink-0 rounded-xl drop-shadow-2xl"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ))}
        </InfiniteSlider>
      </section>

      {/* ── O que o Connect resolve ─────────────────────────────── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              O que o Connect resolve
            </h2>
            <p className="mt-3 text-gray-500 max-w-lg mx-auto">
              Três desafios que toda consultoria de RH enfrenta — e como o Connect
              elimina cada um deles.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Kanban className="h-6 w-6 text-[#3D63B8]" />,
                problem: "Processo seletivo sem visibilidade",
                solution:
                  "Kanban com etapas configuráveis, SLA por vaga e histórico completo de cada candidato.",
              },
              {
                icon: <Users className="h-6 w-6 text-[#3D63B8]" />,
                problem: "Comunicação fragmentada com clientes",
                solution:
                  "Portal exclusivo para o gestor do cliente acompanhar o processo em tempo real, sem depender de reuniões.",
              },
              {
                icon: <FileText className="h-6 w-6 text-[#3D63B8]" />,
                problem: "Candidatos perdidos em planilhas",
                solution:
                  "Banco de talentos centralizado, com histórico de entrevistas, avaliações DISC e aprovações registradas.",
              },
            ].map((item) => (
              <div
                key={item.problem}
                className="rounded-2xl border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#3D63B8]/10">
                  {item.icon}
                </div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#3D63B8] mb-2">
                  Problema
                </p>
                <p className="font-semibold text-gray-800 mb-3">{item.problem}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{item.solution}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Funcionalidades ─────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Funcionalidades</h2>
            <p className="mt-3 text-gray-500">O que já está disponível — e o que está chegando.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            {/* Disponível */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#3D63B8] mb-5">
                ✦ Disponível agora
              </p>
              <ul className="space-y-3">
                {[
                  "Kanban de recrutamento com funil configurável",
                  "Portal do cliente com acesso por login",
                  "Testes DISC integrados ao processo",
                  "Relatório final de processo por vaga",
                  "Banco de talentos centralizado",
                  "Questionários customizados por vaga",
                  "Agenda de entrevistas com confirmação",
                  "SLA por vaga com alertas de prazo",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-gray-700">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-[#3D63B8]" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Em breve */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-500 mb-5">
                ◎ Em desenvolvimento
              </p>
              <ul className="space-y-3">
                {[
                  { icon: <Brain className="h-4 w-4" />, label: "IA para triagem automática de candidatos" },
                  { icon: <Smartphone className="h-4 w-4" />, label: "Aplicativo mobile para consultoras e gestores" },
                  { icon: <Linkedin className="h-4 w-4" />, label: "Integração direta com LinkedIn Jobs" },
                  { icon: <TrendingUp className="h-4 w-4" />, label: "Dashboard preditivo de turnover e clima" },
                ].map((f) => (
                  <li key={f.label} className="flex items-start gap-3 text-sm text-gray-500">
                    <span className="mt-0.5 shrink-0 text-amber-400">{f.icon}</span>
                    {f.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Quem utiliza ────────────────────────────────────────── */}
      <section className="py-24 bg-[#0d1a2d]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Quem utiliza</h2>
            <p className="mt-3 text-white/50">Três perfis. Um só sistema.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Star className="h-6 w-6" />,
                role: "Consultoras Azumi",
                desc: "Gestão completa de vagas, candidatos e entregas para todos os clientes — em uma única visão, sem planilha.",
              },
              {
                icon: <Users className="h-6 w-6" />,
                role: "Empresas clientes",
                desc: "Acesso ao portal para acompanhar o processo seletivo em tempo real, visualizar perfis e aprovar candidatos.",
              },
              {
                icon: <BarChart3 className="h-6 w-6" />,
                role: "Gestão estratégica",
                desc: "Relatórios de processo, análise de SLA, histórico de contratações e indicadores de RH consolidados.",
              },
            ].map((p) => (
              <div
                key={p.role}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/8 transition-colors"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#3D63B8]/20 text-[#7FA8E8]">
                  {p.icon}
                </div>
                <p className="font-semibold text-white mb-2">{p.role}</p>
                <p className="text-sm text-white/55 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Como funciona ───────────────────────────────────────── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Como funciona</h2>
            <p className="mt-3 text-gray-500">Do briefing ao relatório final, em 4 etapas.</p>
          </div>

          <div className="relative">
            <div className="hidden md:block absolute left-6 top-8 bottom-8 w-px bg-gradient-to-b from-[#3D63B8] via-[#7FA8E8] to-transparent" />
            <div className="space-y-8">
              {[
                {
                  n: "01",
                  title: "Briefing da vaga",
                  desc: "A consultora registra o perfil completo: cargo, benefícios, SLA, nível de urgência e perguntas customizadas para os candidatos.",
                },
                {
                  n: "02",
                  title: "Triagem e entrevistas no Kanban",
                  desc: "Candidatos avançam pelas etapas do funil — com avaliações DISC, notas internas, agendamentos e rastreabilidade de cada decisão.",
                },
                {
                  n: "03",
                  title: "Aprovação pelo portal do cliente",
                  desc: "O gestor da empresa acessa seu portal exclusivo, visualiza os perfis indicados e aprova ou solicita ajustes diretamente na plataforma.",
                },
                {
                  n: "04",
                  title: "Contratação com relatório final",
                  desc: "O processo é encerrado com relatório completo: candidato selecionado, tempo de processo, histórico de etapas e avaliações registradas.",
                },
              ].map((step) => (
                <div key={step.n} className="relative flex gap-8 items-start">
                  <div className="relative z-10 flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-[#3D63B8] text-white font-bold text-sm shadow-lg shadow-[#3D63B8]/30">
                    {step.n}
                  </div>
                  <div className="pt-2.5">
                    <p className="font-semibold text-gray-900 mb-1">{step.title}</p>
                    <p className="text-sm text-gray-500 leading-relaxed max-w-lg">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Planos ──────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Planos</h2>
            <p className="mt-3 text-gray-500">
              Escolha o plano ideal para o tamanho da sua operação. Sem fidelidade.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Start",
                desc: "Para consultorias que estão começando e precisam de organização básica.",
                features: ["Até 5 vagas ativas", "Portal do cliente", "Kanban de recrutamento", "Banco de talentos"],
                highlight: false,
                msg: "Olá! Tenho interesse no plano Start do Azumi Connect. Pode me contar mais?",
              },
              {
                name: "Ongoing",
                desc: "Para equipes em crescimento que precisam de mais módulos e rastreabilidade.",
                features: ["Vagas ilimitadas", "DISC integrado", "Questionários customizados", "Relatórios de processo", "SLA e alertas de prazo"],
                highlight: true,
                msg: "Olá! Tenho interesse no plano Ongoing do Azumi Connect. Pode me contar mais?",
              },
              {
                name: "Growth",
                desc: "Para operações robustas que exigem controle total e relatórios estratégicos.",
                features: ["Tudo do Ongoing", "Dashboard analytics", "Múltiplos consultores", "Gestão de horas e projetos", "Suporte prioritário"],
                highlight: false,
                msg: "Olá! Tenho interesse no plano Growth do Azumi Connect. Pode me contar mais?",
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-7 flex flex-col gap-5 transition-shadow ${
                  plan.highlight
                    ? "border-[#3D63B8] shadow-xl shadow-[#3D63B8]/10 relative"
                    : "border-gray-200 hover:shadow-md"
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-[#3D63B8] px-4 py-1 text-xs font-semibold text-white">
                    Mais escolhido
                  </span>
                )}
                <div>
                  <p className="text-xl font-bold text-gray-900">{plan.name}</p>
                  <p className="mt-1 text-sm text-gray-500">{plan.desc}</p>
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
                  className={`inline-flex items-center justify-center gap-2 h-10 rounded-lg text-sm font-semibold transition-colors ${
                    plan.highlight
                      ? "bg-[#3D63B8] text-white hover:bg-[#264478]"
                      : "border border-[#3D63B8] text-[#3D63B8] hover:bg-[#3D63B8]/5"
                  }`}
                >
                  <MessageCircle className="h-4 w-4" />
                  Falar no WhatsApp
                </a>
              </div>
            ))}
          </div>

          <p className="text-center mt-8 text-sm text-gray-400">
            Dúvidas? Fale com a equipe Azumi no{" "}
            <a
              href={waLink("Olá! Tenho dúvidas sobre o Azumi Connect.")}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#3D63B8] underline underline-offset-2 hover:text-[#264478]"
            >
              WhatsApp
            </a>
            .
          </p>
        </div>
      </section>

      {/* ── CTA Final ───────────────────────────────────────────── */}
      <section className="relative py-24 bg-[#0d1a2d] overflow-hidden">
        <NetworkBackground />
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full bg-[#3D63B8]/15 blur-[80px]" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
            Pronto para organizar
            <br />
            sua operação de RH?
          </h2>
          <p className="mt-4 text-white/55 text-base">
            Comece agora. Sem burocracia, sem contrato longo.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 h-11 px-7 rounded-lg bg-[#3D63B8] text-white text-sm font-semibold hover:bg-[#264478] transition-colors shadow-lg shadow-[#3D63B8]/30"
            >
              Acessar plataforma <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={waLink("Olá! Quero conhecer o Azumi Connect.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 h-11 px-7 rounded-lg border border-white/20 text-white/80 text-sm font-medium hover:bg-white/10 hover:text-white transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              Falar com a equipe
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="bg-[#080f1a] py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <AzumiLogo product="Connect" light size={12} />
            <p className="text-xs text-white/30 mt-1">
              © {new Date().getFullYear()} Azumi RH · Todos os direitos reservados
            </p>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://instagram.com/azumirh"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 hover:text-white/80 transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="h-4.5 w-4.5" />
            </a>
            <a
              href="https://linkedin.com/company/azumirh"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 hover:text-white/80 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-4.5 w-4.5" />
            </a>
            <a
              href="mailto:contato@azumirh.com.br"
              className="text-white/40 hover:text-white/80 transition-colors"
              aria-label="E-mail"
            >
              <Mail className="h-4.5 w-4.5" />
            </a>
          </div>

          <div className="flex items-center gap-5 text-xs text-white/30">
            <a href="https://azumirh.com.br" target="_blank" rel="noopener noreferrer" className="hover:text-white/60 transition-colors">
              azumirh.com.br
            </a>
            <Link to="/login" className="hover:text-white/60 transition-colors">
              Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
