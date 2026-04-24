import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const projetos = [
  {
    id: "PROJ-2026-0001",
    titulo: "Mapeamento de Cargos",
    progresso: 62,
    prazo: "30/06/2026",
    status: "andamento" as const,
  },
  {
    id: "PROJ-2026-0002",
    titulo: "Hunting Gerente TI",
    progresso: 45,
    prazo: "15/07/2026",
    status: "andamento" as const,
  },
];

export default function PortalProjetos() {
  const navigate = useNavigate();

  return (
    <>
      <PageHeader
        title="Projetos"
        subtitle="Projetos contratados pela Kentaki Foods"
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {projetos.map((p) => (
          <Card key={p.id} className="card-hover">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-data text-xs text-muted-foreground">{p.id}</p>
                  <CardTitle className="text-base mt-1">{p.titulo}</CardTitle>
                </div>
                <StatusBadge status={p.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Conclusão</span>
                  <span className="font-data tabular-nums">{p.progresso}%</span>
                </div>
                <Progress value={p.progresso} className="h-2" />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Prazo final</span>
                <span className="font-data tabular-nums">{p.prazo}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => navigate(`/portal/projetos/${p.id}`)}
              >
                Ver detalhes
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
