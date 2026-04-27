import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronUp,
  MessagesSquare,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Tipo = "ferias" | "beneficio" | "holerite" | "documentos" | "outros";
const tipoLabel: Record<Tipo, string> = {
  ferias: "Férias",
  beneficio: "Ajuste de benefício",
  holerite: "Dúvida sobre holerite",
  documentos: "Documentos",
  outros: "Outros",
};
const tipoCls: Record<Tipo, string> = {
  ferias: "bg-info/15 text-info border-info/30",
  beneficio: "bg-primary/10 text-primary border-primary/30",
  holerite: "bg-warning/15 text-warning border-warning/30",
  documentos: "bg-success/15 text-success border-success/30",
  outros: "bg-muted text-muted-foreground border-border",
};

type StatusSol = "aberta" | "andamento" | "respondida" | "encerrada";
const statusStyle: Record<StatusSol, { label: string; cls: string }> = {
  aberta: { label: "Aberta", cls: "bg-info/15 text-info border-info/30" },
  andamento: { label: "Em andamento", cls: "bg-warning/15 text-warning border-warning/30" },
  respondida: { label: "Respondida", cls: "bg-success/15 text-success border-success/30" },
  encerrada: { label: "Encerrada", cls: "bg-muted text-muted-foreground border-border" },
};

type Urgencia = "alta" | "media" | "baixa";
const urgenciaStyle: Record<Urgencia, { label: string; cls: string }> = {
  alta: { label: "Alta", cls: "bg-destructive/15 text-destructive border-destructive/30" },
  media: { label: "Média", cls: "bg-warning/15 text-warning border-warning/30" },
  baixa: { label: "Baixa", cls: "bg-muted text-muted-foreground border-border" },
};

interface Mensagem {
  autor: string;
  data: string;
  texto: string;
}

interface Solicitacao {
  id: string;
  tipo: Tipo;
  data: string;
  status: StatusSol;
  urgencia: Urgencia;
  descricao: string;
  historico: Mensagem[];
}

const iniciais: Solicitacao[] = [
  {
    id: "s1",
    tipo: "documentos",
    data: "22/04/2026",
    status: "respondida",
    urgencia: "media",
    descricao:
      "Preciso de uma declaração de vínculo empregatício para apresentar no consulado para solicitação de visto.",
    historico: [
      { autor: "Marina Silva", data: "22/04/2026 09:14", texto: "Preciso da declaração para o consulado." },
      { autor: "RH — Camila", data: "22/04/2026 14:02", texto: "Olá, Marina! Sua declaração já foi gerada e enviada ao seu e-mail corporativo." },
    ],
  },
  {
    id: "s2",
    tipo: "beneficio",
    data: "18/04/2026",
    status: "andamento",
    urgencia: "alta",
    descricao:
      "Meu cartão de vale-alimentação não está aceitando recarga há dois meses. Já tentei pelo app e não funciona.",
    historico: [
      { autor: "Marina Silva", data: "18/04/2026 11:00", texto: "Cartão sem recarga há 2 meses." },
      { autor: "RH — Bruno", data: "19/04/2026 10:25", texto: "Estamos verificando junto à operadora. Retornamos até sexta." },
    ],
  },
  {
    id: "s3",
    tipo: "holerite",
    data: "10/03/2026",
    status: "encerrada",
    urgencia: "baixa",
    descricao: "Dúvida sobre desconto de IRRF no holerite de fevereiro.",
    historico: [
      { autor: "Marina Silva", data: "10/03/2026", texto: "Por que o IRRF aumentou em fevereiro?" },
      { autor: "RH — Camila", data: "11/03/2026", texto: "Ajuste de tabela progressiva da Receita Federal. Tudo correto." },
    ],
  },
];

