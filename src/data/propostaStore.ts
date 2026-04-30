// Mock store de Propostas (Etapa 6 — Doc Mestre Azumi Connect).
// Persiste em localStorage. Pub/sub para sincronizar abas/visões.

export type PropostaStatus = "enviada" | "aceita" | "recusada" | "expirada";
export type CanalProposta = "whatsapp" | "email" | "ambos";
export type TipoProposta = "CLT" | "PJ" | "Estagio";

export interface PropostaCandidato {
  id: string;
  candidatoId: string;
  vagaId: string;
  tipo: TipoProposta;
  remuneracao: string;
  beneficios: string;
  dataInicio: string;
  canal: CanalProposta;
  mensagem: string;
  enviadaEm: string; // ISO
  expiraEm: string;  // ISO (enviadaEm + 24h)
  status: PropostaStatus;
  respostaEm?: string;
  motivoRecusa?: string;
}

export type FeedbackCanal = "email" | "whatsapp" | "ambos";
export interface FeedbackReprovado {
  id: string;
  candidatoId: string;
  vagaId: string;
  templateKey: string;
  canal: FeedbackCanal;
  mensagem: string;
  enviadoEm: string; // ISO
}

const KEY_PROPOSTAS = "azumi:propostas:v1";
const KEY_FEEDBACKS = "azumi:feedbacks-reprovados:v1";

type Listener = () => void;
const listeners = new Set<Listener>();
function bump() { listeners.forEach((l) => { try { l(); } catch {} }); }
export function subscribePropostas(l: Listener) { listeners.add(l); return () => listeners.delete(l); }

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { const raw = window.localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; }
}
function safeWrite<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// ── Propostas ───────────────────────────────────────────────────────
export function listarPropostas(vagaId: string): PropostaCandidato[] {
  return safeRead<PropostaCandidato[]>(KEY_PROPOSTAS, []).filter((p) => p.vagaId === vagaId);
}
export function getPropostaAtiva(candidatoId: string): PropostaCandidato | null {
  const all = safeRead<PropostaCandidato[]>(KEY_PROPOSTAS, []);
  // mais recente para o candidato
  const dele = all.filter((p) => p.candidatoId === candidatoId).sort((a, b) => b.enviadaEm.localeCompare(a.enviadaEm));
  return dele[0] ?? null;
}

const HORAS_24_MS = 24 * 60 * 60 * 1000;

export function criarProposta(input: Omit<PropostaCandidato, "id" | "enviadaEm" | "expiraEm" | "status">): PropostaCandidato {
  const enviadaEm = new Date().toISOString();
  const expiraEm = new Date(Date.now() + HORAS_24_MS).toISOString();
  const proposta: PropostaCandidato = {
    ...input,
    id: `prop_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    enviadaEm,
    expiraEm,
    status: "enviada",
  };
  const all = safeRead<PropostaCandidato[]>(KEY_PROPOSTAS, []);
  all.push(proposta);
  safeWrite(KEY_PROPOSTAS, all);
  bump();
  return proposta;
}

function atualizarProposta(id: string, patch: Partial<PropostaCandidato>) {
  const all = safeRead<PropostaCandidato[]>(KEY_PROPOSTAS, []);
  const idx = all.findIndex((p) => p.id === id);
  if (idx < 0) return;
  all[idx] = { ...all[idx], ...patch };
  safeWrite(KEY_PROPOSTAS, all);
  bump();
}

export function aceitarProposta(id: string) {
  atualizarProposta(id, { status: "aceita", respostaEm: new Date().toISOString() });
}
export function recusarProposta(id: string, motivo?: string) {
  atualizarProposta(id, { status: "recusada", respostaEm: new Date().toISOString(), motivoRecusa: motivo });
}
export function expirarProposta(id: string) {
  atualizarProposta(id, { status: "expirada" });
}

/** Retorna ms restantes até expirar; valor negativo se já passou. */
export function msRestantes(p: PropostaCandidato): number {
  return new Date(p.expiraEm).getTime() - Date.now();
}
export function isExpiradaPorTempo(p: PropostaCandidato): boolean {
  return p.status === "enviada" && msRestantes(p) <= 0;
}

/** Conta candidatos com proposta ACEITA na vaga (= contratados). */
export function contratadosNaVaga(vagaId: string): string[] {
  return listarPropostas(vagaId).filter((p) => p.status === "aceita").map((p) => p.candidatoId);
}

// ── Feedback de reprovados ──────────────────────────────────────────
export function listarFeedbacks(vagaId: string): FeedbackReprovado[] {
  return safeRead<FeedbackReprovado[]>(KEY_FEEDBACKS, []).filter((f) => f.vagaId === vagaId);
}
export function jaTemFeedback(candidatoId: string): boolean {
  return safeRead<FeedbackReprovado[]>(KEY_FEEDBACKS, []).some((f) => f.candidatoId === candidatoId);
}
export function registrarFeedback(input: Omit<FeedbackReprovado, "id" | "enviadoEm">): FeedbackReprovado {
  const fb: FeedbackReprovado = {
    ...input,
    id: `fb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    enviadoEm: new Date().toISOString(),
  };
  const all = safeRead<FeedbackReprovado[]>(KEY_FEEDBACKS, []);
  all.push(fb);
  safeWrite(KEY_FEEDBACKS, all);
  bump();
  return fb;
}

// ── Helpers de label ────────────────────────────────────────────────
export function statusPropostaLabel(s: PropostaStatus): string {
  return { enviada: "Enviada — aguardando resposta", aceita: "Aceita", recusada: "Recusada", expirada: "Expirada" }[s];
}
