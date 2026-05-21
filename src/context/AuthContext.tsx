import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

/**
 * Papéis legados do Connect — mantidos por compatibilidade com código existente.
 * Os novos papéis (rh, ceo, colaborador, lider, dp, contador, juridico) estendem
 * o conjunto sem remover os anteriores.
 */
export type Papel =
  | "admin"
  | "consultor"
  | "cliente"
  | "cliente_avulso"
  | "rh"
  | "rh_operacional"
  | "ceo"
  | "colaborador"
  | "lider"
  | "dp"
  | "contador"
  | "juridico"
  | "trial";

export type UserRole = Papel;

export type Plano = "trial" | "start" | "ongoing" | "growth";


export type ModuloSlug =
  | "atracao"
  | "performance"
  | "governanca"
  | "regulamentacao"
  | "politicas"
  | "engenharia_pessoas"
  | "endomarketing"
  | "dp"
  | "contabilidade"
  | "juridico";

export type PermissaoNivel = "operar" | "consultar" | "auditoria";

export interface ModuloPermissao {
  slug: ModuloSlug;
  nivel: PermissaoNivel;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  empresaNome: string;
  empresaId?: string | null;
  modulos: ModuloPermissao[];
  isDemo: boolean;
  auditoria: boolean;
  plano?: Plano | null;
  trialExpiraEm?: string | null;
  avatarUrl?: string | null;
  inativo?: boolean;
  /** Cliente contratou o produto Hub? Define se vê o Hub real ou a apresentação. */
  hubContratado?: boolean;
}


/**
 * Compat com o tipo antigo AuthUser, ainda usado em src/pages/Login.tsx e
 * em alguns componentes via useAuth().user.
 */
export interface AuthUser {
  id: string;
  nome: string;
  papel: Papel;
  empresaId: string | null;
}

// ---------------------------------------------------------------------------
// Mock de credenciais e permissões
// ---------------------------------------------------------------------------

const TODOS_MODULOS: ModuloSlug[] = [
  "atracao",
  "performance",
  "governanca",
  "regulamentacao",
  "politicas",
  "engenharia_pessoas",
  "endomarketing",
  "dp",
  "contabilidade",
  "juridico",
];

function todosCom(nivel: PermissaoNivel): ModuloPermissao[] {
  return TODOS_MODULOS.map((slug) => ({ slug, nivel }));
}

const PERMISSOES_POR_ROLE: Record<UserRole, ModuloPermissao[]> = {
  colaborador: [
    { slug: "atracao", nivel: "consultar" },
    { slug: "performance", nivel: "consultar" },
    { slug: "politicas", nivel: "consultar" },
    { slug: "endomarketing", nivel: "consultar" },
    { slug: "regulamentacao", nivel: "consultar" },
  ],
  lider: [
    { slug: "atracao", nivel: "consultar" },
    { slug: "performance", nivel: "operar" },
    { slug: "politicas", nivel: "consultar" },
    { slug: "endomarketing", nivel: "consultar" },
    { slug: "engenharia_pessoas", nivel: "consultar" },
  ],
  rh: todosCom("consultar"),
  rh_operacional: [
    { slug: "dp", nivel: "operar" },
    { slug: "atracao", nivel: "consultar" },
    { slug: "performance", nivel: "consultar" },
    { slug: "politicas", nivel: "operar" },
    { slug: "regulamentacao", nivel: "operar" },
  ],
  ceo: todosCom("consultar"),
  dp: [{ slug: "dp", nivel: "operar" }],
  contador: [{ slug: "contabilidade", nivel: "operar" }],
  juridico: [{ slug: "juridico", nivel: "operar" }],
  admin: todosCom("operar"),
  // legados — sem módulos do Hub
  consultor: [],
  cliente: [],
  cliente_avulso: [],
  trial: [],
};


const ROLES_COM_AUDITORIA: UserRole[] = ["rh", "ceo", "admin"];

interface MockCred {
  email: string;
  senha: string;
  id: string;
  nome: string;
  role: UserRole;
  empresaNome: string;
  empresaId?: string | null;
  plano?: Plano | null;
  trialExpiraEm?: string | null;
  avatarUrl?: string | null;
  inativo?: boolean;
  hubContratado?: boolean;
}

