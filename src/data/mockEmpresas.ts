// =============================================================================
// MOCK CENTRAL DE EMPRESAS — dados de demonstração para o portal do cliente
// =============================================================================
// Cada empresa traz tudo que as páginas do cliente precisam consumir:
// - filiais, usuários, consultor responsável, plano e horas
// - vagas (atração), projetos, solicitações, comunicados, eventos de calendário
//
// TODO: conectar a Supabase quando houver schema definido por empresa.
// =============================================================================

export type PlanoMock = "start" | "ongoing" | "growth";

export interface FilialMock {
  id: string;
  nome: string;
  cidade: string;
  uf: string;
  isMatriz: boolean;
}

export interface UsuarioMock {
  id: string;
  nome: string;
  email: string;
  papel: "admin" | "usuario";
}

export interface VagaMock {
  id: string;
  titulo: string;
  filialId: string;
  status: "ativa" | "pausada" | "finalizada";
  candidatos: number;
  abertaEm: string;
}

export interface ProjetoMock {
  id: string;
  nome: string;
  status: "andamento" | "planejado" | "concluido";
  progresso: number; // 0-100
  responsavel: string;
}

export interface SolicitacaoMock {
  id: string;
  codigo: string;
  titulo: string;
  tipo: string;
  status: "aberta" | "andamento" | "aguardando_cliente" | "finalizada" | "cancelada";
  criadaEm: string;
}

export interface ComunicadoMock {
  id: string;
  titulo: string;
  resumo: string;
  data: string;
  tipo: "atualizacao" | "aviso" | "endomarketing" | "alerta" | "evento";
}

export interface EventoCalendarioMock {
  id: string;
  titulo: string;
  data: string; // ISO
  tipo: "reuniao" | "entrega" | "treinamento" | "visita";
}

export interface EmpresaMock {
  isMock: true;
  id: string;
  nome: string;
  plano: PlanoMock;
  horasMensais: number;
  consultor: { nome: string; email: string };
  filiais: FilialMock[];
  usuarios: UsuarioMock[];
  vagas: VagaMock[];
  projetos: ProjetoMock[];
  solicitacoes: SolicitacaoMock[];
  comunicados: ComunicadoMock[];
  eventos: EventoCalendarioMock[];
}

