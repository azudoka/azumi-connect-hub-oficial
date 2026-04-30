import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Briefcase,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Target,
} from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/AuthContext";
import { vagas, horasSemana } from "@/data/mock";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────
// Mock local — entregáveis e projetos do consultor logado
// (a regra de visibilidade real está em /app/projetos)
// ─────────────────────────────────────────────────────────────────

interface EntregavelDoConsultor {
  id: string;
  codigo: string;
  nome: string;
  projetoId: string;
  projeto: string;
  empresa: string;
  prazoISO: string;
  status: "em_andamento" | "aprovacao_interna" | "aprovacao_cliente" | "ajuste_solicitado" | "nao_iniciado";
  statusLabel: string;
  badge: "andamento" | "analise" | "aguardando" | "atrasada";
}

const ENTREGAVEIS_MOCK: Record<string, EntregavelDoConsultor[]> = {
  ab: [
    { id: "e1", codigo: "ENT-002", nome: "Workshop de validação", projetoId: "p1", projeto: "Mapeamento de Cargos", empresa: "Kentaki Foods", prazoISO: "2026-04-28", status: "aprovacao_cliente", statusLabel: "Aprovação cliente", badge: "analise" },
    { id: "e2", codigo: "ENT-003", nome: "Política de cargos", projetoId: "p1", projeto: "Mapeamento de Cargos", empresa: "Kentaki Foods", prazoISO: "2026-05-10", status: "aprovacao_interna", statusLabel: "Aprovação interna", badge: "analise" },
    { id: "e3", codigo: "ENT-006", nome: "Revisão jurídica", projetoId: "p6", projeto: "Revisão de políticas", empresa: "Tech Plural", prazoISO: "2026-04-22", status: "ajuste_solicitado", statusLabel: "Ajuste solicitado", badge: "atrasada" },
    { id: "e4", codigo: "ENT-005", nome: "Triagem técnica", projetoId: "p2", projeto: "Hunting Dev Full Stack", empresa: "Tech Plural", prazoISO: "2026-05-15", status: "em_andamento", statusLabel: "Em andamento", badge: "andamento" },
  ],
  ct: [],
  rm: [],
};

const PROJETOS_DO_CONSULTOR: Record<string, { id: string; codigo: string; titulo: string; empresa: string }[]> = {
  ab: [
    { id: "p1", codigo: "PROJ-2026-0001", titulo: "Mapeamento de Cargos", empresa: "Kentaki Foods" },
    { id: "p2", codigo: "PROJ-2026-0002", titulo: "Hunting — Gerente TI", empresa: "Kentaki Foods" },
    { id: "p6", codigo: "PROJ-2026-0006", titulo: "Revisão de políticas internas", empresa: "Tech Plural" },
  ],
  ct: [],
  rm: [],
};

function getSaudacao(hour: number) {
  if (hour >= 5 && hour < 12) return "Bom dia";
  if (hour >= 12 && hour < 18) return "Boa tarde";
  return "Boa noite";
}

const parseISO = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const formatDateBR = (iso: string) => format(parseISO(iso), "dd/MM/yyyy", { locale: ptBR });

