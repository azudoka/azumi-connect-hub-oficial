import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { SlaBar } from "@/components/SlaBar";
import { vagas as vagasMock } from "@/data/mock";
import { Plus, LayoutGrid, List, Filter, Info, AlertTriangle } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  FUNIL_ETAPAS,
  FUNIL_ETAPA_LABEL,
  LEGACY_ETAPA_TO_FUNIL,
  MAX_CANDIDATOS_POR_ENVIO,
  type FunilEtapa,
} from "@/constants/funil";
import { toast } from "sonner";

// Datas mock por etapa (usadas no cabeçalho da timeline horizontal acima do kanban).
// Quando uma vaga não tem data para uma etapa, mostramos "—" alinhado.
const DATAS_FASE_MOCK: Record<FunilEtapa, { inicio: string; fim: string }> = {
  briefing:        { inicio: "01/04", fim: "02/04" },
  triagem:         { inicio: "06/04", fim: "12/04" },
  entrevista:      { inicio: "15/04", fim: "22/04" },
  perfis_enviados: { inicio: "23/04", fim: "—"    },
  decisao:         { inicio: "—",    fim: "—"    },
};

// SLA crítico: > 80% de SLA consumido em "perfis_enviados" → badge de alerta no card
function isSlaCritico(etapa: FunilEtapa, sla: number) {
  return etapa === "perfis_enviados" && sla >= 80;
}

type VagaLocal = (typeof vagasMock)[number] & { etapaFunil: FunilEtapa };

