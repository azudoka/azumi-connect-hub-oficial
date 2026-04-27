import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState } from "@/components/EmptyState";
import { toast } from "sonner";
import {
  FileText, Plane, HeartPulse, Gift, Scale, MoreHorizontal,
  Check, X, MessageSquare, Forward, Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tipo = "ferias" | "afastamento" | "beneficios" | "juridico" | "outros";
type Urgencia = "alta" | "media" | "baixa";
type Status = "aberta" | "andamento" | "aguardando" | "finalizada" | "cancelada";

interface Solicitacao {
  id: string;
  colaboradorNome: string;
  tipo: Tipo;
  urgencia: Urgencia;
  abertura: string; // ISO
  status: Status;
  resumo: string;
  moduloAtivo?: boolean;
}

const tipoMap: Record<Tipo, { label: string; icon: typeof FileText; cls: string }> = {
  ferias: { label: "Férias", icon: Plane, cls: "bg-info/15 text-info border-info/30" },
  afastamento: { label: "Afastamento", icon: HeartPulse, cls: "bg-warning/15 text-warning border-warning/30" },
  beneficios: { label: "Benefícios", icon: Gift, cls: "bg-primary/15 text-primary border-primary/30" },
  juridico: { label: "Jurídico", icon: Scale, cls: "bg-destructive/15 text-destructive border-destructive/30" },
  outros: { label: "Outros", icon: MoreHorizontal, cls: "bg-muted text-muted-foreground border-border" },
};

const urgenciaMap: Record<Urgencia, { label: string; cls: string }> = {
  alta: { label: "Alta", cls: "bg-destructive/15 text-destructive border-destructive/30" },
  media: { label: "Média", cls: "bg-warning/15 text-warning border-warning/30" },
  baixa: { label: "Baixa", cls: "bg-muted text-muted-foreground border-border" },
};

const statusMap: Record<Status, { label: string; cls: string }> = {
  aberta: { label: "Aberta", cls: "bg-info/15 text-info border-info/30" },
  andamento: { label: "Em andamento", cls: "bg-success/15 text-success border-success/30" },
  aguardando: { label: "Aguardando", cls: "bg-warning/15 text-warning border-warning/30" },
  finalizada: { label: "Finalizada", cls: "bg-muted text-muted-foreground border-border" },
  cancelada: { label: "Cancelada", cls: "bg-muted text-muted-foreground border-border line-through" },
};

const INICIAL: Solicitacao[] = [
  { id: "s1", colaboradorNome: "Marina Costa", tipo: "ferias", urgencia: "media", abertura: "2026-04-22", status: "aberta", resumo: "Solicita 15 dias de férias a partir de 02/06." },
  { id: "s2", colaboradorNome: "Beatriz Lins", tipo: "afastamento", urgencia: "alta", abertura: "2026-04-25", status: "andamento", resumo: "Atestado de 7 dias por motivo de saúde." },
  { id: "s3", colaboradorNome: "Pedro Alves", tipo: "beneficios", urgencia: "baixa", abertura: "2026-04-20", status: "aguardando", resumo: "Inclusão de dependente no plano de saúde.", moduloAtivo: true },
  { id: "s4", colaboradorNome: "Lucas Ferreira", tipo: "juridico", urgencia: "media", abertura: "2026-04-18", status: "aberta", resumo: "Solicita orientação trabalhista sobre horas extras.", moduloAtivo: true },
  { id: "s5", colaboradorNome: "Juliana Lima", tipo: "outros", urgencia: "baixa", abertura: "2026-04-15", status: "finalizada", resumo: "Pedido de declaração de vínculo." },
];

function iniciais(nome: string) {
  return nome.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function LiderSolicitacoes() {
  const [items, setItems] = useState<Solicitacao[]>(INICIAL);

  function setStatus(id: string, status: Status, msg: string) {
    setItems(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    toast.success(msg);
  }

  if (items.length === 0) {
    return (
      <div>
        <PageHeader title="Solicitações do time" subtitle="Pedidos enviados pelos seus colaboradores" />
        <div className="bg-card border border-border rounded-xl">
          <EmptyState icon={FileText} title="Nenhuma solicitação no momento" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Solicitações do time"
        subtitle={`${items.length} solicitações registradas`}
      />

      <div className="space-y-3">
        {items.map((s) => {
          const T = tipoMap[s.tipo];
          const U = urgenciaMap[s.urgencia];
          const St = statusMap[s.status];
          const finalizada = s.status === "finalizada" || s.status === "cancelada";
          return (
            <div key={s.id} className="bg-card border border-border rounded-xl p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="bg-gradient-brand text-white text-xs font-semibold">
                    {iniciais(s.colaboradorNome)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium text-sm">{s.colaboradorNome}</h3>
                    <span className={cn("badge-pill border inline-flex items-center gap-1", T.cls)}>
                      <T.icon className="h-3 w-3" /> {T.label}
                    </span>
                    <span className={cn("badge-pill border", U.cls)} title={`Urgência ${U.label}`}>
                      {U.label}
                    </span>
                    <span className={cn("badge-pill border", St.cls)}>{St.label}</span>
                    {s.moduloAtivo && (
                      <span className="badge-pill bg-primary/10 text-primary border-primary/30">
                        módulo ativo
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1.5">{s.resumo}</p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                    <Calendar className="h-3.5 w-3.5" />
                    Aberta em {formatDate(s.abertura)}
                  </div>
                </div>
              </div>

              {!finalizada && (
                <div className="mt-4 pt-4 border-t border-border/60 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => setStatus(s.id, "finalizada", "Solicitação aprovada")}
                  >
                    <Check className="h-4 w-4" /> Aprovar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setStatus(s.id, "cancelada", "Solicitação recusada")}
                  >
                    <X className="h-4 w-4" /> Recusar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setStatus(s.id, "aguardando", "Ajuste solicitado ao colaborador")}
                  >
                    <MessageSquare className="h-4 w-4" /> Pedir ajuste
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setStatus(s.id, "andamento", "Encaminhada ao RH")}
                  >
                    <Forward className="h-4 w-4" /> Encaminhar ao RH
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
