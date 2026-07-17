// src/components/disc/discProfileContent.ts
// Conteúdo descritivo dos 4 perfis DISC — usado no resultado do
// candidato, no relatório do consultor, e em qualquer outro lugar que
// precise explicar o que cada perfil significa.

export interface DiscProfileContent {
  letra: "D" | "I" | "S" | "C";
  nome: string;
  corHex: string;
  resumo: string;
  pontosFortes: string[];
  pontosDesenvolvimento: string[];
  comoFuncionaMelhor: string[];
  frasesChave: string[];
}

export const DISC_PROFILE_CONTENT: Record<"D" | "I" | "S" | "C", DiscProfileContent> = {
  D: {
    letra: "D",
    nome: "Executor",
    corHex: "#EF4444",
    resumo:
      "Pessoas com perfil Executor são orientadas a resultado e decisão rápida. " +
      "Gostam de desafios, assumem controle de situações difíceis e não têm medo " +
      "de tomar a frente quando algo precisa ser resolvido.",
    pontosFortes: [
      "Toma decisões com rapidez, mesmo sob pressão",
      "Assume responsabilidade e não foge de desafios",
      "Foca em resultado, não se perde em detalhes desnecessários",
      "Naturalmente assume liderança em situações de crise",
      "Confortável com mudança e ritmo acelerado",
    ],
    pontosDesenvolvimento: [
      "Pode parecer impaciente ou direto demais em conversas",
      "Tende a pular etapas de planejamento pra agir mais rápido",
      "Pode não dar espaço suficiente pra opinião dos outros na decisão",
      "Lida mal com processos lentos ou burocráticos",
    ],
    comoFuncionaMelhor: [
      "Em ambientes com autonomia real pra decidir e agir",
      "Com metas claras e desafiadoras, não tarefas repetitivas",
      "Quando tem liberdade pra resolver problemas do jeito que considera melhor",
      "Recebendo feedback direto e objetivo, sem rodeios",
    ],
    frasesChave: ["Foco em resultado", "Decisão rápida", "Não foge de desafio"],
  },
  I: {
    letra: "I",
    nome: "Comunicador",
    corHex: "#F59E0B",
    resumo:
      "Pessoas com perfil Comunicador são entusiasmadas, sociáveis e otimistas. " +
      "Constroem relação com facilidade, gostam de estar perto de gente e " +
      "conseguem contagiar o ambiente com energia positiva.",
    pontosFortes: [
      "Constrói relacionamento e confiança com facilidade",
      "Comunica ideias de forma clara e envolvente",
      "Traz energia e otimismo pro time",
      "Bom em situações que exigem influenciar ou convencer alguém",
      "Se adapta bem a ambientes sociais e colaborativos",
    ],
    pontosDesenvolvimento: [
      "Pode perder o foco em tarefas muito solitárias ou repetitivas",
      "Às vezes prioriza a relação em detrimento do prazo/detalhe técnico",
      "Pode falar mais do que ouvir em alguns momentos",
      "Tende a evitar conflito direto, mesmo quando é necessário",
    ],
    comoFuncionaMelhor: [
      "Em funções com bastante interação humana (atendimento, vendas, recrutamento)",
      "Em ambientes que reconhecem e celebram conquistas publicamente",
      "Trabalhando em equipe, não isolado",
      "Com liberdade pra se expressar e propor ideias novas",
    ],
    frasesChave: ["Energia contagiante", "Constrói relação fácil", "Comunicação clara"],
  },
  S: {
    letra: "S",
    nome: "Planejador",
    corHex: "#10B981",
    resumo:
      "Pessoas com perfil Planejador são estáveis, pacientes e confiáveis. " +
      "Trabalham bem em equipe, valorizam rotina e harmonia, e são a base " +
      "que segura o time nos momentos de mudança.",
    pontosFortes: [
      "Confiável e consistente — entrega o que promete",
      "Ótimo ouvinte, cria ambiente de confiança no time",
      "Paciente em processos longos ou repetitivos",
      "Trabalha bem em equipe, evita atrito desnecessário",
      "Mantém a calma em situações de pressão",
    ],
    pontosDesenvolvimento: [
      "Pode resistir a mudanças bruscas de rotina",
      "Tende a evitar confronto mesmo quando seria necessário se posicionar",
      "Pode demorar mais pra tomar decisão em situações incertas",
      "Às vezes coloca a necessidade do time acima da própria",
    ],
    comoFuncionaMelhor: [
      "Em ambientes estáveis, com expectativas claras",
      "Quando mudanças são comunicadas com antecedência, não de surpresa",
      "Em funções que exigem continuidade e relacionamento de longo prazo",
      "Com reconhecimento privado, não necessariamente público",
    ],
    frasesChave: ["Confiável e paciente", "Time antes do ego", "Estabilidade"],
  },
  C: {
    letra: "C",
    nome: "Analista",
    corHex: "#3B82F6",
    resumo:
      "Pessoas com perfil Analista são precisas, criteriosas e orientadas a " +
      "qualidade. Gostam de entender o porquê das coisas, seguem processo e " +
      "entregam trabalho com alto padrão técnico.",
    pontosFortes: [
      "Atenção a detalhe e precisão acima da média",
      "Toma decisão baseada em dado, não em impulso",
      "Segue processo e padrão de qualidade com rigor",
      "Identifica erro/risco que outros perfis costumam passar batido",
      "Confiável em entregas que exigem exatidão",
    ],
    pontosDesenvolvimento: [
      "Pode demorar demais buscando a decisão 'perfeita'",
      "Tende a ser excessivamente crítico, com si mesmo e com os outros",
      "Pode parecer frio ou distante em interações sociais",
      "Lida mal com ambiguidade ou informação incompleta",
    ],
    comoFuncionaMelhor: [
      "Em funções técnicas, com critério claro de qualidade",
      "Com tempo suficiente pra analisar antes de decidir",
      "Recebendo informação completa e organizada, não fragmentada",
      "Em ambientes onde precisão é mais valorizada que velocidade",
    ],
    frasesChave: ["Precisão acima de tudo", "Decide com dado", "Padrão de qualidade alto"],
  },
};

/** Retorna o conteúdo do perfil predominante + secundário, já formatado
 * pra usar no resultado do candidato ou no relatório do consultor. */
export function getDiscInterpretacao(predominante: string, secundario?: string | null) {
  const p = DISC_PROFILE_CONTENT[predominante as "D" | "I" | "S" | "C"];
  const s = secundario ? DISC_PROFILE_CONTENT[secundario as "D" | "I" | "S" | "C"] : null;
  return { predominante: p, secundario: s };
}