export default function ConsultorDashboard() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const consultorId = usuario?.id ?? "ab";
  const primeiroNome = (usuario?.nome ?? "Consultor").split(" ")[0];

  const now = useMemo(() => new Date(), []);
  const saudacao = getSaudacao(now.getHours());
  const hojeISO = format(now, "yyyy-MM-dd");

  const entregaveis = ENTREGAVEIS_MOCK[consultorId] ?? [];
  const projetos = PROJETOS_DO_CONSULTOR[consultorId] ?? [];

  const pendentesHoje = entregaveis.filter((e) => e.prazoISO <= hojeISO).length;
  const projetosAtivos = projetos.length;

  const totalHorasSemana = horasSemana.reduce((acc, d) => acc + d.horas, 0);
  const maxHoras = Math.max(...horasSemana.map((d) => d.horas), 8);

  // Vagas sob responsabilidade — busca por nome do consultor
  const vagasSobResp = vagas.filter((v) => v.consultor === usuario?.nome);

  const entregaveisOrdenados = [...entregaveis].sort((a, b) => a.prazoISO.localeCompare(b.prazoISO)).slice(0, 5);

  return (
    <div>
      <PageHeader
        title={`${saudacao}, ${primeiroNome} 👋`}
        subtitle="Resumo do seu dia na Azumi Connect."
      />

      {/* ──────── 1. Resumo do dia (KPIs) ──────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Entregáveis pendentes hoje"
          value={String(pendentesHoje)}
          icon={AlertTriangle}
          hint={pendentesHoje > 0 ? "Inclui prazos vencidos" : "Nenhum prazo para hoje"}
          className={cn(pendentesHoje > 0 && "ring-1 ring-warning/40")}
        />
        <KpiCard
          label="Projetos em andamento"
          value={String(projetosAtivos)}
          icon={Briefcase}
          hint="Sob sua responsabilidade"
        />
        <KpiCard
          label="Horas registradas (semana)"
          value={`${totalHorasSemana.toFixed(1)}h`}
          icon={Clock}
          hint="Meta: 40h/semana"
        />
        <KpiCard
          label="Vagas ativas"
          value={String(vagasSobResp.length)}
          icon={Target}
          hint="Em condução por você"
        />
      </div>

      {/* ──────── 2. Entregáveis em destaque ──────── */}
      <Card className="mt-6 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-lg font-semibold">Entregáveis em destaque</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Os mais urgentes dos seus projetos
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/app/projetos")} className="gap-1">
            Ver projetos <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        {entregaveisOrdenados.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="Tudo em dia!"
            description="Você não tem entregáveis urgentes no momento."
          />
        ) : (
          <ul className="space-y-3">
            {entregaveisOrdenados.map((e) => {
              const atrasado = e.prazoISO < hojeISO;
              return (
                <li
                  key={e.id}
                  className="flex items-start justify-between gap-4 rounded-lg border border-border p-3 hover:bg-muted/40 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-data uppercase tracking-wider text-muted-foreground">
                      {e.codigo} · {e.empresa}
                    </div>
                    <div className="font-medium text-sm mt-0.5 truncate">{e.nome}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Projeto: {e.projeto}
                    </div>
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <StatusBadge status={e.badge}>{e.statusLabel}</StatusBadge>
                      <span
                        className={cn(
                          "text-xs font-data tabular-nums",
                          atrasado ? "text-destructive font-semibold" : "text-muted-foreground"
                        )}
                      >
                        Prazo: {formatDateBR(e.prazoISO)}
                        {atrasado && " · atrasado"}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="shrink-0"
                  >
                    <Link to={`/app/projetos/${e.projetoId}`}>Ir para projeto</Link>
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {/* ──────── 3. Horas da semana + 4. Vagas ──────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mt-6">
        {/* Horas da semana */}
        <Card className="lg:col-span-3 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-lg font-semibold">Horas da semana</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Total: <span className="font-data tabular-nums font-medium text-foreground">
                  {totalHorasSemana.toFixed(1)}h
                </span>
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/app/horas")} className="gap-1">
              Módulo de horas <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="space-y-2">
            {horasSemana.map((d) => {
              const pct = Math.min(100, Math.round((d.horas / maxHoras) * 100));
              return (
                <div key={d.dia} className="flex items-center gap-3">
                  <span className="w-8 text-xs text-muted-foreground font-medium">{d.dia}</span>
                  <div className="flex-1">
                    <Progress value={pct} className="h-2" />
                  </div>
                  <span className="w-12 text-right text-xs font-data tabular-nums">
                    {d.horas.toFixed(1)}h
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Vagas sob sua responsabilidade */}
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-lg font-semibold">Vagas sob sua responsabilidade</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Resumo do funil</p>
            </div>
          </div>

          {vagasSobResp.length === 0 ? (
            <EmptyState
              icon={Target}
              title="Sem vagas atribuídas"
              description="Você não está conduzindo vagas no momento."
            />
          ) : (
            <ul className="space-y-3">
              {vagasSobResp.slice(0, 4).map((v) => (
                <li key={v.id} className="rounded-lg border border-border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm truncate">{v.titulo}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{v.empresa}</div>
                    </div>
                    <StatusBadge status={v.status}>{v.etapa}</StatusBadge>
                  </div>
                </li>
              ))}
              <li>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="w-full justify-center gap-1 mt-1"
                >
                  <Link to="/app/atracao">
                    Ver vagas em detalhes <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </li>
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
