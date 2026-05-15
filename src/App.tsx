import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import type { ReactElement } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { AuthProvider, useAuth, type Papel } from "@/context/AuthContext";
import { ModulesProvider } from "@/context/ModulesContext";
import { FinanceiroProvider } from "@/context/FinanceiroContext";
import { useCarregarModulosCliente } from "@/hooks/useCarregarModulosCliente";
import type { ReactNode } from "react";

import { AppLayout } from "@/components/layout/AppLayout";
import { HubLayout } from "@/components/layout/HubLayout";
import PortalLayout from "@/layouts/PortalLayout";

import PortalDashboard from "./pages/portal/PortalDashboard";
// PortalProjetos, PortalProjetoDetalhe e PortalFinanceiro foram descontinuados
// como rotas — os arquivos permanecem no disco. As rotas /portal/* equivalentes
// agora redirecionam para /cliente/* (caminho canônico do cliente).

import Login from "./pages/auth/Login";
import SelecaoPerfil from "./pages/auth/SelecaoPerfil";
import NotFound from "./pages/NotFound";
import Stub from "./pages/Stub";

import AdminDashboard from "./pages/admin/DashboardPage";
import Empresas from "./pages/admin/Empresas";
import AtracaoRouter from "./pages/AtracaoRouter";
import VagaDetalheAdmin from "./pages/admin/VagaDetalhe";
import RelatorioFinalVagaPage from "./pages/admin/RelatorioFinalVagaPage";
import Analytics from "./pages/admin/Analytics";
import GestaoConta from "./pages/admin/GestaoConta";
import HorasPage from "./pages/admin/HorasPage";
import ProjetosPage from "./pages/admin/ProjetosPage";
import ProjetoDetalhe from "./pages/admin/ProjetoDetalhe";
import FinanceiroPage from "./pages/admin/FinanceiroPage";
import ClientesPage from "./pages/admin/ClientesPage";
import ConfiguracoesPage from "./pages/admin/ConfiguracoesPage";
import SolicitacoesPage from "./pages/admin/SolicitacoesPage";
import UsuariosPage from "./pages/admin/UsuariosPage";
import DocumentosPage from "./pages/admin/DocumentosPage";
import EmpresaDetalhePage from "./pages/admin/EmpresaDetalhePage";
import AuditoriaPage from "./pages/admin/AuditoriaPage";
import CalendarioPage from "./pages/admin/CalendarioPage";
import ComunicadosPage from "./pages/admin/ComunicadosPage";
import VagasClientePage from "./pages/VagasClientePage";
import PerfilPage from "./pages/PerfilPage";
import SolicitacoesClientePage from "./pages/SolicitacoesClientePage";
import ClienteProjetosPage from "./pages/cliente/ClienteProjetosPage";
import ClienteProjetoDetalhe from "./pages/cliente/ClienteProjetoDetalhe";
import ClienteHorasPage from "./pages/cliente/ClienteHorasPage";
import ClienteGuiaPage from "./pages/cliente/ClienteGuiaPage";
import ClienteComunicadosPage from "./pages/cliente/ClienteComunicadosPage";
import ClienteCalendarioPage from "./pages/cliente/ClienteCalendarioPage";
import ClienteDocumentosPage from "./pages/cliente/ClienteDocumentosPage";

import ClienteDashboard from "./pages/cliente/ClienteDashboard";
import ClienteGestaoContaPage from "./pages/cliente/ClienteGestaoContaPage";
import ClienteHubIndisponivelPage from "./pages/cliente/ClienteHubIndisponivelPage";
import VagaDetalheCliente from "./pages/cliente/VagaDetalheCliente";
import ConfirmarEntrevistaPage from "./pages/public/ConfirmarEntrevistaPage";

