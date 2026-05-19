import { useMemo, useState } from "react";
import {
  FileText, FileCheck, BookOpen, Workflow, ExternalLink, Plus, Pencil,
  Trash2, HardDrive, Eye, Check,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Categoria = "Políticas" | "Manuais" | "Fluxos" | "Guias" | "Outro";
type Status = "publicado" | "rascunho";

interface Documento {
  id: string;
  empresa: string;
  empresa_id: string;
  titulo: string;
  categoria: Categoria;
  tipo: string;
  status: Status;
  versao: string;
  created_at: string;
  file_url: string | null;
  ciencias: number;
  visualizacoes: number;
  publicado_de_entregavel: boolean;
}

const mockEmpresas = [
  { id: "emp-001", nome: "Kentaki Foods" },
  { id: "emp-002", nome: "Tech Corp" },
];

const initialDocs: Documento[] = [
  { id: "doc-001", empresa: "Kentaki Foods", empresa_id: "emp-001", titulo: "Política de Cargos e Salários", categoria: "Políticas", tipo: "PDF", status: "publicado", versao: "v1.0", created_at: "2026-04-15", file_url: "https://example.com/politica-cargos.pdf", ciencias: 3, visualizacoes: 7, publicado_de_entregavel: true },
  { id: "doc-002", empresa: "Kentaki Foods", empresa_id: "emp-001", titulo: "Manual de Integração de Colaboradores", categoria: "Manuais", tipo: "PDF", status: "publicado", versao: "v2.1", created_at: "2026-03-20", file_url: "https://example.com/manual-integracao.pdf", ciencias: 12, visualizacoes: 18, publicado_de_entregavel: false },
  { id: "doc-003", empresa: "Kentaki Foods", empresa_id: "emp-001", titulo: "Fluxo de Solicitação de Férias", categoria: "Fluxos", tipo: "PDF", status: "rascunho", versao: "v1.0", created_at: "2026-05-01", file_url: null, ciencias: 0, visualizacoes: 0, publicado_de_entregavel: false },
  { id: "doc-004", empresa: "Tech Corp", empresa_id: "emp-002", titulo: "Guia de Boas Práticas — Trabalho Remoto", categoria: "Guias", tipo: "PDF", status: "publicado", versao: "v1.2", created_at: "2026-02-10", file_url: "https://example.com/guia-remoto.pdf", ciencias: 8, visualizacoes: 24, publicado_de_entregavel: true },
  { id: "doc-005", empresa: "Tech Corp", empresa_id: "emp-002", titulo: "Política de Uso de Equipamentos", categoria: "Políticas", tipo: "PDF", status: "publicado", versao: "v1.0", created_at: "2026-01-15", file_url: "https://example.com/politica-equipamentos.pdf", ciencias: 5, visualizacoes: 11, publicado_de_entregavel: false },
];

const categoriaConfig: Record<Categoria, { topo: string; chip: string; icon: typeof FileText }> = {
  "Políticas": { topo: "#7C3AED", chip: "bg-[#7C3AED]/15 text-[#7C3AED] border-[#7C3AED]/30", icon: FileCheck },
  "Manuais":   { topo: "#034C8B", chip: "bg-[#034C8B]/15 text-[#034C8B] border-[#034C8B]/30", icon: BookOpen },
  "Fluxos":    { topo: "#0D9488", chip: "bg-[#0D9488]/15 text-[#0D9488] border-[#0D9488]/30", icon: Workflow },
  "Guias":     { topo: "#D97706", chip: "bg-[#D97706]/15 text-[#D97706] border-[#D97706]/30", icon: BookOpen },
  "Outro":     { topo: "#6B7280", chip: "bg-muted text-muted-foreground border-border", icon: FileText },
};

const categorias: Categoria[] = ["Políticas", "Manuais", "Fluxos", "Guias", "Outro"];

function formatarData(iso: string): string {
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
}

interface FormState {
  empresa_id: string;
  titulo: string;
  categoria: Categoria;
  versao: string;
  status: Status;
  file_url: string;
}

const emptyForm: FormState = {
  empresa_id: mockEmpresas[0].id,
  titulo: "",
  categoria: "Políticas",
  versao: "v1.0",
  status: "rascunho",
  file_url: "",
};

export default function DocumentosPage() {
  const [docs, setDocs] = useState<Documento[]>(initialDocs);
  const [filtroEmpresa, setFiltroEmpresa] = useState("all");
  const [filtroCategoria, setFiltroCategoria] = useState("all");
  const [filtroStatus, setFiltroStatus] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [excluirId, setExcluirId] = useState<string | null>(null);

  const filtrados = useMemo(() => docs.filter((d) => {
    if (filtroEmpresa !== "all" && d.empresa_id !== filtroEmpresa) return false;
    if (filtroCategoria !== "all" && d.categoria !== filtroCategoria) return false;
    if (filtroStatus !== "all" && d.status !== filtroStatus) return false;
    return true;
  }), [docs, filtroEmpresa, filtroCategoria, filtroStatus]);

  const kpis = useMemo(() => {
    const total = docs.length;
    const publicados = docs.filter((d) => d.status === "publicado").length;
    const cienciasPendentes = docs.filter(
      (d) => d.status === "publicado" && d.visualizacoes > 0 && d.ciencias < d.visualizacoes,
    ).length;
    const deEntregavel = docs.filter((d) => d.publicado_de_entregavel).length;
    return { total, publicados, cienciasPendentes, deEntregavel };
  }, [docs]);

  function abrirNovo() {
    setEditId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function abrirEditar(doc: Documento) {
    setEditId(doc.id);
    setForm({
      empresa_id: doc.empresa_id,
      titulo: doc.titulo,
      categoria: doc.categoria,
      versao: doc.versao,
      status: doc.status,
      file_url: doc.file_url ?? "",
    });
    setModalOpen(true);
  }

  function salvar() {
    if (!form.titulo.trim()) return;
    const empresa = mockEmpresas.find((e) => e.id === form.empresa_id)?.nome ?? "";
    if (editId) {
      setDocs((prev) => prev.map((d) => d.id === editId ? {
        ...d,
        empresa,
        empresa_id: form.empresa_id,
        titulo: form.titulo,
        categoria: form.categoria,
        versao: form.versao,
        status: form.status,
        file_url: form.file_url || null,
      } : d));
    } else {
      const novo: Documento = {
        id: `doc-${Date.now()}`,
        empresa,
        empresa_id: form.empresa_id,
        titulo: form.titulo,
        categoria: form.categoria,
        tipo: "PDF",
        status: form.status,
        versao: form.versao,
        created_at: new Date().toISOString().slice(0, 10),
        file_url: form.file_url || null,
        ciencias: 0,
        visualizacoes: 0,
        publicado_de_entregavel: false,
      };
      setDocs((prev) => [novo, ...prev]);
    }
    setModalOpen(false);
  }

  function excluir() {
    if (!excluirId) return;
    setDocs((prev) => prev.filter((d) => d.id !== excluirId));
    setExcluirId(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documentos"
        subtitle="Biblioteca de documentos publicados para os clientes."
        actions={
          <Button onClick={abrirNovo} className="rounded-[100px] bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white">
            <Plus className="h-4 w-4" /> Inserir documento
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total de documentos" value={kpis.total} icon={FileText} />
        <KpiCard label="Publicados" value={kpis.publicados} icon={Check} />
        <KpiCard label="Ciências pendentes" value={kpis.cienciasPendentes} icon={Eye} />
        <KpiCard label="Publicados de entregáveis" value={kpis.deEntregavel} icon={FileCheck} />
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <Select value={filtroEmpresa} onValueChange={setFiltroEmpresa}>
          <SelectTrigger className="md:w-56 rounded-[100px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as empresas</SelectItem>
            {mockEmpresas.map((e) => <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
          <SelectTrigger className="md:w-56 rounded-[100px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categorias.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="md:w-56 rounded-[100px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="publicado">Publicado</SelectItem>
            <SelectItem value="rascunho">Rascunho</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtrados.map((doc) => {
          const cfg = categoriaConfig[doc.categoria];
          const Icon = cfg.icon;
          return (
            <div key={doc.id} className="bg-card border border-border rounded-2xl shadow-card overflow-hidden flex flex-col">
              <div className="h-1.5" style={{ background: cfg.topo }} />
              <div className="p-5 flex flex-col gap-3 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border", cfg.chip)}>
                    <Icon className="h-3 w-3" /> {doc.categoria}
                  </span>
                  {doc.status === "publicado" ? (
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border bg-emerald-500/15 text-emerald-600 border-emerald-500/30">Publicado</span>
                  ) : (
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border bg-muted text-muted-foreground border-border">Rascunho</span>
                  )}
                  {doc.publicado_de_entregavel && (
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border bg-sky-500/15 text-sky-600 border-sky-500/30">
                      📋 De entregável
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

                <div className="text-xs text-muted-foreground">
                  <span className="font-data">👁 {doc.visualizacoes}</span> visualizações
                  <span className="mx-1">·</span>
                  <span className="font-data">✍ {doc.ciencias}</span> ciências
                </div>

                <div className="flex items-center gap-1.5 pt-1 mt-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-[100px] flex-1"
                    disabled={!doc.file_url}
                    onClick={() => doc.file_url && window.open(doc.file_url, "_blank")}
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Abrir
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-[100px]" onClick={() => abrirEditar(doc)} title="Editar">
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-[100px]" disabled title="Integração Google Drive em breve">
                    <HardDrive className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-[100px] text-destructive hover:text-destructive" onClick={() => setExcluirId(doc.id)} title="Excluir">
                    <Trash2 className="h-3.5 w-3.5" />
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

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editId ? "Editar documento" : "Inserir documento"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Empresa</Label>
              <Select value={form.empresa_id} onValueChange={(v) => setForm((f) => ({ ...f, empresa_id: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {mockEmpresas.map((e) => <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Título *</Label>
              <Input value={form.titulo} onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))} placeholder="Título do documento" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Categoria</Label>
                <Select value={form.categoria} onValueChange={(v) => setForm((f) => ({ ...f, categoria: v as Categoria }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categorias.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Versão</Label>
                <Input value={form.versao} onChange={(e) => setForm((f) => ({ ...f, versao: e.target.value }))} placeholder="v1.0" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as Status }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="rascunho">Rascunho</SelectItem>
                  <SelectItem value="publicado">Publicado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>URL do arquivo</Label>
              <Input value={form.file_url} onChange={(e) => setForm((f) => ({ ...f, file_url: e.target.value }))} placeholder="https://..." />
            </div>
            <div className="space-y-1.5">
              <Label>Upload de arquivo</Label>
              <Input type="file" accept="application/pdf" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)} className="rounded-[100px]">Cancelar</Button>
            <Button onClick={salvar} className="rounded-[100px] bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!excluirId} onOpenChange={(o) => !o && setExcluirId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir documento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O documento será removido da biblioteca.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-[100px]">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={excluir} className="rounded-[100px] bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