// =============================================================================
// EMPRESA 1 — Kentaki Foods (Ongoing 40h)
// =============================================================================
export const kentakiFoods: EmpresaMock = {
  isMock: true,
  id: "kentaki",
  nome: "Kentaki Foods",
  plano: "ongoing",
  horasMensais: 40,
  consultor: { nome: "Ana Beatriz", email: "ana.beatriz@azumi.com.br" },
  filiais: [
    { id: "kt-matriz", nome: "Matriz São Paulo", cidade: "São Paulo", uf: "SP", isMatriz: true },
    { id: "kt-rj",     nome: "Filial Rio de Janeiro", cidade: "Rio de Janeiro", uf: "RJ", isMatriz: false },
  ],
  usuarios: [
    { id: "kt-u1", nome: "Mariana Souza",  email: "mariana@kentaki.com.br", papel: "admin"   },
    { id: "kt-u2", nome: "Carlos Mendes",  email: "carlos@kentaki.com.br",  papel: "usuario" },
  ],
  vagas: [
    { id: "kt-v1", titulo: "Gerente de TI",       filialId: "kt-matriz", status: "ativa",      candidatos: 12, abertaEm: "2026-04-22" },
    { id: "kt-v2", titulo: "Analista de Marketing", filialId: "kt-rj",   status: "ativa",      candidatos: 7,  abertaEm: "2026-05-02" },
    { id: "kt-v3", titulo: "Coordenador Logístico", filialId: "kt-matriz", status: "finalizada", candidatos: 18, abertaEm: "2026-02-10" },
  ],
  projetos: [
    { id: "kt-p1", nome: "Implantação HRaaS",            status: "andamento",  progresso: 65, responsavel: "Ana Beatriz" },
    { id: "kt-p2", nome: "Revisão da política de home office", status: "andamento", progresso: 40, responsavel: "Ana Beatriz" },
    { id: "kt-p3", nome: "Pesquisa de clima Q3",          status: "planejado",  progresso: 0,  responsavel: "Ana Beatriz" },
  ],
  solicitacoes: [
    { id: "kt-s1", codigo: "SOL-2026-0091", titulo: "Revisão de política de home office", tipo: "duvida",       status: "andamento",  criadaEm: "2026-05-05" },
    { id: "kt-s2", codigo: "SOL-2026-0082", titulo: "Mapeamento de cargos Q1",            tipo: "duvida",       status: "finalizada", criadaEm: "2026-01-20" },
    { id: "kt-s3", codigo: "SOL-2026-0077", titulo: "Pesquisa de clima — pausada",        tipo: "endomarketing", status: "cancelada", criadaEm: "2026-04-02" },
  ],
  comunicados: [
    { id: "kt-c1", titulo: "Bem-vinda à Azumi, Kentaki Foods!",     resumo: "Início oficial da parceria.",     data: "2026-04-18", tipo: "endomarketing" },
    { id: "kt-c2", titulo: "Relatório HRaaS — Abril 2026 publicado", resumo: "Indicadores e resumo de ações.", data: "2026-05-05", tipo: "atualizacao" },
    { id: "kt-c3", titulo: "Reunião de alinhamento — 28/05",         resumo: "Detalhes por e-mail em breve.",  data: "2026-05-12", tipo: "aviso" },
  ],
  eventos: [
    { id: "kt-e1", titulo: "Reunião de alinhamento",   data: "2026-05-28T14:00:00Z", tipo: "reuniao" },
    { id: "kt-e2", titulo: "Entrega relatório HRaaS",  data: "2026-06-05T18:00:00Z", tipo: "entrega" },
    { id: "kt-e3", titulo: "Workshop liderança",       data: "2026-06-12T13:00:00Z", tipo: "treinamento" },
  ],
};

// =============================================================================
// EMPRESA 2 — Construtora Horizonte (Start 15h)
// =============================================================================
export const construtoraHorizonte: EmpresaMock = {
  isMock: true,
  id: "horizonte",
  nome: "Construtora Horizonte",
  plano: "start",
  horasMensais: 15,
  consultor: { nome: "Rafael Moura", email: "rafael.moura@azumi.com.br" },
  filiais: [
    { id: "hz-cwb", nome: "Curitiba — Matriz", cidade: "Curitiba", uf: "PR", isMatriz: true },
  ],
  usuarios: [
    { id: "hz-u1", nome: "Felipe Andrade", email: "felipe@horizonte.com.br", papel: "admin" },
  ],
  vagas: [
    { id: "hz-v1", titulo: "Engenheiro Civil Pleno", filialId: "hz-cwb", status: "ativa", candidatos: 4, abertaEm: "2026-05-10" },
  ],
  projetos: [
    { id: "hz-p1", nome: "Estruturação de plano de cargos", status: "andamento", progresso: 30, responsavel: "Rafael Moura" },
  ],
  solicitacoes: [
    { id: "hz-s1", codigo: "SOL-2026-0102", titulo: "Modelo de avaliação de obra", tipo: "duvida", status: "aberta", criadaEm: "2026-05-15" },
  ],
  comunicados: [
    { id: "hz-c1", titulo: "Onboarding concluído",  resumo: "Acessos liberados na plataforma.",     data: "2026-05-08", tipo: "atualizacao" },
    { id: "hz-c2", titulo: "Modelo de descrição de cargos", resumo: "Disponível em Documentos.",     data: "2026-05-16", tipo: "aviso" },
  ],
  eventos: [
    { id: "hz-e1", titulo: "Kickoff plano de cargos", data: "2026-05-22T15:00:00Z", tipo: "reuniao" },
  ],
};