import LiderPainelPage from "./pages/hub/lider/LiderPainelPage";
import MeuTimePage from "./pages/hub/lider/MeuTimePage";
import ColaboradorPerfilPage from "./pages/hub/lider/ColaboradorPerfilPage";
import OnboardingPage from "./pages/hub/lider/OnboardingPage";
import FeedbackPage from "./pages/hub/lider/FeedbackPage";
import AvaliacoesLiderPage from "./pages/hub/lider/AvaliacoesLiderPage";
import SolicitacoesLiderPage from "./pages/hub/lider/SolicitacoesLiderPage";
import ColaboradorInicio from "./pages/hub/ColaboradorInicio";
import SobreVocePage from "./pages/hub/colaborador/SobreVocePage";
import HoleritesPage from "./pages/hub/colaborador/HoleritesPage";
import FeriasPage from "./pages/hub/colaborador/FeriasPage";
import BeneficiosPage from "./pages/hub/colaborador/BeneficiosPage";
import PoliticasColabPage from "./pages/hub/colaborador/PoliticasColabPage";
import TreinamentosColabPage from "./pages/hub/colaborador/TreinamentosColabPage";
import AjudaPage from "./pages/hub/colaborador/AjudaPage";
import SolicitacoesColabPage from "./pages/hub/colaborador/SolicitacoesColabPage";
import TermometroPage from "./pages/hub/colaborador/TermometroPage";
import MuralPage from "./pages/hub/colaborador/MuralPage";
import OnboardingColabPage from "./pages/hub/colaborador/OnboardingPage";
import GuiasPage from "./pages/hub/colaborador/GuiasPage";
import CeoDashboard from "./pages/hub/CeoDashboard";
import HeadcountPage from "./pages/hub/ceo/HeadcountPage";
import FinanceiroRHPage from "./pages/hub/ceo/FinanceiroRHPage";
import AvaliacoesCeoPage from "./pages/hub/ceo/AvaliacoesCeoPage";
import TurnoverPage from "./pages/hub/ceo/TurnoverPage";
import ClimaCeoPage from "./pages/hub/ceo/ClimaPage";
import PoliticasCeoPage from "./pages/hub/ceo/PoliticasPage";
import MinhaEmpresaCeoPage from "./pages/hub/ceo/MinhaEmpresaPage";
import BeneficiosCeoPage from "./pages/hub/ceo/BeneficiosPage";
import HistoricoCeoPage from "./pages/hub/ceo/HistoricoPage";
import SolicitacoesCeoPage from "./pages/hub/ceo/SolicitacoesPage";
import AjudaCeoPage from "./pages/hub/ceo/AjudaPage";
import LiderSobreVocePage from "./pages/hub/lider/SobreVocePage";
import LiderTermometroPage from "./pages/hub/lider/TermometroPage";
import LiderMuralPage from "./pages/hub/lider/MuralPage";

const queryClient = new QueryClient();

function PrivateRoute({
  allowed,
  children,
}: {
  allowed: Papel[];
  children: ReactElement;
}) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!allowed.includes(user.papel)) {
    const home = user.papel === "cliente" ? "/portal" : "/app/dashboard";
    return <Navigate to={home} replace />;
  }
  return children;
}

/** Carrega config de módulos do Supabase após login; reseta no logout. */
function ModulesLoader({ children }: { children: ReactNode }) {
  useCarregarModulosCliente();
  return <>{children}</>;
}

function RootRedirect() {
  const { usuario } = useAuth();
  if (!usuario) return <Navigate to="/login" replace />;
  const mapa: Record<string, string> = {
    admin:         "/app/dashboard",
    consultor:     "/app/dashboard",
    rh:            "/app/dashboard",
    rh_operacional:"/app/dashboard",
    cliente:       "/portal",
    colaborador:   "/hub/colaborador/inicio",
    lider:         "/hub/lider/painel",
    ceo:           "/hub/ceo/dashboard",
    dp:            "/hub/dp/inicio",
    contador:      "/hub/contabilidade/inicio",
    juridico:      "/hub/juridico/inicio",
  };
  return <Navigate to={mapa[usuario.role] ?? "/login"} replace />;
}

