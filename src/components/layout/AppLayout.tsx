import { Outlet } from "react-router-dom";
import { SidebarConnect } from "./SidebarConnect";
import { Header } from "./Header";

interface AppLayoutProps {
  variant?: "admin" | "cliente";
}

export function AppLayout({ variant = "admin" }: AppLayoutProps) {
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
    </div>
  );
}
