import { useMemo, useState, type FormEvent } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { Plus, Inbox } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

// ---------- Types ----------
type TipoSolicitacao =
  | "duvida"
  | "reuniao"
  | "suporte"
  | "ajuste"
  | "novo_usuario"
  | "outro";
type Urgencia = "alta" | "media" | "baixa";
type StatusSolicitacao =
  | "aberta"
  | "andamento"
  | "aguardando_cliente"
  | "finalizada"
  | "cancelada";

interface Solicitacao {
  id: string;
  codigo: string;
  tipo: TipoSolicitacao;
  titulo: string;
  urgencia: Urgencia;
  status: StatusSolicitacao;
  empresaId: string;
  criadaEm: string; // ISO
}

// ---------- Labels ----------
const TIPO_LABEL: Record<TipoSolicitacao, string> = {
  duvida: "Dúvida",
  reuniao: "Solicitação de reunião",
  suporte: "Suporte técnico",
  ajuste: "Ajuste em projeto/entregável",
  novo_usuario: "Solicitação de novo usuário",
  outro: "Outro",
};

const URGENCIA_LABEL: Record<Urgencia, string> = {
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
};

const STATUS_LABEL: Record<StatusSolicitacao, string> = {
  aberta: "Aberta",
  andamento: "Em andamento",
  aguardando_cliente: "Aguardando cliente",
  finalizada: "Finalizada",
  cancelada: "Cancelada",
};

const STATUS_ORDEM: StatusSolicitacao[] = [
  "aberta",
  "andamento",
  "aguardando_cliente",
  "finalizada",
  "cancelada",
];

// ---------- Mock ----------
const MOCK: Solicitacao[] = [
  {
    id: "s-71",
    codigo: "SOL-2026-0071",
    tipo: "ajuste",
    titulo: "Revisar escopo do entregável Mapa de Cargos",
    urgencia: "alta",
    status: "andamento",
    empresaId: "kentaki",
    criadaEm: "2026-04-18T14:20:00Z",
  },
  {
    id: "s-68",
    codigo: "SOL-2026-0068",
    tipo: "reuniao",
    titulo: "Agendar alinhamento mensal com a consultora",
    urgencia: "media",
    status: "aguardando_cliente",
    empresaId: "kentaki",
    criadaEm: "2026-04-15T10:05:00Z",
  },
  {
    id: "s-64",
    codigo: "SOL-2026-0064",
    tipo: "novo_usuario",
    titulo: "Adicionar acesso para Joana — RH",
    urgencia: "media",
    status: "aberta",
    empresaId: "kentaki",
    criadaEm: "2026-04-12T09:30:00Z",
  },
  {
    id: "s-59",
    codigo: "SOL-2026-0059",
    tipo: "suporte",
    titulo: "Erro ao baixar boleto de fevereiro",
    urgencia: "baixa",
    status: "finalizada",
    empresaId: "kentaki",
    criadaEm: "2026-03-28T16:45:00Z",
  },
  {
    id: "s-50",
    codigo: "SOL-2026-0050",
    tipo: "duvida",
    titulo: "Como funcionam os relatórios de Gestão de Conta?",
    urgencia: "baixa",
    status: "cancelada",
    empresaId: "kentaki",
    criadaEm: "2026-03-12T11:15:00Z",
  },
];

// ---------- Pill helpers ----------
function urgenciaClasses(u: Urgencia) {
  if (u === "alta") return "bg-destructive/15 text-destructive border-destructive/30";
  if (u === "media") return "bg-warning/15 text-warning border-warning/30";
  return "bg-muted text-muted-foreground border-border";
}

function statusClasses(s: StatusSolicitacao) {
  if (s === "aberta") return "bg-info/15 text-info border-info/30";
  if (s === "andamento") return "bg-success/15 text-success border-success/30";
  if (s === "aguardando_cliente") return "bg-warning/15 text-warning border-warning/30";
  return "bg-muted text-muted-foreground border-border";
}

const PILL_BASE =
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap";

// ---------- Form initial ----------
const FORM_INICIAL = {
  tipo: "duvida" as TipoSolicitacao,
  titulo: "",
  urgencia: "media" as Urgencia,
  descricao: "",
};

