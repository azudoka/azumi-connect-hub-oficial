import { Outlet } from "react-router-dom";
import { SidebarHub } from "./SidebarHub";
import { Header } from "./Header";
import { useAuth } from "@/context/AuthContext";
import { HubTrialPresentation } from "@/components/HubTrialPresentation";

type Profile = "lider" | "colaborador" | "ceo";

export function HubLayout({ profile }: { profile: Profile }) {
  const { usuario } = useAuth();
  const semHub = usuario?.role === "trial" || usuario?.hubContratado === false;

  return (
    <div className="product-hub hub-light flex min-h-screen w-full bg-background text-foreground">
      <SidebarHub profile={profile} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header context="hub" />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 lg:p-8 max-w-[1600px] mx-auto animate-fade-in">
            {semHub ? <HubTrialPresentation /> : <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
}
