import { useMemo, useState, type FormEvent } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import {
  Plus,
  Inbox,
  ChevronDown,
  MessageSquare,
  Clock,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Send,
  Pencil,
  Trash2,
} from "lucide-react";

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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// ---------- Types ----------
type TipoSolicitacao =
  | "duvida"
  | "reuniao"
  | "suporte"
  | "ajuste_projeto"
  | "novo_usuario"
  | "outro";
type Urgencia = "alta" | "media" | "baixa";
type StatusSolicitacao =
  | "aberta"
  | "andamento"
  | "aguardando_cliente"
  | "finalizada"
  | "cancelada";

interface MensagemHistorico {
  autor: string;
  texto: string;
  data: string; // ISO
  enviadoEm?: number;
  editadoEm?: string;
}

interface Solicitacao {
  id: string;
  codigo: string;
  tipo: TipoSolicitacao;
  titulo: string;
  descricao: string;
  urgencia: Urgencia;
  status: StatusSolicitacao;
  empresaId: string;
  consultor?: string;
  criadaEm: string; // ISO
  historico?: MensagemHistorico[];
}

// ---------- Labels ----------
const TIPO_LABEL: Record<TipoSolicitacao, string> = {
  duvida: "Dúvida",
  reuniao: "Solicitação de reunião",
  suporte: "Suporte técnico",
  ajuste_projeto: "Ajuste em projeto/entregável",
  novo_usuario: "Solicitar novo usuário",
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
  aguardando_cliente: "Aguardando você",
  finalizada: "Finalizada",
  cancelada: "Cancelada",
};

// Status agrupados nos 4 cards (cancelada vive escondida e só aparece quando filtrar)
type CardKey = "aberta" | "andamento" | "aguardando_cliente" | "finalizada";

const CARDS: { key: CardKey; label: string; icon: typeof MessageSquare; tone: string }[] = [
  { key: "aberta", label: "Abertas", icon: MessageSquare, tone: "info" },
  { key: "andamento", label: "Em andamento", icon: Clock, tone: "success" },
  { key: "aguardando_cliente", label: "Aguardando", icon: AlertCircle, tone: "warning" },
  { key: "finalizada", label: "Finalizadas", icon: CheckCircle2, tone: "muted" },
];

// ---------- Mock ----------
const MOCK: Solicitacao[] = [
  {
    id: "s-71",
    codigo: "SOL-2026-0071",
    tipo: "ajuste_projeto",
    titulo: "Revisar escopo do entregável Mapa de Cargos",
    descricao:
      "Precisamos rever a estrutura do nível 3 — gerentes de área. A consultora ficou de propor nova matriz na próxima reunião.",
    urgencia: "alta",
    status: "andamento",
    empresaId: "kentaki",
    consultor: "Ana Beatriz",
    criadaEm: "2026-04-18T14:20:00Z",
    historico: [
      {
        autor: "Ana Beatriz",
        texto: "Recebido. Vou trazer a proposta na quinta.",
        data: "2026-04-19T09:10:00Z",
      },
      {
        autor: "Você",
        texto: "Perfeito, obrigada!",
        data: "2026-04-19T09:32:00Z",
      },
    ],
  },
  {
    id: "s-68",
    codigo: "SOL-2026-0068",
    tipo: "reuniao",
    titulo: "Agendar alinhamento mensal com a consultora",
    descricao: "Sugerir 3 horários na semana que vem para alinhamento mensal.",
    urgencia: "media",
    status: "aguardando_cliente",
    empresaId: "kentaki",
    consultor: "Ana Beatriz",
    criadaEm: "2026-04-15T10:05:00Z",
    historico: [
      {
        autor: "Ana Beatriz",
        texto: "Mandei 3 opções no e-mail, pode me confirmar?",
        data: "2026-04-16T15:22:00Z",
      },
    ],
  },
  {
    id: "s-64",
    codigo: "SOL-2026-0064",
    tipo: "novo_usuario",
    titulo: "Adicionar acesso para Joana — RH",
    descricao:
      "Joana Martins · joana.martins@kentaki.com · Analista de RH. Precisa acessar Projetos e Solicitações.",
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
    descricao:
      "Ao clicar em baixar, retorna 404. Já tentei outro navegador e o erro continua.",
    urgencia: "baixa",
    status: "finalizada",
    empresaId: "kentaki",
    consultor: "Suporte Azumi",
    criadaEm: "2026-03-28T16:45:00Z",
    historico: [
      {
        autor: "Suporte Azumi",
        texto: "Boleto reenviado, link funcionando agora.",
        data: "2026-03-29T11:08:00Z",
      },
    ],
  },
  {
    id: "s-50",
    codigo: "SOL-2026-0050",
    tipo: "duvida",
    titulo: "Como funcionam os relatórios de Gestão de Conta?",
    descricao: "Cancelado — encontramos a resposta no FAQ.",
    urgencia: "baixa",
    status: "cancelada",
    empresaId: "kentaki",
    criadaEm: "2026-03-12T11:15:00Z",
  },
];

