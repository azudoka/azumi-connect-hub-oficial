import { useAuth, type Papel } from "../context/AuthContext";

export type Permissao =
  | "dashboard.ver"
  | "projetos.criar" | "projetos.editar"
  | "cronograma.editar"
  | "entregaveis.editar"
  | "subtarefas.criar"
  | "timer.usar"
  | "horas.ver_proprias" | "horas.ver_todas"
  | "solicitacoes.ver" | "solicitacoes.criar"
  | "vagas.ver" | "vagas.editar"
  | "candidatos.ver" | "candidatos.editar" | "candidatos.convidar"
  | "questionario.editar"
  | "gestao_conta.relatorio"
  | "financeiro.ver_valores"
  | "financeiro.nota_fiscal"
  | "analytics.ver_basico"
  | "analytics.ver_financeiro"
  | "documentos.ver" | "documentos.editar" | "documentos.excluir"
  | "wiki.ver" | "wiki.editar"
  | "calendario.ver"
  | "comunicados.ver" | "comunicados.criar"
  | "guia.ver" | "guia.criar" | "guia.editar"
  | "perfil.editar_proprio"
  | "empresas.ver"
  | "usuarios.gerenciar"
  | "clientes.gerenciar"
  | "auditoria.ver"
  | "portal_cliente.acessar"
  | "admin.tudo";

const PERMISSOES_POR_PAPEL: Record<Papel, Permissao[]> = {
  admin: ["admin.tudo"],
  consultor: [
    "dashboard.ver",
    "projetos.criar", "projetos.editar",
    "cronograma.editar",
    "entregaveis.editar",
    "subtarefas.criar",
    "timer.usar",
    "horas.ver_proprias",
    "solicitacoes.ver",
    "vagas.ver", "vagas.editar",
    "candidatos.ver", "candidatos.editar", "candidatos.convidar",
    "questionario.editar",
    "gestao_conta.relatorio",
    "analytics.ver_basico",
    "documentos.ver", "documentos.editar", "documentos.excluir",
    "wiki.ver", "wiki.editar",
    "calendario.ver",
    "comunicados.ver", "comunicados.criar",
    "guia.ver", "guia.criar", "guia.editar",
    "perfil.editar_proprio",
    "empresas.ver",
  ],
  cliente: [
    "dashboard.ver",
    "solicitacoes.ver", "solicitacoes.criar",
    "vagas.ver",
    "candidatos.ver",
    "gestao_conta.relatorio",
    "financeiro.ver_valores",
    "financeiro.nota_fiscal",
    "analytics.ver_basico",
    "documentos.ver",
    "wiki.ver",
    "calendario.ver",
    "comunicados.ver",
    "guia.ver",
    "perfil.editar_proprio",
  ],
  // Novos papéis Hub — sem mapeamento detalhado de permissões legadas
  rh: ["dashboard.ver", "auditoria.ver", "perfil.editar_proprio"],
  rh_operacional: ["dashboard.ver", "perfil.editar_proprio"],
  ceo: ["dashboard.ver", "auditoria.ver", "analytics.ver_basico", "analytics.ver_financeiro", "perfil.editar_proprio"],
  colaborador: ["dashboard.ver", "perfil.editar_proprio"],
  lider: ["dashboard.ver", "perfil.editar_proprio"],
  dp: ["dashboard.ver", "perfil.editar_proprio"],
  contador: ["dashboard.ver", "perfil.editar_proprio"],
  juridico: ["dashboard.ver", "perfil.editar_proprio"],
};

export function temPermissao(papel: Papel, permissao: Permissao): boolean {
  if (papel === "admin") return true;
  return (PERMISSOES_POR_PAPEL[papel] ?? []).includes(permissao);
}

export function usePermissao() {
  const { user } = useAuth();
  return {
    pode: (p: Permissao) => (user ? temPermissao(user.papel, p) : false),
  };
}
