import { useMemo, useState } from "react";
import {
  Plus, Upload, Eye, Download, Link2, FileText, ChevronDown, Search, Check,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Documento {
  id: string;
  nome: string;
  tipo: "Contrato" | "Relatório" | "Boleto" | "Proposta" | "Anexo";
  empresa: string;
  uploadEm: string;
  entregavel?: boolean;
}

const MOCK: Documento[] = [
  { id: "D-001", nome: "Contrato_2026.pdf",       tipo: "Contrato",  empresa: "Empresa X",  uploadEm: "20/04/2026", entregavel: true  },
  { id: "D-002", nome: "Relatorio_Mensal_03.pdf", tipo: "Relatório", empresa: "Empresa X",  uploadEm: "31/03/2026", entregavel: true  },
  { id: "D-003", nome: "Boleto_Abril.pdf",        tipo: "Boleto",    empresa: "Empresa X",  uploadEm: "01/04/2026"                    },
  { id: "D-004", nome: "Proposta_RH.docx",        tipo: "Proposta",  empresa: "Startup Y",  uploadEm: "15/04/2026"                    },
  { id: "D-005", nome: "Contrato_StartupY.pdf",   tipo: "Contrato",  empresa: "Startup Y",  uploadEm: "10/03/2026", entregavel: true  },
  { id: "D-006", nome: "Anexo_DiagDISC.pdf",      tipo: "Anexo",     empresa: "Grupo Zeta", uploadEm: "22/04/2026"                    },
  { id: "D-007", nome: "Relatorio_Q1.pdf",        tipo: "Relatório", empresa: "Grupo Zeta", uploadEm: "05/04/2026", entregavel: true  },
  { id: "D-008", nome: "Boleto_Marco.pdf",        tipo: "Boleto",    empresa: "Nuvem Corp", uploadEm: "01/03/2026"                    },
];

function CopyLinkBtn({ value }: { value: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => { navigator.clipboard.writeText(value); setDone(true); setTimeout(() => setDone(false), 1200); }}
      className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
      title="Copiar link"
    >
      {done ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
    </button>
  );
}

export default function DocumentosPage() {
  const [busca, setBusca]       = useState("");
  const [tipo, setTipo]         = useState<string>("all");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [opened, setOpened] = useState<Record<string, boolean>>(() => {
    const empresas = Array.from(new Set(MOCK.map((d) => d.empresa)));
    return Object.fromEntries(empresas.map((e) => [e, true]));
  });

  const grupos = useMemo(() => {
    const filtrados = MOCK.filter((d) => {
      if (tipo !== "all" && d.tipo !== tipo) return false;
      if (busca && !`${d.nome} ${d.empresa} ${d.tipo}`.toLowerCase().includes(busca.toLowerCase())) return false;
      return true;
    });
    const map = new Map<string, Documento[]>();
    for (const d of filtrados) {
      const arr = map.get(d.empresa) ?? [];
      arr.push(d);
      map.set(d.empresa, arr);
    }
    return Array.from(map.entries());
  }, [busca, tipo]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documentos"
        subtitle="Biblioteca de documentos por empresa"
        actions={
          <Button onClick={() => setUploadOpen(true)} className="rounded-[100px] bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white">
            <Upload className="h-4 w-4" /> Upload
          </Button>
        }
      />

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar documento, empresa ou tipo…" className="pl-9 rounded-[100px]" />
        </div>
        <Select value={tipo} onValueChange={setTipo}>
          <SelectTrigger className="w-full md:w-64 rounded-[100px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="Contrato">Contrato</SelectItem>
            <SelectItem value="Relatório">Relatório</SelectItem>
            <SelectItem value="Boleto">Boleto</SelectItem>
            <SelectItem value="Proposta">Proposta</SelectItem>
            <SelectItem value="Anexo">Anexo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {grupos.map(([empresa, docs]) => {
          const isOpen = opened[empresa] ?? true;
          return (
            <div key={empresa} className="rounded-xl border border-border bg-card overflow-hidden">
              <button
                onClick={() => setOpened((s) => ({ ...s, [empresa]: !isOpen }))}
                className="w-full flex items-center justify-between px-5 py-3 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-md bg-[#034C8B] text-white flex items-center justify-center text-xs font-semibold">
                    {empresa.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                  </div>
                  <span className="font-medium">{empresa}</span>
                  <span className="text-xs text-muted-foreground">{docs.length} documento{docs.length !== 1 ? "s" : ""}</span>
                </div>
                <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
              </button>

              {isOpen && (
                <div className="border-t border-border divide-y divide-border">
                  {docs.map((d) => (
                    <div key={d.id} className="grid grid-cols-12 items-center px-5 py-3 gap-3 hover:bg-muted/30 transition-colors">
                      <div className="col-span-12 md:col-span-5 flex items-center gap-3 min-w-0">
                        <div className="h-9 w-9 rounded-md bg-[#3B82F6]/10 text-[#3B82F6] flex items-center justify-center shrink-0">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium truncate">{d.nome}</div>
                          <div className="text-xs text-muted-foreground">ID {d.id}</div>
                        </div>
                      </div>
                      <div className="col-span-4 md:col-span-2">
                        <span className="badge-pill bg-[#8B5CF6]/15 text-[#8B5CF6] border-[#8B5CF6]/30">{d.tipo}</span>
                      </div>
                      <div className="col-span-4 md:col-span-2">
                        {d.entregavel && (
                          <span className="badge-pill bg-emerald-500/15 text-emerald-500 border-emerald-500/30">Entregável</span>
                        )}
                      </div>
                      <div className="col-span-2 md:col-span-2 text-xs text-muted-foreground">{d.uploadEm}</div>
                      <div className="col-span-2 md:col-span-1 flex items-center justify-end gap-0.5">
                        <button className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground" title="Visualizar">
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground" title="Download">
                          <Download className="h-3.5 w-3.5" />
                        </button>
                        <CopyLinkBtn value={`https://app.azumi.com.br/docs/${d.id}`} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {grupos.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
            Nenhum documento encontrado.
          </div>
        )}
      </div>

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle>Upload de documento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="doc-nome">Nome</Label>
              <Input id="doc-nome" placeholder="Nome do documento" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="doc-empresa">Empresa</Label>
              <Input id="doc-empresa" placeholder="Empresa vinculada" />
            </div>
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Contrato">Contrato</SelectItem>
                  <SelectItem value="Relatório">Relatório</SelectItem>
                  <SelectItem value="Boleto">Boleto</SelectItem>
                  <SelectItem value="Proposta">Proposta</SelectItem>
                  <SelectItem value="Anexo">Anexo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="doc-file">Arquivo</Label>
              <Input id="doc-file" type="file" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadOpen(false)} className="rounded-[100px]">Cancelar</Button>
            <Button onClick={() => setUploadOpen(false)} className="rounded-[100px] bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white">
              <Plus className="h-4 w-4" /> Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
