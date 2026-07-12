import { Outlet, useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { SidebarConnect } from "./SidebarConnect";
import { Header } from "./Header";
import { useAuth } from "@/context/AuthContext";
import { TimerFlutuante } from "@/components/TimerFlutuante";
import { useTimerGlobal } from "@/context/TimerContext";
import { TrialGuard } from "@/components/TrialGuard";
import { MockDataBanner } from "@/components/MockDataBanner";

interface AppLayoutProps {
  /**
   * @deprecated Hoje ainda aceito porque App.tsx passa hardcoded em algumas rotas.
   */
  variant?: "admin" | "cliente";
}

export function AppLayout({ variant: variantOverride }: AppLayoutProps) {
  const { user, usuario } = useAuth();
  const isClienteLike = user?.papel === "cliente" || user?.papel === "trial";
  const variant: "admin" | "cliente" = variantOverride ?? (isClienteLike ? "cliente" : "admin");

  const timerCtx = useTimerGlobal();
  const navigate = useNavigate();
  const isTrial = usuario?.role === "trial";

  return (
    <div className="product-connect flex h-full w-full bg-background text-foreground">
      <SidebarConnect variant={variant} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header context="connect" variant={variant} />
        {isTrial && <MockDataBanner />}
        {isTrial && (
          <div className="border-b border-[hsl(var(--highlight)/0.25)] bg-[hsl(var(--highlight)/0.1)] px-6 py-2 flex items-center gap-3 text-sm">
            <Sparkles className="h-4 w-4 text-highlight shrink-0" />
            <span className="text-foreground">
              Você está em <strong>modo trial</strong> — explore a plataforma e fale com nossa equipe para contratar.
            </span>
          </div>
        )}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 lg:p-8 max-w-[1600px] mx-auto animate-fade-in">
            <TrialGuard>
              <Outlet />
            </TrialGuard>
          </div>
        </main>
      </div>
      <TimerFlutuante
        ativo={timerCtx.ativo}
        tarefaNome={timerCtx.tarefaNome}
        empresaNome={timerCtx.empresaNome}
        segundos={timerCtx.segundos}
        pausado={timerCtx.pausado}
        onIrParaHoras={() => navigate("/app/horas")}
        onPausar={timerCtx.pausar}
        onRetomar={timerCtx.retomar}
        onEncerrar={() => {
          timerCtx.encerrar();
          navigate("/app/horas");
        }}
      />
    </div>
  );
}
