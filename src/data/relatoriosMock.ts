import type { ReportRow } from "@/pages/RelatoriosPage";

export const MOCK_RELATORIOS: ReportRow[] = [
  {
    id: "rel-001",
    title: "Relatório HRaaS — Kentaki Foods — Abril/2026",
    status: "published",
    month_ref: "2026-04",
    report_type: "hraas_operacao_continua",
    total_hours_minutes: 1680,
    hours_deliverables_minutes: 1200,
    hours_solicitations_minutes: 480,
    reference_start: "2026-04-01",
    reference_end: "2026-04-30",
    summary_text: "Mês de alta produtividade com foco em processos de R&S e estruturação de onboarding.",
    risks_text: "Pipeline de candidatos para vaga de Dev Pleno ainda aberto — risco de atraso na entrega.",
    next_steps_text: "Iniciar mapeamento de cargos em maio. Revisar política de férias.",
    consultant_name: "Ana Beatriz",
    consultant_job_title: "Consultora Sênior",
    admin_approved_at: "2026-05-01T10:00:00Z",
    admin_name: "Patricia Lima",
    published_at: "2026-05-02T09:00:00Z",
    client_signed_at: null,
    template_data: {
      objectives: ["Mapear processos internos de RH", "Apoiar recrutamento de 3 vagas abertas", "Estruturar onboarding"],
      deliveries: ["Processo seletivo Dev Pleno concluído", "Treinamento de onboarding realizado", "Política de benefícios revisada"],
      pendencies: ["Revisão da política de férias pendente", "Vaga de Designer ainda em triagem"],
    },
    empresa_id: "emp-001",
    company: { nome: "Kentaki Foods", logo_url: null, monthly_hours: 25 },
    client_opened_at: null,
    boleto_url: null, boleto_vencimento: null, boleto_valor: null,
    comprovante_url: null, comprovante_uploaded_at: null,
  },
  {
    id: "rel-002",
    title: "Relatório HRaaS — Kentaki Foods — Maio/2026",
    status: "draft",
    month_ref: "2026-05",
    report_type: "hraas_operacao_continua",
    total_hours_minutes: 0,
    hours_deliverables_minutes: 0,
    hours_solicitations_minutes: 0,
    reference_start: "2026-05-01",
    reference_end: "2026-05-31",
    summary_text: null,
    risks_text: null,
    next_steps_text: null,
    consultant_name: "Ana Beatriz",
    consultant_job_title: "Consultora Sênior",
    admin_approved_at: null,
    admin_name: null,
    published_at: null,
    client_signed_at: null,
    template_data: {},
    empresa_id: "emp-001",
    company: { nome: "Kentaki Foods", logo_url: null, monthly_hours: 25 },
    client_opened_at: null,
    boleto_url: null, boleto_vencimento: null, boleto_valor: null,
    comprovante_url: null, comprovante_uploaded_at: null,
  },
] as unknown as ReportRow[];

export let mockRelatorios = [...MOCK_RELATORIOS];

export function getMockRelatorio(id: string) {
  return mockRelatorios.find((r) => r.id === id) ?? null;
}

export function addMockRelatorio(r: ReportRow) {
  mockRelatorios = [r, ...mockRelatorios];
}

export function updateMockRelatorio(id: string, updates: Partial<ReportRow>) {
  mockRelatorios = mockRelatorios.map((r) => (r.id === id ? { ...r, ...updates } : r));
}

export function deleteMockRelatorio(id: string) {
  mockRelatorios = mockRelatorios.filter((r) => r.id !== id);
}