const MOCK_USUARIOS: MockCred[] = [
  { email: "patricia@azumirh.com.br", senha: "123", id: "u-patricia", nome: "Patricia Lima", role: "admin", empresaNome: "", empresaId: "", avatarUrl: null, hubContratado: true },
  { email: "ana@azumirh.com.br",      senha: "123", id: "u-ana",      nome: "Ana Beatriz",   role: "consultor", empresaNome: "", empresaId: "", avatarUrl: null, hubContratado: true },
  { email: "rafael@azumirh.com.br",   senha: "123", id: "u-rafael",   nome: "Rafael Moura",  role: "consultor", empresaNome: "", empresaId: "", avatarUrl: null, hubContratado: true },
  { email: "mariana@kentaki.com",     senha: "123", id: "u-mariana",  nome: "Mariana Souza", role: "cliente",   empresaNome: "Kentaki Foods", empresaId: "kentaki", avatarUrl: null, plano: "ongoing", hubContratado: true },
  { email: "felipe@horizonte.com.br", senha: "123", id: "u-felipe",   nome: "Felipe Andrade", role: "cliente",  empresaNome: "Construtora Horizonte", empresaId: "horizonte", avatarUrl: null, plano: "start", hubContratado: false },
  { email: "beatriz@vitasaude.com.br", senha: "123", id: "u-beatriz", nome: "Beatriz Lopes",  role: "cliente",  empresaNome: "Clínica Vita Saúde", empresaId: "vita", avatarUrl: null, plano: "growth", hubContratado: true },
  { email: "joao@startupy.com.br",    senha: "123", id: "u-joao",     nome: "João Pedro",    role: "cliente_avulso", empresaNome: "Startup Y", empresaId: "startupy", avatarUrl: null, inativo: true, hubContratado: false },
  { email: "demo@azumirh.com.br",     senha: "Demo2026", id: "u-trial-demo", nome: "Carlos Demo", role: "trial", empresaNome: "Empresa Demo", empresaId: "empresa-demo", avatarUrl: null, plano: "trial", trialExpiraEm: "2026-06-30", hubContratado: false },
  { email: "fernanda@valoreconsultoria.com.br", senha: "azumi2026", id: "u-fernanda", nome: "Fernanda Albuquerque", role: "cliente", empresaNome: "Valore Consultoria", empresaId: "valore", avatarUrl: null, plano: "ongoing", hubContratado: true },
];

function buildUsuario(cred: MockCred): Usuario {
  return {
    id: cred.id,
    nome: cred.nome,
    email: cred.email,
    role: cred.role,
    empresaNome: cred.empresaNome,
    empresaId: cred.empresaId ?? null,
    modulos: PERMISSOES_POR_ROLE[cred.role] ?? [],
    isDemo: cred.role === "trial",
    auditoria: ROLES_COM_AUDITORIA.includes(cred.role),
    plano: cred.plano ?? null,
    trialExpiraEm: cred.trialExpiraEm ?? null,
    avatarUrl: cred.avatarUrl ?? null,
    inativo: cred.inativo ?? false,
    hubContratado: cred.hubContratado ?? false,
  };
}


// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface AuthContextValue {
  usuario: Usuario | null;
  /** @deprecated mantenha compat: AuthUser legado derivado de usuario */
  user: AuthUser | null;
  login: (email: string, senha: string) => Promise<"ok" | "erro">;
  /** Compat com Login antigo (admin/consultor/cliente). */
  loginLegacy: (user: AuthUser) => void;
  logout: () => void;
  hasModulo: (slug: ModuloSlug) => boolean;
  podeOperar: (slug: ModuloSlug) => boolean;
  temAuditoria: boolean;
}

const STORAGE_KEY = "azumi_user_v2";
const LEGACY_STORAGE_KEY = "azumi_user";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStored(): Usuario | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Usuario;
      if (parsed && typeof parsed.id === "string" && typeof parsed.role === "string") {
        return parsed;
      }
    }
    // tenta ler formato legado
    const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy) {
      const p = JSON.parse(legacy) as AuthUser;
      if (p && p.id && p.papel) {
        return {
          id: p.id,
          nome: p.nome,
          email: "",
          role: p.papel,
          empresaNome: p.empresaId ?? "",
          modulos: PERMISSOES_POR_ROLE[p.papel] ?? [],
          isDemo: false,
          auditoria: ROLES_COM_AUDITORIA.includes(p.papel),
        };
      }
    }
    return null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(() => readStored());

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (usuario) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(usuario));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    }
  }, [usuario]);

  const login = useCallback(async (email: string, senha: string): Promise<"ok" | "erro"> => {
    await new Promise((r) => setTimeout(r, 350));
    const cred = MOCK_USUARIOS.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.senha === senha
    );
    if (!cred) return "erro";
    setUsuario(buildUsuario(cred));
    return "ok";
  }, []);

  const loginLegacy = useCallback((u: AuthUser) => {
    setUsuario({
      id: u.id,
      nome: u.nome,
      email: "",
      role: u.papel,
      empresaNome: u.empresaId ?? "",
      modulos: PERMISSOES_POR_ROLE[u.papel] ?? [],
      isDemo: false,
      auditoria: ROLES_COM_AUDITORIA.includes(u.papel),
    });
  }, []);

  const logout = useCallback(() => setUsuario(null), []);

  const hasModulo = useCallback(
    (slug: ModuloSlug) => !!usuario?.modulos.some((m) => m.slug === slug),
    [usuario]
  );

  const podeOperar = useCallback(
    (slug: ModuloSlug) =>
      !!usuario?.modulos.some((m) => m.slug === slug && m.nivel === "operar"),
    [usuario]
  );

  const value = useMemo<AuthContextValue>(() => {
    const legacyUser: AuthUser | null = usuario
      ? {
          id: usuario.id,
          nome: usuario.nome,
          papel: usuario.role,
          // BUGFIX: empresaId precisa ser o slug ("kentaki", "valore", "horizonte"…),
          // não o empresaNome. As páginas do cliente filtram por esse slug.
          empresaId: usuario.empresaId ?? null,
        }
      : null;
    return {
      usuario,
      user: legacyUser,
      login,
      loginLegacy,
      logout,
      hasModulo,
      podeOperar,
      temAuditoria: usuario?.auditoria ?? false,
    };
  }, [usuario, login, loginLegacy, logout, hasModulo, podeOperar]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}