// ---------- Helpers ----------
function urgenciaPill(u: Urgencia) {
  if (u === "alta") return "bg-destructive/15 text-destructive border-destructive/30";
  if (u === "media") return "bg-warning/15 text-warning border-warning/30";
  return "bg-muted text-muted-foreground border-border";
}
function statusPill(s: StatusSolicitacao) {
  if (s === "aberta") return "bg-info/15 text-info border-info/30";
  if (s === "andamento") return "bg-success/15 text-success border-success/30";
  if (s === "aguardando_cliente") return "bg-warning/15 text-warning border-warning/30";
  if (s === "cancelada")
    return "bg-muted text-muted-foreground border-border line-through";
  return "bg-muted text-muted-foreground border-border";
}
const PILL_BASE =
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap";

const TONE_CARD: Record<string, { ring: string; bg: string; text: string; icon: string }> = {
  info: {
    ring: "ring-info/30",
    bg: "bg-info/10",
    text: "text-info",
    icon: "text-info",
  },
  success: {
    ring: "ring-success/30",
    bg: "bg-success/10",
    text: "text-success",
    icon: "text-success",
  },
  warning: {
    ring: "ring-warning/30",
    bg: "bg-warning/10",
    text: "text-warning",
    icon: "text-warning",
  },
  muted: {
    ring: "ring-border",
    bg: "bg-muted/40",
    text: "text-muted-foreground",
    icon: "text-muted-foreground",
  },
};

