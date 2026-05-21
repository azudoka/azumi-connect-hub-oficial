import { useMemo, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertTriangle, ChevronLeft, ChevronRight, Clock } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Modulo = "projeto" | "vaga" | "solicitacao";

interface Registro {
  id: string;
  data: string; // ISO
  inicio: string; // HH:mm
  fim: string; // HH:mm
  duracaoMin: number;
  consultor: string;
  acao: string; // nome do entregável/vaga/solicitação
  codigoAcao: string;
  modulo: Modulo;
  tipo: "timer" | "manual";
  empresaId: string;
}

const HORAS_CONTRATADAS = 25;

// 19h consumidas de 25h (76%)
const REGISTROS: Registro[] = [
  {
    id: "h1",
    data: "2026-04-22",
    inicio: "09:00",
    fim: "11:30",
    duracaoMin: 150,
    consultor: "Ana Beatriz",
    acao: "Mapa de cargos — versão 1",
    codigoAcao: "ENT-2026-0002",
    modulo: "projeto",
    tipo: "timer",
    empresaId: "kentaki",
  },
  {
    id: "h2",
    data: "2026-04-21",
    inicio: "14:00",
    fim: "16:45",
    duracaoMin: 165,
    consultor: "Ana Beatriz",
    acao: "Triagem — Gerente de TI",
    codigoAcao: "VAGA-2026-0011",
    modulo: "vaga",
    tipo: "timer",
    empresaId: "kentaki",
  },
  {
    id: "h3",
    data: "2026-04-19",
    inicio: "10:00",
    fim: "10:45",
    duracaoMin: 45,
    consultor: "Ana Beatriz",
    acao: "Atendimento — ajuste no entregável",
    codigoAcao: "SOL-2026-0071",
    modulo: "solicitacao",
    tipo: "timer",
    empresaId: "kentaki",
  },
  {
    id: "h4",
    data: "2026-04-15",
    inicio: "—",
    fim: "—",
    duracaoMin: 240,
    consultor: "Rafael Moura",
    acao: "Modelo de avaliação 360",
    codigoAcao: "ENT-2026-0010",
    modulo: "projeto",
    tipo: "manual",
    empresaId: "kentaki",
  },
  {
    id: "h5",
    data: "2026-04-12",
    inicio: "08:30",
    fim: "11:00",
    duracaoMin: 150,
    consultor: "Ana Beatriz",
    acao: "Diagnóstico inicial e levantamento de cargos",
    codigoAcao: "ENT-2026-0001",
    modulo: "projeto",
    tipo: "timer",
    empresaId: "kentaki",
  },
  {
    id: "h6",
    data: "2026-04-08",
    inicio: "15:00",
    fim: "18:00",
    duracaoMin: 180,
    consultor: "Ana Beatriz",
    acao: "Entrevistas — Gerente de TI",
    codigoAcao: "VAGA-2026-0011",
    modulo: "vaga",
    tipo: "timer",
    empresaId: "kentaki",
  },
  {
    id: "h7",
    data: "2026-04-05",
    inicio: "09:00",
    fim: "11:00",
    duracaoMin: 120,
    consultor: "Ana Beatriz",
    acao: "Reunião mensal de alinhamento",
    codigoAcao: "SOL-2026-0068",
    modulo: "solicitacao",
    tipo: "timer",
    empresaId: "kentaki",
  },
  // ───── Construtora Horizonte ─────
  {
    id: "h-hz-1", data: "2026-04-20", inicio: "09:00", fim: "11:00", duracaoMin: 120,
    consultor: "Rafael Moura", acao: "Diagnóstico inicial de cargos",
    codigoAcao: "ENT-2026-HZ01", modulo: "projeto", tipo: "timer", empresaId: "horizonte",
  },
  {
    id: "h-hz-2", data: "2026-04-15", inicio: "14:00", fim: "15:30", duracaoMin: 90,
    consultor: "Rafael Moura", acao: "Triagem — Engenheiro Civil",
    codigoAcao: "VAGA-2026-HZ01", modulo: "vaga", tipo: "timer", empresaId: "horizonte",
  },
  {
    id: "h-hz-3", data: "2026-04-10", inicio: "—", fim: "—", duracaoMin: 60,
    consultor: "Rafael Moura", acao: "Suporte com NR-18",
    codigoAcao: "SOL-2026-HZ03", modulo: "solicitacao", tipo: "manual", empresaId: "horizonte",
  },
  // ───── Clínica Vita Saúde ─────
  {
    id: "h-vt-1", data: "2026-04-22", inicio: "09:00", fim: "12:00", duracaoMin: 180,
    consultor: "Juliana Costa", acao: "Diagnóstico de lideranças",
    codigoAcao: "ENT-2026-VT01", modulo: "projeto", tipo: "timer", empresaId: "vita",
  },
  {
    id: "h-vt-2", data: "2026-04-20", inicio: "13:00", fim: "16:30", duracaoMin: 210,
    consultor: "Juliana Costa", acao: "Trilha de liderança — Módulo 1",
    codigoAcao: "ENT-2026-VT02", modulo: "projeto", tipo: "timer", empresaId: "vita",
  },
  {
    id: "h-vt-3", data: "2026-04-18", inicio: "10:00", fim: "12:00", duracaoMin: 120,
    consultor: "Juliana Costa", acao: "Entrevistas — Enfermagem",
    codigoAcao: "VAGA-2026-VT01", modulo: "vaga", tipo: "timer", empresaId: "vita",
  },
  {
    id: "h-vt-4", data: "2026-04-12", inicio: "—", fim: "—", duracaoMin: 180,
    consultor: "Juliana Costa", acao: "Planejamento NR-32",
    codigoAcao: "SOL-2026-VT01", modulo: "solicitacao", tipo: "manual", empresaId: "vita",
  },
  // ───── Valore Consultoria ─────
  {
    id: "h-val-1", data: "2026-04-21", inicio: "09:30", fim: "11:30", duracaoMin: 120,
    consultor: "Rafael Moura", acao: "Diagnóstico inicial do RH",
    codigoAcao: "ENT-2026-VAL01", modulo: "projeto", tipo: "timer", empresaId: "valore",
  },
  {
    id: "h-val-2", data: "2026-04-18", inicio: "14:00", fim: "16:30", duracaoMin: 150,
    consultor: "Rafael Moura", acao: "Mapa de cargos — v1",
    codigoAcao: "ENT-2026-VAL02", modulo: "projeto", tipo: "timer", empresaId: "valore",
  },
  {
    id: "h-val-3", data: "2026-04-12", inicio: "10:00", fim: "11:00", duracaoMin: 60,
    consultor: "Rafael Moura", acao: "Triagem — Analista RH",
    codigoAcao: "VAGA-2026-VAL01", modulo: "vaga", tipo: "timer", empresaId: "valore",
  },
  // ───── Empresa Demo (trial) ─────
  {
    id: "h-demo-1", data: "2026-05-04", inicio: "09:00", fim: "11:00", duracaoMin: 120,
    consultor: "Ana Beatriz", acao: "Diagnóstico inicial",
    codigoAcao: "ENT-DEMO-001", modulo: "projeto", tipo: "timer", empresaId: "empresa-demo",
  },
  {
    id: "h-demo-2", data: "2026-05-08", inicio: "14:00", fim: "15:30", duracaoMin: 90,
    consultor: "Ana Beatriz", acao: "Triagem — Gerente de TI",
    codigoAcao: "VAGA-DEMO-001", modulo: "vaga", tipo: "timer", empresaId: "empresa-demo",
  },
  {
    id: "h-demo-3", data: "2026-05-12", inicio: "—", fim: "—", duracaoMin: 60,
    consultor: "Ana Beatriz", acao: "Atendimento — política de home office",
    codigoAcao: "SOL-DEMO-001", modulo: "solicitacao", tipo: "manual", empresaId: "empresa-demo",
  },
];

