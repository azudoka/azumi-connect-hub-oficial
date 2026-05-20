export type CategoriaDoc = "Políticas" | "Manuais" | "Fluxos" | "Guias" | "Relatórios" | "Onboarding" | "Outro";
export type StatusDoc = "publicado" | "rascunho";

export interface DocumentoMock {
  id: string;
  empresa: string;
  empresa_id: string;
  titulo: string;
  categoria: CategoriaDoc;
  tipo: string;
  status: StatusDoc;
  versao: string;
  created_at: string;
  file_url: string | null;
  capa_url: string | null;
  ciencias: number;
  visualizacoes: number;
  publicado_de_entregavel: boolean;
}

export let documentosMock: DocumentoMock[] = [
  { id: "doc-100", empresa: "Kentaki Foods", empresa_id: "emp-001", titulo: "Relatório HRaaS — Abril/2026", categoria: "Relatórios", tipo: "PDF", status: "publicado", versao: "v1.0", created_at: "2026-05-02", file_url: "https://example.com/relatorio-abril-2026.pdf", capa_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80", ciencias: 4, visualizacoes: 9, publicado_de_entregavel: true },
  { id: "doc-101", empresa: "Kentaki Foods", empresa_id: "emp-001", titulo: "Política de Home Office v2", categoria: "Políticas", tipo: "PDF", status: "publicado", versao: "v2.0", created_at: "2026-04-22", file_url: "https://example.com/politica-home-office-v2.pdf", capa_url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80", ciencias: 6, visualizacoes: 14, publicado_de_entregavel: false },
  { id: "doc-102", empresa: "Kentaki Foods", empresa_id: "emp-001", titulo: "Onboarding — Manual do Colaborador", categoria: "Onboarding", tipo: "PDF", status: "publicado", versao: "v1.3", created_at: "2026-04-05", file_url: "https://example.com/onboarding-manual.pdf", capa_url: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&q=80", ciencias: 9, visualizacoes: 21, publicado_de_entregavel: true },
  { id: "doc-001", empresa: "Kentaki Foods", empresa_id: "emp-001", titulo: "Política de Cargos e Salários", categoria: "Políticas", tipo: "PDF", status: "publicado", versao: "v1.0", created_at: "2026-04-15", file_url: "https://example.com/politica-cargos.pdf", capa_url: "https://images.unsplash.com/photo-1568992688065-536aad8a12f6?w=600&q=80", ciencias: 3, visualizacoes: 7, publicado_de_entregavel: true },
  { id: "doc-002", empresa: "Kentaki Foods", empresa_id: "emp-001", titulo: "Manual de Integração de Colaboradores", categoria: "Manuais", tipo: "PDF", status: "publicado", versao: "v2.1", created_at: "2026-03-20", file_url: "https://example.com/manual-integracao.pdf", capa_url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80", ciencias: 12, visualizacoes: 18, publicado_de_entregavel: false },
  { id: "doc-003", empresa: "Kentaki Foods", empresa_id: "emp-001", titulo: "Fluxo de Solicitação de Férias", categoria: "Fluxos", tipo: "PDF", status: "rascunho", versao: "v1.0", created_at: "2026-05-01", file_url: null, capa_url: null, ciencias: 0, visualizacoes: 0, publicado_de_entregavel: false },
  { id: "doc-004", empresa: "Tech Corp", empresa_id: "emp-002", titulo: "Guia de Boas Práticas — Trabalho Remoto", categoria: "Guias", tipo: "PDF", status: "publicado", versao: "v1.2", created_at: "2026-02-10", file_url: "https://example.com/guia-remoto.pdf", capa_url: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&q=80", ciencias: 8, visualizacoes: 24, publicado_de_entregavel: true },
  { id: "doc-005", empresa: "Tech Corp", empresa_id: "emp-002", titulo: "Política de Uso de Equipamentos", categoria: "Políticas", tipo: "PDF", status: "publicado", versao: "v1.0", created_at: "2026-01-15", file_url: "https://example.com/politica-equipamentos.pdf", capa_url: null, ciencias: 5, visualizacoes: 11, publicado_de_entregavel: false },
];

export function adicionarDocumento(doc: DocumentoMock) {
  documentosMock = [doc, ...documentosMock];
}

export function atualizarDocumento(id: string, patch: Partial<DocumentoMock>) {
  documentosMock = documentosMock.map((d) => d.id === id ? { ...d, ...patch } : d);
}

export function removerDocumento(id: string) {
  documentosMock = documentosMock.filter((d) => d.id !== id);
}
