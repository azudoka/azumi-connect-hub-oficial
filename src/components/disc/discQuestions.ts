// 12 perguntas DISC — cada item tem 4 opções, cada uma associada a D/I/S/C.
// Para cada pergunta o candidato marca + Mais (somava +1) e − Menos (somava −1).
// Score final por dimensão = soma. Perfil predominante = maior score.

export type DiscDim = "D" | "I" | "S" | "C";

export interface DiscOption {
  dim: DiscDim;
  text: string;
}

export interface DiscQuestion {
  id: number;
  options: DiscOption[];
}

export const DISC_QUESTIONS: DiscQuestion[] = [
  {
    id: 1,
    options: [
      { dim: "D", text: "Decidido e direto" },
      { dim: "I", text: "Entusiasmado e comunicativo" },
      { dim: "S", text: "Calmo e paciente" },
      { dim: "C", text: "Detalhista e cuidadoso" },
    ],
  },
  {
    id: 2,
    options: [
      { dim: "D", text: "Gosto de assumir riscos" },
      { dim: "I", text: "Gosto de inspirar pessoas" },
      { dim: "S", text: "Gosto de ajudar os outros" },
      { dim: "C", text: "Gosto de planejar antes de agir" },
    ],
  },
  {
    id: 3,
    options: [
      { dim: "D", text: "Sou competitivo" },
      { dim: "I", text: "Sou sociável" },
      { dim: "S", text: "Sou leal" },
      { dim: "C", text: "Sou analítico" },
    ],
  },
  {
    id: 4,
    options: [
      { dim: "D", text: "Foco em resultados" },
      { dim: "I", text: "Foco em pessoas" },
      { dim: "S", text: "Foco em estabilidade" },
      { dim: "C", text: "Foco em qualidade" },
    ],
  },
  {
    id: 5,
    options: [
      { dim: "D", text: "Tomo decisões rápidas" },
      { dim: "I", text: "Convenço com argumentos" },
      { dim: "S", text: "Pondero antes de decidir" },
      { dim: "C", text: "Analiso dados antes de decidir" },
    ],
  },
  {
    id: 6,
    options: [
      { dim: "D", text: "Confiante" },
      { dim: "I", text: "Otimista" },
      { dim: "S", text: "Confiável" },
      { dim: "C", text: "Preciso" },
    ],
  },
  {
    id: 7,
    options: [
      { dim: "D", text: "Gosto de desafios" },
      { dim: "I", text: "Gosto de novidades" },
      { dim: "S", text: "Gosto de rotina" },
      { dim: "C", text: "Gosto de regras claras" },
    ],
  },
  {
    id: 8,
    options: [
      { dim: "D", text: "Ousado" },
      { dim: "I", text: "Persuasivo" },
      { dim: "S", text: "Cooperativo" },
      { dim: "C", text: "Cuidadoso" },
    ],
  },
  {
    id: 9,
    options: [
      { dim: "D", text: "Independente" },
      { dim: "I", text: "Animado" },
      { dim: "S", text: "Tranquilo" },
      { dim: "C", text: "Organizado" },
    ],
  },
  {
    id: 10,
    options: [
      { dim: "D", text: "Direto ao ponto" },
      { dim: "I", text: "Expressivo" },
      { dim: "S", text: "Atencioso" },
      { dim: "C", text: "Sistemático" },
    ],
  },
  {
    id: 11,
    options: [
      { dim: "D", text: "Lidero naturalmente" },
      { dim: "I", text: "Motivo pessoas" },
      { dim: "S", text: "Apoio o grupo" },
      { dim: "C", text: "Garanto a qualidade" },
    ],
  },
  {
    id: 12,
    options: [
      { dim: "D", text: "Vou direto ao resultado" },
      { dim: "I", text: "Crio conexões" },
      { dim: "S", text: "Mantenho o ritmo" },
      { dim: "C", text: "Sigo o processo" },
    ],
  },
];

export interface DiscAnswer {
  mais?: DiscDim;
  menos?: DiscDim;
}

export interface DiscScores {
  D: number;
  I: number;
  S: number;
  C: number;
}

