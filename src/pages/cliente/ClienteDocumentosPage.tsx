import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { FileText, FileSpreadsheet, Presentation, Download, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { documentosMock, type DocumentoMock } from "@/data/documentosMock";

const tipoConfig: Record<string, { icon: LucideIcon; cls: string }> = {
  PDF:          { icon: FileText,        cls: "text-red-500 bg-red-500/10" },
  Planilha:     { icon: FileSpreadsheet, cls: "text-emerald-500 bg-emerald-500/10" },
  Apresentação: { icon: Presentation,    cls: "text-blue-500 bg-blue-500/10" },
};

function iconeFor(tipo: string) {
  return tipoConfig[tipo] ?? { icon: FileText, cls: "text-muted-foreground bg-muted" };
}

function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

// Documentos visíveis para o cliente: apenas publicados, da sua empresa (Kentaki Foods).
const EMPRESA_CLIENTE_ID = "emp-001";

export default function ClienteDocumentosPage() {
  const docs: DocumentoMock[] = documentosMock.filter(
    (d) => d.empresa_id === EMPRESA_CLIENTE_ID && d.status === "publicado",
  );
  const categorias = [...new Set(docs.map((d) => d.categoria))];

  return (
    <div>
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
        <div className="space-y-6">
          {categorias.map((cat) => (
            <div key={cat} className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-secondary/30 flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{cat}</span>
              </div>
              <ul className="divide-y divide-border">
                {docs.filter((d) => d.categoria === cat).map((doc) => {
                  const { icon: Icon, cls } = iconeFor(doc.tipo);
                  return (
                    <li key={doc.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-secondary/20 transition-colors">
                      <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center shrink-0", cls)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{doc.titulo}</p>
                        <p className="text-xs text-muted-foreground">{doc.tipo} · {doc.versao} · {formatarData(doc.created_at)}</p>
                      </div>
                      <a
                        href={doc.file_url ?? "#"}
                        target={doc.file_url ? "_blank" : undefined}
                        rel="noreferrer"
                        aria-disabled={!doc.file_url}
                        className={cn(
                          "shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors",
                          doc.file_url
                            ? "text-muted-foreground hover:text-primary hover:bg-secondary/50"
                            : "text-muted-foreground/50 pointer-events-none",
                        )}
                      >
                        <Download className="h-3.5 w-3.5" />
                        Baixar
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
