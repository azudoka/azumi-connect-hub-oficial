import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Search, Copy, Check, X, MessageSquare, Plus, Send, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "aberta" | "andamento" | "finalizada" | "cancelada";

interface HistoricoItem {
  autor: string;
  quando: string;
  texto: string;
  enviadoEm?: number;
  editadoEm?: string;
}

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
  historico: HistoricoItem[];
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

const CONSULTORES_AZUMI = [
  { id: "ab", nome: "Ana Beatriz" },
  { id: "rm", nome: "Rafael Moura" },
  { id: "ct", nome: "Camila Torres" },
  { id: "da", nome: "Diego Alves" },
];

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

function RespostaInput({ onEnviar }: { onEnviar: (texto: string) => void }) {
  const [texto, setTexto] = useState("");
  return (
    <div className="flex gap-2 items-end border-t border-border pt-3">
      <Textarea
        rows={2}
        placeholder="Escreva uma mensagem…"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        className="resize-none flex-1 text-sm"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (texto.trim()) {
              onEnviar(texto.trim());
              setTexto("");
            }
          }
        }}
      />
      <Button
        size="sm"
        disabled={!texto.trim()}
        onClick={() => {
          if (texto.trim()) {
            onEnviar(texto.trim());
            setTexto("");
          }
        }}
        className="gap-1.5 shrink-0"
      >
        <Send className="h-3.5 w-3.5" /> Enviar
      </Button>
    </div>
  );
}

