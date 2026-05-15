import { Outlet, useNavigate } from "react-router-dom";
import { SidebarConnect } from "./SidebarConnect";
import { Header } from "./Header";
import { useAuth } from "@/context/AuthContext";
import { TimerFlutuante } from "@/components/TimerFlutuante";
import { useTimerGlobal } from "@/context/TimerContext";

interface AppLayoutProps {
  /**
   * @deprecated Hoje ainda aceito porque App.tsx passa hardcoded em algumas rotas.
   * Quando essas chamadas forem removidas, esta prop também deve sumir.
   * Por padrão o variant é derivado de user.papel.
   */
  variant?: "admin" | "cliente";
}

export function AppLayout({ variant: variantOverride }: AppLayoutProps) {
  const { user } = useAuth();
  const variant: "admin" | "cliente" =
    variantOverride ?? (user?.papel === "cliente" ? "cliente" : "admin");

  const timerCtx = useTimerGlobal();
  const navigate = useNavigate();

  return (
    <div className="flex h-full w-full bg-background text-foreground">
      <SidebarConnect variant={variant} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header context="connect" />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 lg:p-8 max-w-[1600px] mx-auto animate-fade-in">
            <Outlet />
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