const URGENCIA_DOT: Record<Urgencia, string> = {
  alta: "bg-destructive",
  media: "bg-warning",
  baixa: "bg-muted-foreground/40",
};

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
  const [sheetAberto, setSheetAberto] = useState(false);
  const [form, setForm] = useState(FORM_INICIAL);
  const [expandidos, setExpandidos] = useState<Record<string, boolean>>({});
  const [conversaAberta, setConversaAberta] = useState<Solicitacao | null>(null);
  const [cancelarSol, setCancelarSol] = useState<Solicitacao | null>(null);

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
    const mapa: Record<CardKey | "todos" | "cancelada", number> = {
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

  function toggleExpand(id: string) {
    setExpandidos((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.titulo.trim() || !form.descricao.trim()) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    const ano = new Date().getFullYear();
    const sufixo = String(Math.floor(Math.random() * 9000) + 1000);
    const codigo = `SOL-${ano}-${sufixo}`;
    const nova: Solicitacao = {
      id: `s-${sufixo}-${Date.now()}`,
      codigo,
      tipo: form.tipo,
      titulo: form.titulo.trim(),
      descricao: form.descricao.trim(),
      urgencia: form.urgencia,
      status: "aberta",
      empresaId: empresaId || "kentaki",
      criadaEm: new Date().toISOString(),
    };
    setSolicitacoes((prev) => [nova, ...prev]);
    setSheetAberto(false);
    resetForm();
    toast.success(`Solicitação criada — protocolo ${codigo}`);
  }

  return (
    <>
      <PageHeader
        title="Minhas Solicitações"
        subtitle="Acompanhe e abra novos pedidos para sua consultora."
        actions={
          <Button
            size="sm"
            className="rounded-full"
            onClick={() => setSheetAberto(true)}
          >
            <Plus className="h-4 w-4" />
            Nova solicitação
          </Button>
        }
      />

      {/* Pill "Todas" — reset do filtro */}
      <div className="mb-4">
        <Button
          size="sm"
          variant={filtro === "todos" ? "default" : "outline"}
          className="rounded-full"
          onClick={() => setFiltro("todos")}
        >
          Todas ({contagens.todos})
        </Button>
      </div>

      {/* 4 cards de contagem clicáveis */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {CARDS.map(({ key, label, icon: Icon, tone }) => {
          const ativo = filtro === key;
          const t = TONE_CARD[tone];
          return (
            <button
              key={key}
              type="button"
              onClick={() => setFiltro(key)}
              className={cn(
                "rounded-2xl border bg-card p-4 text-left transition-all",
                "hover:border-primary/40 hover:shadow-card",
                ativo && "border-primary ring-1 ring-primary"
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "h-9 w-9 rounded-xl flex items-center justify-center",
                    t.bg
                  )}
                >
                  <Icon className={cn("h-4.5 w-4.5", t.icon)} size={18} />
                </span>
                <span className="font-display text-2xl font-semibold tabular-nums">
                  {contagens[key]}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{label}</p>
            </button>
          );
        })}
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {lista.length === 0 ? (
          <Card className="glass">
            <CardContent className="p-0">
              <EmptyState
                icon={Inbox}
                title="Nenhuma solicitação por aqui"
                description={
                  filtro === "todos"
                    ? "Quando você abrir um pedido para sua consultora, ele aparece aqui."
                    : "Nenhuma solicitação neste status. Tente outro filtro."
                }
              />
            </CardContent>
          </Card>
        ) : (
          lista.map((s) => {
            const aberto = !!expandidos[s.id];
            const cancelada = s.status === "cancelada";
            const ultimas = (s.historico ?? []).slice(-2);
            return (
              <Card
                key={s.id}
                className={cn(
                  "transition-shadow",
                  aberto ? "shadow-card" : "hover:shadow-card"
                )}
              >
                <CardContent className="p-0">
                  {/* Linha principal */}
                  <button
                    type="button"
                    onClick={() => toggleExpand(s.id)}
                    className="w-full text-left p-4 flex items-start gap-3"
                    aria-expanded={aberto}
                  >
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                        <span className="font-data text-xs text-muted-foreground">
                          {s.codigo}
                        </span>
                        <span
                          className={cn(
                            "text-sm font-semibold truncate",
                            cancelada && "line-through text-muted-foreground"
                          )}
                        >
                          {s.titulo}
                        </span>
                        <span className={cn(PILL_BASE, statusPill(s.status))}>
                          {STATUS_LABEL[s.status]}
                        </span>
                        <span className={cn(PILL_BASE, urgenciaPill(s.urgencia))}>
                          <span
                            className={cn("h-1.5 w-1.5 rounded-full", URGENCIA_DOT[s.urgencia])}
                          />
                          {URGENCIA_LABEL[s.urgencia]}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <span>{TIPO_LABEL[s.tipo]}</span>
                        <span>·</span>
                        <span>
                          {format(new Date(s.criadaEm), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform shrink-0 mt-1",
                        aberto && "rotate-180"
                      )}
                    />
                  </button>

                  {/* Painel expandido */}
                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-200 ease-out",
                      aberto ? "max-h-[28rem]" : "max-h-0"
                    )}
                  >
                    <div className="px-4 pb-4 pt-0 border-t border-border/60 space-y-4">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Descrição
                        </p>
                        <p className="text-sm text-foreground/90 whitespace-pre-line">
                          {s.descricao}
                        </p>
                      </div>

                      {s.consultor && (
                        <div className="text-xs text-muted-foreground">
                          Consultor responsável:{" "}
                          <span className="text-foreground font-medium">{s.consultor}</span>
                        </div>
                      )}

                      {ultimas.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-2">
                            Últimas mensagens
                          </p>
                          <div className="space-y-2">
                            {ultimas.map((m, i) => {
                              const isMe = m.autor === "Você";
                              return (
                                <div key={i}
                                  className={cn("flex gap-2 items-end",
                                    isMe && "flex-row-reverse")}>
                                  {!isMe && (
                                    <div className="h-6 w-6 rounded-md bg-gradient-brand flex items-center justify-center text-[9px] font-semibold text-white shrink-0">
                                      {m.autor.charAt(0)}
                                    </div>
                                  )}
                                  <div className={cn(
                                    "max-w-[80%] rounded-xl px-3 py-2 text-xs",
                                    isMe
                                      ? "bg-primary text-primary-foreground rounded-br-sm"
                                      : "bg-muted text-foreground rounded-bl-sm"
                                  )}>
                                    {!isMe && (
                                      <div className="font-semibold mb-0.5 opacity-70">
                                        {m.autor}
                                      </div>
                                    )}
                                    <p>{m.texto}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="pt-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="rounded-full text-primary hover:text-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConversaAberta(s);
                          }}
                        >
                          Ver conversa completa
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                        {(s.status === "aberta" || s.status === "aguardando_cliente") && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="rounded-full text-destructive hover:text-destructive hover:bg-destructive/10 ml-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCancelarSol(s);
                            }}
                          >
                            Cancelar solicitação
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Dialog — Cancelar solicitação */}
      <Dialog
        open={!!cancelarSol}
        onOpenChange={(o) => !o && setCancelarSol(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Cancelar solicitação?
            </DialogTitle>
            <DialogDescription className="pt-1 space-y-2">
              <span className="block">
                Você está cancelando{" "}
                <strong className="text-foreground">{cancelarSol?.titulo}</strong>.
              </span>
              <span className="block text-warning font-medium text-sm">
                Atenção: as horas já trabalhadas nesta solicitação não serão devolvidas ao seu pacote.
              </span>
              <span className="block text-muted-foreground text-xs">
                Se preferir, entre em contato com sua consultora antes de cancelar.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelarSol(null)}>
              Voltar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!cancelarSol) return;
                setSolicitacoes((prev) =>
                  prev.map((s) =>
                    s.id === cancelarSol.id
                      ? { ...s, status: "cancelada" as StatusSolicitacao }
                      : s
                  )
                );
                toast.warning("Solicitação cancelada.", {
                  description:
                    "As horas já trabalhadas não foram devolvidas ao seu pacote.",
                });
                setCancelarSol(null);
              }}
            >
              Confirmar cancelamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sheet — Nova solicitação */}
      <Sheet
        open={sheetAberto}
        onOpenChange={(open) => {
          setSheetAberto(open);
          if (!open) resetForm();
        }}
      >
        <SheetContent className="sm:max-w-md w-full overflow-y-auto">
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <SheetHeader>
              <SheetTitle>Nova solicitação</SheetTitle>
              <SheetDescription>
                Sua consultora receberá o pedido e dará retorno por aqui.
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-4 py-4 flex-1">
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
                {form.tipo === "novo_usuario" && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Informe nome completo, e-mail e cargo do novo usuário no campo
                    Descrição.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  value={form.titulo}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, titulo: e.target.value }))
                  }
                  placeholder="Resumo da solicitação"
                />
              </div>

              <div className="space-y-2">
                <Label>Urgência</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(URGENCIA_LABEL) as Urgencia[]).map((u) => {
                    const ativo = form.urgencia === u;
                    return (
                      <button
                        key={u}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, urgencia: u }))}
                        className={cn(
                          "rounded-full border px-3 py-2 flex items-center justify-center gap-2 text-sm transition-colors",
                          ativo
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border hover:bg-muted/40"
                        )}
                        aria-pressed={ativo}
                      >
                        <span className={cn("h-2.5 w-2.5 rounded-full", URGENCIA_DOT[u])} />
                        {URGENCIA_LABEL[u]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  rows={4}
                  className="resize-none"
                  value={form.descricao}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, descricao: e.target.value }))
                  }
                  placeholder="Conte com detalhes o que você precisa."
                />
              </div>
            </div>

            <SheetFooter className="flex-row sm:justify-end gap-2 pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => {
                  setSheetAberto(false);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" className="rounded-full">
                Criar solicitação
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Sheet — Conversa completa */}
      <Sheet
        open={!!conversaAberta}
        onOpenChange={(o) => !o && setConversaAberta(null)}
      >
        <SheetContent className="sm:max-w-md w-full flex flex-col">
          <SheetHeader>
            <SheetTitle>{conversaAberta?.titulo}</SheetTitle>
            <SheetDescription>
              {conversaAberta?.codigo} · {conversaAberta?.consultor ?? "Azumi RH"}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto space-y-2 py-4 pr-1">
            {(conversaAberta?.historico ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">
                Nenhuma mensagem ainda.
              </p>
            )}
            {(conversaAberta?.historico ?? []).map((m, i) => (
              <MensagemChatCliente
                key={i}
                mensagem={m}
                index={i}
                onEditar={(idx, texto, editadoEm) => {
                  const atualizado = (conversaAberta?.historico ?? []).map((msg, j) =>
                    j === idx ? { ...msg, texto, editadoEm } : msg
                  );
                  setConversaAberta((prev) =>
                    prev ? { ...prev, historico: atualizado } : prev
                  );
                  setSolicitacoes((prev) =>
                    prev.map((s) =>
                      s.id === conversaAberta?.id ? { ...s, historico: atualizado } : s
                    )
                  );
                }}
                onExcluir={(idx) => {
                  const atualizado = (conversaAberta?.historico ?? []).filter(
                    (_, j) => j !== idx
                  );
                  setConversaAberta((prev) =>
                    prev ? { ...prev, historico: atualizado } : prev
                  );
                  setSolicitacoes((prev) =>
                    prev.map((s) =>
                      s.id === conversaAberta?.id ? { ...s, historico: atualizado } : s
                    )
                  );
                }}
              />
            ))}
          </div>

          {conversaAberta &&
            conversaAberta.status !== "finalizada" &&
            conversaAberta.status !== "cancelada" && (
              <ClienteRespostaInput
                onEnviar={(texto) => {
                  const nova: MensagemHistorico = {
                    autor: "Você",
                    texto,
                    data: new Date().toISOString(),
                    enviadoEm: Date.now(),
                  };
                  setSolicitacoes((prev) =>
                    prev.map((s) =>
                      s.id === conversaAberta.id
                        ? { ...s, historico: [...(s.historico ?? []), nova] }
                        : s
                    )
                  );
                  setConversaAberta((prev) =>
                    prev ? {
                      ...prev,
                      historico: [...(prev.historico ?? []), nova],
                    } : prev
                  );
                  toast.success("Mensagem enviada.");
                }}
              />
            )}
        </SheetContent>
      </Sheet>
    </>
  );
}

