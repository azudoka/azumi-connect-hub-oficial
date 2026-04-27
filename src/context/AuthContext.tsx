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
  | "rh"
  | "rh_operacional"
  | "ceo"
  | "colaborador"
  | "lider"
  | "dp"
  | "contador"
  | "juridico";

export type UserRole = Papel;

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
  modulos: ModuloPermissao[];
  isDemo: boolean;
  auditoria: boolean;
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
};

const ROLES_COM_AUDITORIA: UserRole[] = ["rh", "ceo", "admin"];

interface MockCred {
  email: string;
  senha: string;
  id: string;
  nome: string;
  role: UserRole;
  empresaNome: string;
}

const MOCK_USUARIOS: MockCred[] = [
  { email: "rh@empresa.com", senha: "123", id: "u-rh", nome: "Julia Fernandes", role: "rh", empresaNome: "Azumi" },
  { email: "ceo@empresa.com", senha: "123", id: "u-ceo", nome: "Roberto Alves", role: "ceo", empresaNome: "Azumi" },
  { email: "colaborador@empresa.com", senha: "123", id: "u-col", nome: "Ana Carolina Silva", role: "colaborador", empresaNome: "Azumi" },
  { email: "lider@empresa.com", senha: "123", id: "u-lid", nome: "Roberto Mendes", role: "lider", empresaNome: "Azumi" },
  { email: "dp@empresa.com", senha: "123", id: "u-dp", nome: "Patrícia Santos", role: "dp", empresaNome: "Azumi" },
  { email: "contador@empresa.com", senha: "123", id: "u-cont", nome: "Carlos Lima", role: "contador", empresaNome: "Azumi" },
  { email: "juridico@empresa.com", senha: "123", id: "u-jur", nome: "Dr. Marcos Ribeiro", role: "juridico", empresaNome: "Azumi" },
  { email: "admin@empresa.com", senha: "123", id: "u-adm", nome: "Administrador", role: "admin", empresaNome: "Azumi" },
];

function buildUsuario(cred: MockCred): Usuario {
  return {
    id: cred.id,
    nome: cred.nome,
    email: cred.email,
    role: cred.role,
    empresaNome: cred.empresaNome,
    modulos: PERMISSOES_POR_ROLE[cred.role] ?? [],
    isDemo: false,
    auditoria: ROLES_COM_AUDITORIA.includes(cred.role),
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
          empresaId: usuario.empresaNome || null,
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
