import { useMemo, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  Inbox,
  Users,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ---------- Types ----------
type StatusVaga =
  | "em_andamento"
  | "aguardando_cliente"
  | "finalizada"
  | "cancelada"
  | "aberta";

interface VagaMock {
  id: string;
  cargo: string;
  departamento: string;
  status: StatusVaga;
  totalCandidatos: number;
  aprovados: number;
  criadaEm: string; // ISO
  empresaId: string;
}

const STATUS_LABEL: Record<StatusVaga, string> = {
  em_andamento: "Em andamento",
  aguardando_cliente: "Aguardando cliente",
  finalizada: "Finalizada",
  cancelada: "Cancelada",
  aberta: "Aberta",
};

const STATUS_ORDEM: StatusVaga[] = [
  "em_andamento",
  "aguardando_cliente",
  "finalizada",
  "cancelada",
  "aberta",
];

const STATUS_ORDER: Record<string, number> = {
  em_andamento: 0,
  aguardando_cliente: 1,
  aberta: 2,
  finalizada: 3,
  cancelada: 4,
};

const MOCK: VagaMock[] = [
  {
    id: "v-01",
    cargo: "Analista de RH Sênior",
    departamento: "Recursos Humanos",
    status: "em_andamento",
    totalCandidatos: 12,
    aprovados: 3,
    criadaEm: "2026-04-10T09:00:00Z",
    empresaId: "kentaki",
  },
  {
    id: "v-02",
    cargo: "Coordenador Financeiro",
    departamento: "Financeiro",
    status: "aguardando_cliente",
    totalCandidatos: 8,
    aprovados: 2,
    criadaEm: "2026-03-28T11:30:00Z",
    empresaId: "kentaki",
  },
  {
    id: "v-03",
    cargo: "Desenvolvedor Full Stack",
    departamento: "TI",
    status: "finalizada",
    totalCandidatos: 22,
    aprovados: 1,
    criadaEm: "2026-02-15T14:45:00Z",
    empresaId: "kentaki",
  },
  {
    id: "v-04",
    cargo: "Assistente Administrativo",
    departamento: "Administrativo",
    status: "aberta",
    totalCandidatos: 5,
    aprovados: 0,
    criadaEm: "2026-04-20T10:15:00Z",
    empresaId: "kentaki",
  },
];

function statusClasses(s: StatusVaga) {
  if (s === "em_andamento") return "bg-success/15 text-success border-success/30";
  if (s === "aguardando_cliente") return "bg-warning/15 text-warning border-warning/30";
  if (s === "aberta") return "bg-info/15 text-info border-info/30";
  if (s === "cancelada") return "bg-muted text-muted-foreground border-border line-through";
  return "bg-muted text-muted-foreground border-border";
}

const PILL_BASE =
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap";

export default function VagasClientePage() {
  const { user } = useAuth();
  const empresaId = user?.empresaId ?? "";

  const [vagas] = useState<VagaMock[]>(() =>
    MOCK.filter((v) => (empresaId ? v.empresaId === empresaId : true))
  );
  const [filtro, setFiltro] = useState<StatusVaga | "todas">("todas");
  const [vagaSelecionadaId, setVagaSelecionadaId] = useState<string | null>(null);

  const lista = useMemo(() => {
    const base = filtro === "todas" ? vagas : vagas.filter((v) => v.status === filtro);
    return [...base].sort((a, b) => {
      const ordemA = STATUS_ORDER[a.status] ?? 99;
      const ordemB = STATUS_ORDER[b.status] ?? 99;
      if (ordemA !== ordemB) return ordemA - ordemB;
      // desempate por data de criação (mais recente primeiro)
      return new Date(b.criadaEm).getTime() - new Date(a.criadaEm).getTime();
    });
  }, [vagas, filtro]);

  const vagaSelecionada = useMemo(
    () => vagas.find((v) => v.id === vagaSelecionadaId) ?? null,
    [vagas, vagaSelecionadaId]
  );

  // ---------- Modo detalhe (view simplificada inline) ----------
  if (vagaSelecionada) {
    const v = vagaSelecionada;
    return (
      <div className="flex flex-col gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="self-start gap-1.5"
          onClick={() => setVagaSelecionadaId(null)}
        >
          <ChevronLeft size={16} /> Voltar para vagas
        </Button>

        <PageHeader
          title={v.cargo}
          subtitle={v.departamento}
          actions={
            <span className={cn(PILL_BASE, statusClasses(v.status))}>
              {STATUS_LABEL[v.status]}
            </span>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card/80 backdrop-blur border rounded-2xl p-5">
            <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider">
              <Users size={14} /> Candidatos
            </div>
            <div className="mt-2 text-2xl font-display font-semibold">
              {v.totalCandidatos}
            </div>
          </div>
          <div className="bg-card/80 backdrop-blur border rounded-2xl p-5">
            <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider">
              <CheckCircle2 size={14} /> Aprovados
            </div>
            <div className="mt-2 text-2xl font-display font-semibold">
              {v.aprovados}
            </div>
          </div>
          <div className="bg-card/80 backdrop-blur border rounded-2xl p-5">
            <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider">
              <Calendar size={14} /> Aberta em
            </div>
            <div className="mt-2 text-2xl font-display font-semibold">
              {format(new Date(v.criadaEm), "dd/MM/yyyy", { locale: ptBR })}
            </div>
          </div>
        </div>

        <div className="bg-card/80 backdrop-blur border rounded-2xl p-5">
          <h3 className="font-display font-semibold mb-2">Sobre o processo</h3>
          <p className="text-sm text-muted-foreground">
            Acompanhe o andamento desta vaga junto à sua consultora. As decisões
            sobre candidatos e prazos ficam centralizadas pela equipe Azumi —
            entre em contato pelo canal de Solicitações para qualquer ajuste.
          </p>
        </div>
      </div>
    );
  }

  // ---------- Modo lista ----------
  return (
    <>
      <PageHeader
        title="Minhas Vagas"
        subtitle="Acompanhe o andamento dos seus processos seletivos."
      />

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Button
          size="sm"
          variant={filtro === "todas" ? "default" : "outline"}
          className="rounded-full"
          onClick={() => setFiltro("todas")}
        >
          Todas
        </Button>
        {STATUS_ORDEM.map((s) => (
          <Button
            key={s}
            size="sm"
            variant={filtro === s ? "default" : "outline"}
            className="rounded-full"
            onClick={() => setFiltro(s)}
          >
            {STATUS_LABEL[s]}
          </Button>
        ))}
      </div>

      {lista.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Nenhuma vaga encontrada"
          description="Nenhuma vaga encontrada para este filtro."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lista.map((v) => (
            <article
              key={v.id}
              className="bg-card/80 backdrop-blur border rounded-2xl p-5 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-base leading-snug">{v.cargo}</h3>
                <span className={cn(PILL_BASE, statusClasses(v.status))}>
                  {STATUS_LABEL[v.status]}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Briefcase size={14} />
                <span>{v.departamento}</span>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Users size={14} />
                  {v.totalCandidatos} candidatos
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 size={14} />
                  {v.aprovados} aprovados
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar size={14} />
                {format(new Date(v.criadaEm), "dd/MM/yyyy", { locale: ptBR })}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full mt-1"
                onClick={() => setVagaSelecionadaId(v.id)}
              >
                Ver processo
              </Button>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
