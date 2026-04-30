import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import SolicitacoesClientePage from "@/pages/SolicitacoesClientePage";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search, Copy, Check, X, MessageSquare, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "aberta" | "andamento" | "finalizada" | "cancelada";

interface Solicitacao {
  id: string;
  protocolo: string;
  empresa: string;
  tipo: string;
  status: Status;
  urgencia: "baixa" | "media" | "alta";
  data: string;
  consultor: string;
  titulo: string;
  historico: { autor: string; quando: string; texto: string }[];
}

const MOCK: Solicitacao[] = [
  { id: "1", protocolo: "SOL-2025-0142", empresa: "Empresa X",   tipo: "Recrutamento",   status: "aberta",     urgencia: "alta",  data: "27/04/2026", consultor: "Marina Costa",  titulo: "Vaga de Dev Pleno React", historico: [
    { autor: "Empresa X",    quando: "27/04 09:12", texto: "Precisamos abrir vaga urgente." },
    { autor: "Marina Costa", quando: "27/04 09:40", texto: "Recebido. Iniciando triagem hoje." },
  ]},
  { id: "2", protocolo: "SOL-2025-0141", empresa: "Startup Y",   tipo: "Consultoria",    status: "andamento",  urgencia: "media", data: "26/04/2026", consultor: "Rafael Lima",   titulo: "Reestruturação de cargos", historico: [
    { autor: "Startup Y",   quando: "26/04 14:00", texto: "Queremos revisar a estrutura comercial." },
  ]},
  { id: "3", protocolo: "SOL-2025-0140", empresa: "Grupo Zeta",  tipo: "Documento",      status: "finalizada", urgencia: "baixa", data: "25/04/2026", consultor: "Ana Beatriz",   titulo: "Emissão de contrato", historico: [
    { autor: "Ana Beatriz", quando: "25/04 11:00", texto: "Contrato enviado." },
  ]},
  { id: "4", protocolo: "SOL-2025-0139", empresa: "Nuvem Corp",  tipo: "Recrutamento",   status: "cancelada",  urgencia: "media", data: "24/04/2026", consultor: "Marina Costa",  titulo: "Vaga de Designer", historico: [
    { autor: "Nuvem Corp", quando: "24/04 10:00", texto: "Cancelado por mudança de prioridade." },
  ]},
  { id: "5", protocolo: "SOL-2025-0138", empresa: "Empresa X",   tipo: "Suporte",        status: "andamento",  urgencia: "alta",  data: "23/04/2026", consultor: "Rafael Lima",   titulo: "Acesso ao portal", historico: [] },
  { id: "6", protocolo: "SOL-2025-0137", empresa: "Tech Bravo",  tipo: "Consultoria",    status: "aberta",     urgencia: "baixa", data: "22/04/2026", consultor: "Diego Alves",   titulo: "Plano de carreira", historico: [] },
  { id: "7", protocolo: "SOL-2025-0136", empresa: "Grupo Zeta",  tipo: "Recrutamento",   status: "finalizada", urgencia: "media", data: "20/04/2026", consultor: "Ana Beatriz",   titulo: "Vaga Tech Lead", historico: [] },
  { id: "8", protocolo: "SOL-2025-0135", empresa: "Startup Y",   tipo: "Documento",      status: "cancelada",  urgencia: "alta",  data: "18/04/2026", consultor: "Marina Costa",  titulo: "Aditivo contratual", historico: [] },
];

const STATUS_LABEL: Record<Status, string> = {
  aberta: "Aberta", andamento: "Em andamento", finalizada: "Finalizada", cancelada: "Cancelada",
};

function StatusPill({ s }: { s: Status }) {
  const map: Record<Status, string> = {
    aberta:     "bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/30",
    andamento:  "bg-amber-500/15 text-amber-500 border-amber-500/30",
    finalizada: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
    cancelada:  "bg-[#424447]/20 text-muted-foreground border-border",
  };
  return (
    <span className={cn("badge-pill", map[s])}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {STATUS_LABEL[s]}
    </span>
  );
}

function UrgPill({ u }: { u: Solicitacao["urgencia"] }) {
  const map = {
    baixa: "bg-muted text-muted-foreground border-border",
    media: "bg-amber-500/10 text-amber-500 border-amber-500/30",
    alta:  "bg-destructive/15 text-destructive border-destructive/30",
  } as const;
  return <span className={cn("badge-pill", map[u])}>{u}</span>;
}

