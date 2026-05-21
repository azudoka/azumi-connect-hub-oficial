import { useMemo, useState } from "react";
import {
  FileText, FileCheck, BookOpen, Workflow, ExternalLink, MessageSquare,
  PenLine, FolderOpen, Check, Send,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { documentosMock, type DocumentoMock } from "@/data/documentosMock";
import { useAuth } from "@/context/AuthContext";

type Categoria = DocumentoMock["categoria"];

const categoriaConfig: Record<string, { topo: string; chip: string; icon: typeof FileText }> = {
  "Políticas":  { topo: "#7C3AED", chip: "bg-[#7C3AED]/15 text-[#7C3AED] border-[#7C3AED]/30", icon: FileCheck },
  "Manuais":    { topo: "#034C8B", chip: "bg-[#034C8B]/15 text-[#034C8B] border-[#034C8B]/30", icon: BookOpen },
  "Fluxos":     { topo: "#0D9488", chip: "bg-[#0D9488]/15 text-[#0D9488] border-[#0D9488]/30", icon: Workflow },
  "Guias":      { topo: "#D97706", chip: "bg-[#D97706]/15 text-[#D97706] border-[#D97706]/30", icon: BookOpen },
  "Relatórios": { topo: "#0EA5E9", chip: "bg-[#0EA5E9]/15 text-[#0EA5E9] border-[#0EA5E9]/30", icon: FileText },
  "Onboarding": { topo: "#16A34A", chip: "bg-[#16A34A]/15 text-[#16A34A] border-[#16A34A]/30", icon: BookOpen },
  "Outro":      { topo: "#6B7280", chip: "bg-muted text-muted-foreground border-border", icon: FileText },
};

function formatarData(iso: string): string {
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
}

const EMPRESA_ID_MAP: Record<string, string> = {
  kentaki: "emp-001",
  valore: "valore",
  horizonte: "horizonte",
  vita: "vita",
  "empresa-demo": "empresa-demo",
};

interface Mensagem {
  autor: "cliente" | "consultor";
  texto: string;
  data: string;
}

export default function ClienteDocumentosPage() {
  const { user } = useAuth();
  const empresaDocId = EMPRESA_ID_MAP[user?.empresaId ?? ""] ?? "emp-001";

  const docs: DocumentoMock[] = useMemo(
    () => documentosMock.filter((d) => d.empresa_id === empresaDocId && d.status === "publicado"),
    [empresaDocId],
  );
  const categorias = useMemo(
    () => Array.from(new Set(docs.map((d) => d.categoria))) as Categoria[],
    [docs],
  );

  const [filtroCategoria, setFiltroCategoria] = useState<string>("all");
  const filtrados = useMemo(
    () => (filtroCategoria === "all" ? docs : docs.filter((d) => d.categoria === filtroCategoria)),
    [docs, filtroCategoria],
  );

  const [viewerDoc, setViewerDoc] = useState<DocumentoMock | null>(null);
  const [chatDoc, setChatDoc] = useState<DocumentoMock | null>(null);
  const [assinarDoc, setAssinarDoc] = useState<DocumentoMock | null>(null);
  const [assinados, setAssinados] = useState<Set<string>>(new Set());

  const [mensagens, setMensagens] = useState<Record<string, Mensagem[]>>({});
  const [novaMsg, setNovaMsg] = useState("");

  function getMensagens(docId: string): Mensagem[] {
    return mensagens[docId] ?? [
      { autor: "consultor", texto: "Documento disponibilizado para sua análise. Qualquer dúvida estou à disposição.", data: "10/05/2026 09:12" },
    ];
  }

  function enviarMsg() {
    if (!chatDoc || !novaMsg.trim()) return;
    const atual = getMensagens(chatDoc.id);
    const nova: Mensagem = {
      autor: "cliente",
      texto: novaMsg.trim(),
      data: new Date().toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }),
    };
    setMensagens({ ...mensagens, [chatDoc.id]: [...atual, nova] });
    setNovaMsg("");
  }

  function confirmarAssinatura() {
    if (!assinarDoc) return;
    setAssinados((prev) => new Set(prev).add(assinarDoc.id));
    setAssinarDoc(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documentos"
        subtitle="Arquivos e documentos compartilhados pela Azumi com sua empresa."
      />

      {docs.length === 0 ? (
        <div className="bg-card border border-border rounded-xl">
          <EmptyState
            icon={FolderOpen}
            title="Nenhum documento"
            description="Os documentos da sua empresa ainda estão sendo preparados."
          />
        </div>
      ) : (
        <>
          <div className="flex flex-col md:flex-row gap-3">
            <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
              <SelectTrigger className="md:w-56 rounded-[100px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categorias.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtrados.map((doc) => {
              const cfg = categoriaConfig[doc.categoria] ?? categoriaConfig["Outro"];
              const Icon = cfg.icon;
              const assinado = assinados.has(doc.id);
              return (
                <div key={doc.id} className="bg-card border border-border rounded-2xl shadow-card overflow-hidden flex flex-col">
                  {doc.capa_url ? (
                    <>
                      <img
                        src={doc.capa_url}
                        alt=""
                        style={{ height: 110, width: "100%", objectFit: "cover", display: "block" }}
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                      <div className="h-[3px]" style={{ background: cfg.topo }} />
                    </>
                  ) : (
                    <div className="h-1.5" style={{ background: cfg.topo }} />
                  )}
                  <div className="p-5 flex flex-col gap-3 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border", cfg.chip)}>
                        <Icon className="h-3 w-3" /> {doc.categoria}
                      </span>
                      {assinado && (
                        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border bg-emerald-500/15 text-emerald-600 border-emerald-500/30">
                          <Check className="h-3 w-3" /> Assinado
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-semibold leading-snug">{doc.titulo}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{doc.empresa}</p>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="font-mono">{doc.versao}</span>
                      <span>·</span>
                      <span className="font-data">{formatarData(doc.created_at)}</span>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1 mt-auto">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-[100px] flex-1"
                        onClick={() => setViewerDoc(doc)}
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> Abrir
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-[100px]"
                        onClick={() => setChatDoc(doc)}
                        title="Comentar"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className={cn(
                          "rounded-[100px]",
                          assinado && "text-emerald-600 border-emerald-500/40",
                        )}
                        onClick={() => !assinado && setAssinarDoc(doc)}
                        title={assinado ? "Já assinado" : "Assinar"}
                        disabled={assinado}
                      >
                        <PenLine className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filtrados.length === 0 && (
              <div className="col-span-full rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground">
                Nenhum documento encontrado.
              </div>
            )}
          </div>
        </>
      )}

      {/* Visualizador de documento */}
      <Dialog open={!!viewerDoc} onOpenChange={(o) => !o && setViewerDoc(null)}>
        <DialogContent className="sm:max-w-3xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>{viewerDoc?.titulo}</DialogTitle>
          </DialogHeader>
          <div className="rounded-xl border border-border bg-muted/30 h-[60vh] flex items-center justify-center text-center p-8">
            <div className="space-y-3">
              <FileText className="h-14 w-14 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Pré-visualização do documento <strong className="text-foreground">{viewerDoc?.titulo}</strong>
              </p>
              <p className="text-xs text-muted-foreground">
                {viewerDoc?.tipo} · {viewerDoc?.versao}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-[100px]" onClick={() => setViewerDoc(null)}>Fechar</Button>
            {viewerDoc?.file_url && (
              <Button
                className="rounded-[100px] bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white"
                onClick={() => window.open(viewerDoc.file_url!, "_blank")}
              >
                Abrir em nova aba
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Chat / Comentários */}
      <Sheet open={!!chatDoc} onOpenChange={(o) => !o && setChatDoc(null)}>
        <SheetContent className="w-full sm:max-w-md flex flex-col">
          <SheetHeader>
            <SheetTitle className="text-left">Comentários · {chatDoc?.titulo}</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto space-y-3 py-4">
            {chatDoc && getMensagens(chatDoc.id).map((m, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                  m.autor === "cliente"
                    ? "ml-auto bg-[#3B82F6] text-white"
                    : "bg-secondary text-foreground",
                )}
              >
                <p>{m.texto}</p>
                <p className={cn("text-[10px] mt-1 opacity-70")}>{m.data}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-3 space-y-2">
            <Textarea
              value={novaMsg}
              onChange={(e) => setNovaMsg(e.target.value)}
              placeholder="Escreva um comentário..."
              rows={2}
            />
            <Button
              onClick={enviarMsg}
              className="w-full rounded-[100px] bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white"
              disabled={!novaMsg.trim()}
            >
              <Send className="h-4 w-4" /> Enviar
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Assinatura */}
      <Dialog open={!!assinarDoc} onOpenChange={(o) => !o && setAssinarDoc(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Assinar documento</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Ao assinar, você confirma a leitura e ciência do documento:
            </p>
            <p className="font-medium">{assinarDoc?.titulo}</p>
            <p className="text-xs text-muted-foreground">{assinarDoc?.versao} · {assinarDoc && formatarData(assinarDoc.created_at)}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-[100px]" onClick={() => setAssinarDoc(null)}>Cancelar</Button>
            <Button
              onClick={confirmarAssinatura}
              className="rounded-[100px] bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <PenLine className="h-4 w-4" /> Confirmar assinatura
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
