export type StatusColab = "ativo" | "ferias" | "afastado";

export interface ColabLider {
  id: string;
  nome: string;
  cargo: string;
  admissao: string; // dd/mm/yyyy
  status: StatusColab;
}

export const statusColabStyle: Record<
  StatusColab,
  { label: string; cls: string }
> = {
  ativo: { label: "Ativo", cls: "bg-success/15 text-success border-success/30" },
  ferias: { label: "Férias", cls: "bg-info/15 text-info border-info/30" },
  afastado: { label: "Afastado", cls: "bg-warning/15 text-warning border-warning/30" },
};

export const timeLider: ColabLider[] = [
  { id: "c1", nome: "Marina Costa", cargo: "Analista de RH Sênior", admissao: "15/03/2022", status: "ativo" },
  { id: "c2", nome: "Pedro Alves", cargo: "Coordenador de Operações", admissao: "08/01/2021", status: "ativo" },
  { id: "c3", nome: "Lucas Ferreira", cargo: "Analista de DP", admissao: "22/07/2023", status: "ferias" },
  { id: "c4", nome: "Beatriz Lins", cargo: "Recrutadora Pleno", admissao: "10/11/2022", status: "afastado" },
  { id: "c5", nome: "Rafael Mendes", cargo: "Analista de Cargos & Salários", admissao: "03/05/2024", status: "ativo" },
  { id: "c6", nome: "Juliana Lima", cargo: "Estagiária de RH", admissao: "01/02/2025", status: "ativo" },
];

export function iniciaisDe(nome: string) {
  return nome
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function tempoDeEmpresa(admissao: string) {
  const [d, m, y] = admissao.split("/").map(Number);
  const inicio = new Date(y, m - 1, d);
  const hoje = new Date();
  const meses =
    (hoje.getFullYear() - inicio.getFullYear()) * 12 +
    (hoje.getMonth() - inicio.getMonth());
  if (meses < 12) return `${meses} meses`;
  const anos = Math.floor(meses / 12);
  const restoMeses = meses % 12;
  return restoMeses === 0
    ? `${anos} ano${anos > 1 ? "s" : ""}`
    : `${anos} ano${anos > 1 ? "s" : ""} e ${restoMeses} m`;
}
