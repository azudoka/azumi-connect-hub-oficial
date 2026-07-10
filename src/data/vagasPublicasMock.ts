export type VagaPublica = {
  id: string;
  titulo: string;
  empresa: string;
  logo: string | null;
  segmento: string;
  nivel: string;
  modalidade: string;
  tipo_contrato: string;
  salario_de: number | null;
  salario_ate: number | null;
  salario_fixo: boolean;
  confidencial: boolean;
  tem_comissao: boolean;
  local_trabalho: string;
  carga_horaria: string;
  turno: string;
  nivel_urgencia: string | null;
  descricao: string;
  beneficios: string;
  created_at: string;
};

export const VAGAS_MOCK: VagaPublica[] = [
  {
    id: "1",
    titulo: "Analista de RH",
    empresa: "Empresa Confidencial",
    logo: null,
    segmento: "RH",
    nivel: "pleno",
    modalidade: "hibrido",
    tipo_contrato: "clt",
    salario_de: 4500,
    salario_ate: 6000,
    salario_fixo: false,
    confidencial: false,
    tem_comissao: false,
    local_trabalho: "Curitiba, PR",
    carga_horaria: "44h semanais",
    turno: "integral",
    nivel_urgencia: null,
    descricao:
      "Buscamos um Analista de RH para atuar nas frentes de recrutamento, treinamento e desenvolvimento.",
    beneficios: "",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "2",
    titulo: "Gerente Comercial",
    empresa: "Rede de Restaurantes",
    logo: null,
    segmento: "Gastronomia",
    nivel: "senior",
    modalidade: "presencial",
    tipo_contrato: "clt",
    salario_de: 8000,
    salario_ate: 12000,
    salario_fixo: false,
    confidencial: false,
    tem_comissao: true,
    local_trabalho: "São Paulo, SP",
    carga_horaria: "44h semanais",
    turno: "integral",
    nivel_urgencia: "urgente",
    descricao:
      "Oportunidade para liderar equipe comercial em rede de restaurantes em expansão.",
    beneficios: "",
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "3",
    titulo: "Auxiliar Administrativo",
    empresa: "Empresa Confidencial",
    logo: null,
    segmento: "Administrativo",
    nivel: "junior",
    modalidade: "presencial",
    tipo_contrato: "clt",
    salario_de: 1800,
    salario_ate: 2200,
    salario_fixo: false,
    confidencial: false,
    tem_comissao: false,
    local_trabalho: "Curitiba, PR",
    carga_horaria: "40h semanais",
    turno: "manha",
    nivel_urgencia: null,
    descricao:
      "Apoio em rotinas administrativas, controle de documentos e atendimento interno.",
    beneficios: "",
    created_at: new Date().toISOString(),
  },
  {
    id: "4",
    titulo: "Estagiário de Marketing",
    empresa: "Startup de Tecnologia",
    logo: null,
    segmento: "Marketing",
    nivel: "estagio",
    modalidade: "remoto",
    tipo_contrato: "estagio",
    salario_de: 1200,
    salario_ate: null,
    salario_fixo: true,
    confidencial: false,
    tem_comissao: false,
    local_trabalho: "Remoto",
    carga_horaria: "30h semanais",
    turno: "flexivel",
    nivel_urgencia: null,
    descricao:
      "Estágio em marketing digital com foco em redes sociais, conteúdo e performance.",
    beneficios: "",
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: "5",
    titulo: "Chef de Cozinha",
    empresa: "Hotel Boutique",
    logo: null,
    segmento: "Gastronomia",
    nivel: "senior",
    modalidade: "presencial",
    tipo_contrato: "clt",
    salario_de: 7000,
    salario_ate: 9000,
    salario_fixo: false,
    confidencial: false,
    tem_comissao: false,
    local_trabalho: "Florianópolis, SC",
    carga_horaria: "44h semanais",
    turno: "integral",
    nivel_urgencia: "urgente",
    descricao:
      "Chef responsável pela criação de cardápio e gestão da equipe de cozinha.",
    beneficios: "",
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "6",
    titulo: "Recepcionista",
    empresa: "Clínica Odontológica",
    logo: null,
    segmento: "Saúde",
    nivel: "junior",
    modalidade: "presencial",
    tipo_contrato: "clt",
    salario_de: 1800,
    salario_ate: 2000,
    salario_fixo: false,
    confidencial: false,
    tem_comissao: false,
    local_trabalho: "Curitiba, PR",
    carga_horaria: "40h semanais",
    turno: "manha",
    nivel_urgencia: null,
    descricao:
      "Atendimento presencial e telefônico, agendamento de consultas e organização da recepção.",
    beneficios: "",
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
];

export const NIVEL_LABEL: Record<string, string> = {
  padrao: "Padrão",
  estagio: "Estágio",
  junior: "Júnior",
  pleno: "Pleno",
  senior: "Sênior",
  especialista: "Especialista",
  gerencia: "Gerência",
  diretoria: "Diretoria",
};

export const MODALIDADE_LABEL: Record<string, string> = {
  presencial: "Presencial",
  remoto: "Remoto",
  hibrido: "Híbrido",
};

export const CONTRATO_LABEL: Record<string, string> = {
  clt: "CLT",
  pj: "PJ",
  estagio: "Estágio",
  temporario: "Temporário",
};

export const TURNO_LABEL: Record<string, string> = {
  manha: "Manhã",
  tarde: "Tarde",
  noite: "Noite",
  integral: "Integral",
  flexivel: "Flexível",
};

export function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export function formatSalario(de: number | null, ate: number | null, salario_fixo?: boolean) {
  if (salario_fixo && de) return formatBRL(de);
  if (de && ate) return `${formatBRL(de)} – ${formatBRL(ate)}`;
  if (de) return `A partir de ${formatBRL(de)}`;
  if (ate) return `Até ${formatBRL(ate)}`;
  return "A combinar";
}

export function diasAtras(iso: string) {
  const dias = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (dias <= 0) return "Hoje";
  if (dias === 1) return "1 dia atrás";
  return `${dias} dias atrás`;
}
