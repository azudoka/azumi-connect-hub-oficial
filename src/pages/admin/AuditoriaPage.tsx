import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search, Copy, Check, X, Package, ListChecks, MessageSquare,
  Briefcase, FileText, History, EyeOff, Eye,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { cn } from "@/lib/utils";

type Tipo = "entregavel" | "subtarefa" | "solicitacao" | "vaga";
type StatusT = "andamento" | "pendente" | "concluido" | "atrasado";

interface Trabalho {
  id: string;
  empresa: string;
  nome: string;
  tipo: Tipo;
  status: StatusT;
  horas: number;
  observacoes?: string;
  historico: { quando: string; autor: string; acao: string }[];
}

const TRABALHOS: Trabalho[] = [
  { id: "TR-1042", empresa: "Empresa X",   nome: "Diagnóstico DISC equipe",  tipo: "entregavel",  status: "andamento", horas: 12.5, observacoes: "Aguardando devolutiva.", historico: [
    { quando: "27/04 10:00", autor: "Marina Costa", acao: "Iniciou o trabalho" },
    { quando: "27/04 14:30", autor: "Marina Costa", acao: "+2.5h registradas" },
  ]},
  { id: "TR-1041", empresa: "Startup Y",   nome: "Proposta comercial",       tipo: "subtarefa",   status: "pendente",  horas: 3.0,  historico: [] },
  { id: "TR-1040", empresa: "Empresa X",   nome: "SOL-2025-0142",            tipo: "solicitacao", status: "andamento", horas: 1.5,  historico: [] },
  { id: "TR-1039", empresa: "Grupo Zeta",  nome: "Vaga Tech Lead",           tipo: "vaga",        status: "concluido", horas: 22.0, historico: [] },
  { id: "TR-1038", empresa: "Nuvem Corp",  nome: "Contrato 2026",            tipo: "entregavel",  status: "atrasado",  horas: 6.0,  historico: [] },
  { id: "TR-1037", empresa: "Tech Bravo",  nome: "Onboarding gerência",      tipo: "subtarefa",   status: "andamento", horas: 8.0,  historico: [] },
];

const TIPO_ICON: Record<Tipo, typeof Package> = {
  entregavel:  Package,
  subtarefa:   ListChecks,
  solicitacao: MessageSquare,
  vaga:        Briefcase,
};
const TIPO_LABEL: Record<Tipo, string> = {
  entregavel: "Entregável", subtarefa: "Subtarefa", solicitacao: "Solicitação", vaga: "Vaga",
};

