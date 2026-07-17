import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export type Papel =
  | "admin"
  | "consultor"
  | "cliente"
  | "cliente_avulso"
  | "trial"
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
  empresaId: string | null;
  modulos: ModuloPermissao[];
  isDemo: boolean;
  auditoria: boolean;
  avatarUrl?: string;
}

export interface AuthUser {
  id: string;
  nome: string;
  papel: Papel;
  empresaId: string | null;
}

// ---------------------------------------------------------------------------
// Mapeamento DB role → Papel interno
// ---------------------------------------------------------------------------

const DB_ROLE_TO_PAPEL: Record<string, Papel> = {
  azumi_admin:            "admin",
  azumi_consultor:        "consultor",
  cliente_user:           "cliente",
  cliente_avulso:         "cliente_avulso",
  cliente_go_to_market:   "cliente",
  lider:                  "lider",
  colaborador:            "colaborador",
  ceo:                    "ceo",
  dp:                     "dp",
  contador:               "contador",
  juridico:               "juridico",
};

// ---------------------------------------------------------------------------
// Permissões por role
// ---------------------------------------------------------------------------

const TODOS_MODULOS: ModuloSlug[] = [
  "atracao", "performance", "governanca", "regulamentacao",
  "politicas", "engenharia_pessoas", "endomarketing", "dp",
  "contabilidade", "juridico",
];

function todosCom(nivel: PermissaoNivel): ModuloPermissao[] {
  return TODOS_MODULOS.map((slug) => ({ slug, nivel }));
}

const PERMISSOES_POR_ROLE: Record<UserRole, ModuloPermissao[]> = {
  colaborador:    [
    { slug: "atracao",           nivel: "consultar" },
    { slug: "performance",       nivel: "consultar" },
    { slug: "politicas",         nivel: "consultar" },
    { slug: "endomarketing",     nivel: "consultar" },
    { slug: "regulamentacao",    nivel: "consultar" },
  ],
  lider:          [
    { slug: "atracao",           nivel: "consultar" },
    { slug: "performance",       nivel: "operar"    },
    { slug: "politicas",         nivel: "consultar" },
    { slug: "endomarketing",     nivel: "consultar" },
    { slug: "engenharia_pessoas",nivel: "consultar" },
  ],
  rh:             todosCom("consultar"),
  rh_operacional: [
    { slug: "dp",                nivel: "operar"    },
    { slug: "atracao",           nivel: "consultar" },
    { slug: "performance",       nivel: "consultar" },
    { slug: "politicas",         nivel: "operar"    },
    { slug: "regulamentacao",    nivel: "operar"    },
  ],
  ceo:            todosCom("consultar"),
  dp:             [{ slug: "dp",           nivel: "operar"    }],
  contador:       [{ slug: "contabilidade",nivel: "operar"    }],
  juridico:       [{ slug: "juridico",     nivel: "operar"    }],
  admin:          todosCom("operar"),
  consultor:      [],
  cliente:        [],
  cliente_avulso: [],
  trial:          [],
};

const ROLES_COM_AUDITORIA: UserRole[] = ["rh", "ceo", "admin"];

// ---------------------------------------------------------------------------
// Fetch do perfil após login
// ---------------------------------------------------------------------------

async function fetchPerfil(userId: string): Promise<Usuario | null> {
  const { data, error } = await supabase
    .from("users_profile")
    .select("id, role, company_id, full_name, is_active, email, empresa_externa_nome, avatar_url")
    .eq("id", userId)
    .single();

  if (error || !data) return null;

  const papel = DB_ROLE_TO_PAPEL[data.role as string];
  if (!papel) {
    console.warn("[auth] role desconhecido:", data.role);
    return null;
  }

  return {
    id: data.id,
    nome: data.full_name ?? "Usuário",
    email: data.email ?? "",
    role: papel,
    empresaNome: (data as any).empresa_externa_nome ?? "",
    empresaId: data.company_id ?? null,
    modulos: PERMISSOES_POR_ROLE[papel] ?? [],
    isDemo: false,
    auditoria: ROLES_COM_AUDITORIA.includes(papel),
    avatarUrl: (data as any).avatar_url ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface AuthContextValue {
  usuario: Usuario | null;
  carregando: boolean;
  user: AuthUser | null;
  login: (email: string, senha: string) => Promise<"ok" | "erro" | "inativo">;
  loginLegacy: (user: AuthUser) => void;
  logout: () => Promise<void>;
  hasModulo: (slug: ModuloSlug) => boolean;
  podeOperar: (slug: ModuloSlug) => boolean;
  temAuditoria: boolean;
  refreshPerfil: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    // 1. Verifica sessão existente ao montar
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchPerfil(session.user.id)
          .then(setUsuario)
          .finally(() => setCarregando(false));
      } else {
        setCarregando(false);
      }
    });

    // 2. Reage a mudanças de estado (login, logout, refresh de token)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          fetchPerfil(session.user.id).then(setUsuario);
        } else {
          setUsuario(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(
    async (email: string, senha: string): Promise<"ok" | "erro" | "inativo"> => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: senha,
      });
      if (error || !data.session) return "erro";

      const perfil = await fetchPerfil(data.user.id);
      if (!perfil) return "erro";
      if (!perfil.isDemo && !(await isActive(data.user.id))) return "inativo";

      setUsuario(perfil);
      return "ok";
    },
    []
  );

  // loginLegacy: mantido apenas para SelecaoPerfil em modo dev.
  // Em produção (VITE_DEV_MODE !== 'true') a tela é redirecionada para /login.
  const loginLegacy = useCallback((u: AuthUser) => {
    setUsuario({
      id: u.id,
      nome: u.nome,
      email: "",
      role: u.papel,
      empresaNome: u.empresaId ?? "",
      empresaId: u.empresaId ?? null,
      modulos: PERMISSOES_POR_ROLE[u.papel] ?? [],
      isDemo: false,
      auditoria: ROLES_COM_AUDITORIA.includes(u.papel),
    });
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUsuario(null);
  }, []);

  const hasModulo = useCallback(
    (slug: ModuloSlug) => !!usuario?.modulos.some((m) => m.slug === slug),
    [usuario]
  );

  const podeOperar = useCallback(
    (slug: ModuloSlug) =>
      !!usuario?.modulos.some((m) => m.slug === slug && m.nivel === "operar"),
    [usuario]
  );

  const refreshPerfil = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const perfil = await fetchPerfil(session.user.id);
      if (perfil) setUsuario(perfil);
    }
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const legacyUser: AuthUser | null = usuario
      ? { id: usuario.id, nome: usuario.nome, papel: usuario.role, empresaId: usuario.empresaId ?? null }
      : null;
    return {
      usuario,
      carregando,
      user: legacyUser,
      login,
      loginLegacy,
      logout,
      hasModulo,
      podeOperar,
      temAuditoria: usuario?.auditoria ?? false,
      refreshPerfil,
    };
  }, [usuario, carregando, login, loginLegacy, logout, hasModulo, podeOperar, refreshPerfil]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}

// ---------------------------------------------------------------------------
// Helpers privados
// ---------------------------------------------------------------------------

async function isActive(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("users_profile")
    .select("is_active")
    .eq("id", userId)
    .single();
  return data?.is_active !== false;
}
