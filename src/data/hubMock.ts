// Mocks centralizados do Azumi Hub – visão Colaborador.
// Tudo em memória, sem persistência.

export type PoliticaCategoria = "Governança" | "Operação" | "Compliance" | "RH";
export type PoliticaTipo = "Obrigatória" | "Complementar" | "Informativa";
export type PoliticaStatus = "assinada" | "visualizada" | "pendente" | "em_revisao";

export interface PoliticaHub {
  id: string;
  titulo: string;
  categoria: PoliticaCategoria;
  tipo: PoliticaTipo;
  versao: string;
  capa: string;
  visualizacoes: number;
  assinaturas: number;
  total: number;
  status: PoliticaStatus;
}

export const politicasMock: PoliticaHub[] = [
  {
    id: "p1",
    titulo: "Código de Conduta",
    categoria: "Governança",
    tipo: "Obrigatória",
    versao: "v3.2",
    capa: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=70",
    visualizacoes: 42,
    assinaturas: 38,
    total: 48,
    status: "visualizada",
  },
  {
    id: "p2",
    titulo: "Política de Home Office",
    categoria: "Operação",
    tipo: "Obrigatória",
    versao: "v2.0",
    capa: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=70",
    visualizacoes: 46,
    assinaturas: 44,
    total: 48,
    status: "assinada",
  },
  {
    id: "p3",
    titulo: "Política de Viagens",
    categoria: "Operação",
    tipo: "Complementar",
    versao: "v1.5",
    capa: "https://images.unsplash.com/photo-1544550581-1bcabf842b77?w=800&q=70",
    visualizacoes: 31,
    assinaturas: 25,
    total: 48,
    status: "visualizada",
  },
  {
    id: "p4",
    titulo: "LGPD - Privacidade de Dados",
    categoria: "Compliance",
    tipo: "Obrigatória",
    versao: "v1.0",
    capa: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=70",
    visualizacoes: 12,
    assinaturas: 0,
    total: 48,
    status: "em_revisao",
  },
  {
    id: "p5",
    titulo: "Manual de Benefícios",
    categoria: "RH",
    tipo: "Informativa",
    versao: "v4.1",
    capa: "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=70",
    visualizacoes: 47,
    assinaturas: 46,
    total: 48,
    status: "assinada",
  },
  {
    id: "p6",
    titulo: "Política Anticorrupção",
    categoria: "Compliance",
    tipo: "Obrigatória",
    versao: "v2.1",
    capa: "https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=800&q=70",
    visualizacoes: 35,
    assinaturas: 32,
    total: 48,
    status: "pendente",
  },
];

export type GuiaTipo = "PDF" | "Vídeo" | "Link externo";
export interface GuiaHub {
  id: string;
  titulo: string;
  descricao: string;
  tipo: GuiaTipo;
  categoria: string;
  capa: string;
  url: string;
}

export const guiasMock: GuiaHub[] = [
  {
    id: "g1",
    titulo: "Guia de Onboarding",
    descricao: "Passo a passo para os primeiros 30 dias na empresa.",
    tipo: "PDF",
    categoria: "Integração",
    capa: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=70",
    url: "#",
  },
  {
    id: "g2",
    titulo: "Manual do Colaborador",
    descricao: "Tudo o que você precisa saber sobre políticas, benefícios e cultura.",
    tipo: "PDF",
    categoria: "Geral",
    capa: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=70",
    url: "#",
  },
  {
    id: "g3",
    titulo: "Guia de Ferramentas",
    descricao: "Como acessar e usar as ferramentas internas da empresa.",
    tipo: "Vídeo",
    categoria: "Operação",
    capa: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=70",
    url: "#",
  },
  {
    id: "g4",
    titulo: "Protocolo de Segurança",
    descricao: "Procedimentos de segurança física e digital.",
    tipo: "PDF",
    categoria: "Compliance",
    capa: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=70",
    url: "#",
  },
  {
    id: "g5",
    titulo: "Guia de Comunicação Interna",
    descricao: "Canais oficiais e boas práticas de comunicação.",
    tipo: "Link externo",
    categoria: "Cultura",
    capa: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=70",
    url: "https://www.notion.so",
  },
  {
    id: "g6",
    titulo: "Trilha de Carreira",
    descricao: "Entenda os níveis, expectativas e caminhos de evolução.",
    tipo: "PDF",
    categoria: "Carreira",
    capa: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=70",
    url: "#",
  },
];

export type ModalidadeTreinamento = "Presencial" | "Online";
export interface TreinamentoHub {
  id: string;
  titulo: string;
  modalidade: ModalidadeTreinamento;
  data: string;
  instrutor: string;
  cargaHoraria: string;
  participantesAtual: number;
  participantesMax: number;
  sla: number;
  capa: string;
  materiais: { label: string; url: string }[];
}

