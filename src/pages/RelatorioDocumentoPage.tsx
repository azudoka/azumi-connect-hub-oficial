import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getMockRelatorio, updateMockRelatorio } from "@/data/relatoriosMock";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Printer, Send, CheckCircle, ExternalLink } from "lucide-react";
import ReportDocumentView from "@/components/relatorios/ReportDocumentView";
import type { Report, TaskRow, SolRow, ReportStatus } from "@/components/relatorios/ReportDocumentView";

const STATUS_LABELS: Record<ReportStatus, string> = {
  draft: "Rascunho",
  pending_approval: "Ag. aprovação",
  approved: "Aprovado",
  published: "Publicado",
};

export default function RelatorioDocumentoPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const isAdmin = ["admin", "admin_azumi"].includes(usuario?.role ?? "");
  const isConsultant = usuario?.role === "consultor";
  const isClient = ["cliente", "gestor_cliente"].includes(usuario?.role ?? "");
  const isInternal = isAdmin || isConsultant;
  const canCreate = isAdmin || isConsultant;

  const [report, setReport] = useState<Report | null>(null);
  const [taskRows] = useState<TaskRow[]>([]);
  const [solRows] = useState<SolRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    if (!id) return;
    const r = getMockRelatorio(id);
    if (!r) {
      toast.error("Relatório não encontrado.");
      navigate(-1);
      return;
    }
    setReport(r as unknown as Report);
    setAcknowledged(!!r.client_signed_at);
    setLoading(false);
  }, [id, navigate]);

  function handleStatusChange(newStatus: ReportStatus) {
    if (!id || !report) return;
    setActioning(true);
    const now = new Date().toISOString();
    const updates: Partial<Report> = { status: newStatus };
    if (newStatus === "approved") {
      updates.admin_approved_at = now;
      updates.admin_name = usuario?.nome ?? "Admin";
    }
    if (newStatus === "published") {
      updates.published_at = now;
    }
    updateMockRelatorio(id, updates as Parameters<typeof updateMockRelatorio>[1]);
    setReport((prev) => prev ? { ...prev, status: newStatus, ...updates } as Report : prev);
    toast.success(
      newStatus === "published"
        ? "Relatório publicado."
        : `Status atualizado para "${STATUS_LABELS[newStatus]}".`
    );
    setActioning(false);
  }

  function handleAcknowledge(reportId: string) {
    const now = new Date().toISOString();
    updateMockRelatorio(reportId, { client_signed_at: now } as Parameters<typeof updateMockRelatorio>[1]);
    setAcknowledged(true);
    setReport((prev) => prev ? { ...prev, client_signed_at: now } : prev);
    toast.success("Ciência registrada com sucesso.");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!report) return null;

  const comp = report.company as { nome: string } | null;

  return (
    <div>
      {/* Toolbar */}
      <div className="no-print sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="h-8 w-8 rounded-md border border-border flex items-center justify-center hover:bg-secondary"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm truncate">
            {report.title ?? report.month_ref}
          </div>
          {comp?.nome && (
            <div className="text-xs text-muted-foreground">{comp.nome}</div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isInternal && report.status !== "published" && (
            <>
              {report.status === "draft" && canCreate && (
                <button
                  onClick={() => handleStatusChange("pending_approval")}
                  disabled={actioning}
                  className="h-8 px-3 rounded-md border border-border text-xs font-medium hover:bg-secondary flex items-center gap-1.5 disabled:opacity-50"
                >
                  {actioning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  Enviar para aprovação
                </button>
              )}
              {report.status === "pending_approval" && isAdmin && (
                <button
                  onClick={() => handleStatusChange("approved")}
                  disabled={actioning}
                  className="h-8 px-3 rounded-md bg-blue-500/10 border border-blue-400/30 text-blue-600 text-xs font-medium hover:bg-blue-500/20 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {actioning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                  Aprovar
                </button>
              )}
              {report.status === "approved" && isAdmin && (
                <button
                  onClick={() => handleStatusChange("published")}
                  disabled={actioning}
                  className="h-8 px-3 rounded-md bg-emerald-500/10 border border-emerald-400/30 text-emerald-600 text-xs font-medium hover:bg-emerald-500/20 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {actioning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ExternalLink className="h-3.5 w-3.5" />}
                  Publicar
                </button>
              )}
            </>
          )}

          <button
            onClick={() => window.print()}
            className="h-8 px-3 rounded-md border border-border text-xs font-medium hover:bg-secondary flex items-center gap-1.5"
          >
            <Printer className="h-3.5 w-3.5" />
            Imprimir / PDF
          </button>
        </div>
      </div>

      {/* Document */}
      <div className="p-4 sm:p-8 max-w-4xl mx-auto">
        <ReportDocumentView
          report={report}
          taskRows={taskRows}
          solicitationRows={solRows}
          userRole={usuario?.role}
          onAcknowledge={handleAcknowledge}
          acknowledged={acknowledged}
        />
      </div>
    </div>
  );
}
