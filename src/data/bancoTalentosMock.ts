export type DiscDimMock = "D" | "I" | "S" | "C";
export type StatusTalento = "disponivel" | "em_processo" | "contratado";

export interface TalentoCandidato {
  id: string;
  nome: string;
  fotoUrl: string | null;
  email: string;
  telefone: string;
  cargoPretendido: string;
  cidade: string;
  escolaridade: string;
  perfilDisc: DiscDimMock;
  scoresDisc: { D: number; I: number; S: number; C: number };
  status: StatusTalento;
  ultimaInteracao: string; // ISO
  contratoDesejado: string;
  disponibilidade: string;
  linkedin?: string;
  historico: { vaga: string; etapa: string; data: string }[];
  interessesSetores?: string[];
  interessesCargos?: string[];
}

export const TALENTOS_MOCK: TalentoCandidato[] = [
  {
    id: "t1",
    nome: "Mariana Silva",
    fotoUrl: null,
    email: "mariana.silva@email.com",
    telefone: "(41) 99999-1111",
    cargoPretendido: "Analista de Marketing",
    cidade: "Curitiba, PR",
    escolaridade: "Superior completo",
    perfilDisc: "I",
    scoresDisc: { D: 45, I: 82, S: 60, C: 38 },
    status: "disponivel",
    ultimaInteracao: new Date(Date.now() - 3 * 86400000).toISOString(),
    contratoDesejado: "CLT",
    disponibilidade: "Imediato",
    linkedin: "linkedin.com/in/marianasilva",
    historico: [
      { vaga: "Analista de Marketing — Acme", etapa: "Entrevista", data: "2026-04-12" },
    ],
  },
  {
    id: "t2",
    nome: "Pedro Costa",
    fotoUrl: null,
    email: "pedro.costa@email.com",
    telefone: "(11) 98888-2222",
    cargoPretendido: "Gerente Comercial",
    cidade: "São Paulo, SP",
    escolaridade: "Pós-graduação/MBA",
    perfilDisc: "D",
    scoresDisc: { D: 88, I: 62, S: 40, C: 55 },
    status: "em_processo",
    ultimaInteracao: new Date(Date.now() - 1 * 86400000).toISOString(),
    contratoDesejado: "PJ",
    disponibilidade: "30 dias",
    historico: [
      { vaga: "Gerente Comercial — Rede Restaurantes", etapa: "Triagem", data: "2026-05-15" },
    ],
  },
  {
    id: "t3",
    nome: "Júlia Andrade",
    fotoUrl: null,
    email: "julia@email.com",
    telefone: "(41) 97777-3333",
    cargoPretendido: "Auxiliar Administrativo",
    cidade: "Curitiba, PR",
    escolaridade: "Ensino Médio",
    perfilDisc: "S",
    scoresDisc: { D: 32, I: 50, S: 80, C: 58 },
    status: "disponivel",
    ultimaInteracao: new Date(Date.now() - 14 * 86400000).toISOString(),
    contratoDesejado: "CLT",
    disponibilidade: "Imediato",
    historico: [],
  },
  {
    id: "t4",
    nome: "Rafael Souza",
    fotoUrl: null,
    email: "rafael@email.com",
    telefone: "(48) 96666-4444",
    cargoPretendido: "Analista Financeiro",
    cidade: "Florianópolis, SC",
    escolaridade: "Superior completo",
    perfilDisc: "C",
    scoresDisc: { D: 40, I: 35, S: 55, C: 90 },
    status: "contratado",
    ultimaInteracao: new Date(Date.now() - 60 * 86400000).toISOString(),
    contratoDesejado: "CLT",
    disponibilidade: "A combinar",
    historico: [
      { vaga: "Analista Financeiro — Cliente X", etapa: "Contratado", data: "2026-03-20" },
    ],
  },
  {
    id: "t5",
    nome: "Beatriz Lima",
    fotoUrl: null,
    email: "bia.lima@email.com",
    telefone: "(41) 95555-5555",
    cargoPretendido: "Recepcionista",
    cidade: "Curitiba, PR",
    escolaridade: "Ensino Médio",
    perfilDisc: "I",
    scoresDisc: { D: 50, I: 78, S: 65, C: 42 },
    status: "disponivel",
    ultimaInteracao: new Date(Date.now() - 5 * 86400000).toISOString(),
    contratoDesejado: "CLT",
    disponibilidade: "15 dias",
    historico: [],
  },
];

export const STATUS_LABEL: Record<StatusTalento, string> = {
  disponivel: "Disponível",
  em_processo: "Em processo",
  contratado: "Contratado",
};

export const DISC_COR: Record<DiscDimMock, string> = {
  D: "#ef4444",
  I: "#f59e0b",
  S: "#10b981",
  C: "#3b82f6",
};
