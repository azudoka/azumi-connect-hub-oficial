import { useMemo, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { Plus, Inbox } from "lucide-react";

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
  DialogTrigger,
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

import { useAuth } from "@/context/AuthContext";
import { empresas } from "@/data/mock";

// =====================================================================
// Tipos
// =====================================================================

type StatusSolicitacao =
  | "aberta"
  | "andamento"
  | "aguardando_cliente"
  | "finalizada"
  | "cancelada";

type Urgencia = "alta" | "media" | "baixa";

type TipoSolicitacao =
  | "duvida"
  | "reuniao"
  | "suporte"
  | "ajuste"
  | "novo_usuario"
  | "outro";

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

// =====================================================================
// Tabelas auxiliares
// =====================================================================

const TIPO_LABEL: Record<TipoSolicitacao, string> = {
  duvida: "Dúvida",
  reuniao: "Solicitação de reunião",
  suporte: "Suporte técnico",
  ajuste: "Ajuste em projeto/entregável",
  novo_usuario: "Solicitação de novo usuário",
  outro: "Outro",
};

const STATUS_LABEL: Record<StatusSolicitacao, string> = {
  aberta: "Aberta",
  andamento: "Em andamento",
  aguardando_cliente: "Aguardando cliente",
  finalizada: "Finalizada",
  cancelada: "Cancelada",
};

const STATUS_CLS: Record<StatusSolicitacao, string> = {
  aberta: "bg-info/15 text-info border-info/30",
  andamento: "bg-success/15 text-success border-success/30",
  aguardando_cliente: "bg-warning/15 text-warning border-warning/30",
  finalizada: "bg-muted text-muted-foreground border-border",
  cancelada: "bg-muted text-muted-foreground border-border line-through",
};

const URGENCIA_LABEL: Record<Urgencia, string> = {
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
};

const URGENCIA_CLS: Record<Urgencia, string> = {
  alta: "bg-destructive/15 text-destructive border-destructive/30",
  media: "bg-warning/15 text-warning border-warning/30",
  baixa: "bg-muted text-muted-foreground border-border",
};

// Ordem usada nos filtros e nos selects
const STATUS_ORDEM: StatusSolicitacao[] = [
  "aberta",
  "andamento",
  "aguardando_cliente",
  "finalizada",
  "cancelada",
];

const URGENCIA_ORDEM: Urgencia[] = ["alta", "media", "baixa"];

const TIPO_ORDEM: TipoSolicitacao[] = [
  "duvida",
  "reuniao",
  "suporte",
  "ajuste",
  "novo_usuario",
  "outro",
];

// =====================================================================
// Mock inicial — 5 solicitações distribuídas por todos os status
// =====================================================================

const MOCK_SOLICITACOES: Solicitacao[] = [
  {
    id: "s1",
    codigo: "SOL-2026-0071",
    tipo: "ajuste",
    titulo: "Revisar escopo do entregável Mapa de Cargos",
    urgencia: "alta",
    status: "andamento",
    empresaId: "kentaki",
    criadaEm: "2026-04-18T13:20:00",
  },
  {
    id: "s2",
    codigo: "SOL-2026-0068",
    tipo: "reuniao",
    titulo: "Agendar alinhamento mensal com a consultora",
    urgencia: "media",
    status: "aguardando_cliente",
    empresaId: "kentaki",
    criadaEm: "2026-04-15T09:00:00",
  },
  {
    id: "s3",
    codigo: "SOL-2026-0064",
    tipo: "novo_usuario",
    titulo: "Adicionar acesso para Joana — RH",
    urgencia: "media",
    status: "aberta",
    empresaId: "kentaki",
    criadaEm: "2026-04-12T16:42:00",
  },
  {
    id: "s4",
    codigo: "SOL-2026-0059",
    tipo: "suporte",
    titulo: "Erro ao baixar boleto de fevereiro",
    urgencia: "baixa",
    status: "finalizada",
    empresaId: "kentaki",
    criadaEm: "2026-04-05T10:15:00",
  },
  {
    id: "s5",
    codigo: "SOL-2026-0050",
    tipo: "duvida",
    titulo: "Como funcionam os relatórios de Gestão de Conta?",
    urgencia: "baixa",
    status: "cancelada",
    empresaId: "kentaki",
    criadaEm: "2026-03-28T14:00:00",
  },
];

// =====================================================================
// Helpers
// =====================================================================

function gerarCodigo(): string {
  const ano = new Date().getFullYear();
  const num = String(Math.floor(1000 + Math.random() * 9000));
  return `SOL-${ano}-${num}`;
}

// =====================================================================
// Componente
// =====================================================================

type FiltroStatus = StatusSolicitacao | "todos";

export default function ClienteSolicitacoes() {
  const { user } = useAuth();
  const empresaId = user?.empresaId ?? "kentaki";
  const empresaNome = useMemo(
    () => empresas.find((e) => e.id === empresaId)?.nome ?? "Minha empresa",
    [empresaId]
  );

  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>(
    MOCK_SOLICITACOES.filter((s) => s.empresaId === empresaId)
  );
  const [filtro, setFiltro] = useState<FiltroStatus>("todos");
  const [modalAberto, setModalAberto] = useState(false);

  // Form state
  const [tipo, setTipo] = useState<TipoSolicitacao>("duvida");
  const [titulo, setTitulo] = useState("");
  const [urgencia, setUrgencia] = useState<Urgencia>("media");
  const [descricao, setDescricao] = useState("");

  const lista = useMemo(() => {
    const base =
      filtro === "todos"
        ? solicitacoes
        : solicitacoes.filter((s) => s.status === filtro);
    return [...base].sort(
      (a, b) => new Date(b.criadaEm).getTime() - new Date(a.criadaEm).getTime()
    );
  }, [solicitacoes, filtro]);

  function resetForm() {
    setTipo("duvida");
    setTitulo("");
    setUrgencia("media");
    setDescricao("");
  }

  function handleCriar(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim()) {
      toast.error("Informe um título para a solicitação.");
      return;
    }
    if (!descricao.trim()) {
      toast.error("Descreva sua solicitação.");
      return;
    }

    const codigo = gerarCodigo();
    const nova: Solicitacao = {
      id: `s-${Date.now()}`,
      codigo,
      tipo,
      titulo: titulo.trim(),
      urgencia,
      status: "aberta",
      empresaId,
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
        title="Minhas solicitações"
        subtitle={`Histórico de pedidos da ${empresaNome}`}
        actions={
          <Dialog
            open={modalAberto}
            onOpenChange={(open) => {
              setModalAberto(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nova solicitação
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Nova solicitação</DialogTitle>
                <DialogDescription>
                  Sua consultora receberá o pedido e dará retorno por aqui.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCriar} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo</Label>
                    <Select
                      value={tipo}
                      onValueChange={(v) => setTipo(v as TipoSolicitacao)}
                    >
                      <SelectTrigger id="tipo">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIPO_ORDEM.map((t) => (
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
                      value={urgencia}
                      onValueChange={(v) => setUrgencia(v as Urgencia)}
                    >
                      <SelectTrigger id="urgencia">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {URGENCIA_ORDEM.map((u) => (
                          <SelectItem key={u} value={u}>
                            {URGENCIA_LABEL[u]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="titulo">
                    Título <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="titulo"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ex: Reagendar reunião de alinhamento"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">
                    Descrição <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="descricao"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    rows={4}
                    placeholder="Detalhe sua solicitação para agilizar o atendimento."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="empresa">Empresa</Label>
                  <Input id="empresa" value={empresaNome} disabled />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setModalAberto(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">Enviar solicitação</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Filtros por status — bug A21 corrigido */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <FiltroPill
          ativo={filtro === "todos"}
          onClick={() => setFiltro("todos")}
        >
          Todos
          <span className="ml-1.5 opacity-70">({solicitacoes.length})</span>
        </FiltroPill>
        {STATUS_ORDEM.map((s) => {
          const count = solicitacoes.filter((x) => x.status === s).length;
          return (
            <FiltroPill
              key={s}
              ativo={filtro === s}
              onClick={() => setFiltro(s)}
            >
              {STATUS_LABEL[s]}
              <span className="ml-1.5 opacity-70">({count})</span>
            </FiltroPill>
          );
        })}
      </div>

      <section className="mt-4">
        <Card>
          <CardContent className="p-0">
            {lista.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  icon={Inbox}
                  title="Nenhuma solicitação encontrada"
                  description={
                    filtro === "todos"
                      ? "Você ainda não criou nenhuma solicitação."
                      : `Nenhuma solicitação com status "${STATUS_LABEL[filtro]}".`
                  }
                />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Código</TableHead>
                    <TableHead className="w-[200px]">Tipo</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead className="w-[110px]">Urgência</TableHead>
                    <TableHead className="w-[170px]">Status</TableHead>
                    <TableHead className="w-[140px] text-right">
                      Criada em
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lista.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-data">{s.codigo}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {TIPO_LABEL[s.tipo]}
                      </TableCell>
                      <TableCell className="font-medium">{s.titulo}</TableCell>
                      <TableCell>
                        <span
                          className={cn("badge-pill", URGENCIA_CLS[s.urgencia])}
                        >
                          {URGENCIA_LABEL[s.urgencia]}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={cn("badge-pill", STATUS_CLS[s.status])}>
                          <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                          {STATUS_LABEL[s.status]}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-data tabular-nums text-muted-foreground">
                        {format(new Date(s.criadaEm), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </section>
    </>
  );
}

// =====================================================================
// Pill de filtro
// =====================================================================

function FiltroPill({
  ativo,
  onClick,
  children,
}: {
  ativo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "badge-pill cursor-pointer transition-colors",
        ativo
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-foreground/30"
      )}
    >
      {children}
    </button>
  );
}