function CopyBtn({ value }: { value: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(value); setDone(true); setTimeout(() => setDone(false), 1200); }}
      className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      title="Copiar protocolo"
    >
      {done ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

function AdminView() {
  const [busca, setBusca]       = useState("");
  const [empresa, setEmpresa]   = useState<string>("all");
  const [tipo, setTipo]         = useState<string>("all");
  const [status, setStatus]     = useState<Status | "all">("all");
  const [selected, setSelected] = useState<Solicitacao | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const empresas = useMemo(() => Array.from(new Set(MOCK.map((s) => s.empresa))), []);
  const tipos    = useMemo(() => Array.from(new Set(MOCK.map((s) => s.tipo))), []);

  const lista = useMemo(() => MOCK.filter((s) => {
    if (empresa !== "all" && s.empresa !== empresa) return false;
    if (tipo !== "all" && s.tipo !== tipo) return false;
    if (status !== "all" && s.status !== status) return false;
    if (busca && !`${s.protocolo} ${s.titulo} ${s.empresa}`.toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  }), [empresa, tipo, status, busca]);

  function openPanel(s: Solicitacao) {
    setSelected(s);
    requestAnimationFrame(() => setPanelOpen(true));
  }
  function closePanel() {
    setPanelOpen(false);
    setTimeout(() => setSelected(null), 250);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") closePanel(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Solicitações" subtitle="Central de solicitações" />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="relative md:col-span-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por protocolo, título ou empresa…" className="pl-9 rounded-[100px]" />
        </div>
        <Select value={empresa} onValueChange={setEmpresa}>
          <SelectTrigger className="md:col-span-2 rounded-[100px]"><SelectValue placeholder="Empresa" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as empresas</SelectItem>
            {empresas.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={tipo} onValueChange={setTipo}>
          <SelectTrigger className="md:col-span-2 rounded-[100px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {tipos.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => setStatus(v as Status | "all")}>
          <SelectTrigger className="md:col-span-3 rounded-[100px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="aberta">Aberta</SelectItem>
            <SelectItem value="andamento">Em andamento</SelectItem>
            <SelectItem value="finalizada">Finalizada</SelectItem>
            <SelectItem value="cancelada">Cancelada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-[20%]">Protocolo</TableHead>
              <TableHead className="w-[18%]">Empresa</TableHead>
              <TableHead className="w-[14%]">Tipo</TableHead>
              <TableHead className="w-[12%]">Urgência</TableHead>
              <TableHead className="w-[14%]">Status</TableHead>
              <TableHead className="w-[10%]">Data</TableHead>
              <TableHead className="w-[12%]">Consultor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lista.map((s) => (
              <TableRow key={s.id} onClick={() => openPanel(s)} className="cursor-pointer">
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-sm font-medium text-[#3B82F6]">{s.protocolo}</span>
                    <CopyBtn value={s.protocolo} />
                  </div>
                </TableCell>
                <TableCell>{s.empresa}</TableCell>
                <TableCell className="text-muted-foreground">{s.tipo}</TableCell>
                <TableCell><UrgPill u={s.urgencia} /></TableCell>
                <TableCell><StatusPill s={s.status} /></TableCell>
                <TableCell className="text-muted-foreground text-sm">{s.data}</TableCell>
                <TableCell>{s.consultor}</TableCell>
              </TableRow>
            ))}
            {lista.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">Nenhuma solicitação encontrada.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Side panel */}
      {selected && (
        <>
          <div
            className={cn(
              "fixed inset-0 bg-black/40 z-40 transition-opacity duration-200",
              panelOpen ? "opacity-100" : "opacity-0",
            )}
            onClick={closePanel}
          />
          <aside
            className={cn(
              "fixed top-0 right-0 h-full w-full max-w-[480px] bg-card border-l border-border z-50 shadow-elevated",
              "transition-transform duration-300 ease-out",
              panelOpen ? "translate-x-0" : "translate-x-full",
            )}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-mono text-sm font-medium text-[#3B82F6] truncate">{selected.protocolo}</span>
                <CopyBtn value={selected.protocolo} />
              </div>
              <button onClick={closePanel} className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-5 py-4 space-y-4 overflow-y-auto h-[calc(100%-64px)]">
              <div>
                <h2 className="text-lg font-semibold">{selected.titulo}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">{selected.empresa} · {selected.tipo}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <StatusPill s={selected.status} />
                <UrgPill u={selected.urgencia} />
                <span className="text-xs text-muted-foreground">Aberta em {selected.data}</span>
              </div>

              <div className="rounded-lg border border-border p-3 text-sm">
                <div className="text-muted-foreground text-xs mb-1">Consultor responsável</div>
                <div className="font-medium">{selected.consultor}</div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2 text-sm font-medium">
                  <MessageSquare className="h-4 w-4" /> Histórico
                </div>
                <div className="space-y-3">
                  {selected.historico.length === 0 && (
                    <p className="text-sm text-muted-foreground">Sem interações registradas.</p>
                  )}
                  {selected.historico.map((h, i) => (
                    <div key={i} className="rounded-lg border border-border bg-muted/30 p-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium">{h.autor}</span>
                        <span className="text-muted-foreground">{h.quando}</span>
                      </div>
                      <p className="text-sm">{h.texto}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-2">
                {selected.status === "aberta" && (
                  <>
                    <Button className="rounded-[100px] bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white">Assumir</Button>
                    <Button variant="outline" className="rounded-[100px]">Encaminhar</Button>
                  </>
                )}
                {selected.status === "andamento" && (
                  <>
                    <Button className="rounded-[100px] bg-emerald-600 hover:bg-emerald-600/90 text-white">Finalizar</Button>
                    <Button variant="outline" className="rounded-[100px]">Adicionar nota</Button>
                  </>
                )}
                {selected.status === "finalizada" && (
                  <Button variant="outline" className="rounded-[100px]">Reabrir</Button>
                )}
                {selected.status === "cancelada" && (
                  <Button variant="outline" className="rounded-[100px]">Reabrir</Button>
                )}
              </div>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}

export default function SolicitacoesPage() {
  const { user } = useAuth();
  if (user?.papel === "cliente") return <SolicitacoesClientePage />;
  return <AdminView />;
}
