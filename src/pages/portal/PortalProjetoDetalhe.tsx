import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { StatusKey } from "@/data/mock";

type EntregavelStatus =
  | "nao_iniciado"
  | "em_andamento"
  | "aprovacao_interna"
  | "aprovacao_cliente"
  | "ajuste_solicitado"
  | "aprovado_cliente";

interface Entregavel {
  id: string;
  nome: string;
  complexidade: "Baixa" | "Média" | "Alta";
  prazo: string;
  status: EntregavelStatus;
}

const projetosMap: Record<
  string,
  {
    id: string;
    titulo: string;
    empresa: string;
    periodo: string;
    progresso: number;
    entregaveis: Entregavel[];
  }
> = {
  "PROJ-2026-0001": {
    id: "PROJ-2026-0001",
    titulo: "Mapeamento de Cargos",
    empresa: "Kentaki Foods",
    periodo: "01/03/2026 — 30/06/2026",
    progresso: 62,
    entregaveis: [
      { id: "ENT-001", nome: "Diagnóstico inicial", complexidade: "Média", prazo: "15/03/2026", status: "aprovado_cliente" },
      { id: "ENT-002", nome: "Entrevistas com gestores", complexidade: "Alta", prazo: "05/04/2026", status: "aprovado_cliente" },
      { id: "ENT-003", nome: "Workshop de validação", complexidade: "Alta", prazo: "28/04/2026", status: "aprovacao_cliente" },
      { id: "ENT-004", nome: "Política de cargos", complexidade: "Alta", prazo: "10/05/2026", status: "aprovacao_interna" },
      { id: "ENT-005", nome: "Treinamento de líderes", complexidade: "Média", prazo: "20/05/2026", status: "em_andamento" },
      { id: "ENT-006", nome: "Material de comunicação", complexidade: "Baixa", prazo: "05/06/2026", status: "nao_iniciado" },
      { id: "ENT-007", nome: "Plano de implementação", complexidade: "Média", prazo: "25/06/2026", status: "nao_iniciado" },
    ],
  },
  "PROJ-2026-0002": {
    id: "PROJ-2026-0002",
    titulo: "Hunting Gerente TI",
    empresa: "Kentaki Foods",
    periodo: "01/04/2026 — 15/07/2026",
    progresso: 45,
    entregaveis: [
      { id: "ENT-101", nome: "Briefing executivo", complexidade: "Baixa", prazo: "10/04/2026", status: "aprovado_cliente" },
      { id: "ENT-102", nome: "Mapeamento de mercado", complexidade: "Alta", prazo: "30/04/2026", status: "em_andamento" },
      { id: "ENT-103", nome: "Shortlist de candidatos", complexidade: "Média", prazo: "20/05/2026", status: "nao_iniciado" },
    ],
  },
};

const statusToKey: Record<EntregavelStatus, StatusKey> = {
  nao_iniciado: "aguardando",
  em_andamento: "andamento",
  aprovacao_interna: "analise",
  aprovacao_cliente: "analise",
  ajuste_solicitado: "atrasada",
  aprovado_cliente: "concluida",
};

const statusLabel: Record<EntregavelStatus, string> = {
  nao_iniciado: "Não iniciado",
  em_andamento: "Em andamento",
  aprovacao_interna: "Em validação interna",
  aprovacao_cliente: "Aguardando seu parecer",
  ajuste_solicitado: "Ajuste solicitado",
  aprovado_cliente: "Aprovado",
};

export default function PortalProjetoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const projeto = useMemo(() => (id ? projetosMap[id] : undefined), [id]);

  const [aprovarTarget, setAprovarTarget] = useState<Entregavel | null>(null);
  const [ajusteTarget, setAjusteTarget] = useState<Entregavel | null>(null);
  const [justificativa, setJustificativa] = useState("");

  if (!projeto) {
    return (
      <>
        <PageHeader title="Projeto não encontrado" />
        <Button variant="outline" onClick={() => navigate("/portal/projetos")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
      </>
    );
  }

  const handleAprovar = () => {
    toast.success("Aprovação registrada");
    setAprovarTarget(null);
  };

  const handleAjuste = () => {
    if (!justificativa.trim()) {
      toast.error("Informe a justificativa do ajuste");
      return;
    }
    toast.success("Solicitação enviada");
    setJustificativa("");
    setAjusteTarget(null);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="mb-4 -ml-2"
        onClick={() => navigate("/portal/projetos")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Projetos
      </Button>

      <PageHeader
        title={projeto.titulo}
        subtitle={`${projeto.id} · ${projeto.empresa} · ${projeto.periodo}`}
      />

      <Card className="mb-6">
        <CardContent className="p-5">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progresso geral</span>
            <span className="font-data tabular-nums font-semibold">
              {projeto.progresso}%
            </span>
          </div>
          <Progress value={projeto.progresso} className="h-2" />
        </CardContent>
      </Card>

      <section>
        <h2 className="font-display text-lg font-semibold mb-3">Entregáveis</h2>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Entregável</TableHead>
                  <TableHead>Complexidade</TableHead>
                  <TableHead>Prazo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projeto.entregaveis.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>
                      <div className="font-medium">{e.nome}</div>
                      <div className="font-data text-xs text-muted-foreground">
                        {e.id}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="badge-pill border-border bg-muted/40 text-muted-foreground">
                        {e.complexidade}
                      </span>
                    </TableCell>
                    <TableCell className="font-data tabular-nums">{e.prazo}</TableCell>
                    <TableCell>
                      <StatusBadge status={statusToKey[e.status]}>
                        {statusLabel[e.status]}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="text-right">
                      {e.status === "aprovacao_cliente" && (
                        <div className="inline-flex flex-wrap justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setAjusteTarget(e)}
                          >
                            Solicitar ajuste
                          </Button>
                          <Button size="sm" onClick={() => setAprovarTarget(e)}>
                            Aprovar
                          </Button>
                        </div>
                      )}
                      {e.status === "aprovado_cliente" && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Aprovado
                        </span>
                      )}
                      {e.status !== "aprovacao_cliente" &&
                        e.status !== "aprovado_cliente" && (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <Dialog open={!!aprovarTarget} onOpenChange={(o) => !o && setAprovarTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprovar entregável</DialogTitle>
            <DialogDescription>
              Confirma a aprovação de <strong>{aprovarTarget?.nome}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAprovarTarget(null)}>
              Cancelar
            </Button>
            <Button onClick={handleAprovar}>Confirmar aprovação</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!ajusteTarget} onOpenChange={(o) => !o && setAjusteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitar ajuste</DialogTitle>
            <DialogDescription>
              Descreva o ajuste necessário em <strong>{ajusteTarget?.nome}</strong>.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={justificativa}
            onChange={(e) => setJustificativa(e.target.value)}
            placeholder="Justificativa obrigatória..."
            rows={5}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAjusteTarget(null)}>
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
