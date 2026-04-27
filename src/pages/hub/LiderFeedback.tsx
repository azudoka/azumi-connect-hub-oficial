import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState } from "@/components/EmptyState";
import { toast } from "sonner";
import { Plus, Lock, MessageSquare, ThumbsUp, Minus, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type Tipo = "positivo" | "neutro" | "ajuste";

interface Feedback {
  id: string;
  colaboradorId: string;
  colaboradorNome: string;
  tipo: Tipo;
  contexto: string;
  proximoPasso?: string;
  planoAcao?: string;
  confidencial: boolean;
  data: string; // ISO
}

const colaboradores = [
  { id: "c1", nome: "Marina Costa" },
  { id: "c2", nome: "Pedro Alves" },
  { id: "c3", nome: "Lucas Ferreira" },
  { id: "c4", nome: "Beatriz Lins" },
  { id: "c5", nome: "Rafael Mendes" },
  { id: "c6", nome: "Juliana Lima" },
];

const tipoMap: Record<Tipo, { label: string; cls: string; icon: typeof ThumbsUp }> = {
  positivo: { label: "Positivo", cls: "bg-success/15 text-success border-success/30", icon: ThumbsUp },
  neutro: { label: "Neutro", cls: "bg-muted text-muted-foreground border-border", icon: Minus },
  ajuste: { label: "Ajuste", cls: "bg-warning/15 text-warning border-warning/30", icon: AlertTriangle },
};

const INICIAL: Feedback[] = [
  {
    id: "f1",
    colaboradorId: "c1",
    colaboradorNome: "Marina Costa",
    tipo: "positivo",
    contexto: "Excelente condução do projeto de revisão de cargos. Engajou todo o time e entregou no prazo com qualidade acima do esperado.",
    proximoPasso: "2026-05-10",
    confidencial: false,
    data: "2026-04-18",
  },
  {
    id: "f2",
    colaboradorId: "c4",
    colaboradorNome: "Beatriz Lins",
    tipo: "ajuste",
    contexto: "Conversamos sobre a queda de produtividade nas últimas duas semanas e os bloqueios pessoais relatados.",
    planoAcao: "Apoio do RH e revisão de carga até o fim do mês.",
    confidencial: true,
    data: "2026-03-30",
  },
  {
    id: "f3",
    colaboradorId: "c2",
    colaboradorNome: "Pedro Alves",
    tipo: "neutro",
    contexto: "Alinhamento mensal de rotina, sem pontos críticos. Demandas seguem dentro do esperado.",
    confidencial: false,
    data: "2026-04-10",
  },
];

function iniciais(nome: string) {
  return nome.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function LiderFeedback() {
  const [items, setItems] = useState<Feedback[]>(INICIAL);
  const [open, setOpen] = useState(false);

  const [colab, setColab] = useState<string>("");
  const [tipo, setTipo] = useState<Tipo>("positivo");
  const [contexto, setContexto] = useState("");
  const [proximoPasso, setProximoPasso] = useState("");
  const [planoAcao, setPlanoAcao] = useState("");
  const [confidencial, setConfidencial] = useState(false);

  function reset() {
    setColab(""); setTipo("positivo"); setContexto("");
    setProximoPasso(""); setPlanoAcao(""); setConfidencial(false);
  }

  function salvar() {
    if (!colab) { toast.error("Selecione um colaborador"); return; }
    if (!contexto.trim()) { toast.error("O contexto é obrigatório"); return; }
    const c = colaboradores.find(x => x.id === colab)!;
    const novo: Feedback = {
      id: `f${Date.now()}`,
      colaboradorId: c.id,
      colaboradorNome: c.nome,
      tipo,
      contexto: contexto.trim(),
      proximoPasso: proximoPasso || undefined,
      planoAcao: planoAcao.trim() || undefined,
      confidencial,
      data: new Date().toISOString().slice(0, 10),
    };
    setItems(prev => [novo, ...prev]);
    toast.success("Feedback registrado");
    reset();
    setOpen(false);
  }

  return (
    <div>
      <PageHeader
        title="Feedback"
        subtitle="Histórico de feedbacks dados ao seu time"
        actions={
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" /> Novo feedback
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Novo feedback</SheetTitle>
                <SheetDescription>Registre o feedback dado ao colaborador.</SheetDescription>
              </SheetHeader>

              <div className="space-y-5 py-6">
                <div className="space-y-2">
                  <Label>Colaborador</Label>
                  <Select value={colab} onValueChange={setColab}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {colaboradores.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <RadioGroup value={tipo} onValueChange={(v) => setTipo(v as Tipo)} className="grid grid-cols-3 gap-2">
                    {(Object.keys(tipoMap) as Tipo[]).map((t) => {
                      const T = tipoMap[t];
                      const active = tipo === t;
                      return (
                        <label
                          key={t}
                          className={cn(
                            "flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer text-sm transition-colors",
                            active ? T.cls : "border-border hover:bg-muted/40"
                          )}
                        >
                          <RadioGroupItem value={t} className="sr-only" />
                          <T.icon className="h-4 w-4" />
                          {T.label}
                        </label>
                      );
                    })}
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Contexto <span className="text-destructive">*</span></Label>
                  <Textarea
                    value={contexto}
                    onChange={(e) => setContexto(e.target.value)}
                    placeholder="Descreva o contexto do feedback..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Próximo passo (agendamento)</Label>
                  <Input type="date" value={proximoPasso} onChange={(e) => setProximoPasso(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Plano de ação (opcional)</Label>
                  <Textarea
                    value={planoAcao}
                    onChange={(e) => setPlanoAcao(e.target.value)}
                    placeholder="Ações combinadas, prazos, apoio necessário..."
                    rows={3}
                  />
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg border border-border/60 bg-muted/30">
                  <Switch checked={confidencial} onCheckedChange={setConfidencial} id="conf" />
                  <div className="flex-1">
                    <Label htmlFor="conf" className="cursor-pointer flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5" /> Marcar como confidencial
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Visível apenas para você (líder) e para o RH.
                    </p>
                  </div>
                </div>
              </div>

              <SheetFooter>
                <Button variant="outline" onClick={() => { reset(); setOpen(false); }}>Cancelar</Button>
                <Button onClick={salvar}>Salvar feedback</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        }
      />

      {items.length === 0 ? (
        <div className="bg-card border border-border rounded-xl">
          <EmptyState icon={MessageSquare} title="Nenhum feedback registrado" description="Comece registrando o primeiro feedback do seu time." />
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((f) => {
            const T = tipoMap[f.tipo];
            return (
              <div key={f.id} className="bg-card border border-border rounded-xl p-4 flex items-start gap-4">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="bg-gradient-brand text-white text-xs font-semibold">
                    {iniciais(f.colaboradorNome)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium text-sm">{f.colaboradorNome}</h3>
                    <span className={cn("badge-pill border", T.cls)}>
                      <T.icon className="h-3 w-3" /> {T.label}
                    </span>
                    {f.confidencial && (
                      <span className="badge-pill bg-muted text-muted-foreground border-border" title="Confidencial">
                        <Lock className="h-3 w-3" /> Confidencial
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground ml-auto">{formatDate(f.data)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">{f.contexto}</p>
                  {f.proximoPasso && (
                    <p className="text-xs text-primary mt-1.5">
                      Próximo passo: {formatDate(f.proximoPasso)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
