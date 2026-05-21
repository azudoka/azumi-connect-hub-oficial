import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Clock, ListTodo, FileText, MessageSquare, Paperclip } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { StarRating } from "@/components/ui/StarRating";
import { cn } from "@/lib/utils";
import {
  COMPLEX_PILL,
  ENT_STATUS_LABEL,
  entStatusPill,
  formatHoraMinuto,
  formatPrazo,
  isPrazoVencido,
  minutosRestantesAprovacao,
  type EntregavelItem,
} from "@/data/projetosCliente";
import {
  aprovarEntregavel,
  getProjetoById,
  registrarNps,
  solicitarAjusteEntregavel,
  useProjetosClienteStore,
  vincularDocsOficiais,
} from "@/data/useProjetosClienteStore";

const PILL_BASE =
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap";

export default function ClienteProjetoDetalhe() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Subscreve às mudanças do store para o projeto atual
  const projeto = useProjetosClienteStore((s) =>
    s.projetos.find((p) => p.id === id || p.codigo === id)
  );

  useEffect(() => {
    if (!projeto && getProjetoById(id) === undefined) {
      // Pequeno delay para garantir hydrate
    }
  }, [id, projeto]);

  if (!projeto) {
    return (
      <Card className="glass">
        <CardContent className="p-8 text-center space-y-3">
          <p className="text-sm text-muted-foreground">Projeto não encontrado.</p>
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link to="/cliente/projetos">
              <ArrowLeft className="h-3.5 w-3.5" />
              Voltar para projetos
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Filtro de empresa — não exibe projeto de outra empresa
  if (user?.empresaId && projeto.empresaId !== user.empresaId) {
    navigate("/cliente/projetos", { replace: true });
    return null;
  }

  const entregaveisVisiveis = projeto.entregaveis.filter(
    (e) => e.status === "aprovacao_cliente" || e.status === "aprovado_cliente"
  );

  return (
    <>
      <div className="mb-5">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="rounded-full -ml-2 mb-3 text-muted-foreground hover:text-foreground"
        >
          <Link to="/cliente/projetos">
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar
          </Link>
        </Button>
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="min-w-0">
            <p className="font-data text-xs text-muted-foreground">{projeto.codigo}</p>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight mt-1">
              {projeto.nome}
            </h1>
          </div>
          <div className="sm:ml-auto flex items-center gap-2">
            <span className="h-7 w-7 rounded-lg bg-primary/15 text-primary text-xs font-semibold flex items-center justify-center">
              {projeto.consultorIniciais}
            </span>
            <span className="text-sm text-muted-foreground">{projeto.consultor}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {entregaveisVisiveis.length === 0 ? (
          <Card className="glass">
            <CardContent className="p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Nenhum entregável disponível para avaliação no momento. Você será notificado quando houver itens aguardando seu parecer.
              </p>
            </CardContent>
          </Card>
        ) : (
          entregaveisVisiveis.map((e) => (
            <EntregavelCard key={e.id} projetoId={projeto.id} entregavel={e} />
          ))
        )}
      </div>
    </>
  );
}

// ---------- Card de entregável ----------

function EntregavelCard({
  projetoId,
  entregavel,
}: {
  projetoId: string;
  entregavel: EntregavelItem;
}) {
  const [openConfirmAprovar, setOpenConfirmAprovar] = useState(false);
  const [openNps, setOpenNps] = useState(false);
  const [openDocs, setOpenDocs] = useState(false);
  const [openAjuste, setOpenAjuste] = useState(false);
  const [openConversa, setOpenConversa] = useState(false);
  const [openVisualizar, setOpenVisualizar] = useState(false);

  // Conversa mockada entre cliente e consultor sobre este entregável (sessão).
  const [conversa, setConversa] = useState<
    { autor: "consultor" | "cliente"; nome: string; texto: string; data: string; anexo?: string }[]
  >(() => [
    {
      autor: "consultor",
      nome: "Consultor Azumi",
      texto: `Olá! Enviei a versão para sua aprovação de "${entregavel.nome}". Qualquer ajuste me avise por aqui.`,
      data: entregavel.aprovacaoEnviadaEm ?? new Date().toISOString(),
      anexo: `${entregavel.codigo}.pdf`,
    },
    {
      autor: "consultor",
      nome: "Consultor Azumi",
      texto: "Aproveitei e já apontei os principais pontos no documento. Vou ficar aguardando seu retorno.",
      data: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    },
  ]);
  const [novaMsg, setNovaMsg] = useState("");
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState("");

  // Ajuste
  const [ajusteObs, setAjusteObs] = useState("");

  const minutosRestantes = useMemo(
    () => minutosRestantesAprovacao(entregavel.aprovacaoEnviadaEm),
    [entregavel.aprovacaoEnviadaEm]
  );
  const prazoAprovacaoExpirado = minutosRestantes !== null && minutosRestantes <= 0;
  const aguardando = entregavel.status === "aprovacao_cliente";
  const aprovado = entregavel.status === "aprovado_cliente";
  const vencido = isPrazoVencido(entregavel.prazo) && !aprovado;

  function handleAprovar() {
    aprovarEntregavel(projetoId, entregavel.id);
    setOpenConfirmAprovar(false);
    setOpenNps(true);
  }

  function enviarNps() {
    if (nota === 0) return;
    if (nota <= 3 && comentario.trim().length < 20) {
      toast.error("Descreva o que pode melhorar (mín. 20 caracteres)");
      return;
    }
    registrarNps(projetoId, entregavel.id, {
      nota,
      comentario: comentario.trim(),
      data: new Date().toISOString(),
    });
    toast.success("Avaliação registrada, obrigado!");
    setOpenNps(false);
    if (entregavel.tipoDocumento) {
      setOpenDocs(true);
    } else {
      setNota(0);
      setComentario("");
    }
  }

  function decidirDocs(vincular: boolean) {
    vincularDocsOficiais(projetoId, entregavel.id, vincular);
    setOpenDocs(false);
    setNota(0);
    setComentario("");
    toast.success(
      vincular
        ? "Documento vinculado aos Docs Oficiais."
        : "Documento mantido apenas no projeto."
    );
  }

  function confirmarAjuste() {
    if (ajusteObs.trim().length < 20) {
      toast.error("Descreva o ajuste com pelo menos 20 caracteres.");
      return;
    }
    solicitarAjusteEntregavel(projetoId, entregavel.id, ajusteObs.trim());
    toast.success("Ajuste solicitado. O consultor será notificado.");
    setOpenAjuste(false);
    setAjusteObs("");
  }

  return (
    <Card className={cn(aprovado && "opacity-90")}>
      <CardContent className="p-4 space-y-3">
        {/* Linha principal */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="font-data text-xs text-muted-foreground">{entregavel.codigo}</span>
          <span className="text-sm font-semibold flex-1 min-w-0 truncate">
            {entregavel.nome}
          </span>
          <span className={cn(PILL_BASE, "bg-muted/60 text-muted-foreground border-border")}>
            {entregavel.frente}
          </span>
          <span className={cn(PILL_BASE, COMPLEX_PILL[entregavel.complexidade])}>
            {entregavel.complexidade}
          </span>
          <span className={cn(PILL_BASE, entStatusPill(entregavel.status))}>
            {ENT_STATUS_LABEL[entregavel.status]}
          </span>
          <span
            className={cn(
              "text-xs",
              vencido ? "text-destructive font-semibold" : "text-muted-foreground"
            )}
          >
            Prazo: {formatPrazo(entregavel.prazo)}
            {vencido && " · vencido"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {entregavel.subtarefas > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-xs text-muted-foreground">
              <ListTodo className="h-3 w-3" />
              {entregavel.subtarefas} subtarefas
            </span>
          )}
          {entregavel.tipoDocumento && (
            <button
              type="button"
              onClick={() => setOpenVisualizar(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs text-primary hover:bg-primary/15 transition-colors"
            >
              <FileText className="h-3 w-3" /> Visualizar documento
            </button>
          )}
          <button
            type="button"
            onClick={() => setOpenConversa(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs text-foreground hover:bg-secondary/80 transition-colors"
          >
            <MessageSquare className="h-3 w-3" /> Conversa com consultor ({conversa.length})
          </button>
        </div>


        {/* Banner de aprovação */}
        {aguardando && (
          <div
            className={cn(
              "rounded-lg border p-3 mt-1 flex items-start gap-3",
              prazoAprovacaoExpirado
                ? "bg-destructive/10 border-destructive/30"
                : "bg-warning/10 border-warning/30"
            )}
          >
            <Clock
              className={cn(
                "h-4 w-4 mt-0.5 shrink-0",
                prazoAprovacaoExpirado ? "text-destructive" : "text-warning"
              )}
            />
            <div className="flex-1 min-w-0 text-sm">
              {prazoAprovacaoExpirado ? (
                <p className="text-destructive font-medium">
                  Prazo vencido — a Azumi seguirá com a versão atual.
                </p>
              ) : (
                <>
                  <p className="font-medium">Este entregável aguarda sua aprovação.</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Prazo: 72h. Restam {formatHoraMinuto(minutosRestantes ?? 0)}.
                  </p>
                </>
              )}
            </div>
            {!prazoAprovacaoExpirado && (
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  className="rounded-full bg-success text-success-foreground hover:bg-success/90"
                  onClick={() => setOpenConfirmAprovar(true)}
                >
                  Aprovar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full bg-warning/15 text-warning border-warning/40 hover:bg-warning/25"
                  onClick={() => setOpenAjuste(true)}
                >
                  Solicitar ajuste
                </Button>
              </div>
            )}
          </div>
        )}

        {/* NPS já preenchido — exibe estrelas readonly */}
        {aprovado && entregavel.nps && (
          <div className="flex items-center justify-between border-t border-border/60 pt-3">
            <span className="text-xs text-muted-foreground">Sua avaliação</span>
            <StarRating value={entregavel.nps.nota} readonly size={18} />
          </div>
        )}
      </CardContent>

      {/* Confirmação de aprovação */}
      <Dialog open={openConfirmAprovar} onOpenChange={setOpenConfirmAprovar}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Aprovar entregável?</DialogTitle>
            <DialogDescription>
              Ao aprovar, o status será imutável. Confirma?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setOpenConfirmAprovar(false)}
            >
              Cancelar
            </Button>
            <Button className="rounded-full" onClick={handleAprovar}>
              Confirmar aprovação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* NPS — não pode fechar sem responder */}
      <Dialog open={openNps} onOpenChange={() => { /* trava fechamento */ }}>
        <DialogContent
          className="sm:max-w-md"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          hideClose
        >
          <DialogHeader>
            <DialogTitle>Como foi esse entregável?</DialogTitle>
            <DialogDescription>
              Sua avaliação é confidencial e ajuda a Azumi a melhorar.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-2">
            <StarRating value={nota} onChange={setNota} />
          </div>
          {nota > 0 && nota <= 3 && (
            <div className="space-y-2">
              <Label htmlFor="nps-melhorar">O que poderíamos melhorar?</Label>
              <Textarea
                id="nps-melhorar"
                rows={4}
                className="resize-none"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Mín. 20 caracteres"
              />
            </div>
          )}
          {nota >= 4 && (
            <div className="space-y-2">
              <Label htmlFor="nps-coment">Quer deixar um comentário? (opcional)</Label>
              <Textarea
                id="nps-coment"
                rows={3}
                className="resize-none"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
              />
            </div>
          )}
          <DialogFooter>
            <Button className="rounded-full" disabled={nota === 0} onClick={enviarNps}>
              Enviar avaliação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Vincular Docs Oficiais — só para tipoDocumento */}
      <Dialog open={openDocs} onOpenChange={() => { /* trava */ }}>
        <DialogContent
          className="sm:max-w-md"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          hideClose
        >
          <DialogHeader>
            <DialogTitle>Vincular aos Docs Oficiais?</DialogTitle>
            <DialogDescription>
              Documentos vinculados ficam disponíveis para toda a empresa na biblioteca de
              Docs Oficiais.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => decidirDocs(false)}
            >
              Não, manter no projeto
            </Button>
            <Button className="rounded-full" onClick={() => decidirDocs(true)}>
              Sim, vincular
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Solicitar ajuste */}
      <Dialog open={openAjuste} onOpenChange={setOpenAjuste}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Solicitar ajuste</DialogTitle>
            <DialogDescription>
              Descreva o que precisa ser ajustado (mín. 20 caracteres).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="ent-ajuste">Observação</Label>
            <Textarea
              id="ent-ajuste"
              rows={4}
              className="resize-none"
              value={ajusteObs}
              onChange={(e) => setAjusteObs(e.target.value)}
              placeholder="Ex.: revisar a seção de níveis 3 e 4 com base no novo organograma."
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setOpenAjuste(false)}
            >
              Cancelar
            </Button>
            <Button
              className="rounded-full"
              disabled={ajusteObs.trim().length < 20}
              onClick={confirmarAjuste}
            >
              Confirmar ajuste
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Visualizador de documento (mock) */}
      <Dialog open={openVisualizar} onOpenChange={setOpenVisualizar}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              {entregavel.nome}
            </DialogTitle>
            <DialogDescription>
              {entregavel.codigo} · Pré-visualização do documento enviado pelo consultor.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-border bg-muted/30 p-8 min-h-[300px] flex flex-col items-center justify-center text-center gap-3">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <FileText className="h-8 w-8" />
            </div>
            <div>
              <p className="text-sm font-medium">{entregavel.codigo}.pdf</p>
              <p className="text-xs text-muted-foreground mt-1">
                Documento de demonstração — a versão final será exibida aqui.
              </p>
            </div>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => toast.info("Download disponível na versão final.")}
            >
              Baixar PDF
            </Button>
          </div>
          <DialogFooter>
            <Button variant="ghost" className="rounded-full" onClick={() => setOpenVisualizar(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Conversa com consultor */}
      <Sheet open={openConversa} onOpenChange={setOpenConversa}>
        <SheetContent className="sm:max-w-md w-full flex flex-col">
          <SheetHeader>
            <SheetTitle>Conversa do entregável</SheetTitle>
            <SheetDescription>
              {entregavel.codigo} · {entregavel.nome}
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto space-y-3 py-4 pr-1">
            {conversa.map((m, i) => {
              const isMe = m.autor === "cliente";
              return (
                <div key={i} className={cn("flex gap-2 items-end", isMe && "flex-row-reverse")}>
                  {!isMe && (
                    <div className="h-7 w-7 rounded-lg bg-gradient-brand flex items-center justify-center text-[10px] font-semibold text-white shrink-0">
                      {m.nome.charAt(0)}
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                      isMe
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-secondary text-foreground border border-border rounded-bl-sm"
                    )}
                  >
                    {!isMe && (
                      <div className="text-[10px] font-semibold mb-0.5 text-primary">{m.nome}</div>
                    )}
                    <p className="break-words">{m.texto}</p>
                    {m.anexo && (
                      <div
                        className={cn(
                          "mt-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs",
                          isMe ? "bg-primary-foreground/15" : "bg-background border border-border"
                        )}
                      >
                        <Paperclip className="h-3 w-3" /> {m.anexo}
                      </div>
                    )}
                    <div
                      className={cn(
                        "text-[10px] font-data mt-1 text-right",
                        isMe ? "text-primary-foreground/70" : "text-muted-foreground"
                      )}
                    >
                      {format(new Date(m.data), "dd/MM HH:mm", { locale: ptBR })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-2 items-end border-t border-border pt-3">
            <Textarea
              rows={2}
              value={novaMsg}
              onChange={(e) => setNovaMsg(e.target.value)}
              placeholder="Escreva uma mensagem para o consultor…"
              className="resize-none flex-1 text-sm rounded-xl"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (novaMsg.trim()) {
                    setConversa((prev) => [
                      ...prev,
                      { autor: "cliente", nome: "Você", texto: novaMsg.trim(), data: new Date().toISOString() },
                    ]);
                    setNovaMsg("");
                  }
                }
              }}
            />
            <Button
              size="sm"
              disabled={!novaMsg.trim()}
              className="rounded-full shrink-0"
              onClick={() => {
                if (!novaMsg.trim()) return;
                setConversa((prev) => [
                  ...prev,
                  { autor: "cliente", nome: "Você", texto: novaMsg.trim(), data: new Date().toISOString() },
                ]);
                setNovaMsg("");
              }}
            >
              Enviar
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </Card>
  );
}

