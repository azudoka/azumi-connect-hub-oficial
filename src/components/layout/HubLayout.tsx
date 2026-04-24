import { Outlet } from "react-router-dom";
import { SidebarHub } from "./SidebarHub";
import { Header } from "./Header";

type Profile = "lider" | "colaborador" | "ceo";

export function HubLayout({ profile }: { profile: Profile }) {
  return (
    <div className="hub-light flex h-full w-full bg-background text-foreground">
      <SidebarHub profile={profile} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header context="hub" />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 lg:p-8 max-w-[1600px] mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