// Redireciona /portal/projetos/:id → /cliente/projetos/:id preservando o id
function PortalProjetoRedirect() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/cliente/projetos/${id ?? ""}`} replace />;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<RootRedirect />} />
    <Route path="/login" element={<Login />} />
    <Route path="/selecao-perfil" element={<SelecaoPerfil />} />
    <Route path="/confirmar-entrevista/:agendamentoId" element={<ConfirmarEntrevistaPage />} />

    {/* Admin / Consultor */}
    <Route
      element={
        <PrivateRoute allowed={["admin", "consultor"]}>
          <AppLayout />
        </PrivateRoute>
      }
    >
      <Route path="/app/dashboard" element={<AdminDashboard />} />
      <Route path="/app/empresas" element={<Empresas />} />
      <Route path="/app/empresas/:id" element={<EmpresaDetalhePage />} />
      <Route path="/app/usuarios" element={<UsuariosPage />} />
      <Route path="/app/projetos" element={<ProjetosPage />} />
      <Route path="/app/projetos/:id" element={<ProjetoDetalhe />} />
      <Route path="/app/clientes" element={<ClientesPage />} />
      <Route path="/app/clientes/:id" element={<Stub title="Detalhe do cliente" subtitle="Visão consolidada da empresa" />} />
      <Route path="/app/horas" element={<HorasPage />} />
      <Route path="/app/financeiro" element={<FinanceiroPage />} />
      <Route path="/app/solicitacoes" element={<SolicitacoesPage />} />
      <Route path="/app/solicitacoes/:id" element={<Stub title="Detalhe da solicitação" />} />
      <Route path="/app/atracao" element={<AtracaoRouter />} />
      <Route path="/app/atracao/:id" element={<VagaDetalheAdmin />} />
      <Route path="/app/atracao/:id/relatorio-final" element={<RelatorioFinalVagaPage />} />
      <Route path="/app/candidatos/:id" element={<Stub title="Perfil do candidato" subtitle="DISC, questionários, pareceres" />} />
      <Route path="/app/analytics" element={<Analytics />} />
      <Route path="/app/gestao-de-conta" element={<GestaoConta />} />
      <Route path="/app/comunicados" element={<ComunicadosPage />} />
      <Route path="/app/calendario" element={<CalendarioPage />} />
      <Route path="/app/documentos" element={<DocumentosPage />} />
      <Route path="/app/auditoria" element={<AuditoriaPage />} />
      <Route path="/app/configuracoes" element={<ConfiguracoesPage />} />
      <Route path="/app/perfil" element={<PerfilPage />} />
    </Route>

    {/* Cliente ADM (mantido) */}
    <Route
      element={
        <PrivateRoute allowed={["cliente"]}>
          <AppLayout />
        </PrivateRoute>
      }
    >
      <Route path="/cliente/dashboard" element={<ClienteDashboard />} />
      <Route path="/cliente/projetos" element={<ClienteProjetosPage />} />
      <Route path="/cliente/projetos/:id" element={<ClienteProjetoDetalhe />} />
      <Route path="/cliente/horas" element={<ClienteHorasPage />} />
      <Route path="/cliente/solicitacoes" element={<SolicitacoesClientePage />} />
      <Route path="/cliente/solicitacoes/:id" element={<Stub title="Detalhe da solicitação" subtitle="Conversa completa com a consultora" />} />
      <Route path="/cliente/atracao" element={<VagasClientePage />} />
      <Route path="/cliente/atracao/:id" element={<VagaDetalheCliente />} />
      <Route path="/cliente/gestao-conta" element={<ClienteGestaoContaPage />} />
      <Route path="/cliente/hub-indisponivel" element={<ClienteHubIndisponivelPage />} />
      <Route path="/cliente/comunicados" element={<ClienteComunicadosPage />} />
      <Route path="/cliente/calendario" element={<ClienteCalendarioPage />} />
      <Route path="/cliente/documentos" element={<ClienteDocumentosPage />} />
      <Route path="/cliente/guia" element={<ClienteGuiaPage />} />
    </Route>

    {/* Hub Líder */}
    <Route element={
      <PrivateRoute allowed={["lider", "rh", "admin"]}>
        <HubLayout profile="lider" />
      </PrivateRoute>
    }>
      <Route path="/hub/lider/painel" element={<LiderPainelPage />} />
      <Route path="/hub/lider/meu-time" element={<MeuTimePage />} />
      <Route path="/hub/lider/meu-time/:id" element={<ColaboradorPerfilPage />} />
      <Route path="/hub/lider/onboarding" element={<OnboardingPage />} />
      <Route path="/hub/lider/feedback" element={<FeedbackPage />} />
      <Route path="/hub/lider/avaliacoes" element={<AvaliacoesLiderPage />} />
      <Route path="/hub/lider/solicitacoes" element={<SolicitacoesLiderPage />} />
      <Route path="/hub/lider/sobre-voce" element={<LiderSobreVocePage />} />
      <Route path="/hub/lider/termometro" element={<LiderTermometroPage />} />
      <Route path="/hub/lider/mural" element={<LiderMuralPage />} />
      <Route path="/hub/lider/politicas" element={<Stub title="Políticas internas" />} />
      <Route path="/hub/lider/treinamentos" element={<Stub title="Treinamentos" />} />
      <Route path="/hub/lider/calendario" element={<Stub title="Calendário da equipe" />} />
      <Route path="/hub/lider/comunicados" element={<Stub title="Comunicados para a equipe" />} />
    </Route>

    {/* Hub Colaborador (cliente liberado em ambiente demo) */}
    <Route element={
      <PrivateRoute allowed={["colaborador", "lider", "rh", "admin", "cliente"]}>
        <HubLayout profile="colaborador" />
      </PrivateRoute>
    }>
      <Route path="/hub/colaborador/inicio" element={<ColaboradorInicio />} />
      <Route path="/hub/colaborador/sobre-voce" element={<SobreVocePage />} />
      <Route path="/hub/colaborador/solicitacoes" element={<SolicitacoesColabPage />} />
      <Route path="/hub/colaborador/holerites" element={<HoleritesPage />} />
      <Route path="/hub/colaborador/ferias" element={<FeriasPage />} />
      <Route path="/hub/colaborador/beneficios" element={<BeneficiosPage />} />
      <Route path="/hub/colaborador/politicas" element={<PoliticasColabPage />} />
      <Route path="/hub/colaborador/treinamentos" element={<TreinamentosColabPage />} />
      <Route path="/hub/colaborador/ajuda" element={<AjudaPage />} />
      <Route path="/hub/colaborador/termometro" element={<TermometroPage />} />
      <Route path="/hub/colaborador/mural" element={<MuralPage />} />
      <Route path="/hub/colaborador/comunicados" element={<MuralPage />} />
      <Route path="/hub/colaborador/guias" element={<GuiasPage />} />
      <Route path="/hub/colaborador/onboarding" element={<OnboardingColabPage />} />
    </Route>

    {/* Hub — atalhos /hub/* → versão colaborador */}
    <Route path="/hub" element={<Navigate to="/hub/colaborador/inicio" replace />} />
    <Route path="/hub/politicas" element={<Navigate to="/hub/colaborador/politicas" replace />} />
    <Route path="/hub/guias" element={<Navigate to="/hub/colaborador/guias" replace />} />
    <Route path="/hub/treinamentos" element={<Navigate to="/hub/colaborador/treinamentos" replace />} />
    <Route path="/hub/comunicados" element={<Navigate to="/hub/colaborador/mural" replace />} />
    <Route path="/hub/mural" element={<Navigate to="/hub/colaborador/mural" replace />} />
    <Route path="/hub/ajuda" element={<Navigate to="/hub/colaborador/ajuda" replace />} />

    {/* Hub CEO */}
    <Route element={
      <PrivateRoute allowed={["ceo", "admin"]}>
        <HubLayout profile="ceo" />
      </PrivateRoute>
    }>
      <Route path="/hub/ceo/dashboard" element={<CeoDashboard />} />
      <Route path="/hub/ceo/headcount" element={<HeadcountPage />} />
      <Route path="/hub/ceo/financeiro" element={<FinanceiroRHPage />} />
      <Route path="/hub/ceo/avaliacoes" element={<AvaliacoesCeoPage />} />
      <Route path="/hub/ceo/turnover" element={<TurnoverPage />} />
      <Route path="/hub/ceo/clima" element={<ClimaCeoPage />} />
      <Route path="/hub/ceo/politicas" element={<PoliticasCeoPage />} />
      <Route path="/hub/ceo/minha-empresa" element={<MinhaEmpresaCeoPage />} />
      <Route path="/hub/ceo/mini-empresa" element={<Navigate to="/hub/ceo/minha-empresa" replace />} />
      <Route path="/hub/ceo/beneficios" element={<BeneficiosCeoPage />} />
      <Route path="/hub/ceo/historico" element={<HistoricoCeoPage />} />
      <Route path="/hub/ceo/solicitacoes" element={<SolicitacoesCeoPage />} />
      <Route path="/hub/ceo/ajuda" element={<AjudaCeoPage />} />
    </Route>

    {/* Hub — Módulos terceiros */}
    <Route element={
      <PrivateRoute allowed={["dp", "rh_operacional", "rh", "admin"]}>
        <HubLayout profile="colaborador" />
      </PrivateRoute>
    }>
      <Route path="/hub/dp/inicio" element={<Stub title="Departamento Pessoal" subtitle="Holerites, férias, afastamentos e CCT" />} />
      <Route path="/hub/dp/holerites" element={<Stub title="Holerites" />} />
      <Route path="/hub/dp/ferias" element={<Stub title="Férias e Afastamentos" />} />
      <Route path="/hub/dp/sindicato-cct" element={<Stub title="Sindicato e CCT" />} />
    </Route>

    <Route element={
      <PrivateRoute allowed={["contador", "rh", "ceo", "admin"]}>
        <HubLayout profile="colaborador" />
      </PrivateRoute>
    }>
      <Route path="/hub/contabilidade/inicio" element={<Stub title="Contabilidade" subtitle="Folha, FGTS, DARF, prazos e relatórios" />} />
      <Route path="/hub/contabilidade/folha" element={<Stub title="Folha de Pagamento" />} />
      <Route path="/hub/contabilidade/arquivos" element={<Stub title="Arquivos do Mês" />} />
    </Route>

    <Route element={
      <PrivateRoute allowed={["juridico", "rh", "ceo", "admin"]}>
        <HubLayout profile="colaborador" />
      </PrivateRoute>
    }>
      <Route path="/hub/juridico/inicio" element={<Stub title="Jurídico" subtitle="Processos trabalhistas e compliance" />} />
      <Route path="/hub/juridico/processos" element={<Stub title="Processos Trabalhistas" />} />
    </Route>

    {/* Portal do Cliente */}
    <Route
      element={
        <PrivateRoute allowed={["cliente", "admin"]}>
          <PortalLayout />
        </PrivateRoute>
      }
    >
      <Route path="/portal" element={<PortalDashboard />} />
      <Route path="/portal/projetos" element={<Navigate to="/cliente/projetos" replace />} />
      <Route path="/portal/projetos/:id" element={<PortalProjetoRedirect />} />
      <Route path="/portal/financeiro" element={<Navigate to="/cliente/gestao-conta" replace />} />
    </Route>

    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ModulesProvider>
            <FinanceiroProvider>
              <ModulesLoader>
                <AppRoutes />
              </ModulesLoader>
            </FinanceiroProvider>
          </ModulesProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
