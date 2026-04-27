import { useNavigate } from "react-router-dom";
import {
  ShieldCheck, UserCog, Building2, Crown, Users, UserCircle2, BriefcaseBusiness, ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth, type AuthUser } from "@/context/AuthContext";

type PerfilItem = {
  key: string;
  label: string;
  desc: string;
  icon: typeof ShieldCheck;
  to: string;
  color: string;
  auth?: AuthUser;
};

const perfis: PerfilItem[] = [
  {
    key: "admin",
    label: "Admin Azumi",
    desc: "Acesso completo à plataforma",
    icon: ShieldCheck,
    to: "/app/dashboard",
    color: "text-primary",
    auth: { id: "admin-01", nome: "Patricia Lima", papel: "admin", empresaId: null },
  },
  {
    key: "consultor",
    label: "Consultor",
    desc: "Gestão de clientes e operações",
    icon: UserCog,
    to: "/app/dashboard",
    color: "text-primary",
    auth: { id: "consultor-01", nome: "Ana Beatriz", papel: "consultor", empresaId: null },
  },
  {
    key: "cliente",
    label: "Cliente ADM",
    desc: "Visão da empresa contratante",
    icon: Building2,
    to: "/portal",
    color: "text-highlight",
    auth: { id: "cliente-01", nome: "Kentaki Foods", papel: "cliente", empresaId: "kentaki" },
  },
  {
    key: "cliente-avulso",
    label: "Cliente Avulso",
    desc: "Empresa em projeto pontual",
    icon: Building2,
    to: "/portal",
    color: "text-highlight",
    auth: { id: "cliente-02", nome: "Cliente Avulso", papel: "cliente", empresaId: "maverick" },
  },
  { key: "ceo", label: "CEO", desc: "Indicadores estratégicos", icon: Crown, to: "/hub/ceo/dashboard", color: "text-warning" },
  { key: "lider", label: "Líder", desc: "Gestão do time e feedback", icon: BriefcaseBusiness, to: "/hub/lider/painel", color: "text-info" },
  { key: "colab", label: "Colaborador", desc: "Sua jornada na empresa", icon: UserCircle2, to: "/hub/colaborador/inicio", color: "text-success" },
  { key: "rh", label: "RH", desc: "Operação de gente e cultura", icon: Users, to: "/hub/lider/painel", color: "text-primary" },
];

export default function SelecaoPerfil() {
  const navigate = useNavigate();
  const { loginLegacy: login } = useAuth();

  const handleSelecionar = (p: PerfilItem) => {
    if (p.auth) {
      login(p.auth);
    }
    navigate(p.to);
  };

  return (
    <div className="min-h-full w-full bg-background relative overflow-hidden p-6 sm:p-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-96 w-[60rem] rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex h-10 w-10 rounded-lg bg-gradient-brand items-center justify-center font-logo font-bold text-white">A</div>
          <h1 className="mt-4 font-display text-3xl sm:text-4xl font-semibold">
            Bem-vindo(a) à <span className="text-gradient-brand">Azumi</span>
          </h1>
          <p className="mt-2 text-muted-foreground">Selecione com qual perfil deseja acessar a plataforma.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {perfis.map((p, i) => (
            <button
              key={p.key}
              onClick={() => handleSelecionar(p)}
              className={cn(
                "group text-left bg-card border border-border rounded-2xl p-5 card-hover animate-fade-in",
              )}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className={cn("h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center", p.color)}>
                  <p.icon className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="mt-4 font-display text-base font-semibold">{p.label}</h3>
              <p className="text-sm text-muted-foreground mt-1">{p.desc}</p>
            </button>
          ))}
        </div>

        <div className="mt-8 text-center text-xs text-muted-foreground">
          Você pode alternar entre Connect e Hub a qualquer momento pelo seletor no topo.
        </div>
      </div>
    </div>
  );
}