const MODULO_PILL: Record<Modulo, string> = {
  projeto: "bg-primary/15 text-primary border-primary/30",
  vaga: "bg-info/15 text-info border-info/30",
  solicitacao: "bg-success/15 text-success border-success/30",
};
const MODULO_LABEL: Record<Modulo, string> = {
  projeto: "Projeto",
  vaga: "Vaga",
  solicitacao: "Solicitação",
};

const PILL_BASE =
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap";

function formatDuracao(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function formatMesAno(d: Date) {
  return format(d, "MMMM yyyy", { locale: ptBR }).replace(/^./, (c) => c.toUpperCase());
}

const PAGE_SIZE = 20;

export default function ClienteHorasPage() {
  const { user } = useAuth();
  const empresaId = user?.empresaId ?? "";

  const meses = useMemo(() => {
    const arr: Date[] = [];
    const base = new Date(2026, 3, 1); // Abril 2026 — fixo p/ alinhar com o mock
    for (let i = 0; i < 6; i++) {
      arr.push(new Date(base.getFullYear(), base.getMonth() - i, 1));
    }
    return arr;
  }, []);

  const [mesIso, setMesIso] = useState(meses[0].toISOString());
  const [modulo, setModulo] = useState<"todos" | Modulo>("todos");
  const [pagina, setPagina] = useState(0);

  const mesSelecionado = new Date(mesIso);
  const mesLabel = formatMesAno(mesSelecionado);

  // Filtra por empresa, mês e módulo
  const registrosEmpresa = useMemo(
    () =>
      REGISTROS.filter((r) => (empresaId ? r.empresaId === empresaId : true)).map((r) => ({
        ...r,
      })),
    [empresaId]
  );

  const registrosMes = useMemo(() => {
    return registrosEmpresa.filter((r) => {
      const d = new Date(r.data);
      return (
        d.getFullYear() === mesSelecionado.getFullYear() &&
        d.getMonth() === mesSelecionado.getMonth()
      );
    });
  }, [registrosEmpresa, mesSelecionado]);

  const registrosFiltrados = useMemo(() => {
    if (modulo === "todos") return registrosMes;
    return registrosMes.filter((r) => r.modulo === modulo);
  }, [registrosMes, modulo]);

  const totalConsumidoMin = registrosMes.reduce((acc, r) => acc + r.duracaoMin, 0);
  const horasConsumidas = totalConsumidoMin / 60;
  const pct = Math.min(100, Math.round((horasConsumidas / HORAS_CONTRATADAS) * 100));
  const restantesMin = Math.max(0, HORAS_CONTRATADAS * 60 - totalConsumidoMin);

  // Cor da barra + alerta
  let barColor = "bg-primary";
  let alertText: string | null = null;
  let alertTone: "warning" | "destructive" | null = null;
  if (pct >= 100) {
    barColor = "bg-destructive";
    alertText = "Pacote esgotado. Entre em contato com a Azumi para regularização.";
    alertTone = "destructive";
  } else if (pct >= 85) {
    barColor = "bg-warning";
    alertText = "Alerta: 85% do pacote consumido. Fale com seu consultor.";
    alertTone = "warning";
  } else if (pct >= 70) {
    barColor = "bg-warning";
    alertText = "Atenção: 70% do pacote consumido.";
    alertTone = "warning";
  }

  // Paginação
  const totalPaginas = Math.max(1, Math.ceil(registrosFiltrados.length / PAGE_SIZE));
  const paginaAtual = Math.min(pagina, totalPaginas - 1);
  const inicio = paginaAtual * PAGE_SIZE;
  const visiveis = registrosFiltrados.slice(inicio, inicio + PAGE_SIZE);

  const [expandidos, setExpandidos] = useState<Record<string, boolean>>({});

  return (
    <>
      <PageHeader
        title="Horas Consumidas"
        subtitle="Acompanhe o consumo do seu pacote"
      />

      {/* Resumo do mês */}
      <Card className="mb-5">
        <CardContent className="p-5 space-y-4">
          {alertTone === "destructive" && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{alertText}</span>
            </div>
          )}

          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Horas do mês
              </p>
              <h2 className="font-display text-xl font-semibold mt-0.5">{mesLabel}</h2>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-data tabular-nums">
                {formatDuracao(totalConsumidoMin)} / {HORAS_CONTRATADAS}h
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">
                {formatDuracao(restantesMin)} restantes
              </span>
            </div>
          </div>

          <div>
            <div className="h-3 rounded-full bg-secondary overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", barColor)}
                style={{ width: `${pct}%` }}
              />
            </div>
            {alertText && alertTone !== "destructive" && (
              <p
                className={cn(
                  "text-xs mt-2",
                  alertTone === "warning" ? "text-warning" : "text-muted-foreground"
                )}
              >
                {alertText}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex-1 min-w-[180px] max-w-xs">
          <Select
            value={mesIso}
            onValueChange={(v) => {
              setMesIso(v);
              setPagina(0);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {meses.map((m) => (
                <SelectItem key={m.toISOString()} value={m.toISOString()}>
                  {formatMesAno(m)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 min-w-[160px] max-w-xs">
          <Select
            value={modulo}
            onValueChange={(v) => {
              setModulo(v as typeof modulo);
              setPagina(0);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os módulos</SelectItem>
              <SelectItem value="projeto">Projeto</SelectItem>
              <SelectItem value="vaga">Vaga</SelectItem>
              <SelectItem value="solicitacao">Solicitação</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabela desktop / cards mobile */}
      {visiveis.length === 0 ? (
        <Card className="glass">
          <CardContent className="p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhum registro de horas neste período.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop */}
          <Card className="hidden md:block">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="text-left font-medium px-4 py-3">Data</th>
                      <th className="text-left font-medium px-4 py-3">Início–Fim</th>
                      <th className="text-left font-medium px-4 py-3">Duração</th>
                      <th className="text-left font-medium px-4 py-3">Consultor</th>
                      <th className="text-left font-medium px-4 py-3">Ação</th>
                      <th className="text-left font-medium px-4 py-3">Módulo</th>
                      <th className="text-left font-medium px-4 py-3">Tipo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visiveis.map((r) => {
                      const aberto = !!expandidos[r.id];
                      return (
                        <>
                          <tr
                            key={r.id}
                            onClick={() =>
                              setExpandidos((p) => ({ ...p, [r.id]: !p[r.id] }))
                            }
                            className="border-t border-border/60 hover:bg-muted/30 cursor-pointer"
                          >
                            <td className="px-4 py-3 font-data tabular-nums text-xs">
                              {format(new Date(r.data), "dd/MM/yyyy", { locale: ptBR })}
                            </td>
                            <td className="px-4 py-3 font-data tabular-nums text-xs">
                              {r.inicio}–{r.fim}
                            </td>
                            <td className="px-4 py-3 font-data tabular-nums">
                              {formatDuracao(r.duracaoMin)}
                            </td>
                            <td className="px-4 py-3">{r.consultor}</td>
                            <td className="px-4 py-3 truncate max-w-[200px]">{r.acao}</td>
                            <td className="px-4 py-3">
                              <span className={cn(PILL_BASE, MODULO_PILL[r.modulo])}>
                                {MODULO_LABEL[r.modulo]}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {r.tipo === "manual" ? (
                                <span
                                  className={cn(
                                    PILL_BASE,
                                    "bg-warning/15 text-warning border-warning/30"
                                  )}
                                >
                                  Manual
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground">Timer</span>
                              )}
                            </td>
                          </tr>
                          {aberto && (
                            <tr className="bg-muted/20 border-t border-border/60">
                              <td colSpan={7} className="px-4 py-3 text-xs">
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                  <span className="text-muted-foreground">Ação completa:</span>
                                  <span className="font-medium">{r.acao}</span>
                                  <span className="font-data text-muted-foreground">
                                    {r.codigoAcao}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Mobile */}
          <div className="md:hidden space-y-2">
            {visiveis.map((r) => {
              const aberto = !!expandidos[r.id];
              return (
                <Card key={r.id}>
                  <CardContent className="p-3">
                    <button
                      type="button"
                      className="w-full text-left space-y-1.5"
                      onClick={() => setExpandidos((p) => ({ ...p, [r.id]: !p[r.id] }))}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-data tabular-nums text-muted-foreground">
                          {format(new Date(r.data), "dd/MM/yyyy", { locale: ptBR })} ·{" "}
                          {r.inicio}–{r.fim}
                        </span>
                        <span className="font-data tabular-nums text-sm">
                          {formatDuracao(r.duracaoMin)}
                        </span>
                      </div>
                      <p className="text-sm font-medium truncate">{r.acao}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn(PILL_BASE, MODULO_PILL[r.modulo])}>
                          {MODULO_LABEL[r.modulo]}
                        </span>
                        {r.tipo === "manual" && (
                          <span
                            className={cn(
                              PILL_BASE,
                              "bg-warning/15 text-warning border-warning/30"
                            )}
                          >
                            Manual
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">{r.consultor}</span>
                      </div>
                      {aberto && (
                        <p className="text-xs text-muted-foreground pt-1">
                          {r.codigoAcao}
                        </p>
                      )}
                    </button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Paginação */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-between mt-4">
              <span className="text-xs text-muted-foreground">
                Página {paginaAtual + 1} de {totalPaginas}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  disabled={paginaAtual === 0}
                  onClick={() => setPagina((p) => Math.max(0, p - 1))}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  disabled={paginaAtual >= totalPaginas - 1}
                  onClick={() => setPagina((p) => Math.min(totalPaginas - 1, p + 1))}
                >
                  Próxima
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