function ClienteRespostaInput({
  onEnviar,
}: {
  onEnviar: (texto: string) => void;
}) {
  const [texto, setTexto] = useState("");
  return (
    <div className="flex gap-2 items-end border-t border-border pt-3">
      <Textarea
        rows={2}
        placeholder="Escreva uma mensagem…"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        className="resize-none flex-1 text-sm rounded-xl"
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
        className="rounded-full gap-1.5 shrink-0"
        onClick={() => {
          if (texto.trim()) {
            onEnviar(texto.trim());
            setTexto("");
          }
        }}
      >
        <Send className="h-3.5 w-3.5" /> Enviar
      </Button>
    </div>
  );
}

function MensagemChatCliente({
  mensagem,
  index,
  onEditar,
  onExcluir,
}: {
  mensagem: MensagemHistorico;
  index: number;
  onEditar: (index: number, novoTexto: string, editadoEm: string) => void;
  onExcluir: (index: number) => void;
}) {
  const [editando, setEditando] = useState(false);
  const [textoEdit, setTextoEdit] = useState(mensagem.texto);
  const isMe = mensagem.autor === "Você";
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
      <div className="relative max-w-[80%]">
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
              {format(new Date(mensagem.data), "dd/MM HH:mm", { locale: ptBR })}
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