export function calcularScores(answers: Record<number, DiscAnswer>): DiscScores {
  const s: DiscScores = { D: 0, I: 0, S: 0, C: 0 };
  for (const a of Object.values(answers)) {
    if (a.mais) s[a.mais] += 1;
    if (a.menos) s[a.menos] -= 1;
  }
  // normaliza p/ 0–100 (faixa teórica: -12 a +12)
  const norm = (v: number) => Math.round(((v + 12) / 24) * 100);
  return { D: norm(s.D), I: norm(s.I), S: norm(s.S), C: norm(s.C) };
}

export interface PerfilInfo {
  dim: DiscDim;
  nome: string;
  apelido: string;
  descricao: string;
  adjetivos: [string, string, string];
  fraseImpacto: string;
  pontosFortes: string[];
  comoSairBem: string[];
}

export const PERFIS: Record<DiscDim, PerfilInfo> = {
  D: {
    dim: "D",
    nome: "Executor (D)",
    apelido: "Executor",
    descricao:
      "Pessoa orientada a resultados, decidida e direta. Toma iniciativa, gosta de desafios e busca eficiência.",
    adjetivos: ["decidida", "objetiva", "competitiva"],
    fraseImpacto: "Você lidera pela ação e transforma decisões em resultado rapidamente.",
    pontosFortes: [
      "Toma decisões rápidas sob pressão",
      "Foco intenso em resultados e metas",
      "Iniciativa e capacidade de liderar",
    ],
    comoSairBem: [
      "Use sua autonomia para entregar metas claras com prazo curto.",
      "Cuidado com o excesso de pressa: ouça o time antes de decidir sozinho.",
      "Mostre resultados objetivos com números — é assim que você brilha.",
    ],
  },
  I: {
    dim: "I",
    nome: "Comunicador (I)",
    apelido: "Comunicador",
    descricao:
      "Pessoa sociável, otimista e persuasiva. Inspira times, comunica com clareza e cria conexões facilmente.",
    adjetivos: ["sociável", "otimista", "persuasiva"],
    fraseImpacto: "Você engaja pessoas pela energia e abre portas com facilidade.",
    pontosFortes: [
      "Comunicação envolvente e clara",
      "Cria boas relações interpessoais",
      "Motiva e engaja pessoas ao redor",
    ],
    comoSairBem: [
      "Aposte em apresentações, networking e papéis de relacionamento.",
      "Atenção aos detalhes e prazos — feche o que começa.",
      "Equilibre entusiasmo com escuta ativa para não dominar a conversa.",
    ],
  },
  S: {
    dim: "S",
    nome: "Planejador (S)",
    apelido: "Planejador",
    descricao:
      "Pessoa calma, leal e consistente. Valoriza estabilidade, mantém o ritmo do time e apoia os colegas.",
    adjetivos: ["paciente", "leal", "colaborativa"],
    fraseImpacto: "Você é o ponto de equilíbrio que mantém o time coeso e produtivo.",
    pontosFortes: [
      "Constância e confiabilidade",
      "Boa escuta e empatia",
      "Mantém o time coeso e funcional",
    ],
    comoSairBem: [
      "Brilha em funções que exigem consistência, escuta e relacionamento.",
      "Pratique dizer 'não' quando a demanda exceder sua capacidade.",
      "Use sua estabilidade para conduzir mudanças sem ruído.",
    ],
  },
  C: {
    dim: "C",
    nome: "Analista (C)",
    apelido: "Analista",
    descricao:
      "Pessoa detalhista, organizada e analítica. Busca qualidade, segue processos e fundamenta decisões em dados.",
    adjetivos: ["analítica", "criteriosa", "organizada"],
    fraseImpacto: "Você entrega qualidade alta porque pensa antes, mede e refina.",
    pontosFortes: [
      "Atenção a detalhes e qualidade",
      "Análise estruturada e crítica",
      "Disciplina com processos e padrões",
    ],
    comoSairBem: [
      "Prefira papéis técnicos, analíticos ou que exijam precisão.",
      "Cuidado com o perfeccionismo: defina um 'bom o suficiente'.",
      "Compartilhe seus critérios — o time aprende com sua estrutura.",
    ],
  },
};

export function perfilPredominante(scores: DiscScores): PerfilInfo {
  const dim = (Object.keys(scores) as DiscDim[]).reduce((a, b) =>
    scores[a] >= scores[b] ? a : b,
  );
  return PERFIS[dim];
}