function StatusPill({ s }: { s: StatusT }) {
  const map: Record<StatusT, { l: string; c: string }> = {
    andamento: { l: "Em andamento", c: "bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/30" },
    pendente:  { l: "Pendente",     c: "bg-amber-500/15 text-amber-500 border-amber-500/30" },
    concluido: { l: "Concluído",    c: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30" },
    atrasado:  { l: "Atrasado",     c: "bg-destructive/15 text-destructive border-destructive/30" },
  };
  return <span className={cn("badge-pill", map[s].c)}>{map[s].l}</span>;
}

function CopyBtn({ value }: { value: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(value); setDone(true); setTimeout(() => setDone(false), 1200); }}
      className="opacity-0 group-hover:opacity-100 inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-opacity ml-1"
      title="Copiar"
    >
      {done ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

interface Documento { id: string; nome: string; empresa: string; tipo: "entregavel" | "solicitacao" | "documento"; href: string; }
const DOCS: Documento[] = [
  { id: "D-001", nome: "Contrato_2026.pdf",       empresa: "Empresa X",  tipo: "documento",   href: "/app/documentos" },
  { id: "D-002", nome: "Diagnóstico DISC",        empresa: "Empresa X",  tipo: "entregavel",  href: "/app/projetos/PRJ-0014" },
  { id: "D-003", nome: "SOL-2025-0142",           empresa: "Empresa X",  tipo: "solicitacao", href: "/app/solicitacoes" },
  { id: "D-004", nome: "Proposta_RH.docx",        empresa: "Startup Y",  tipo: "documento",   href: "/app/documentos" },
  { id: "D-005", nome: "Relatorio_Q1.pdf",        empresa: "Grupo Zeta", tipo: "entregavel",  href: "/app/projetos/PRJ-0019" },
  { id: "D-006", nome: "SOL-2025-0140",           empresa: "Grupo Zeta", tipo: "solicitacao", href: "/app/solicitacoes" },
];

function TrabalhosTab() {
  const [busca, setBusca] = useState("");
  const [selected, setSelected] = useState<Trabalho | null>(null);
  const [hidden, setHidden] = useState<Record<string, boolean>>({});

  const lista = useMemo(() => TRABALHOS.filter((t) => {
    if (!busca) return true;
    return `${t.id} ${t.nome} ${t.empresa}`.toLowerCase().includes(busca.toLowerCase());
  }), [busca]);

  const cols = [
    { key: "codigo",  label: "Código" },
    { key: "empresa", label: "Empresa" },
    { key: "nome",    label: "Trabalho" },
    { key: "tipo",    label: "Tipo" },
    { key: "status",  label: "Status" },
    { key: "horas",   label: "Horas" },
  ] as const;

  function toggleCol(k: string) {
    setHidden((s) => ({ ...s, [k]: !s[k] }));
  }
  const isVis = (k: string) => !hidden[k];

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por código, empresa ou nome…" className="pl-9 rounded-[100px]" />
        </div>
        {selected && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {cols.map((c) => (
              <button
                key={c.key}
                onClick={() => toggleCol(c.key)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-[100px] border px-2.5 py-1 text-xs",
                  isVis(c.key) ? "border-border text-foreground" : "border-border text-muted-foreground line-through",
                )}
                title={isVis(c.key) ? "Ocultar coluna" : "Mostrar coluna"}
              >
                {isVis(c.key) ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                {c.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={cn("grid gap-4", selected ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1")}>
        <div className={cn("rounded-xl border border-border bg-card overflow-hidden", selected && "lg:col-span-2")}>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                {isVis("codigo")  && <TableHead className="w-[16%]">Código</TableHead>}
                {isVis("empresa") && <TableHead className="w-[18%]">Empresa</TableHead>}
                {isVis("nome")    && <TableHead>Trabalho</TableHead>}
                {isVis("tipo")    && <TableHead className="w-[14%]">Tipo</TableHead>}
                {isVis("status")  && <TableHead className="w-[14%]">Status</TableHead>}
                {isVis("horas")   && <TableHead className="text-right pr-6 w-[10%]">Horas</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {lista.map((t) => {
                const Icon = TIPO_ICON[t.tipo];
                return (
                  <TableRow
                    key={t.id}
                    onClick={() => setSelected(t)}
                    className={cn("cursor-pointer group", selected?.id === t.id && "bg-muted/40")}
                  >
                    {isVis("codigo") && (
                      <TableCell>
                        <span className="font-mono text-sm text-[#3B82F6]">{t.id}</span>
                        <CopyBtn value={t.id} />
                      </TableCell>
                    )}
                    {isVis("empresa") && <TableCell>{t.empresa}</TableCell>}
                    {isVis("nome")    && <TableCell className="font-medium">{t.nome}</TableCell>}
                    {isVis("tipo")    && (
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-sm">
                          <Icon className="h-3.5 w-3.5 text-[#8B5CF6]" />
                          {TIPO_LABEL[t.tipo]}
                        </span>
                      </TableCell>
                    )}
                    {isVis("status") && <TableCell><StatusPill s={t.status} /></TableCell>}
                    {isVis("horas")  && <TableCell className="text-right pr-6 tabular-nums">{t.horas.toFixed(1)} h</TableCell>}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {selected && (
          <aside className="rounded-xl border border-border bg-card p-5 h-fit lg:sticky lg:top-4">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <div className="text-xs text-muted-foreground inline-flex items-center gap-1.5 group">
                  <span className="font-mono text-[#3B82F6]">{selected.id}</span>
                  <CopyBtn value={selected.id} />
                </div>
                <h3 className="font-semibold mt-1">{selected.nome}</h3>
                <p className="text-xs text-muted-foreground">{selected.empresa}</p>
              </div>
              <button onClick={() => setSelected(null)} className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <StatusPill s={selected.status} />
              <span className="text-xs text-muted-foreground">{selected.horas.toFixed(1)} h registradas</span>
            </div>

            <div className="text-sm font-medium mb-1">Observações</div>
            <p className="text-sm text-muted-foreground mb-4">{selected.observacoes ?? "Sem observações."}</p>

            <div className="text-sm font-medium mb-2">Histórico</div>
            <div className="space-y-2">
              {selected.historico.length === 0 && (
                <p className="text-sm text-muted-foreground">Sem registros.</p>
              )}
              {selected.historico.map((h, i) => (
                <div key={i} className="rounded-lg border border-border bg-muted/30 p-2.5">
                  <div className="flex items-center justify-between text-xs mb-0.5">
                    <span className="font-medium">{h.autor}</span>
                    <span className="text-muted-foreground">{h.quando}</span>
                  </div>
                  <p className="text-sm">{h.acao}</p>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

function ArquivoTab() {
  const [empresa, setEmpresa] = useState<string>("all");
  const [tipo, setTipo]       = useState<string>("all");

  const empresas = useMemo(() => Array.from(new Set(DOCS.map((d) => d.empresa))), []);

  const grupos = useMemo(() => {
    const filt = DOCS.filter((d) => {
      if (empresa !== "all" && d.empresa !== empresa) return false;
      if (tipo !== "all" && d.tipo !== tipo) return false;
      return true;
    });
    const map = new Map<string, Documento[]>();
    for (const d of filt) {
      const arr = map.get(d.empresa) ?? [];
      arr.push(d);
      map.set(d.empresa, arr);
    }
    return Array.from(map.entries());
  }, [empresa, tipo]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3">
        <Select value={empresa} onValueChange={setEmpresa}>
          <SelectTrigger className="w-full md:w-64 rounded-[100px]"><SelectValue placeholder="Empresa" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as empresas</SelectItem>
            {empresas.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={tipo} onValueChange={setTipo}>
          <SelectTrigger className="w-full md:w-64 rounded-[100px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="entregavel">Entregável</SelectItem>
            <SelectItem value="solicitacao">Solicitação</SelectItem>
            <SelectItem value="documento">Documento</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {grupos.map(([emp, docs]) => (
          <div key={emp} className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-3 bg-muted/40 flex items-center gap-3">
              <div className="h-8 w-8 rounded-md bg-[#034C8B] text-white flex items-center justify-center text-xs font-semibold">
                {emp.split(" ").map((p) => p[0]).slice(0, 2).join("")}
              </div>
              <span className="font-medium">{emp}</span>
              <span className="text-xs text-muted-foreground">{docs.length} item(ns)</span>
            </div>
            <div className="divide-y divide-border">
              {docs.map((d) => (
                <Link key={d.id} to={d.href} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 group">
                  <div className="h-9 w-9 rounded-md bg-[#3B82F6]/10 text-[#3B82F6] flex items-center justify-center">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{d.nome}</div>
                    <div className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
                      <span className="font-mono">{d.id}</span><CopyBtn value={d.id} />
                    </div>
                  </div>
                  <span className="badge-pill bg-[#8B5CF6]/15 text-[#8B5CF6] border-[#8B5CF6]/30 capitalize">{d.tipo}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
        {grupos.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
            Nenhum item encontrado.
          </div>
        )}
      </div>
    </div>
  );
}

function HistoricoTab() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3">
        <Select>
          <SelectTrigger className="w-full md:w-48 rounded-[100px]"><SelectValue placeholder="Usuário" /></SelectTrigger>
          <SelectContent><SelectItem value="all">Todos os usuários</SelectItem></SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-full md:w-48 rounded-[100px]"><SelectValue placeholder="Tipo de ação" /></SelectTrigger>
          <SelectContent><SelectItem value="all">Todos os tipos</SelectItem></SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-full md:w-48 rounded-[100px]"><SelectValue placeholder="Entidade" /></SelectTrigger>
          <SelectContent><SelectItem value="all">Todas as entidades</SelectItem></SelectContent>
        </Select>
        <Input type="date" className="w-full md:w-48 rounded-[100px]" />
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead>Data/Hora</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Ação</TableHead>
              <TableHead>Entidade</TableHead>
              <TableHead>Antes</TableHead>
              <TableHead>Depois</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={6} className="p-0">
                <EmptyState
                  icon={History}
                  title="Nenhuma ação registrada"
                  description="O log será populado automaticamente conforme as ações forem realizadas."
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default function AuditoriaPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Auditoria" subtitle="Trabalhos em execução, arquivo e histórico de ações" />

      <Tabs defaultValue="trabalhos" className="w-full">
        <TabsList className="rounded-[100px] p-1 h-auto">
          <TabsTrigger value="trabalhos" className="rounded-[100px]">Trabalhos</TabsTrigger>
          <TabsTrigger value="arquivo"   className="rounded-[100px]">Arquivo</TabsTrigger>
          <TabsTrigger value="historico" className="rounded-[100px]">Histórico de Ações</TabsTrigger>
        </TabsList>
        <TabsContent value="trabalhos" className="mt-5"><TrabalhosTab /></TabsContent>
        <TabsContent value="arquivo"   className="mt-5"><ArquivoTab   /></TabsContent>
        <TabsContent value="historico" className="mt-5"><HistoricoTab /></TabsContent>
      </Tabs>
    </div>
  );
}