export const treinamentosMock: TreinamentoHub[] = [
  {
    id: "t1",
    titulo: "Liderança Situacional",
    modalidade: "Presencial",
    data: "19/02/2026",
    instrutor: "Consultoria Externa",
    cargaHoraria: "8h",
    participantesAtual: 10,
    participantesMax: 12,
    sla: 85,
    capa: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=70",
    materiais: [
      { label: "Material de apoio (PDF)", url: "#" },
      { label: "Formulário de presença", url: "#" },
    ],
  },
  {
    id: "t2",
    titulo: "LGPD na Prática",
    modalidade: "Online",
    data: "04/03/2026",
    instrutor: "Julia Fernandes",
    cargaHoraria: "4h",
    participantesAtual: 40,
    participantesMax: 48,
    sla: 83,
    capa: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=70",
    materiais: [
      { label: "Slides (PDF)", url: "#" },
      { label: "Quiz de avaliação", url: "#" },
    ],
  },
  {
    id: "t3",
    titulo: "Excel Avançado",
    modalidade: "Online",
    data: "14/02/2026",
    instrutor: "Rafael Almeida",
    cargaHoraria: "12h",
    participantesAtual: 22,
    participantesMax: 30,
    sla: 73,
    capa: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=70",
    materiais: [
      { label: "Apostila (PDF)", url: "#" },
      { label: "Planilha de exercícios", url: "#" },
    ],
  },
  {
    id: "t4",
    titulo: "Comunicação Não-Violenta",
    modalidade: "Presencial",
    data: "24/01/2026",
    instrutor: "Fernanda Lima",
    cargaHoraria: "6h",
    participantesAtual: 18,
    participantesMax: 20,
    sla: 90,
    capa: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=70",
    materiais: [
      { label: "Material de apoio (PDF)", url: "#" },
      { label: "Formulário de presença", url: "#" },
    ],
  },
];

export type ComunicadoCategoria =
  | "Endomarketing"
  | "Atualização"
  | "Aviso"
  | "Alerta"
  | "Evento";

export interface ComunicadoHub {
  id: string;
  titulo: string;
  categoria: ComunicadoCategoria;
  autor: string;
  cargo: string;
  data: string;
  capa: string;
  conteudo: string;
  curtidas: number;
  comentarios: number;
  visualizacoes: number;
}

export const comunicadosMock: ComunicadoHub[] = [
  {
    id: "c1",
    titulo: "Dia do Consumidor",
    categoria: "Endomarketing",
    autor: "Patricia Lima",
    cargo: "Diretora de Operações",
    data: "09/03/2026",
    capa: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=70",
    conteudo:
      "Dia do Consumidor é celebrado mundialmente em 15 de março para conscientizar sobre direitos e deveres nas relações de consumo. Aproveite as ofertas internas e fique atento aos seus direitos.",
    curtidas: 0,
    comentarios: 0,
    visualizacoes: 4,
  },
  {
    id: "c2",
    titulo: "Dia Mundial do Consumidor",
    categoria: "Endomarketing",
    autor: "Patricia Lima",
    cargo: "Diretora de Operações",
    data: "04/03/2026",
    capa: "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1200&q=70",
    conteudo:
      "Dia do Consumidor é celebrado mundialmente em 15 de março para conscientizar sobre direitos e deveres nas relações de consumo. Instituído no Brasil para fortalecer a proteção ao consumidor, a data é um grande evento comercial, conhecido como a 'Black Friday do primeiro semestre', oferecendo muitas promoções e descontos em lojas físicas e online.",
    curtidas: 0,
    comentarios: 0,
    visualizacoes: 6,
  },
  {
    id: "c3",
    titulo: "Dia Internacional da Mulher",
    categoria: "Endomarketing",
    autor: "Patricia Lima",
    cargo: "Diretora de Operações",
    data: "04/03/2026",
    capa: "https://images.unsplash.com/photo-1573164574572-cb89e39749b4?w=1200&q=70",
    conteudo:
      "Hoje, 8 de março, o mundo solenizа a mistura da força com a leveza. Reconhecemos cada mulher do nosso time pela sua trajetória, talento e impacto.",
    curtidas: 0,
    comentarios: 0,
    visualizacoes: 6,
  },
  {
    id: "c4",
    titulo: "Novo plano de benefícios 2026",
    categoria: "Atualização",
    autor: "Camila Reis",
    cargo: "Consultora de RH",
    data: "05/02/2026",
    capa: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200&q=70",
    conteudo:
      "A partir de março, todos os colaboradores terão acesso ao novo plano de benefícios que inclui auxílio-creche e vale-cultura. Consulte o RH para mais detalhes.",
    curtidas: 12,
    comentarios: 3,
    visualizacoes: 35,
  },
  {
    id: "c5",
    titulo: "Manutenção programada do sistema",
    categoria: "Aviso",
    autor: "TI Azumi",
    cargo: "Tecnologia",
    data: "03/02/2026",
    capa: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=70",
    conteudo:
      "No sábado, dia 08/02, o sistema ficará indisponível das 22h às 02h para manutenção preventiva. Salve seus trabalhos antes do horário.",
    curtidas: 4,
    comentarios: 1,
    visualizacoes: 42,
  },
  {
    id: "c6",
    titulo: "Campanha de vacinação",
    categoria: "Evento",
    autor: "Camila Reis",
    cargo: "Consultora de RH",
    data: "31/01/2026",
    capa: "https://images.unsplash.com/photo-1584118624012-df056829fbd0?w=1200&q=70",
    conteudo:
      "Parceria com o laboratório para vacinação contra gripe no escritório. Inscrições abertas até 15/02. Gratuito para todos os colaboradores e dependentes.",
    curtidas: 8,
    comentarios: 2,
    visualizacoes: 28,
  },
];
