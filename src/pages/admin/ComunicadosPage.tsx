import { useMemo, useState } from "react";
import {
  Plus, Search, ThumbsUp, Heart, Smile, Check, X, Eye, EyeOff, Copy,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type StatusC = "rascunho" | "agendado" | "enviado";
type Segmento = "empresa" | "role" | "filial";

interface Leitor { nome: string; iniciais: string; lidoEm?: string; }
interface Comunicado {
  id: string;
  titulo: string;
  corpo: string;
  autor: { nome: string; iniciais: string };
  destinatarios: string;
  segmento: Segmento;
  enviadoEm?: string;
  agendadoPara?: string;
  status: StatusC;
  leitores: Leitor[];
  reacoes: { thumbs: number; heart: number; smile: number };
}

const COMUNICADOS: Comunicado[] = [
  { id: "C-001", titulo: "Atualização da política de férias", corpo: "Comunicamos as atualizações na política de férias da Azumi para 2026...",
    autor: { nome: "Marina Costa", iniciais: "MC" }, destinatarios: "Todos", segmento: "role",
    enviadoEm: "20/04/2026", status: "enviado",
    leitores: [
      { nome: "Rafael Lima",  iniciais: "RL", lidoEm: "20/04 09:30" },
      { nome: "Ana Beatriz",  iniciais: "AB", lidoEm: "20/04 11:10" },
      { nome: "Camila Souza", iniciais: "CS" },
      { nome: "Diego Alves",  iniciais: "DA", lidoEm: "21/04 08:00" },
    ], reacoes: { thumbs: 8, heart: 3, smile: 1 },
  },
  { id: "C-002", titulo: "Reunião geral — quarta às 10h", corpo: "Pauta: resultados de Q1 e diretrizes para Q2.",
    autor: { nome: "Diego Alves", iniciais: "DA" }, destinatarios: "Time interno", segmento: "role",
    enviadoEm: "22/04/2026", status: "enviado",
    leitores: [
      { nome: "Marina Costa", iniciais: "MC", lidoEm: "22/04 09:00" },
      { nome: "Rafael Lima",  iniciais: "RL" },
    ], reacoes: { thumbs: 5, heart: 1, smile: 0 },
  },
  { id: "C-003", titulo: "Boas-vindas, Empresa X!", corpo: "Damos as boas-vindas à Empresa X, novo cliente Ongoing.",
    autor: { nome: "Marina Costa", iniciais: "MC" }, destinatarios: "Empresa X", segmento: "empresa",
    enviadoEm: "18/04/2026", status: "enviado",
    leitores: [{ nome: "Camila Souza", iniciais: "CS", lidoEm: "18/04 14:00" }],
    reacoes: { thumbs: 12, heart: 7, smile: 2 },
  },
  { id: "C-004", titulo: "Procedimento de auditoria — rascunho", corpo: "Documento em revisão.",
    autor: { nome: "Ana Beatriz", iniciais: "AB" }, destinatarios: "Time interno", segmento: "role",
    status: "rascunho",
    leitores: [], reacoes: { thumbs: 0, heart: 0, smile: 0 },
  },
  { id: "C-005", titulo: "Comunicado de feriado prolongado", corpo: "Expediente especial entre 21 e 22/04.",
    autor: { nome: "Diego Alves", iniciais: "DA" }, destinatarios: "Todos", segmento: "filial",
    agendadoPara: "30/04/2026 08:00", status: "agendado",
    leitores: [], reacoes: { thumbs: 0, heart: 0, smile: 0 },
  },
];

function StatusPill({ s }: { s: StatusC }) {
  const map: Record<StatusC, { l: string; c: string }> = {
    rascunho: { l: "Rascunho",  c: "bg-[#424447]/20 text-muted-foreground border-border" },
    agendado: { l: "Agendado",  c: "bg-amber-500/15 text-amber-500 border-amber-500/30" },
    enviado:  { l: "Enviado",   c: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30" },
  };
  return <span className={cn("badge-pill", map[s].c)}>{map[s].l}</span>;
}

function CopyBtn({ value }: { value: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(value); setDone(true); setTimeout(() => setDone(false), 1200); }}
      className="opacity-0 group-hover:opacity-100 inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-opacity"
      title="Copiar"
    >
      {done ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

function pctLeitura(c: Comunicado) {
  if (c.leitores.length === 0) return 0;
  const lidos = c.leitores.filter((l) => !!l.lidoEm).length;
  return Math.round((lidos / c.leitores.length) * 100);
}

export default function ComunicadosPage() {
  const [busca, setBusca]       = useState("");
  const [status, setStatus]     = useState<StatusC | "all">("all");
  const [segmento, setSegmento] = useState<Segmento | "all">("all");
  const [novoOpen, setNovoOpen] = useState(false);
  const [sel, setSel]           = useState<Comunicado | null>(null);

  const lista = useMemo(() => COMUNICADOS.filter((c) => {
    if (status !== "all" && c.status !== status) return false;
    if (segmento !== "all" && c.segmento !== segmento) return false;
    if (busca && !`${c.titulo} ${c.destinatarios}`.toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  }), [busca, status, segmento]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Comunicados"
        subtitle="Crie, segmente e acompanhe a leitura"
        actions={
          <Button onClick={() => setNovoOpen(true)} className="rounded-[100px] bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white">
            <Plus className="h-4 w-4" /> Novo comunicado
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="relative md:col-span-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por título ou destinatário…" className="pl-9 rounded-[100px]" />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as StatusC | "all")}>
          <SelectTrigger className="md:col-span-3 rounded-[100px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="rascunho">Rascunho</SelectItem>
            <SelectItem value="agendado">Agendado</SelectItem>
            <SelectItem value="enviado">Enviado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={segmento} onValueChange={(v) => setSegmento(v as Segmento | "all")}>
          <SelectTrigger className="md:col-span-3 rounded-[100px]"><SelectValue placeholder="Segmento" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os segmentos</SelectItem>
            <SelectItem value="empresa">Por empresa</SelectItem>
            <SelectItem value="role">Por role</SelectItem>
            <SelectItem value="filial">Por filial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-[34%]">Título</TableHead>
              <TableHead className="w-[18%]">Destinatários</TableHead>
              <TableHead className="w-[14%]">Status</TableHead>
              <TableHead className="w-[14%]">Data de envio</TableHead>
              <TableHead className="w-[20%]">% de leitura</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lista.map((c) => {
              const pct = pctLeitura(c);
              return (
                <TableRow key={c.id} onClick={() => setSel(c)} className="cursor-pointer group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-md bg-[#034C8B] text-white flex items-center justify-center text-xs font-semibold shrink-0">
                        {c.autor.iniciais}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{c.titulo}</div>
                        <div className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
                          <span className="font-mono">{c.id}</span><CopyBtn value={c.id} />
                          <span>· por {c.autor.nome}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{c.destinatarios}</TableCell>
                  <TableCell><StatusPill s={c.status} /></TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {c.enviadoEm ?? c.agendadoPara ?? "—"}
                  </TableCell>
                  <TableCell>
                    {c.status === "enviado" ? (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-[#3B82F6]" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs tabular-nums text-muted-foreground w-9 text-right">{pct}%</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Detalhe + leitores */}
      <Dialog open={!!sel} onOpenChange={(v) => !v && setSel(null)}>
        <DialogContent className="sm:max-w-2xl rounded-xl">
          {sel && (
            <>
              <DialogHeader>
                <DialogTitle>{sel.titulo}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-md bg-[#034C8B] text-white flex items-center justify-center text-sm font-semibold">
                    {sel.autor.iniciais}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{sel.autor.nome}</div>
                    <div className="text-xs text-muted-foreground">
                      {sel.enviadoEm ? `Enviado em ${sel.enviadoEm}` : sel.agendadoPara ? `Agendado para ${sel.agendadoPara}` : "Rascunho"} · {sel.destinatarios}
                    </div>
                  </div>
                  <div className="ml-auto"><StatusPill s={sel.status} /></div>
                </div>

                <p className="text-sm whitespace-pre-line bg-muted/30 border border-border rounded-lg p-3">{sel.corpo}</p>

                <div className="flex items-center gap-3 text-sm">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[100px] border border-border">
                    <ThumbsUp className="h-3.5 w-3.5 text-[#3B82F6]" /> {sel.reacoes.thumbs}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[100px] border border-border">
                    <Heart className="h-3.5 w-3.5 text-rose-500" /> {sel.reacoes.heart}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[100px] border border-border">
                    <Smile className="h-3.5 w-3.5 text-amber-500" /> {sel.reacoes.smile}
                  </span>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Rastreamento de leitura</div>
                  <div className="rounded-lg border border-border divide-y divide-border max-h-64 overflow-y-auto">
                    {sel.leitores.length === 0 && (
                      <div className="p-4 text-sm text-muted-foreground text-center">Nenhum destinatário ainda.</div>
                    )}
                    {sel.leitores.map((l, i) => (
                      <div key={i} className="flex items-center gap-3 px-3 py-2">
                        <div className="h-8 w-8 rounded-md bg-[#3B82F6]/10 text-[#3B82F6] flex items-center justify-center text-xs font-semibold">
                          {l.iniciais}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">{l.nome}</div>
                          <div className="text-xs text-muted-foreground">
                            {l.lidoEm ? `Lido em ${l.lidoEm}` : "Ainda não lido"}
                          </div>
                        </div>
                        {l.lidoEm
                          ? <Eye className="h-4 w-4 text-emerald-500" />
                          : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" className="rounded-[100px]" onClick={() => setSel(null)}>
                  <X className="h-4 w-4" /> Fechar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Novo */}
      <Dialog open={novoOpen} onOpenChange={setNovoOpen}>
        <DialogContent className="sm:max-w-lg rounded-xl">
          <DialogHeader><DialogTitle>Novo comunicado</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5"><Label>Título</Label><Input placeholder="Título do comunicado" /></div>
            <div className="space-y-1.5"><Label>Corpo</Label><Textarea rows={5} placeholder="Escreva o conteúdo…" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Segmentação</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Tipo de segmento" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="empresa">Por empresa</SelectItem>
                    <SelectItem value="role">Por role</SelectItem>
                    <SelectItem value="filial">Por filial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Valor</Label><Input placeholder="Ex.: Empresa X / admin / SP" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Agendar (opcional)</Label><Input type="date" /></div>
              <div className="space-y-1.5"><Label>Hora</Label><Input type="time" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-[100px]" onClick={() => setNovoOpen(false)}>Salvar rascunho</Button>
            <Button className="rounded-[100px] bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white" onClick={() => setNovoOpen(false)}>Enviar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