function MensagemChat({
  mensagem,
  index,
  onEditar,
  onExcluir,
}: {
  mensagem: HistoricoItem;
  index: number;
  onEditar: (index: number, novoTexto: string, editadoEm: string) => void;
  onExcluir: (index: number) => void;
}) {
  const [editando, setEditando] = useState(false);
  const [textoEdit, setTextoEdit] = useState(mensagem.texto);
  const isMe = mensagem.autor === "Você" || mensagem.autor.includes("interno");
  const podeExcluir =
    isMe &&
    mensagem.enviadoEm !== undefined &&
    Date.now() - mensagem.enviadoEm < 60_000;

  return (
    <div className={cn("flex gap-2 items-end group", isMe && "flex-row-reverse")}>
      {!isMe && (
        <div className="h-7 w-7 rounded-md bg-gradient-brand flex items-center justify-center text-[10px] font-semibold text-white shrink-0">
          {mensagem.autor.charAt(0)}
        </div>
      )}
      <div className="relative max-w-[78%]">
        {editando ? (
          <div className="space-y-1">
            <textarea
              className="text-sm rounded-xl px-3 py-2 bg-primary/10 border border-primary/30 resize-none w-full min-h-[60px] focus:outline-none"
              value={textoEdit}
              onChange={(e) => setTextoEdit(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setEditando(false);
                  setTextoEdit(mensagem.texto);
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="text-xs text-primary font-medium"
                onClick={() => {
                  if (!textoEdit.trim()) return;
                  const agora = format(new Date(), "HH:mm");
                  onEditar(index, textoEdit.trim(), agora);
                  setEditando(false);
                }}
              >
                Salvar
              </button>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "rounded-2xl px-3 py-2 text-sm shadow-sm",
              isMe
                ? "bg-primary text-primary-foreground rounded-br-sm"
                : "bg-secondary text-foreground rounded-bl-sm border border-border"
            )}
          >
            {!isMe && (
              <div className="text-[10px] font-semibold mb-0.5 text-primary">
                {mensagem.autor}
              </div>
            )}
            <p className="break-words">{mensagem.texto}</p>
            {mensagem.editadoEm && (
              <span className="text-[9px] opacity-60 ml-1">
                · editado {mensagem.editadoEm}
              </span>
            )}
            <div
              className={cn(
                "text-[10px] font-data mt-1 text-right",
                isMe ? "text-primary-foreground/70" : "text-muted-foreground"
              )}
            >
              {mensagem.quando}
            </div>
          </div>
        )}
        {isMe && !editando && (
          <div className="absolute -top-6 right-0 hidden group-hover:flex items-center gap-1 bg-background border border-border rounded-md px-1.5 py-0.5 shadow-sm">
            <button
              type="button"
              title="Editar"
              onClick={() => setEditando(true)}
              className="text-muted-foreground hover:text-foreground p-0.5"
            >
              <Pencil className="h-3 w-3" />
            </button>
            {podeExcluir && (
              <button
                type="button"
                title="Excluir"
                onClick={() => {
                  if (confirm("Excluir esta mensagem?")) onExcluir(index);
                }}
                className="text-muted-foreground hover:text-destructive p-0.5"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function AdminView() {
  const navigate = useNavigate();
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>(MOCK);
  const [busca, setBusca]       = useState("");
  const [empresa, setEmpresa]   = useState<string>("all");
  const [tipo, setTipo]         = useState<string>("all");
  const [status, setStatus]     = useState<Status | "all">("all");
  const [periodo, setPeriodo]   = useState<"all" | "7" | "30" | "90">("all");
  const [selected, setSelected] = useState<Solicitacao | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAcao, setConfirmAcao] = useState<"finalizar" | "reabrir" | null>(null);
  const [notaOpen, setNotaOpen] = useState(false);
  const [notaTexto, setNotaTexto] = useState("");
  const [encaminharOpen, setEncaminharOpen] = useState(false);
  const [consultorDestino, setConsultorDestino] = useState("");

  const empresas = useMemo(() => Array.from(new Set(solicitacoes.map((s) => s.empresa))), [solicitacoes]);
  const tipos    = useMemo(() => Array.from(new Set(solicitacoes.map((s) => s.tipo))), [solicitacoes]);

  function parseDataBR(s: string): Date {
    const [d, m, y] = s.split("/").map(Number);
    return new Date(y, m - 1, d);
  }

  const lista = useMemo(() => solicitacoes.filter((s) => {
    if (empresa !== "all" && s.empresa !== empresa) return false;
    if (tipo !== "all" && s.tipo !== tipo) return false;
    if (status !== "all" && s.status !== status) return false;
    if (periodo !== "all") {
      const dias = Number(periodo);
      const limite = new Date();
      limite.setDate(limite.getDate() - dias);
      if (parseDataBR(s.data) < limite) return false;
    }
    if (busca && !`${s.protocolo} ${s.titulo} ${s.empresa}`.toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  }), [solicitacoes, empresa, tipo, status, periodo, busca]);

  const kpis = useMemo(() => ({
    total: solicitacoes.length,
    abertas: solicitacoes.filter((s) => s.status === "aberta").length,
    andamento: solicitacoes.filter((s) => s.status === "andamento").length,
    finalizadas: solicitacoes.filter((s) => s.status === "finalizada").length,
  }), [solicitacoes]);

  function atualizarSolicitacao(id: string, patch: Partial<Solicitacao>) {
    setSolicitacoes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
    );
    setSelected((prev) => (prev && prev.id === id ? { ...prev, ...patch } : prev));
  }

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
      <PageHeader
        title="Solicitações"
        subtitle="Central de solicitações"
        actions={
          <Button
            onClick={() => navigate("/app/atracao?new=1")}
            className="rounded-[100px] bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white gap-1.5"
          >
            <Plus className="h-4 w-4" /> Nova solicitação
          </Button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total", value: kpis.total, cor: "text-foreground" },
          { label: "Abertas", value: kpis.abertas, cor: "text-info" },
          { label: "Em andamento", value: kpis.andamento, cor: "text-warning" },
          { label: "Finalizadas", value: kpis.finalizadas, cor: "text-success" },
        ].map((k) => (
          <div key={k.label} className="rounded-xl border border-border bg-card p-4">
            <div className={cn("text-2xl font-semibold font-data", k.cor)}>
              {k.value}
            </div>
            <div className="text-xs text-muted-foreground mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="relative md:col-span-4">
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
          <SelectTrigger className="md:col-span-2 rounded-[100px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="aberta">Aberta</SelectItem>
            <SelectItem value="andamento">Em andamento</SelectItem>
            <SelectItem value="finalizada">Finalizada</SelectItem>
            <SelectItem value="cancelada">Cancelada</SelectItem>
          </SelectContent>
        </Select>
        <Select value={periodo} onValueChange={(v) => setPeriodo(v as typeof periodo)}>
          <SelectTrigger className="md:col-span-2 rounded-[100px]"><SelectValue placeholder="Período" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todo o período</SelectItem>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="90">Últimos 90 dias</SelectItem>
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

              {/* Chat */}
              <div>
                <div className="flex items-center gap-2 mb-3 text-sm font-medium">
                  <MessageSquare className="h-4 w-4" /> Conversa
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1 mb-3">
                  {(selected.historico ?? []).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Sem mensagens ainda.
                    </p>
                  )}
                  {(selected.historico ?? []).map((h, i) => {
                    const isMe = h.autor.includes("Costa") ||
                      h.autor.includes("Lima") ||
                      h.autor.includes("Beatriz") ||
                      h.autor.includes("Azumi") ||
                      h.autor.includes("interno") ||
                      h.autor === "Você";
                    return (
                      <div key={i}
                        className={cn("flex gap-2 items-end",
                          isMe && "flex-row-reverse")}>
                        {!isMe && (
                          <div className="h-7 w-7 rounded-md bg-gradient-brand flex items-center justify-center text-[10px] font-semibold text-white shrink-0">
                            {h.autor.charAt(0)}
                          </div>
                        )}
                        <div className={cn(
                          "max-w-[78%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                          isMe
                            ? "bg-primary text-primary-foreground rounded-br-sm"
                            : "bg-secondary text-foreground rounded-bl-sm border border-border"
                        )}>
                          {!isMe && (
                            <div className="text-[10px] font-semibold mb-0.5 text-primary">
                              {h.autor}
                            </div>
                          )}
                          <p className="break-words">{h.texto}</p>
                          <div className={cn(
                            "text-[10px] font-data mt-1 text-right",
                            isMe ? "text-primary-foreground/70" : "text-muted-foreground"
                          )}>
                            {h.quando}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {selected.status !== "finalizada" && selected.status !== "cancelada" && (
                  <RespostaInput
                    onEnviar={(texto) => {
                      const agora = format(new Date(), "dd/MM HH:mm");
                      const nova = { autor: "Você", quando: agora, texto };
                      atualizarSolicitacao(selected.id, {
                        historico: [...(selected.historico ?? []), nova],
                      });
                      toast.success("Mensagem enviada.");
                    }}
                  />
                )}
              </div>

              <div className="pt-2 flex flex-wrap gap-2">
                {selected.status === "aberta" && (
                  <>
                    <Button
                      className="rounded-[100px] bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white"
                      onClick={() => {
                        atualizarSolicitacao(selected.id, { status: "andamento" });
                        toast.success("Solicitação assumida.");
                      }}
                    >
                      Assumir
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-[100px]"
                      onClick={() => { setConsultorDestino(""); setEncaminharOpen(true); }}
                    >
                      Encaminhar
                    </Button>
                  </>
                )}
                {selected.status === "andamento" && (
                  <>
                    <Button
                      className="rounded-[100px] bg-emerald-600 hover:bg-emerald-600/90 text-white"
                      onClick={() => { setConfirmAcao("finalizar"); setConfirmOpen(true); }}
                    >
                      Finalizar
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-[100px]"
                      onClick={() => { setNotaTexto(""); setNotaOpen(true); }}
                    >
                      Adicionar nota
                    </Button>
                  </>
                )}
                {(selected.status === "finalizada" || selected.status === "cancelada") && (
                  <Button
                    variant="outline"
                    className="rounded-[100px]"
                    onClick={() => { setConfirmAcao("reabrir"); setConfirmOpen(true); }}
                  >
                    Reabrir
                  </Button>
                )}
              </div>
            </div>
          </aside>
        </>
      )}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAcao === "finalizar"
                ? "Finalizar solicitação?"
                : "Reabrir solicitação?"}
            </DialogTitle>
            <DialogDescription>
              {confirmAcao === "finalizar"
                ? "Esta ação marca a solicitação como finalizada. Confirma?"
                : "A solicitação voltará para Em andamento. Confirma?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              if (!selected) return;
              const novoStatus: Status = confirmAcao === "finalizar" ? "finalizada" : "andamento";
              atualizarSolicitacao(selected.id, { status: novoStatus });
              toast.success(
                confirmAcao === "finalizar"
                  ? "Solicitação finalizada."
                  : "Solicitação reaberta."
              );
              setConfirmOpen(false);
            }}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={notaOpen} onOpenChange={setNotaOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar nota interna</DialogTitle>
            <DialogDescription>
              A nota será visível apenas para a equipe Azumi.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            rows={4}
            placeholder="Escreva a nota interna…"
            value={notaTexto}
            onChange={(e) => setNotaTexto(e.target.value)}
            className="mt-2"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNotaOpen(false)}>
              Cancelar
            </Button>
            <Button
              disabled={!notaTexto.trim()}
              onClick={() => {
                if (!selected || !notaTexto.trim()) return;
                const agora = format(new Date(), "dd/MM HH:mm");
                const novaMensagem = {
                  autor: "Você (interno)",
                  quando: agora,
                  texto: notaTexto.trim(),
                };
                atualizarSolicitacao(selected.id, {
                  historico: [...(selected.historico ?? []), novaMensagem],
                });
                toast.success("Nota adicionada.");
                setNotaOpen(false);
                setNotaTexto("");
              }}
            >
              Salvar nota
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={encaminharOpen}
        onOpenChange={(o) => { if (!o) setEncaminharOpen(false); }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Encaminhar solicitação</DialogTitle>
            <DialogDescription>
              Selecione o consultor que irá assumir esta solicitação.
              O consultor atual será notificado.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            {CONSULTORES_AZUMI.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setConsultorDestino(c.id)}
                className={cn(
                  "w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-colors flex items-center gap-3",
                  consultorDestino === c.id
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "border-border hover:bg-secondary/50"
                )}
              >
                <span className="h-8 w-8 rounded-full bg-gradient-brand text-white flex items-center justify-center text-xs font-semibold">
                  {c.nome.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </span>
                {c.nome}
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEncaminharOpen(false)}>
              Cancelar
            </Button>
            <Button
              disabled={!consultorDestino}
              onClick={() => {
                if (!selected || !consultorDestino) return;
                const consultor = CONSULTORES_AZUMI.find(
                  (c) => c.id === consultorDestino
                );
                atualizarSolicitacao(selected.id, {
                  consultor: consultor?.nome ?? selected.consultor,
                  status: "andamento",
                });
                toast.success(`Solicitação encaminhada para ${consultor?.nome}.`);
                setEncaminharOpen(false);
                setConsultorDestino("");
              }}
            >
              Confirmar encaminhamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function SolicitacoesPage() {
  const { user } = useAuth();
  if (user?.papel === "cliente") return <SolicitacoesClientePage />;
  return <AdminView />;
}
