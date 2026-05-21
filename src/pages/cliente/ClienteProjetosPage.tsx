import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, FolderKanban } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import { useProjetosClienteStore } from "@/data/useProjetosClienteStore";
import { projetosDemo } from "@/data/mockDemoData";
import type { ProjetoCliente, EntregavelStatus } from "@/data/projetosCliente";
import { CronogramasTab } from "./CronogramasTab";

type Aba = "projetos" | "cronogramas";

export default function ClienteProjetosPage() {
  const { user, usuario } = useAuth();
  const empresaId = user?.empresaId ?? "";
  const isDemoUser = usuario?.role === "trial";

  const projetos = useProjetosClienteStore((s) =>
    s.projetos.filter((p) => (empresaId ? p.empresaId === empresaId : true))
  );
  const cronogramas = useProjetosClienteStore((s) =>
    s.cronogramas.filter((c) => (empresaId ? c.empresaId === empresaId : true))
  );

  const projetosDemoMapped = useMemo<ProjetoCliente[]>(
    () =>
      projetosDemo.map((p) => ({
        id: p.id,
        codigo: p.id.toUpperCase(),
        nome: p.nome,
        empresaId: "empresa-demo",
        consultor: "Ana Beatriz",
        consultorIniciais: "AB",
        status: "andamento",
        frente: "Demo",
        entregaveis: p.entregaveis.map((e) => {
          const status: EntregavelStatus =
            e.status === "aprovado"
              ? "aprovado_cliente"
              : e.status === "aguardando_parecer"
              ? "aprovacao_cliente"
              : "em_andamento";
          return {
            id: e.id,
            codigo: e.id.toUpperCase(),
            nome: e.titulo,
            frente: "Demo",
            complexidade: "C2",
            status,
            prazo: new Date().toISOString(),
            subtarefas: 0,
            tipoDocumento: false,
          };
        }),
      })),
    []
  );

  const projetosExibir = isDemoUser ? projetosDemoMapped : projetos;

  const [aba, setAba] = useState<Aba>("projetos");

  const aguardando = useMemo(
    () => cronogramas.filter((c) => c.status === "aguardando_aprovacao_cliente").length,
    [cronogramas]
  );

  return (
    <>
      <PageHeader
        title="Projetos"
        subtitle="Entregáveis em andamento com a Azumi"
      />

      {/* Abas */}
      <div className="border-b border-border mb-5">
        <div className="flex items-center gap-6">
          <TabButton active={aba === "projetos"} onClick={() => setAba("projetos")}>
            Projetos
          </TabButton>
          <TabButton active={aba === "cronogramas"} onClick={() => setAba("cronogramas")}>
            <span className="inline-flex items-center gap-2">
              Cronogramas
              {aguardando > 0 && (
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-semibold">
                  {aguardando}
                </span>
              )}
            </span>
          </TabButton>
        </div>
      </div>

      {aba === "projetos" ? (
        projetosExibir.length === 0 ? (
          <Card className="glass">
            <CardContent className="p-0">
              <EmptyState
                icon={FolderKanban}
                title="Nenhum projeto vigente"
                description="Quando um cronograma for aprovado, ele vira um projeto e aparece aqui."
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {projetosExibir.map((p) => {
              const total = p.entregaveis.length;
              const aprovados = p.entregaveis.filter(
                (e) => e.status === "aprovado_cliente"
              ).length;
              const pct = total === 0 ? 0 : Math.round((aprovados / total) * 100);
              return (
                <Card key={p.id} className="card-hover">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-data text-xs text-muted-foreground">{p.codigo}</p>
                        <h3 className="text-base font-semibold mt-1 truncate">{p.nome}</h3>
                      </div>
                      <StatusBadge
                        status={p.status === "vigente" ? "andamento" : "andamento"}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="h-6 w-6 rounded-full bg-primary/15 text-primary text-xs font-semibold flex items-center justify-center">
                        {p.consultorIniciais}
                      </span>
                      <span className="text-sm text-muted-foreground">{p.consultor}</span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground">
                          {aprovados} de {total} entregáveis aprovados
                        </span>
                        <span className="font-data tabular-nums">{pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="rounded-full w-full"
                    >
                      <Link to={`/cliente/projetos/${p.id}`}>
                        Ver entregáveis
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )
      ) : (
        <CronogramasTab cronogramas={cronogramas} />
      )}
    </>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "py-2.5 -mb-px border-b-2 text-sm font-medium transition-colors",
        active
          ? "border-primary text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}
