import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Printer, Send, CheckCircle, ExternalLink } from "lucide-react";
import ReportDocumentView from "@/components/relatorios/ReportDocumentView";
import type { Report, TaskRow, SolRow, ReportStatus } from "@/components/relatorios/ReportDocumentView";

const REPORT_SELECT = `
  id, title, status, month_ref, summary_text, risks_text, next_steps_text,
  total_hours_minutes, hours_deliverables_minutes, hours_solicitations_minutes,
  reference_start, reference_end, consultant_name, consultant_job_title, empresa_id,
  admin_approved_at, admin_name, published_at, client_signed_at, report_type,
  template_data,
  company:empresas(nome, logo_url, monthly_hours)
`.trim();

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

  const isAdmin = usuario?.role === "admin";
  const isConsultant = usuario?.role === "consultor";
  const isClient = usuario?.role === "cliente";
  const isInternal = isAdmin || isConsultant;
  const canCreate = isAdmin || isConsultant;

  const [report, setReport] = useState<Report | null>(null);
  const [taskRows, setTaskRows] = useState<TaskRow[]>([]);
  const [solRows, setSolRows] = useState<SolRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function load() {
      setLoading(true);
      try {
        const { data: rep, error } = await supabase
          .from("monthly_reports")
          .select(REPORT_SELECT)
          .eq("id", id)
          .single();

        if (error || !rep) {
          toast.error("Relatório não encontrado.");
          navigate(-1);
          return;
        }

        const r = rep as unknown as Report & { empresa_id?: string };
        setReport(r);
        setAcknowledged(!!r.client_signed_at);

        // Register client_opened_at if client and not yet registered
        if (isClient && !((rep as { client_opened_at?: string }).client_opened_at)) {
          await supabase
            .from("monthly_reports")
            .update({ client_opened_at: new Date().toISOString() })
            .eq("id", id);
        }

        // time_entries será implementado quando tabela existir
        setTaskRows([]);
        // solicitations será implementado quando tabela existir
        setSolRows([]);
      } catch (err) {
        console.error(err);
        toast.error("Erro ao carregar relatório.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id, isClient, navigate]);

  async function handleStatusChange(newStatus: ReportStatus) {
    if (!id || !report) return;
    setActioning(true);
    const updates: Record<string, unknown> = { status: newStatus };
    if (newStatus === "approved") {
      updates.admin_approved_at = new Date().toISOString();
      updates.admin_name = usuario?.nome ?? "Admin";
    }
    if (newStatus === "published") {
      updates.published_at = new Date().toISOString();
    }
    const { error } = await supabase.from("monthly_reports").update(updates).eq("id", id);
    if (error) {
      toast.error("Erro ao atualizar status.");
      setActioning(false);
      return;
    }

    if (newStatus === "published") {
      const companyId = (report as Report & { company_id?: string }).company_id;
      if (companyId) {
        const { data: users } = await supabase
          .from("users_profile")
          .select("id")
          .eq("company_id", companyId)
          .eq("role", "cliente_user");
        if (users?.length) {
          await supabase.from("app_notifications").insert(
            (users as { id: string }[]).map((u) => ({
              user_id: u.id,
              title: "Novo relatório disponível",
              body: `O relatório "${report.title ?? report.month_ref}" foi publicado.`,
              link: `/app/relatorios/${id}/documento`,
            }))
          );
        }
      }
      toast.success("Relatório publicado e clientes notificados.");
    } else {
      toast.success(`Status atualizado para "${STATUS_LABELS[newStatus]}".`);
    }

    setReport((prev) => prev ? { ...prev, status: newStatus, ...updates } as Report : prev);
    setActioning(false);
  }

  async function handleAcknowledge(reportId: string) {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("monthly_reports")
      .update({ client_signed_at: now })
      .eq("id", reportId);
    if (error) { toast.error("Erro ao registrar ciência."); return; }
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

  const comp = report.company as { name: string } | null;

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
          {comp?.name && (
            <div className="text-xs text-muted-foreground">{comp.name}</div>
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