export default function SolicitacoesClientePage() {
  const { user } = useAuth();
  const empresaId = user?.empresaId ?? "";

  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>(() =>
    MOCK.filter((s) => (empresaId ? s.empresaId === empresaId : true))
  );
  const [filtro, setFiltro] = useState<"todos" | StatusSolicitacao>("todos");
  const [modalAberto, setModalAberto] = useState(false);
  const [form, setForm] = useState(FORM_INICIAL);

  const lista = useMemo(() => {
    const base =
      filtro === "todos"
        ? solicitacoes
        : solicitacoes.filter((s) => s.status === filtro);
    return [...base].sort(
      (a, b) => new Date(b.criadaEm).getTime() - new Date(a.criadaEm).getTime()
    );
  }, [solicitacoes, filtro]);

  const contagens = useMemo(() => {
    const mapa: Record<StatusSolicitacao | "todos", number> = {
      todos: solicitacoes.length,
      aberta: 0,
      andamento: 0,
      aguardando_cliente: 0,
      finalizada: 0,
      cancelada: 0,
    };
    for (const s of solicitacoes) mapa[s.status] += 1;
    return mapa;
  }, [solicitacoes]);

  function resetForm() {
    setForm(FORM_INICIAL);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.titulo.trim() || !form.descricao.trim()) {
      toast.error("Preencha título e descrição para enviar a solicitação.");
      return;
    }
    const ano = new Date().getFullYear();
    const sufixo = Math.floor(1000 + Math.random() * 9000);
    const codigo = `SOL-${ano}-${sufixo}`;
    const nova: Solicitacao = {
      id: `s-${sufixo}-${Date.now()}`,
      codigo,
      tipo: form.tipo,
      titulo: form.titulo.trim(),
      urgencia: form.urgencia,
      status: "aberta",
      empresaId: empresaId || "kentaki",
      criadaEm: new Date().toISOString(),
    };
    setSolicitacoes((prev) => [nova, ...prev]);
    setModalAberto(false);
    resetForm();
    toast.success(`Solicitação ${codigo} criada com sucesso`, {
      description: "Sua consultora será notificada em instantes.",
    });
  }

  return (
    <>
      <PageHeader
        title="Solicitações"
        subtitle="Acompanhe e abra novos pedidos para sua consultora."
        actions={
          <Button size="sm" onClick={() => setModalAberto(true)}>
            <Plus className="h-4 w-4" />
            Nova solicitação
          </Button>
        }
      />

      {/* Pills de filtro */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Button
          size="sm"
          variant={filtro === "todos" ? "default" : "outline"}
          className="rounded-full"
          onClick={() => setFiltro("todos")}
        >
          Todos ({contagens.todos})
        </Button>
        {STATUS_ORDEM.map((s) => (
          <Button
            key={s}
            size="sm"
            variant={filtro === s ? "default" : "outline"}
            className="rounded-full"
            onClick={() => setFiltro(s)}
          >
            {STATUS_LABEL[s]} ({contagens[s]})
          </Button>
        ))}
      </div>

      {/* Lista */}
      <Card className="glass">
        <CardContent className="p-0">
          {lista.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="Nenhuma solicitação por aqui"
              description={
                filtro === "todos"
                  ? "Quando você abrir um pedido para sua consultora, ele aparece aqui."
                  : "Nenhuma solicitação neste status. Tente outro filtro."
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">Código</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead className="w-[110px]">Urgência</TableHead>
                  <TableHead className="w-[170px]">Status</TableHead>
                  <TableHead className="w-[130px]">Criada em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lista.map((s) => {
                  const cancelada = s.status === "cancelada";
                  return (
                    <TableRow key={s.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {s.codigo}
                      </TableCell>
                      <TableCell className="text-sm">{TIPO_LABEL[s.tipo]}</TableCell>
                      <TableCell
                        className={cn(
                          "text-sm font-medium",
                          cancelada && "line-through text-muted-foreground"
                        )}
                      >
                        {s.titulo}
                      </TableCell>
                      <TableCell>
                        <span className={cn(PILL_BASE, urgenciaClasses(s.urgencia))}>
                          {URGENCIA_LABEL[s.urgencia]}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            PILL_BASE,
                            statusClasses(s.status),
                            cancelada && "line-through"
                          )}
                        >
                          {STATUS_LABEL[s.status]}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(s.criadaEm), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal nova solicitação */}
      <Dialog
        open={modalAberto}
        onOpenChange={(open) => {
          setModalAberto(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Nova solicitação</DialogTitle>
              <DialogDescription>
                Sua consultora receberá o pedido e dará retorno por aqui.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo</Label>
                <Select
                  value={form.tipo}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, tipo: v as TipoSolicitacao }))
                  }
                >
                  <SelectTrigger id="tipo">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(TIPO_LABEL) as TipoSolicitacao[]).map((t) => (
                      <SelectItem key={t} value={t}>
                        {TIPO_LABEL[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="urgencia">Urgência</Label>
                <Select
                  value={form.urgencia}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, urgencia: v as Urgencia }))
                  }
                >
                  <SelectTrigger id="urgencia">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(URGENCIA_LABEL) as Urgencia[]).map((u) => (
                      <SelectItem key={u} value={u}>
                        {URGENCIA_LABEL[u]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                value={form.titulo}
                onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
                placeholder="Resumo curto do pedido"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                rows={4}
                value={form.descricao}
                onChange={(e) =>
                  setForm((f) => ({ ...f, descricao: e.target.value }))
                }
                placeholder="Conte com detalhes o que você precisa."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="empresa">Empresa</Label>
              <Input id="empresa" value={empresaId} disabled />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setModalAberto(false);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">Enviar solicitação</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