// =============================================================================
// EMPRESA 3 — Clínica Vita Saúde (Growth 80h)
// =============================================================================
export const clinicaVitaSaude: EmpresaMock = {
  isMock: true,
  id: "vita",
  nome: "Clínica Vita Saúde",
  plano: "growth",
  horasMensais: 80,
  consultor: { nome: "Juliana Costa", email: "juliana.costa@azumi.com.br" },
  filiais: [
    { id: "vt-centro", nome: "Unidade Centro", cidade: "São Paulo", uf: "SP", isMatriz: true  },
    { id: "vt-norte",  nome: "Unidade Norte",  cidade: "São Paulo", uf: "SP", isMatriz: false },
    { id: "vt-sul",    nome: "Unidade Sul",    cidade: "São Paulo", uf: "SP", isMatriz: false },
  ],
  usuarios: [
    { id: "vt-u1", nome: "Beatriz Lopes", email: "beatriz@vitasaude.com.br", papel: "admin"   },
    { id: "vt-u2", nome: "Pedro Nunes",   email: "pedro@vitasaude.com.br",   papel: "usuario" },
  ],
  vagas: [
    { id: "vt-v1", titulo: "Enfermeiro(a) Assistencial", filialId: "vt-centro", status: "ativa",   candidatos: 22, abertaEm: "2026-04-30" },
    { id: "vt-v2", titulo: "Recepcionista Bilíngue",     filialId: "vt-norte",  status: "ativa",   candidatos: 9,  abertaEm: "2026-05-04" },
    { id: "vt-v3", titulo: "Coordenador Médico",         filialId: "vt-sul",    status: "pausada", candidatos: 3,  abertaEm: "2026-03-18" },
  ],
  projetos: [
    { id: "vt-p1", nome: "Programa de Líderes",             status: "andamento", progresso: 55, responsavel: "Juliana Costa" },
    { id: "vt-p2", nome: "Trilha de onboarding clínico",    status: "andamento", progresso: 70, responsavel: "Juliana Costa" },
    { id: "vt-p3", nome: "Mapeamento de cargos por unidade", status: "concluido", progresso: 100, responsavel: "Juliana Costa" },
  ],
  solicitacoes: [
    { id: "vt-s1", codigo: "SOL-2026-0118", titulo: "Treinamento NR-32",        tipo: "treinamento",   status: "andamento",        criadaEm: "2026-05-09" },
    { id: "vt-s2", codigo: "SOL-2026-0120", titulo: "Material endomarketing maio", tipo: "endomarketing", status: "aguardando_cliente", criadaEm: "2026-05-12" },
    { id: "vt-s3", codigo: "SOL-2026-0124", titulo: "Visita Unidade Sul",        tipo: "visita",        status: "aberta",           criadaEm: "2026-05-17" },
  ],
  comunicados: [
    { id: "vt-c1", titulo: "Lançamento do Programa de Líderes", resumo: "Trilha iniciada para 12 líderes.", data: "2026-04-25", tipo: "endomarketing" },
    { id: "vt-c2", titulo: "Indicadores de turnover — abril",   resumo: "Queda de 1,8 p.p. no mês.",        data: "2026-05-06", tipo: "atualizacao" },
    { id: "vt-c3", titulo: "Atenção: campanha vacinal",         resumo: "Cronograma nas três unidades.",    data: "2026-05-14", tipo: "alerta" },
  ],
  eventos: [
    { id: "vt-e1", titulo: "Workshop NR-32",            data: "2026-06-03T13:00:00Z", tipo: "treinamento" },
    { id: "vt-e2", titulo: "Visita Unidade Sul",        data: "2026-06-10T15:00:00Z", tipo: "visita" },
    { id: "vt-e3", titulo: "Reunião comitê de líderes", data: "2026-06-18T17:00:00Z", tipo: "reuniao" },
  ],
};

// =============================================================================
// EXPORT CENTRAL
// =============================================================================
export const empresasMock: EmpresaMock[] = [
  kentakiFoods,
  construtoraHorizonte,
  clinicaVitaSaude,
];

export const empresasMockById: Record<string, EmpresaMock> = empresasMock.reduce(
  (acc, e) => ({ ...acc, [e.id]: e }),
  {},
);

/** True quando alguma empresa carregada está em modo mock. */
export const algumaEmpresaIsMock = empresasMock.some(e => e.isMock);