export default function AtracaoLista() {
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [searchParams, setSearchParams] = useSearchParams();

  // Estado local (mock): vagas com etapa do funil derivada do legacy.
  const [vagas, setVagas] = useState<VagaLocal[]>(() =>
    vagasMock.map((v) => ({
      ...v,
      etapaFunil: LEGACY_ETAPA_TO_FUNIL[v.etapa] ?? "briefing",
    })),
  );

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<FunilEtapa | null>(null);

  // Sheet de nova vaga
  const [novaVagaOpen, setNovaVagaOpen] = useState(false);

  const TIPOS_VAGA = [
    { value: "operacional", label: "Operacional" },
    { value: "tatico", label: "Tático" },
    { value: "gestao", label: "Gestão" },
    { value: "hunting", label: "Hunt Executivo" },
  ] as const;
  type TipoVaga = typeof TIPOS_VAGA[number]["value"];

  const MODALIDADES = [
    { value: "presencial", label: "Presencial" },
    { value: "hibrido", label: "Híbrido" },
    { value: "remoto", label: "Remoto" },
  ] as const;

  const BENEFICIOS_OPCOES = [
    { value: "vale_transporte", label: "Vale-transporte" },
    { value: "vale_alimentacao", label: "Vale-alimentação" },
    { value: "plano_saude", label: "Plano de saúde" },
    { value: "plano_odontologico", label: "Plano odontológico" },
    { value: "gympass", label: "Gympass" },
    { value: "home_office", label: "Home office" },
    { value: "bonus", label: "Bônus" },
    { value: "seguro_vida", label: "Seguro de vida" },
  ] as const;

  // Estados do form
  const [nTitulo, setNTitulo] = useState("");
  const [nEmpresa, setNEmpresa] = useState("");
  const [nFilial, setNFilial] = useState("");
  const [nTipo, setNTipo] = useState("operacional");
  const [nModalidade, setNModalidade] = useState("presencial");
  const [nPosicoes, setNPosicoes] = useState("1");
  const [nBeneficios, setNBeneficios] = useState<string[]>([]);
  const [nDescricao, setNDescricao] = useState("");

  function resetNovaVaga() {
    setNTitulo(""); setNEmpresa(""); setNFilial("");
    setNTipo("operacional"); setNModalidade("presencial");
    setNPosicoes("1"); setNBeneficios([]); setNDescricao("");
  }

  // Validação de plano: Hunt Executivo bloqueado no plano Ongoing.
  const PLANO_ATUAL = "ongoing"; // mock — em prod vem do contexto de auth
  const huntBloqueado = nTipo === "hunting" && PLANO_ATUAL === "ongoing";

  // Suporte a deep-link /app/atracao?new=1 vindo de "Nova solicitação"
  useEffect(() => {
    if (searchParams.get("new") === "1") {
      toast.info("Abertura de nova vaga", {
        description: "Preencha o briefing para iniciar o funil.",
      });
      const next = new URLSearchParams(searchParams);
      next.delete("new");
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  function moverVaga(vagaId: string, destino: FunilEtapa) {
    const vaga = vagas.find((v) => v.id === vagaId);
    if (!vaga || vaga.etapaFunil === destino) return;

    // Regra: não permite pular direto para "decisao" sem ter passado por "perfis_enviados"
    const idxAtual = FUNIL_ETAPAS.indexOf(vaga.etapaFunil);
    const idxDestino = FUNIL_ETAPAS.indexOf(destino);
    if (destino === "decisao" && vaga.etapaFunil !== "perfis_enviados") {
      toast.error("Antes de mover para 'Decisão', a vaga precisa passar por 'Perfis enviados'.");
      return;
    }
    // Avançar mais de 2 etapas seguidas → confirmação leve via toast
    if (idxDestino - idxAtual > 2) {
      toast.warning(`Pulou ${idxDestino - idxAtual} etapas — verifique se é intencional.`);
    }

    setVagas((prev) =>
      prev.map((v) => (v.id === vagaId ? { ...v, etapaFunil: destino } : v)),
    );

    if (destino === "perfis_enviados") {
      toast.success("Perfis enviados ao cliente — aguarde avaliação.");
    } else {
      toast.success(`${vaga.titulo} → ${FUNIL_ETAPA_LABEL[destino]}`);
    }
  }

  const totalCriticas = useMemo(
    () => vagas.filter((v) => isSlaCritico(v.etapaFunil, v.sla)).length,
    [vagas],
  );

  return (
    <div>
      <PageHeader
        title="Atração & Hunting"
        subtitle="Gestão de todas as vagas em andamento"
        actions={
          <>
            <div className="flex items-center bg-secondary rounded-lg p-0.5">
              <button
                onClick={() => setView("kanban")}
                className={cn(
                  "h-7 px-2.5 rounded-md text-xs flex items-center gap-1.5",
                  view === "kanban" && "bg-card shadow-card text-foreground",
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5" /> Kanban
              </button>
              <button
                onClick={() => setView("list")}
                className={cn(
                  "h-7 px-2.5 rounded-md text-xs flex items-center gap-1.5",
                  view === "list" && "bg-card shadow-card text-foreground",
                )}
              >
                <List className="h-3.5 w-3.5" /> Lista
              </button>
            </div>
            <button className="h-9 px-3 rounded-lg border border-border hover:bg-secondary text-sm flex items-center gap-1.5">
              <Filter className="h-4 w-4" /> Filtros
            </button>
            <button className="h-9 px-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center gap-1.5">
              <Plus className="h-4 w-4" /> Nova vaga
            </button>
          </>
        }
      />

      {/* Banner com as regras de negócio (Handoff): limite de envio + plano */}
      <div className="mb-3 rounded-xl border border-info/30 bg-info/10 px-4 py-3 flex items-start gap-3">
        <Info className="h-4 w-4 text-info shrink-0 mt-0.5" />
        <div className="text-xs text-info/90 leading-relaxed">
          Envie no máximo <strong>{MAX_CANDIDATOS_POR_ENVIO} candidatos por etapa</strong> ao cliente
          (acima disso é necessária justificativa). Vagas do tipo <strong>Hunt Executivo</strong> não
          são permitidas no plano Ongoing.
        </div>
      </div>

      {/* Alerta SLA crítico (perfis enviados há muito tempo) */}
      {totalCriticas > 0 && (
        <div className="mb-5 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
          <div className="text-xs text-warning/90 leading-relaxed">
            <strong>{totalCriticas}</strong>{" "}
            {totalCriticas === 1 ? "vaga com SLA crítico" : "vagas com SLA crítico"} em
            "Perfis enviados". Cobrança de parecer recomendada.
          </div>
        </div>
      )}

      {view === "kanban" ? (
        <>
          {/* Header de fases — uma "fatia" por coluna, alinhada com o grid abaixo */}
          <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-5 gap-4 mb-2 px-1">
            {FUNIL_ETAPAS.map((etapa) => {
              const d = DATAS_FASE_MOCK[etapa];
              const inicio = d.inicio || "—";
              const fim = d.fim || "—";
              return (
                <div
                  key={`hdr-${etapa}`}
                  className="min-w-0 flex flex-col gap-0.5 rounded-md border border-border/60 bg-muted/30 px-2 py-1.5"
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground/70 truncate">
                    {FUNIL_ETAPA_LABEL[etapa]}
                  </span>
                  <span className="font-data text-[10px] text-muted-foreground tabular-nums">
                    {inicio} <span className="text-foreground/40">→</span> {fim}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {FUNIL_ETAPAS.map((etapa) => {
              const items = vagas.filter((v) => v.etapaFunil === etapa);
              const isOver = dragOverCol === etapa;
              return (
                <div
                  key={etapa}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    if (dragOverCol !== etapa) setDragOverCol(etapa);
                  }}
                  onDragLeave={() => {
                    if (dragOverCol === etapa) setDragOverCol(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const id = e.dataTransfer.getData("text/plain") || draggingId;
                    setDragOverCol(null);
                    setDraggingId(null);
                    if (id) moverVaga(id, etapa);
                  }}
                  className={cn(
                    "bg-card border rounded-xl p-3 min-h-[280px] transition-colors",
                    isOver ? "border-primary ring-2 ring-primary/20" : "border-border",
                  )}
                >
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {FUNIL_ETAPA_LABEL[etapa]}
                    </span>
                    <span className="font-data text-xs text-muted-foreground">{items.length}</span>
                  </div>
                  {items.length === 0 ? (
                    <div className="flex items-center justify-center h-32 text-xs text-muted-foreground border border-dashed border-border/60 rounded-md">
                      {isOver ? "Soltar aqui" : "—"}
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {items.map((v) => {
                        const critico = isSlaCritico(v.etapaFunil, v.sla);
                        return (
                          <li
                            key={v.id}
                            draggable
                            onDragStart={(e) => {
                              setDraggingId(v.id);
                              e.dataTransfer.effectAllowed = "move";
                              e.dataTransfer.setData("text/plain", v.id);
                            }}
                            onDragEnd={() => {
                              setDraggingId(null);
                              setDragOverCol(null);
                            }}
                            className={cn(
                              "block bg-background/60 border border-border rounded-lg p-3 transition-colors cursor-grab active:cursor-grabbing hover:border-primary/40",
                              draggingId === v.id && "opacity-50",
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <Link
                                to={`/app/atracao/${v.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-sm font-medium leading-tight hover:text-primary"
                              >
                                {v.titulo}
                              </Link>
                              <StatusBadge status={v.status} />
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-1">{v.empresa}</div>
                            <div className="mt-3"><SlaBar percent={v.sla} /></div>
                            {critico && (
                              <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 text-[10px] text-warning font-medium">
                                <AlertTriangle className="h-3 w-3" /> SLA crítico
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-4 py-3">Vaga</th>
                <th className="text-left font-medium px-4 py-3">Empresa</th>
                <th className="text-left font-medium px-4 py-3">Etapa</th>
                <th className="text-left font-medium px-4 py-3">Status</th>
                <th className="text-left font-medium px-4 py-3 w-48">SLA</th>
                <th className="text-right font-medium px-4 py-3">Candidatos</th>
              </tr>
            </thead>
            <tbody>
              {vagas.map((v) => (
                <tr key={v.id} className="border-t border-border hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3">
                    <Link to={`/app/atracao/${v.id}`} className="font-medium hover:text-primary">
                      {v.titulo}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{v.empresa}</td>
                  <td className="px-4 py-3">{FUNIL_ETAPA_LABEL[v.etapaFunil]}</td>
                  <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
                  <td className="px-4 py-3"><SlaBar percent={v.sla} /></td>
                  <td className="px-4 py-3 text-right font-data">{v.candidatosTotal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