export default function ColaboradorSolicitacoes() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>(iniciais);
  const [open, setOpen] = useState(false);
  const [tipo, setTipo] = useState<Tipo>("outros");
  const [descricao, setDescricao] = useState("");
  const [urgencia, setUrgencia] = useState<Urgencia>("media");
  const [expandida, setExpandida] = useState<string | null>(null);

  function reset() {
    setTipo("outros");
    setDescricao("");
    setUrgencia("media");
  }

  function criar() {
    if (descricao.trim().length < 20) {
      toast.error("A descrição precisa ter ao menos 20 caracteres.");
      return;
    }
    const nova: Solicitacao = {
      id: `s${Date.now()}`,
      tipo,
      data: new Date().toLocaleDateString("pt-BR"),
      status: "aberta",
      urgencia,
      descricao: descricao.trim(),
      historico: [
        {
          autor: "Marina Silva",
          data: new Date().toLocaleString("pt-BR"),
          texto: descricao.trim(),
        },
      ],
    };
    setSolicitacoes((prev) => [nova, ...prev]);
    toast.success("Solicitação enviada.");
    setOpen(false);
    reset();
  }

  return (
    <div>
      <PageHeader
        title="Minhas solicitações"
        subtitle="Centralize suas demandas para o RH e acompanhe respostas."
        actions={
          <Button className="rounded-full" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            Nova solicitação
          </Button>
        }
      />

      {solicitacoes.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl shadow-card">
          <EmptyState
            icon={MessagesSquare}
            title="Nenhuma solicitação ainda."
            description="Use o botão acima para abrir sua primeira solicitação."
          />
        </div>
      ) : (
        <ul className="space-y-3">
          {solicitacoes.map((s) => {
            const aberta = expandida === s.id;
            return (
              <li
                key={s.id}
                className="bg-card border border-border rounded-2xl shadow-card overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setExpandida(aberta ? null : s.id)}
                  className="w-full text-left p-5 flex flex-wrap items-center gap-3 hover:bg-secondary/40 transition-colors"
                >
                  <span className={cn("badge-pill shrink-0", tipoCls[s.tipo])}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                    {tipoLabel[s.tipo]}
                  </span>
                  <div className="flex-1 min-w-[200px]">
                    <div className="text-sm font-medium line-clamp-1">
                      {s.descricao}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{s.data}</div>
                  </div>
                  <span className={cn("badge-pill shrink-0", urgenciaStyle[s.urgencia].cls)}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                    {urgenciaStyle[s.urgencia].label}
                  </span>
                  <span className={cn("badge-pill shrink-0", statusStyle[s.status].cls)}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                    {statusStyle[s.status].label}
                  </span>
                  {aberta ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>

                {aberta && (
                  <div className="border-t border-border p-5 space-y-4 bg-background/40">
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
                        Descrição completa
                      </div>
                      <p className="text-sm leading-relaxed">{s.descricao}</p>
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
                        Histórico
                      </div>
                      <ul className="space-y-2">
                        {s.historico.map((m, i) => (
                          <li
                            key={i}
                            className="rounded-xl border border-border bg-card p-3"
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="text-xs font-semibold">{m.autor}</span>
                              <span className="text-[11px] text-muted-foreground">{m.data}</span>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {m.texto}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) reset();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova solicitação</DialogTitle>
            <DialogDescription>
              Descreva sua demanda com clareza para agilizar a resposta do RH.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-xs">Tipo</Label>
              <Select value={tipo} onValueChange={(v) => setTipo(v as Tipo)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(tipoLabel) as Tipo[]).map((t) => (
                    <SelectItem key={t} value={t}>
                      {tipoLabel[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">
                Descrição{" "}
                <span className="text-muted-foreground">(mínimo 20 caracteres)</span>
              </Label>
              <Textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={4}
                className="mt-1"
                placeholder="Descreva sua solicitação em detalhes…"
              />
              <div className="text-[11px] text-muted-foreground mt-1">
                {descricao.trim().length}/20
              </div>
            </div>

            <div>
              <Label className="text-xs">Urgência</Label>
              <RadioGroup
                value={urgencia}
                onValueChange={(v) => setUrgencia(v as Urgencia)}
                className="mt-2 flex gap-4"
              >
                {(Object.keys(urgenciaStyle) as Urgencia[]).map((u) => (
                  <label
                    key={u}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <RadioGroupItem value={u} id={`u-${u}`} />
                    {urgenciaStyle[u].label}
                  </label>
                ))}
              </RadioGroup>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" className="rounded-full" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button className="rounded-full" onClick={criar}>
              Enviar solicitação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
