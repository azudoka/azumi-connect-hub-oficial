import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AlertCircle, Briefcase, ClipboardList, FileWarning } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const projetosRecentes = [
  {
    id: "PROJ-2026-0001",
    titulo: "Mapeamento de Cargos",
    progresso: 62,
    status: "andamento" as const,
  },
  {
    id: "PROJ-2026-0002",
    titulo: "Hunting Gerente TI",
    progresso: 45,
    status: "andamento" as const,
  },
];

export default function PortalDashboard() {
  const navigate = useNavigate();
  const [openAprovar, setOpenAprovar] = useState(false);
  const [openAjuste, setOpenAjuste] = useState(false);
  const [justificativa, setJustificativa] = useState("");

  const handleAprovar = () => {
    toast.success("Aprovação registrada");
    setOpenAprovar(false);
  };

  const handleAjuste = () => {
    if (!justificativa.trim()) {
      toast.error("Informe a justificativa do ajuste");
      return;
    }
    toast.success("Solicitação enviada");
    setJustificativa("");
    setOpenAjuste(false);
  };

  return (
    <>
      <PageHeader
        title="Bem-vinda, Ana Beatriz"
        subtitle="Acompanhe os projetos e pendências da sua empresa"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          label="Projetos em andamento"
          value={2}
          icon={Briefcase}
          hint="Gerenciados pela Azumi"
        />
        <KpiCard
          label="Aguardando seu parecer"
          value={1}
          icon={ClipboardList}
          hint="Há 1 entregável pendente"
        />
        <KpiCard
          label="Faturas em aberto"
          value={1}
          icon={FileWarning}
          hint="1 fatura vencida"
        />
      </div>

      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold mb-3">
          Entregáveis aguardando seu parecer
        </h2>
        <Card className="border-warning/40 bg-warning/5">
          <CardContent className="p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-warning" />
                  <span className="text-xs font-medium uppercase tracking-wide text-warning">
                    Há 68h aguardando
                  </span>
                </div>
                <h3 className="font-display text-base font-semibold">
                  Workshop de validação
                </h3>
                <p className="text-sm text-muted-foreground">
                  Mapeamento de Cargos · Prazo: 28/04/2026
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => setOpenAjuste(true)}
                >
                  Solicitar ajuste
                </Button>
                <Button onClick={() => setOpenAprovar(true)}>Aprovar</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold mb-3">Projetos recentes</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {projetosRecentes.map((p) => (
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
              <CardContent className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Progresso</span>
                    <span className="font-data tabular-nums">{p.progresso}%</span>
                  </div>
                  <Progress value={p.progresso} className="h-2" />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate(`/portal/projetos/${p.id}`)}
                >
                  Ver projeto
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Dialog Aprovar */}
      <Dialog open={openAprovar} onOpenChange={setOpenAprovar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprovar entregável</DialogTitle>
            <DialogDescription>
              Confirma a aprovação de <strong>Workshop de validação</strong>? Esta ação
              será registrada no histórico do projeto.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenAprovar(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAprovar}>Confirmar aprovação</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Solicitar ajuste */}
      <Dialog open={openAjuste} onOpenChange={setOpenAjuste}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitar ajuste</DialogTitle>
            <DialogDescription>
              Descreva o ajuste necessário em <strong>Workshop de validação</strong>.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={justificativa}
            onChange={(e) => setJustificativa(e.target.value)}
            placeholder="Justificativa obrigatória..."
            rows={5}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenAjuste(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAjuste} disabled={!justificativa.trim()}>
              Enviar solicitação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
