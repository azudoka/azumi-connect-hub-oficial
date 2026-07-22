// Portal do Candidato v3 — Ficha completa por abas
import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  MapPin, Briefcase, Linkedin, Camera, Pencil, Check, X,
  Download, Lock, Mail, Phone, FileText, Upload,
  LogOut, Plus, Trash2, ExternalLink, Globe,
  MessageCircle, AlertTriangle, GraduationCap, Languages,
  Building2, Calendar, Star, ChevronDown, Heart, Smile,
} from "lucide-react";
import azumiLogoBranca from "@/assets/brand/azumi-logo-branca.png";
import PerfilIlustracao from "@/components/disc/PerfilIlustracao";
import type { DiscDim } from "@/components/disc/discQuestions";
import { DISC_PROFILE_CONTENT } from "@/components/disc/discProfileContent";
import { gerarRadarSvgString } from "@/lib/discRadarSvg";

// ── Logos & assets ────────────────────────────────────────────────────────────
const CONNECT_LOGO = "https://raw.githubusercontent.com/azudoka/azumi-connect-hub-oficial/main/public/connect-logo.png";

// ── Static data ───────────────────────────────────────────────────────────────
const SERVICOS = [
  { label: "Serviços para você", desc: "Soluções de RH pensadas para o seu desenvolvimento.", href: "https://azumirh.com.br", grad: "from-[#264478] to-[#3D63B8]" },
  { label: "Programa Impulso RH", desc: "Capacitação e crescimento para profissionais de RH.", href: "https://azumirh.com.br", grad: "from-[#0F2A4A] to-[#264478]" },
  { label: "Gold Market", desc: "Oportunidades exclusivas para perfis em destaque.", href: "https://azumirh.com.br", grad: "from-[#3D63B8] to-[#7FA8E8]" },
];

const DISC_INFO: Record<string, { nome: string; cor: string; frase: string }> = {
  D: { nome: "Executor",    cor: "#EF4444", frase: "Você age com velocidade porque desafios são o seu combustível." },
  I: { nome: "Comunicador", cor: "#F59E0B", frase: "Você conecta pessoas porque a energia que transmite é genuína." },
  S: { nome: "Planejador",  cor: "#10B981", frase: "Você entrega consistência porque pensa antes e constrói com cuidado." },
  C: { nome: "Analista",    cor: "#3B82F6", frase: "Você entrega qualidade alta porque mede e refina cada detalhe." },
};

const ETAPAS = [
  { key: "recebido",           label: "Candidatura recebida",     ordem: 1 },
  { key: "triagem_inicial",    label: "Triagem",                  ordem: 2 },
  { key: "questionario",       label: "Questionário",             ordem: 3 },
  { key: "entrevista_azumi",   label: "Entrevista Azumi",         ordem: 4 },
  { key: "teste_tecnico",      label: "Teste Técnico",            ordem: 5 },
  { key: "entrevista_cliente", label: "Entrevista com a empresa", ordem: 6 },
  { key: "proposta",           label: "Proposta",                 ordem: 7 },
  { key: "contratado",         label: "Contratado 🎉",            ordem: 8 },
];

const SETORES = [
  "Administrativo", "Comercial/Vendas", "Financeiro", "RH",
  "Tecnologia", "Operações", "Marketing", "Atendimento",
  "Logística", "Produção/Industrial",
];

const ESCOLARIDADES = [
  "Ensino Fundamental", "Ensino Médio", "Técnico/Tecnólogo",
  "Superior incompleto", "Superior completo", "Pós-graduação/MBA", "Mestrado/Doutorado",
];

const NIVEIS_IDIOMA = ["Básico", "Intermediário", "Avançado", "Fluente", "Nativo"];
const MODALIDADES = ["Presencial", "Híbrido", "Remoto"];
const GENEROS = ["Feminino", "Masculino", "Não-binário", "Prefiro não informar", "Outro"];
const RACAS = ["Branca", "Preta", "Parda", "Amarela", "Indígena", "Prefiro não informar"];

const TABS = [
  { key: "sobre",      emoji: "👋", label: "Sobre mim" },
  { key: "dados",      emoji: "📋", label: "Dados gerais" },
  { key: "trajetoria", emoji: "💼", label: "Trajetória" },
  { key: "interesses", emoji: "🎯", label: "Interesses" },
  { key: "testes",     emoji: "🧭", label: "Meus testes" },
  { key: "processos",  emoji: "📁", label: "Meus processos" },
  { key: "diversidade",emoji: "🔒", label: "Diversidade" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

const DISC_VALIDADE_MS = 1000 * 60 * 60 * 24 * 30 * 6;

// ── Types ─────────────────────────────────────────────────────────────────────
interface Formacao   { id: string; curso: string; instituicao: string; ano: string }
interface Idioma     { id: string; idioma: string; nivel: string }
interface Experiencia { id: string; cargo: string; empresa: string; periodo: string; descricao?: string }

interface DiscResultado {
  score_d: number; score_i: number; score_s: number; score_c: number;
  fator_predominante: string; fator_secundario: string | null;
  created_at: string;
}

interface Candidatura {
  id: string; etapa_azumi: string | null; banco_talentos: boolean;
  data_aplicacao: string | null;
  job_solicitations: { cargo: string; avulsa_empresa_nome: string | null } | null;
}

interface CandidatoData {
  id: string; nome: string; apelido: string | null; pronomes: string | null;
  email: string | null; telefone: string | null;
  cidade: string | null; bairro: string | null; escolaridade: string | null;
  linkedin: string | null; foto_url: string | null; avatar_url: string | null;
  cpf: string | null; data_nascimento: string | null;
  interesses_setores: string[] | null; interesses_cargos: string[] | null;
  observacoes: string | null; resumo_candidato: string | null;
  curriculo_url: string | null; curriculo_nome: string | null;
  portfolio_url: string | null; pretensao_salarial: string | null;
  frase_lema: string | null; hobbies: string | null;
  nacionalidade: string | null; cnh: boolean | null; cnh_categoria: string | null;
  disponibilidade_horario: string | null; disponibilidade_mudanca: boolean | null;
  modalidade_preferida: string | null; disponibilidade_viagens: boolean | null;
  faixa_deslocamento: string | null;
  formacoes: Formacao[] | null; idiomas: Idioma[] | null; experiencias: Experiencia[] | null;
  carta_apresentacao: string | null;
  pcd: boolean | null; pcd_tipo: string | null;
  autodeclaracao_racial: string | null; genero: string | null;
  consentimento_diversidade: boolean | null; consentimento_diversidade_data: string | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function ilustracaoSvgString(dim: DiscDim): string {
  const COR: Record<DiscDim, string> = { D: "#EF4444", I: "#F59E0B", S: "#10B981", C: "#3B82F6" };
  const cor = COR[dim], tint = `${cor}22`, stroke = "#1f2937";
  let extra = "";
  if (dim === "D") extra = `<rect x="74" y="22" width="8" height="32" rx="3" fill="${cor}" stroke="${stroke}" stroke-width="1.5"/><circle cx="78" cy="20" r="9" fill="#fde7d3" stroke="${stroke}" stroke-width="1.5"/><path d="M95 25 l8 -4 -5 8 6 2 -10 6" fill="none" stroke="${cor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;
  else if (dim === "I") extra = `<path d="M82 44 L102 36 L102 64 L82 56 Z" fill="${cor}" stroke="${stroke}" stroke-width="1.5" stroke-linejoin="round"/><rect x="74" y="46" width="10" height="8" fill="${cor}" stroke="${stroke}" stroke-width="1.5"/><path d="M106 42 q4 8 0 16 M110 38 q6 12 0 24" fill="none" stroke="${cor}" stroke-width="2" stroke-linecap="round"/><path d="M53 54 q7 6 14 0" fill="none" stroke="${stroke}" stroke-width="1.8" stroke-linecap="round"/>`;
  else if (dim === "S") extra = `<path d="M60 78 c -8 -8 -16 -2 -16 6 c 0 8 16 16 16 16 c 0 0 16 -8 16 -16 c 0 -8 -8 -14 -16 -6 z" fill="${cor}" stroke="${stroke}" stroke-width="1.5"/><path d="M53 55 q7 4 14 0" fill="none" stroke="${stroke}" stroke-width="1.8" stroke-linecap="round"/>`;
  else extra = `<circle cx="86" cy="46" r="10" fill="#fff" stroke="${cor}" stroke-width="3"/><line x1="94" y1="54" x2="104" y2="64" stroke="${cor}" stroke-width="3.5" stroke-linecap="round"/><circle cx="54" cy="50" r="4" fill="none" stroke="${stroke}" stroke-width="1.5"/><circle cx="66" cy="50" r="4" fill="none" stroke="${stroke}" stroke-width="1.5"/><line x1="58" y1="50" x2="62" y2="50" stroke="${stroke}" stroke-width="1.5"/>`;
  return `<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><circle cx="60" cy="60" r="58" fill="${tint}"/><path d="M30 110 C 30 86, 90 86, 90 110 Z" fill="${cor}"/><circle cx="60" cy="50" r="18" fill="#fde7d3" stroke="${stroke}" stroke-width="1.5"/><path d="M44 46 C 46 32, 74 32, 76 46 Z" fill="${stroke}"/>${extra}</svg>`;
}

function downloadDiscRelatorio(nome: string, disc: DiscResultado) {
  const COR: Record<string, string> = { D: "#EF4444", I: "#F59E0B", S: "#10B981", C: "#3B82F6" };
  const dim = disc.fator_predominante as DiscDim;
  const perfil = DISC_PROFILE_CONTENT[dim];
  const profSec = disc.fator_secundario ? DISC_PROFILE_CONTENT[disc.fator_secundario as DiscDim] : null;
  const scores = { D: disc.score_d, I: disc.score_i, S: disc.score_s, C: disc.score_c };
  const dataHoje = new Date().toLocaleDateString("pt-BR");
  const origin = window.location.origin;
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"/><title>Relatório DISC — ${nome} — Azumi RH — ${dataHoje}</title>
<style>*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;box-sizing:border-box;margin:0;padding:0;font-family:-apple-system,Segoe UI,Roboto,Inter,sans-serif}body{background:#F5F7FA;color:#1f2937;padding:24px}.wrap{max-width:780px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08)}header{background:#264478;padding:6px 32px;display:flex;justify-content:space-between;align-items:center}.body{padding:28px 32px}.lead{color:#64748b;font-size:14px;margin-bottom:24px}.hero{display:flex;align-items:center;gap:20px;margin-bottom:22px;padding:18px;border-radius:10px;background:#F8FAFC}.bar-row{display:flex;align-items:center;gap:12px;margin-bottom:10px}.bar-row .k{width:24px;font-weight:700}.bar-row .track{flex:1;height:14px;border-radius:7px;background:#e5e7eb;overflow:hidden}.bar-row .fill{height:100%;border-radius:7px}.bar-row .v{width:48px;text-align:right;font-size:13px;color:#475569}.secao{margin-top:24px;padding:18px;border-radius:10px;background:#F1F5F9}.aviso{margin-top:22px;padding:14px;border-left:4px solid #f59e0b;background:#FFF7ED;color:#92400e;font-size:13px;border-radius:6px}footer{padding:22px 32px;background:#0F2A4A;color:#CBD5E1;font-size:12px;text-align:center}ul{margin-top:10px;padding-left:18px}ul li{font-size:14px;margin:4px 0;color:#334155}@media print{body{background:#fff;padding:0}.wrap{box-shadow:none;border-radius:0}}</style></head>
<body><div class="wrap"><header><img src="${origin}/azumi-logo.png" height="56" alt="Azumi RH" style="display:block"><img src="${origin}/connect-logo.png" height="60" alt="Connect" style="display:block"></header>
<div class="body"><p style="font-size:20px;font-weight:700;margin-bottom:4px">${nome}</p><p class="lead">Resultado obtido em ${dataHoje}</p>
<div class="hero">${ilustracaoSvgString(dim)}<div><p style="font-size:26px;font-weight:700;color:${COR[dim]}">${perfil.nome}</p><p style="margin-top:6px;font-size:14px;color:#475569">${perfil.fraseImpacto ?? perfil.resumo}</p></div></div>
<div style="display:flex;align-items:flex-start;gap:24px;margin-bottom:8px"><div style="flex-shrink:0">${gerarRadarSvgString(scores)}</div><div style="flex:1;padding-top:8px">${(["D","I","S","C"] as DiscDim[]).map(d=>`<div class="bar-row"><div class="k" style="color:${COR[d]}">${d}</div><div class="track"><div class="fill" style="width:${scores[d]}%;background:${COR[d]}"></div></div><div class="v">${scores[d]}%</div></div>`).join("")}</div></div>
<div class="secao"><h2 style="font-size:16px;margin-bottom:6px">${perfil.nome}</h2><p style="font-size:14px;color:#475569">${perfil.resumo}</p><h3 style="font-size:13px;margin:14px 0 6px;color:#059669">Pontos fortes</h3><ul>${perfil.pontosFortes.map(p=>`<li>${p}</li>`).join("")}</ul><h3 style="font-size:13px;margin:14px 0 6px;color:#d97706">Pontos de desenvolvimento</h3><ul>${perfil.pontosDesenvolvimento.map(p=>`<li>${p}</li>`).join("")}</ul></div>
${profSec?`<div class="secao" style="margin-top:16px;border-left:4px solid ${COR[profSec.letra]}"><p style="font-size:11px;text-transform:uppercase;color:#6b7280;margin-bottom:4px">Perfil secundário</p><h2 style="font-size:15px;color:${COR[profSec.letra]};margin-bottom:4px">${profSec.nome}</h2><p style="font-size:14px;color:#475569">${profSec.resumo}</p></div>`:""}
<div class="aviso">Este resultado é uma leitura comportamental de triagem. Não é um diagnóstico psicológico.</div></div>
<footer>Azumi RH · azumirh.com.br · contato@azumirh.com.br</footer></div>
<script>window.onload=()=>setTimeout(()=>window.print(),300)</script></body></html>`;
  const win = window.open("", "_blank");
  if (win) { win.document.write(html); win.document.close(); }
}

function calcProgresso(c: CandidatoData, disc: DiscResultado | null): number {
  const campos = [
    c.foto_url || c.avatar_url, c.apelido, c.observacoes, c.frase_lema,
    c.data_nascimento, c.cidade, c.escolaridade, c.linkedin, c.curriculo_url,
    c.pretensao_salarial, c.interesses_setores?.length ? "ok" : null,
    c.interesses_cargos?.length ? "ok" : null, c.resumo_candidato, disc ? "ok" : null,
  ];
  return Math.round((campos.filter(Boolean).length / campos.length) * 100);
}

function waLink(tel: string | null): string {
  if (!tel) return "#";
  return `https://wa.me/55${tel.replace(/\D/g, "")}`;
}

function fmtData(iso: string | null): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function uid() { return Math.random().toString(36).slice(2); }

// ── Reusable sub-components ───────────────────────────────────────────────────
function SectionCard({ title, icon, onEdit, children }: {
  title: string; icon?: React.ReactNode; onEdit?: () => void; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 mb-4" style={{ boxShadow: "0 1px 4px rgba(133,146,173,0.2)" }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon && <span className="text-[#264478]">{icon}</span>}
          <h2 className="text-[15px] font-semibold text-slate-800">{title}</h2>
        </div>
        {onEdit && (
          <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors" title="Editar">
            <Pencil className="h-3.5 w-3.5 text-slate-400" />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ msg }: { msg: string }) {
  return <p className="text-sm text-slate-400 italic">{msg}</p>;
}

// ══════════════════════════════════════════════════════════════════════════════
export default function MeuPerfilPage() {
  const { token } = useParams<{ token: string }>();

  const [candidato, setCandidato] = useState<CandidatoData | null>(null);
  const [disc, setDisc] = useState<DiscResultado | null>(null);
  const [candidaturas, setCandidaturas] = useState<Candidatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("sobre");
  const [verFinalizadas, setVerFinalizadas] = useState(false);

  // ── Edit states ─────────────────────────────────────────────────────────────
  const [editSobre, setEditSobre] = useState(false);
  const [sobreDraft, setSobreDraft] = useState({ apelido: "", pronomes: "", data_nascimento: "", observacoes: "", frase_lema: "", hobbies: "" });
  const [salvandoSobre, setSalvandoSobre] = useState(false);

  const [editDados, setEditDados] = useState(false);
  const [dadosDraft, setDadosDraft] = useState({ cidade: "", bairro: "", nacionalidade: "", telefone: "", cnh: false, cnh_categoria: "", disponibilidade_horario: "", disponibilidade_mudanca: false, pretensao_salarial: "" });
  const [salvandoDados, setSalvandoDados] = useState(false);

  const [editTrajetoria, setEditTrajetoria] = useState(false);
  const [trajDraft, setTrajDraft] = useState({
    escolaridade: "", linkedin: "", portfolio_url: "", carta_apresentacao: "",
    formacoes: [] as Formacao[], idiomas: [] as Idioma[], experiencias: [] as Experiencia[],
  });
  const [salvandoTraj, setSalvandoTraj] = useState(false);

  const [editInteresses, setEditInteresses] = useState(false);
  const [intDraft, setIntDraft] = useState({ interesses_setores: [] as string[], interesses_cargos: "", modalidade_preferida: "", disponibilidade_viagens: false, faixa_deslocamento: "" });
  const [salvandoInt, setSalvandoInt] = useState(false);

  const [editDiversidade, setEditDiversidade] = useState(false);
  const [divDraft, setDivDraft] = useState({ pcd: false, pcd_tipo: "", autodeclaracao_racial: "", genero: "", consentimento_diversidade: false });
  const [salvandoDiv, setSalvandoDiv] = useState(false);

  const [uploadandoFoto, setUploadandoFoto] = useState(false);
  const [uploadandoCurriculo, setUploadandoCurriculo] = useState(false);
  const [resumoDraft, setResumoDraft] = useState("");
  const [editResumo, setEditResumo] = useState(false);
  const [salvandoResumo, setSalvandoResumo] = useState(false);

  const fotoInputRef = useRef<HTMLInputElement>(null);
  const curriculoInputRef = useRef<HTMLInputElement>(null);

  // remove dark theme
  useEffect(() => {
    const html = document.documentElement;
    const had = html.classList.contains("theme-midnight");
    html.classList.remove("theme-midnight");
    return () => { if (had) html.classList.add("theme-midnight"); };
  }, []);

  // ── Fetch ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) { setErro(true); setLoading(false); return; }
    (async () => {
      const { data, error } = await (supabase as any)
        .from("candidates")
        .select(`id, nome, apelido, pronomes, email, telefone, cidade, bairro, escolaridade,
                 linkedin, foto_url, avatar_url, cpf, data_nascimento,
                 interesses_setores, interesses_cargos, observacoes, resumo_candidato,
                 curriculo_url, curriculo_nome, portfolio_url, pretensao_salarial,
                 frase_lema, hobbies, nacionalidade, cnh, cnh_categoria,
                 disponibilidade_horario, disponibilidade_mudanca, modalidade_preferida,
                 disponibilidade_viagens, faixa_deslocamento, formacoes, idiomas, experiencias,
                 carta_apresentacao, pcd, pcd_tipo, autodeclaracao_racial, genero,
                 consentimento_diversidade, consentimento_diversidade_data`)
        .eq("token_acesso_candidato", token)
        .maybeSingle();

      if (error || !data) { setErro(true); setLoading(false); return; }
      const cand = data as CandidatoData;
      setCandidato(cand);
      setResumoDraft(cand.resumo_candidato ?? "");
      initDrafts(cand);

      const { data: discData } = await (supabase as any)
        .from("disc_resultado_candidato")
        .select("score_d, score_i, score_s, score_c, fator_predominante, fator_secundario, created_at")
        .eq("candidato_id", cand.id)
        .maybeSingle();
      if (discData) setDisc(discData as DiscResultado);

      if (cand.cpf) {
        const { data: apps } = await (supabase as any)
          .from("candidates")
          .select("id, etapa_azumi, banco_talentos, data_aplicacao, job_solicitations(cargo, avulsa_empresa_nome)")
          .eq("cpf", cand.cpf)
          .order("created_at", { ascending: false });
        if (apps) setCandidaturas(apps as Candidatura[]);
      }
      setLoading(false);
    })();
  }, [token]);

  function initDrafts(c: CandidatoData) {
    setSobreDraft({ apelido: c.apelido ?? "", pronomes: c.pronomes ?? "", data_nascimento: c.data_nascimento ?? "", observacoes: c.observacoes ?? "", frase_lema: c.frase_lema ?? "", hobbies: c.hobbies ?? "" });
    setDadosDraft({ cidade: c.cidade ?? "", bairro: c.bairro ?? "", nacionalidade: c.nacionalidade ?? "", telefone: c.telefone ?? "", cnh: c.cnh ?? false, cnh_categoria: c.cnh_categoria ?? "", disponibilidade_horario: c.disponibilidade_horario ?? "", disponibilidade_mudanca: c.disponibilidade_mudanca ?? false, pretensao_salarial: c.pretensao_salarial ?? "" });
    setTrajDraft({ escolaridade: c.escolaridade ?? "", linkedin: c.linkedin ?? "", portfolio_url: c.portfolio_url ?? "", carta_apresentacao: c.carta_apresentacao ?? "", formacoes: c.formacoes ?? [], idiomas: c.idiomas ?? [], experiencias: c.experiencias ?? [] });
    setIntDraft({ interesses_setores: c.interesses_setores ?? [], interesses_cargos: c.interesses_cargos?.join(", ") ?? "", modalidade_preferida: c.modalidade_preferida ?? "", disponibilidade_viagens: c.disponibilidade_viagens ?? false, faixa_deslocamento: c.faixa_deslocamento ?? "" });
    setDivDraft({ pcd: c.pcd ?? false, pcd_tipo: c.pcd_tipo ?? "", autodeclaracao_racial: c.autodeclaracao_racial ?? "", genero: c.genero ?? "", consentimento_diversidade: c.consentimento_diversidade ?? false });
  }

  // ── Save handlers ─────────────────────────────────────────────────────────────
  async function patchCandidato(updates: Record<string, unknown>) {
    if (!candidato) return;
    const target = candidato.cpf
      ? (supabase as any).from("candidates").update(updates).eq("cpf", candidato.cpf)
      : (supabase as any).from("candidates").update(updates).eq("id", candidato.id);
    await target;
    setCandidato((p) => p ? { ...p, ...updates } as CandidatoData : p);
  }

  async function salvarSobre() {
    setSalvandoSobre(true);
    await patchCandidato({ apelido: sobreDraft.apelido || null, pronomes: sobreDraft.pronomes || null, data_nascimento: sobreDraft.data_nascimento || null, observacoes: sobreDraft.observacoes || null, frase_lema: sobreDraft.frase_lema || null, hobbies: sobreDraft.hobbies || null });
    setSalvandoSobre(false); setEditSobre(false);
  }

  async function salvarDados() {
    setSalvandoDados(true);
    await patchCandidato({ cidade: dadosDraft.cidade || null, bairro: dadosDraft.bairro || null, nacionalidade: dadosDraft.nacionalidade || null, telefone: dadosDraft.telefone || null, cnh: dadosDraft.cnh, cnh_categoria: dadosDraft.cnh_categoria || null, disponibilidade_horario: dadosDraft.disponibilidade_horario || null, disponibilidade_mudanca: dadosDraft.disponibilidade_mudanca, pretensao_salarial: dadosDraft.pretensao_salarial || null });
    setSalvandoDados(false); setEditDados(false);
  }

  async function salvarTrajetoria() {
    setSalvandoTraj(true);
    await patchCandidato({ escolaridade: trajDraft.escolaridade || null, linkedin: trajDraft.linkedin || null, portfolio_url: trajDraft.portfolio_url || null, carta_apresentacao: trajDraft.carta_apresentacao || null, formacoes: trajDraft.formacoes, idiomas: trajDraft.idiomas, experiencias: trajDraft.experiencias });
    setSalvandoTraj(false); setEditTrajetoria(false);
  }

  async function salvarInteresses() {
    setSalvandoInt(true);
    const cargos = intDraft.interesses_cargos.split(",").map((c) => c.trim()).filter(Boolean);
    await patchCandidato({ interesses_setores: intDraft.interesses_setores.length ? intDraft.interesses_setores : null, interesses_cargos: cargos.length ? cargos : null, modalidade_preferida: intDraft.modalidade_preferida || null, disponibilidade_viagens: intDraft.disponibilidade_viagens, faixa_deslocamento: intDraft.faixa_deslocamento || null });
    setSalvandoInt(false); setEditInteresses(false);
  }

  async function salvarResumoFn() {
    setSalvandoResumo(true);
    await patchCandidato({ resumo_candidato: resumoDraft || null });
    setSalvandoResumo(false); setEditResumo(false);
  }

  async function salvarDiversidade() {
    setSalvandoDiv(true);
    const agora = divDraft.consentimento_diversidade ? new Date().toISOString() : null;
    await patchCandidato({ pcd: divDraft.pcd, pcd_tipo: divDraft.pcd_tipo || null, autodeclaracao_racial: divDraft.autodeclaracao_racial || null, genero: divDraft.genero || null, consentimento_diversidade: divDraft.consentimento_diversidade, consentimento_diversidade_data: agora });
    setSalvandoDiv(false); setEditDiversidade(false);
  }

  // ── File uploads ─────────────────────────────────────────────────────────────
  async function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !candidato) return;
    setUploadandoFoto(true);
    const ext = file.name.split(".").pop();
    const path = `avatars/${candidato.id}.${ext}`;
    const { error } = await supabase.storage.from("public-applications").upload(path, file, { upsert: true });
    if (!error) {
      const { data: u } = supabase.storage.from("public-applications").getPublicUrl(path);
      await patchCandidato({ avatar_url: u.publicUrl });
    }
    setUploadandoFoto(false);
  }

  async function handleCurriculoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !candidato) return;
    setUploadandoCurriculo(true);
    const path = `curriculos/${candidato.id}-${file.name}`;
    const { error } = await supabase.storage.from("curriculos").upload(path, file, { upsert: true });
    if (!error) {
      const { data: u } = supabase.storage.from("curriculos").getPublicUrl(path);
      await patchCandidato({ curriculo_url: u.publicUrl, curriculo_nome: file.name });
    }
    setUploadandoCurriculo(false);
  }

  // ── Loading / error ───────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
      <div className="h-8 w-8 rounded-full border-4 border-[#264478]/30 border-t-[#264478] animate-spin" />
    </div>
  );
  if (erro || !candidato) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg,#14233F,#264478,#3D63B8)" }}>
      <div className="text-center text-white px-6">
        <img src={azumiLogoBranca} alt="Azumi" className="mx-auto mb-6" style={{ height: 44 }} />
        <h1 className="text-xl font-bold mb-2">Link não encontrado</h1>
        <p className="text-white/70 text-sm">Este link é inválido ou expirou. Verifique o e-mail recebido.</p>
        <Link to="/area-do-candidato" className="mt-4 inline-block text-sm underline text-white/80">Solicitar novo acesso</Link>
      </div>
    </div>
  );

  // ── Computed ──────────────────────────────────────────────────────────────────
  const saudacao = candidato.apelido?.trim() || candidato.nome.split(" ")[0];
  const fotoUrl = candidato.avatar_url || candidato.foto_url;
  const iniciais = candidato.nome.split(" ").filter(Boolean).map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  const progresso = calcProgresso(candidato, disc);
  const discInfo = disc ? DISC_INFO[disc.fator_predominante] : null;
  const discValidoAte = disc ? new Date(new Date(disc.created_at).getTime() + DISC_VALIDADE_MS) : null;
  const discValido = disc && (Date.now() - new Date(disc.created_at).getTime()) < DISC_VALIDADE_MS;
  const ativas = candidaturas.filter((c) => c.job_solicitations && c.etapa_azumi !== "reprovado" && c.etapa_azumi !== "contratado" && !c.banco_talentos);
  const finalizadas = candidaturas.filter((c) => c.etapa_azumi === "reprovado" || c.etapa_azumi === "contratado");
  const estaNoBanco = candidaturas.some((c) => c.banco_talentos);

  // ── Input style ───────────────────────────────────────────────────────────────
  const inputCls = "w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#264478]/20 focus:border-[#264478]";
  const labelCls = "block text-xs font-medium text-slate-500 mb-1";

  function SaveBar({ onSave, onCancel, saving }: { onSave: () => void; onCancel: () => void; saving: boolean }) {
    return (
      <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
        <button onClick={onSave} disabled={saving} className="flex-1 flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold text-white disabled:opacity-60 transition-all" style={{ background: "#264478" }}>
          {saving ? <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <Check className="h-4 w-4" />}
          {saving ? "Salvando…" : "Salvar"}
        </button>
        <button onClick={onCancel} className="px-4 rounded-full border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F5F7FA] overscroll-none">
      <input ref={fotoInputRef} type="file" accept="image/*" className="hidden" onChange={handleFotoChange} />
      <input ref={curriculoInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleCurriculoChange} />

      {/* ── Topbar pílula ──────────────────────────────────────────────────── */}
      <div className="px-4 pt-3 pb-2">
        <div className="max-w-[1060px] mx-auto flex items-center justify-between rounded-full px-5 py-0.5 border border-white/10 shadow-[0_8px_24px_rgba(3,29,56,0.25)]"
          style={{ background: "rgba(3,29,56,0.92)", backdropFilter: "blur(10px)" }}>
          <div className="flex items-center gap-3">
            <img src={azumiLogoBranca} alt="Azumi RH" style={{ height: 84, width: "auto" }} />
            <div className="w-px h-8 bg-white/20" />
            <img src={CONNECT_LOGO} alt="Connect" style={{ height: 108, width: "auto" }} />
          </div>
          <nav className="flex items-center gap-1.5">
            <Link to="/vagas" className="hidden sm:flex items-center rounded-full bg-white/10 border border-white/20 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-white/20 transition-colors">
              Portal de Vagas
            </Link>
            <Link to="/vagas" className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] text-white/70 hover:text-white hover:bg-white/10 transition-colors">
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </Link>
          </nav>
        </div>
      </div>

      <div className="max-w-[1060px] mx-auto px-4 pb-16">

        {/* ── Hero card ────────────────────────────────────────────────────── */}
        <section className="mt-3 rounded-[20px] overflow-hidden relative px-8 py-8"
          style={{ background: "linear-gradient(135deg,#14233F 0%,#264478 55%,#3D63B8 100%)", color: "#fff" }}>
          <div className="pointer-events-none absolute -right-16 -top-16 w-64 h-64 rounded-full"
            style={{ background: "radial-gradient(circle,rgba(127,168,232,.28),transparent 70%)" }} />

          <div className="relative z-10 flex flex-col sm:flex-row gap-6 items-center sm:items-end">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-[132px] h-[132px] rounded-2xl overflow-hidden border-2 border-white/35 shadow-xl">
                {fotoUrl
                  ? <img src={fotoUrl} alt={candidato.nome} className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-white/20 flex items-center justify-center"><span className="text-4xl font-bold text-white">{iniciais}</span></div>
                }
              </div>
              <button onClick={() => fotoInputRef.current?.click()}
                className="absolute bottom-2 right-2 bg-white text-[#264478] rounded-lg text-[10px] font-bold px-2 py-1 shadow-md hover:bg-slate-100 transition-colors flex items-center gap-1">
                {uploadandoFoto ? <div className="h-3 w-3 rounded-full border-2 border-[#264478] border-t-transparent animate-spin" /> : <Camera className="h-3 w-3" />}
                Trocar foto
              </button>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <p className="text-white/70 text-sm mb-1">Oi, <strong>{saudacao}</strong>! 👋</p>
              <h1 className="text-[28px] font-extrabold tracking-tight leading-tight">{candidato.nome}</h1>
              {candidato.pronomes && <p className="text-white/60 text-xs mt-0.5">{candidato.pronomes}</p>}

              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
                {candidato.escolaridade && (
                  <span className="flex items-center gap-1.5 text-[12px] rounded-full px-3 py-1" style={{ background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.22)" }}>
                    <GraduationCap className="h-3.5 w-3.5" /> {candidato.escolaridade}
                  </span>
                )}
                {candidato.cidade && (
                  <span className="flex items-center gap-1.5 text-[12px] rounded-full px-3 py-1" style={{ background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.22)" }}>
                    <MapPin className="h-3.5 w-3.5" /> {candidato.cidade}
                  </span>
                )}
                {discInfo && (
                  <span className="flex items-center gap-1.5 text-[12px] rounded-full px-3 py-1 font-semibold" style={{ background: discInfo.cor + "33", border: `1px solid ${discInfo.cor}66`, color: "#fff" }}>
                    {discInfo.nome}
                  </span>
                )}
              </div>

              {/* Completude */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-white/70">Perfil {progresso}% completo {progresso >= 80 ? "✨" : progresso >= 50 ? "🔧" : "📝"}</span>
                  <span className="text-[11px] text-white/50">{progresso < 100 ? "Complete para se destacar!" : "Perfil completo 🎉"}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,.2)" }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${progresso}%`, background: "#7FA8E8" }} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Main layout ──────────────────────────────────────────────────── */}
        <div className="mt-4 flex flex-col lg:flex-row gap-4">

          {/* ── Left column (tabs) ─────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Tab navigation */}
            <div className="overflow-x-auto -mx-4 px-4 mb-4">
              <div className="flex gap-1.5 min-w-max">
                {TABS.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key)}
                    className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-all"
                    style={activeTab === t.key
                      ? { background: "#264478", color: "#fff", boxShadow: "0 2px 8px rgba(38,68,120,0.35)" }
                      : { background: "#fff", color: "#64748b", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }
                    }
                  >
                    <span>{t.emoji}</span> {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ══ ABA: Sobre mim ═══════════════════════════════════════════ */}
            {activeTab === "sobre" && (
              <>
                <SectionCard title="Sobre mim" icon={<Smile className="h-4 w-4" />} onEdit={editSobre ? undefined : () => setEditSobre(true)}>
                  {editSobre ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className={labelCls}>Como gosta de ser chamado(a)?</label>
                          <input className={inputCls} value={sobreDraft.apelido} onChange={(e) => setSobreDraft((p) => ({ ...p, apelido: e.target.value }))} placeholder="Apelido ou nome preferido" />
                        </div>
                        <div>
                          <label className={labelCls}>Pronomes <span className="text-slate-400">(opcional)</span></label>
                          <input className={inputCls} value={sobreDraft.pronomes} onChange={(e) => setSobreDraft((p) => ({ ...p, pronomes: e.target.value }))} placeholder="Ex: ela/dela, ele/dele, elu/delu" />
                        </div>
                        <div>
                          <label className={labelCls}>Data de aniversário</label>
                          <input type="date" className={inputCls} value={sobreDraft.data_nascimento} onChange={(e) => setSobreDraft((p) => ({ ...p, data_nascimento: e.target.value }))} />
                        </div>
                        <div>
                          <label className={labelCls}>Frase / lema pessoal <span className="text-slate-400">(opcional)</span></label>
                          <input className={inputCls} value={sobreDraft.frase_lema} onChange={(e) => setSobreDraft((p) => ({ ...p, frase_lema: e.target.value }))} placeholder="Uma frase que te representa" />
                        </div>
                        <div className="sm:col-span-2">
                          <label className={labelCls}>Me conta sua história <span className="text-slate-400">(bio)</span></label>
                          <textarea rows={4} className={inputCls + " resize-none"} value={sobreDraft.observacoes} onChange={(e) => setSobreDraft((p) => ({ ...p, observacoes: e.target.value }))} placeholder="Fale um pouco sobre você, sua trajetória, o que te motiva…" />
                        </div>
                        <div className="sm:col-span-2">
                          <label className={labelCls}>Hobbies e interesses <span className="text-slate-400">(opcional)</span></label>
                          <input className={inputCls} value={sobreDraft.hobbies} onChange={(e) => setSobreDraft((p) => ({ ...p, hobbies: e.target.value }))} placeholder="Ex: fotografia, culinária, esportes, música" />
                        </div>
                      </div>
                      <SaveBar onSave={salvarSobre} onCancel={() => { setEditSobre(false); initDrafts(candidato); }} saving={salvandoSobre} />
                    </>
                  ) : (
                    <div className="space-y-4">
                      {candidato.frase_lema && (
                        <p className="text-sm italic text-slate-500 border-l-4 border-[#264478]/30 pl-3">"{candidato.frase_lema}"</p>
                      )}
                      {candidato.observacoes ? (
                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{candidato.observacoes}</p>
                      ) : (
                        <EmptyState msg="Conte sua história aqui — sua trajetória, motivações e o que te faz único(a)." />
                      )}
                      {candidato.data_nascimento && (
                        <p className="text-sm text-slate-500 flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Aniversário: <strong>{fmtData(candidato.data_nascimento)}</strong></p>
                      )}
                      {candidato.hobbies && (
                        <div>
                          <p className="text-xs text-slate-400 mb-1.5">Hobbies e interesses</p>
                          <div className="flex flex-wrap gap-1.5">
                            {candidato.hobbies.split(",").map((h) => (
                              <span key={h} className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">{h.trim()}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </SectionCard>

                {/* Resumo de experiência */}
                <SectionCard title="Resumo de experiência" icon={<FileText className="h-4 w-4" />} onEdit={editResumo ? undefined : () => setEditResumo(true)}>
                  {editResumo ? (
                    <>
                      <textarea rows={5} className={inputCls + " resize-none"} value={resumoDraft} onChange={(e) => setResumoDraft(e.target.value)} placeholder="Descreva sua experiência profissional em poucas linhas para a equipe Azumi…" />
                      <SaveBar onSave={salvarResumoFn} onCancel={() => { setEditResumo(false); setResumoDraft(candidato.resumo_candidato ?? ""); }} saving={salvandoResumo} />
                    </>
                  ) : candidato.resumo_candidato ? (
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{candidato.resumo_candidato}</p>
                  ) : (
                    <EmptyState msg="Adicione um resumo profissional — ele é visto pela equipe Azumi na sua ficha." />
                  )}
                </SectionCard>
              </>
            )}

            {/* ══ ABA: Dados gerais ════════════════════════════════════════ */}
            {activeTab === "dados" && (
              <SectionCard title="Dados gerais" icon={<FileText className="h-4 w-4" />} onEdit={editDados ? undefined : () => setEditDados(true)}>
                {editDados ? (
                  <>
                    <p className="text-xs text-slate-400 mb-3">Quanto mais completo, melhor te conhecemos — mas você compartilha só o que quiser.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <label className={labelCls}>Nome completo <span className="text-slate-400">(somente leitura)</span></label>
                        <input className={inputCls + " opacity-60"} value={candidato.nome} readOnly />
                      </div>
                      {candidato.cpf && (
                        <div>
                          <label className={labelCls}>CPF <span className="text-slate-400">(somente leitura)</span></label>
                          <input className={inputCls + " opacity-60"} value={candidato.cpf} readOnly />
                        </div>
                      )}
                      <div>
                        <label className={labelCls}>Cidade</label>
                        <input className={inputCls} value={dadosDraft.cidade} onChange={(e) => setDadosDraft((p) => ({ ...p, cidade: e.target.value }))} placeholder="Sua cidade" />
                      </div>
                      <div>
                        <label className={labelCls}>Bairro <span className="text-slate-400">(opcional)</span></label>
                        <input className={inputCls} value={dadosDraft.bairro} onChange={(e) => setDadosDraft((p) => ({ ...p, bairro: e.target.value }))} placeholder="Bairro" />
                      </div>
                      <div>
                        <label className={labelCls}>Nacionalidade <span className="text-slate-400">(opcional)</span></label>
                        <input className={inputCls} value={dadosDraft.nacionalidade} onChange={(e) => setDadosDraft((p) => ({ ...p, nacionalidade: e.target.value }))} placeholder="Brasileira" />
                      </div>
                      <div>
                        <label className={labelCls}>Telefone / WhatsApp</label>
                        <input className={inputCls} value={dadosDraft.telefone} onChange={(e) => setDadosDraft((p) => ({ ...p, telefone: e.target.value }))} placeholder="(41) 99999-9999" />
                      </div>
                      {candidato.email && (
                        <div>
                          <label className={labelCls}>E-mail <span className="text-slate-400">(somente leitura)</span></label>
                          <input className={inputCls + " opacity-60"} value={candidato.email} readOnly />
                        </div>
                      )}
                      <div>
                        <label className={labelCls}>Pretensão salarial</label>
                        <input className={inputCls} value={dadosDraft.pretensao_salarial} onChange={(e) => setDadosDraft((p) => ({ ...p, pretensao_salarial: e.target.value }))} placeholder="Ex: R$ 4.000 – R$ 6.000" />
                      </div>
                      <div>
                        <label className={labelCls}>Disponibilidade de horário</label>
                        <select className={inputCls} value={dadosDraft.disponibilidade_horario} onChange={(e) => setDadosDraft((p) => ({ ...p, disponibilidade_horario: e.target.value }))}>
                          <option value="">Selecione</option>
                          {["Manhã", "Tarde", "Noite", "Integral", "Flexível"].map((v) => <option key={v} value={v}>{v}</option>)}
                        </select>
                      </div>
                      <div className="flex items-center gap-3">
                        <input type="checkbox" id="cnh" checked={dadosDraft.cnh} onChange={(e) => setDadosDraft((p) => ({ ...p, cnh: e.target.checked }))} className="h-4 w-4 rounded" />
                        <label htmlFor="cnh" className="text-sm text-slate-700">Possui CNH</label>
                        {dadosDraft.cnh && (
                          <input className={inputCls + " flex-1"} value={dadosDraft.cnh_categoria} onChange={(e) => setDadosDraft((p) => ({ ...p, cnh_categoria: e.target.value }))} placeholder="Categoria (A, B, C…)" />
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <input type="checkbox" id="mudanca" checked={dadosDraft.disponibilidade_mudanca} onChange={(e) => setDadosDraft((p) => ({ ...p, disponibilidade_mudanca: e.target.checked }))} className="h-4 w-4 rounded" />
                        <label htmlFor="mudanca" className="text-sm text-slate-700">Disponível para mudança de cidade</label>
                      </div>
                    </div>
                    <SaveBar onSave={salvarDados} onCancel={() => { setEditDados(false); initDrafts(candidato); }} saving={salvandoDados} />
                  </>
                ) : (
                  <div className="space-y-3">
                    {candidato.cpf && <Row icon={<FileText className="h-3.5 w-3.5" />} label="CPF" val={candidato.cpf} />}
                    {(candidato.cidade || candidato.bairro) && <Row icon={<MapPin className="h-3.5 w-3.5" />} label="Localização" val={[candidato.bairro, candidato.cidade].filter(Boolean).join(", ")} />}
                    {candidato.nacionalidade && <Row icon={<Globe className="h-3.5 w-3.5" />} label="Nacionalidade" val={candidato.nacionalidade} />}
                    {candidato.telefone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="text-slate-500 text-xs w-20 shrink-0">Telefone</span>
                        <a href={waLink(candidato.telefone)} target="_blank" rel="noopener noreferrer" className="text-slate-700 hover:text-green-600 flex items-center gap-1 font-medium">
                          {candidato.telefone} <MessageCircle className="h-3.5 w-3.5 text-green-500" />
                        </a>
                      </div>
                    )}
                    {candidato.email && <Row icon={<Mail className="h-3.5 w-3.5" />} label="E-mail" val={candidato.email} />}
                    {candidato.pretensao_salarial && <Row icon={<Star className="h-3.5 w-3.5" />} label="Pretensão" val={candidato.pretensao_salarial} />}
                    {candidato.disponibilidade_horario && <Row icon={<Calendar className="h-3.5 w-3.5" />} label="Horário" val={candidato.disponibilidade_horario} />}
                    {candidato.cnh && <Row icon={<Briefcase className="h-3.5 w-3.5" />} label="CNH" val={candidato.cnh_categoria ? `Sim — categoria ${candidato.cnh_categoria}` : "Sim"} />}
                    {candidato.disponibilidade_mudanca && <Row icon={<MapPin className="h-3.5 w-3.5" />} label="Mudança" val="Disponível para mudança de cidade" />}
                    {!candidato.cidade && !candidato.telefone && !candidato.pretensao_salarial && <EmptyState msg="Preencha seus dados para que a equipe Azumi te conheça melhor." />}
                  </div>
                )}
              </SectionCard>
            )}

            {/* ══ ABA: Trajetória ══════════════════════════════════════════ */}
            {activeTab === "trajetoria" && (
              <SectionCard title="Trajetória" icon={<Building2 className="h-4 w-4" />} onEdit={editTrajetoria ? undefined : () => setEditTrajetoria(true)}>
                {editTrajetoria ? (
                  <>
                    <div className="space-y-5">
                      {/* Escolaridade */}
                      <div>
                        <label className={labelCls}>Escolaridade</label>
                        <select className={inputCls} value={trajDraft.escolaridade} onChange={(e) => setTrajDraft((p) => ({ ...p, escolaridade: e.target.value }))}>
                          <option value="">Selecione</option>
                          {ESCOLARIDADES.map((e) => <option key={e} value={e}>{e}</option>)}
                        </select>
                      </div>

                      {/* Links */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className={labelCls}>LinkedIn</label>
                          <input className={inputCls} value={trajDraft.linkedin} onChange={(e) => setTrajDraft((p) => ({ ...p, linkedin: e.target.value }))} placeholder="linkedin.com/in/seu-perfil" />
                        </div>
                        <div>
                          <label className={labelCls}>Portfólio / site <span className="text-slate-400">(opcional)</span></label>
                          <input className={inputCls} value={trajDraft.portfolio_url} onChange={(e) => setTrajDraft((p) => ({ ...p, portfolio_url: e.target.value }))} placeholder="seusite.com" />
                        </div>
                      </div>

                      {/* Formações */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className={labelCls}>Formações e cursos</label>
                          <button onClick={() => setTrajDraft((p) => ({ ...p, formacoes: [...p.formacoes, { id: uid(), curso: "", instituicao: "", ano: "" }] }))} className="text-xs text-[#264478] flex items-center gap-1 hover:underline"><Plus className="h-3 w-3" /> Adicionar</button>
                        </div>
                        {trajDraft.formacoes.map((f, i) => (
                          <div key={f.id} className="grid grid-cols-[1fr_1fr_80px_32px] gap-2 mb-2 items-center">
                            <input className={inputCls} value={f.curso} onChange={(e) => setTrajDraft((p) => { const a = [...p.formacoes]; a[i] = { ...a[i], curso: e.target.value }; return { ...p, formacoes: a }; })} placeholder="Curso / formação" />
                            <input className={inputCls} value={f.instituicao} onChange={(e) => setTrajDraft((p) => { const a = [...p.formacoes]; a[i] = { ...a[i], instituicao: e.target.value }; return { ...p, formacoes: a }; })} placeholder="Instituição" />
                            <input className={inputCls} value={f.ano} onChange={(e) => setTrajDraft((p) => { const a = [...p.formacoes]; a[i] = { ...a[i], ano: e.target.value }; return { ...p, formacoes: a }; })} placeholder="Ano" />
                            <button onClick={() => setTrajDraft((p) => ({ ...p, formacoes: p.formacoes.filter((_, j) => j !== i) }))} className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                          </div>
                        ))}
                        {trajDraft.formacoes.length === 0 && <p className="text-xs text-slate-400">Nenhuma formação adicionada ainda.</p>}
                      </div>

                      {/* Idiomas */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className={labelCls}>Idiomas</label>
                          <button onClick={() => setTrajDraft((p) => ({ ...p, idiomas: [...p.idiomas, { id: uid(), idioma: "", nivel: "" }] }))} className="text-xs text-[#264478] flex items-center gap-1 hover:underline"><Plus className="h-3 w-3" /> Adicionar</button>
                        </div>
                        {trajDraft.idiomas.map((id, i) => (
                          <div key={id.id} className="grid grid-cols-[1fr_1fr_32px] gap-2 mb-2 items-center">
                            <input className={inputCls} value={id.idioma} onChange={(e) => setTrajDraft((p) => { const a = [...p.idiomas]; a[i] = { ...a[i], idioma: e.target.value }; return { ...p, idiomas: a }; })} placeholder="Idioma" />
                            <select className={inputCls} value={id.nivel} onChange={(e) => setTrajDraft((p) => { const a = [...p.idiomas]; a[i] = { ...a[i], nivel: e.target.value }; return { ...p, idiomas: a }; })}>
                              <option value="">Nível</option>
                              {NIVEIS_IDIOMA.map((n) => <option key={n} value={n}>{n}</option>)}
                            </select>
                            <button onClick={() => setTrajDraft((p) => ({ ...p, idiomas: p.idiomas.filter((_, j) => j !== i) }))} className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                          </div>
                        ))}
                      </div>

                      {/* Experiências */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className={labelCls}>Experiências profissionais</label>
                          <button onClick={() => setTrajDraft((p) => ({ ...p, experiencias: [...p.experiencias, { id: uid(), cargo: "", empresa: "", periodo: "", descricao: "" }] }))} className="text-xs text-[#264478] flex items-center gap-1 hover:underline"><Plus className="h-3 w-3" /> Adicionar</button>
                        </div>
                        {trajDraft.experiencias.map((ex, i) => (
                          <div key={ex.id} className="border border-slate-100 rounded-xl p-3 mb-3 space-y-2">
                            <div className="grid grid-cols-[1fr_1fr_32px] gap-2 items-center">
                              <input className={inputCls} value={ex.cargo} onChange={(e) => setTrajDraft((p) => { const a = [...p.experiencias]; a[i] = { ...a[i], cargo: e.target.value }; return { ...p, experiencias: a }; })} placeholder="Cargo" />
                              <input className={inputCls} value={ex.empresa} onChange={(e) => setTrajDraft((p) => { const a = [...p.experiencias]; a[i] = { ...a[i], empresa: e.target.value }; return { ...p, experiencias: a }; })} placeholder="Empresa" />
                              <button onClick={() => setTrajDraft((p) => ({ ...p, experiencias: p.experiencias.filter((_, j) => j !== i) }))} className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                            </div>
                            <input className={inputCls} value={ex.periodo} onChange={(e) => setTrajDraft((p) => { const a = [...p.experiencias]; a[i] = { ...a[i], periodo: e.target.value }; return { ...p, experiencias: a }; })} placeholder="Período (ex: Jan 2020 – Dez 2022)" />
                            <textarea rows={2} className={inputCls + " resize-none"} value={ex.descricao ?? ""} onChange={(e) => setTrajDraft((p) => { const a = [...p.experiencias]; a[i] = { ...a[i], descricao: e.target.value }; return { ...p, experiencias: a }; })} placeholder="Principais responsabilidades (opcional)" />
                          </div>
                        ))}
                      </div>

                      {/* Carta de apresentação */}
                      <div>
                        <label className={labelCls}>Carta de apresentação <span className="text-slate-400">(opcional)</span></label>
                        <textarea rows={4} className={inputCls + " resize-none"} value={trajDraft.carta_apresentacao} onChange={(e) => setTrajDraft((p) => ({ ...p, carta_apresentacao: e.target.value }))} placeholder="Uma apresentação sobre você e o que você busca profissionalmente…" />
                      </div>
                    </div>
                    <SaveBar onSave={salvarTrajetoria} onCancel={() => { setEditTrajetoria(false); initDrafts(candidato); }} saving={salvandoTraj} />
                  </>
                ) : (
                  <div className="space-y-4">
                    {candidato.escolaridade && <Row icon={<GraduationCap className="h-3.5 w-3.5" />} label="Escolaridade" val={candidato.escolaridade} />}
                    {candidato.linkedin && (
                      <div className="flex items-center gap-2 text-sm">
                        <Linkedin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="text-slate-500 text-xs w-20 shrink-0">LinkedIn</span>
                        <a href={candidato.linkedin.startsWith("http") ? candidato.linkedin : `https://${candidato.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-[#264478] hover:underline flex items-center gap-1 text-sm">
                          {candidato.linkedin} <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                    {candidato.portfolio_url && (
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="text-slate-500 text-xs w-20 shrink-0">Portfólio</span>
                        <a href={candidato.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-[#264478] hover:underline flex items-center gap-1">{candidato.portfolio_url} <ExternalLink className="h-3 w-3" /></a>
                      </div>
                    )}

                    {/* Formações */}
                    {(candidato.formacoes?.length ?? 0) > 0 && (
                      <div>
                        <p className="text-xs text-slate-400 mb-2">Formações</p>
                        {(candidato.formacoes ?? []).map((f, i) => (
                          <div key={i} className="flex gap-2 mb-1.5">
                            <GraduationCap className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-slate-800">{f.curso}</p>
                              <p className="text-xs text-slate-500">{[f.instituicao, f.ano].filter(Boolean).join(" · ")}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Idiomas */}
                    {(candidato.idiomas?.length ?? 0) > 0 && (
                      <div>
                        <p className="text-xs text-slate-400 mb-2">Idiomas</p>
                        <div className="flex flex-wrap gap-2">
                          {(candidato.idiomas ?? []).map((id, i) => (
                            <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 flex items-center gap-1">
                              <Languages className="h-3 w-3" /> {id.idioma} {id.nivel && `— ${id.nivel}`}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Experiências */}
                    {(candidato.experiencias?.length ?? 0) > 0 && (
                      <div>
                        <p className="text-xs text-slate-400 mb-2">Experiências</p>
                        {(candidato.experiencias ?? []).map((ex, i) => (
                          <div key={i} className="border-l-2 border-[#264478]/20 pl-3 mb-3">
                            <p className="text-sm font-semibold text-slate-800">{ex.cargo}</p>
                            <p className="text-xs text-slate-500">{[ex.empresa, ex.periodo].filter(Boolean).join(" · ")}</p>
                            {ex.descricao && <p className="text-xs text-slate-600 mt-1">{ex.descricao}</p>}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Carta */}
                    {candidato.carta_apresentacao && (
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Carta de apresentação</p>
                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{candidato.carta_apresentacao}</p>
                      </div>
                    )}

                    {/* Currículo */}
                    <div className="pt-2 border-t border-slate-100">
                      <p className="text-xs text-slate-400 mb-2">Currículo</p>
                      {candidato.curriculo_url ? (
                        <div className="flex items-center gap-3">
                          <a href={candidato.curriculo_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-[#264478] hover:underline">
                            <FileText className="h-4 w-4" /> {candidato.curriculo_nome || "Currículo.pdf"}
                          </a>
                          <button onClick={() => curriculoInputRef.current?.click()} className="text-xs text-slate-500 flex items-center gap-1 hover:text-slate-700">
                            <Upload className="h-3.5 w-3.5" /> Atualizar
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => curriculoInputRef.current?.click()} className="flex items-center gap-2 text-sm text-[#264478] border border-[#264478]/30 rounded-lg px-3 py-2 hover:bg-[#264478]/5">
                          {uploadandoCurriculo ? <div className="h-4 w-4 rounded-full border-2 border-[#264478] border-t-transparent animate-spin" /> : <Upload className="h-4 w-4" />}
                          Enviar currículo (PDF)
                        </button>
                      )}
                    </div>

                    {!candidato.escolaridade && !candidato.linkedin && !candidato.curriculo_url && (candidato.experiencias?.length ?? 0) === 0 && <EmptyState msg="Complete sua trajetória: escolaridade, experiências, formações e currículo." />}
                  </div>
                )}
              </SectionCard>
            )}

            {/* ══ ABA: Interesses ══════════════════════════════════════════ */}
            {activeTab === "interesses" && (
              <SectionCard title="Interesses profissionais" icon={<Briefcase className="h-4 w-4" />} onEdit={editInteresses ? undefined : () => setEditInteresses(true)}>
                {editInteresses ? (
                  <>
                    <div className="space-y-4">
                      <div>
                        <label className={labelCls}>Setores de interesse</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {SETORES.map((s) => (
                            <button key={s} onClick={() => setIntDraft((p) => ({ ...p, interesses_setores: p.interesses_setores.includes(s) ? p.interesses_setores.filter((x) => x !== s) : [...p.interesses_setores, s] }))}
                              className="text-xs px-3 py-1.5 rounded-full border transition-colors"
                              style={intDraft.interesses_setores.includes(s) ? { background: "#264478", color: "#fff", borderColor: "#264478" } : { background: "#f8fafc", color: "#64748b", borderColor: "#e2e8f0" }}>
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>Cargos de interesse <span className="text-slate-400">— separe por vírgula</span></label>
                        <input className={inputCls} value={intDraft.interesses_cargos} onChange={(e) => setIntDraft((p) => ({ ...p, interesses_cargos: e.target.value }))} placeholder="Ex: Analista de RH, Coordenador Comercial, Assistente Financeiro" />
                        <p className="text-[11px] text-slate-400 mt-1">Separe os cargos por vírgula.</p>
                      </div>
                      <div>
                        <label className={labelCls}>Modalidade preferida</label>
                        <div className="flex gap-2 flex-wrap">
                          {MODALIDADES.map((m) => (
                            <button key={m} onClick={() => setIntDraft((p) => ({ ...p, modalidade_preferida: p.modalidade_preferida === m ? "" : m }))}
                              className="text-xs px-3 py-1.5 rounded-full border transition-colors"
                              style={intDraft.modalidade_preferida === m ? { background: "#264478", color: "#fff", borderColor: "#264478" } : { background: "#f8fafc", color: "#64748b", borderColor: "#e2e8f0" }}>
                              {m}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <input type="checkbox" id="viagens" checked={intDraft.disponibilidade_viagens} onChange={(e) => setIntDraft((p) => ({ ...p, disponibilidade_viagens: e.target.checked }))} className="h-4 w-4 rounded" />
                        <label htmlFor="viagens" className="text-sm text-slate-700">Disponível para viagens</label>
                      </div>
                      <div>
                        <label className={labelCls}>Faixa de deslocamento <span className="text-slate-400">(opcional)</span></label>
                        <input className={inputCls} value={intDraft.faixa_deslocamento} onChange={(e) => setIntDraft((p) => ({ ...p, faixa_deslocamento: e.target.value }))} placeholder="Ex: até 30 km de Curitiba" />
                      </div>
                    </div>
                    <SaveBar onSave={salvarInteresses} onCancel={() => { setEditInteresses(false); initDrafts(candidato); }} saving={salvandoInt} />
                  </>
                ) : (
                  <div className="space-y-4">
                    {(candidato.interesses_setores?.length ?? 0) > 0 && (
                      <div>
                        <p className="text-xs text-slate-400 mb-2">Setores</p>
                        <div className="flex flex-wrap gap-1.5">
                          {(candidato.interesses_setores ?? []).map((s) => <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-[#264478]/8 text-[#264478] border border-[#264478]/20">{s}</span>)}
                        </div>
                      </div>
                    )}
                    {(candidato.interesses_cargos?.length ?? 0) > 0 && (
                      <div>
                        <p className="text-xs text-slate-400 mb-2">Cargos</p>
                        <div className="flex flex-wrap gap-1.5">
                          {(candidato.interesses_cargos ?? []).map((c) => <span key={c} className="text-xs px-2.5 py-1 rounded-full border border-dashed border-slate-300 text-slate-700">{c}</span>)}
                        </div>
                      </div>
                    )}
                    {candidato.modalidade_preferida && <Row icon={<Briefcase className="h-3.5 w-3.5" />} label="Modalidade" val={candidato.modalidade_preferida} />}
                    {candidato.disponibilidade_viagens && <Row icon={<MapPin className="h-3.5 w-3.5" />} label="Viagens" val="Disponível" />}
                    {candidato.faixa_deslocamento && <Row icon={<MapPin className="h-3.5 w-3.5" />} label="Deslocamento" val={candidato.faixa_deslocamento} />}
                    {!(candidato.interesses_setores?.length) && !(candidato.interesses_cargos?.length) && <EmptyState msg="Adicione seus interesses profissionais para que a Azumi te encontre nas vagas certas." />}
                  </div>
                )}
              </SectionCard>
            )}

            {/* ══ ABA: Meus testes ════════════════════════════════════════ */}
            {activeTab === "testes" && (
              <SectionCard title="Meus testes" icon={<Star className="h-4 w-4" />}>
                {disc ? (
                  <div>
                    <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 mb-4">
                      <PerfilIlustracao dim={disc.fator_predominante as DiscDim} size={80} />
                      <div className="min-w-0">
                        <p className="text-xs text-slate-500 mb-0.5">Perfil comportamental</p>
                        <h3 className="text-xl font-bold" style={{ color: discInfo?.cor }}>{discInfo?.nome}</h3>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{discInfo?.frase}</p>
                      </div>
                    </div>

                    {/* Barras DISC */}
                    <div className="space-y-2 mb-4">
                      {(["D", "I", "S", "C"] as DiscDim[]).map((d) => {
                        const val = d === "D" ? disc.score_d : d === "I" ? disc.score_i : d === "S" ? disc.score_s : disc.score_c;
                        const cor = { D: "#EF4444", I: "#F59E0B", S: "#10B981", C: "#3B82F6" }[d];
                        return (
                          <div key={d} className="flex items-center gap-3">
                            <span className="w-4 text-xs font-bold" style={{ color: cor }}>{d}</span>
                            <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${val}%`, background: cor }} />
                            </div>
                            <span className="text-xs text-slate-500 w-8 text-right">{val}%</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Validade */}
                    <div className={`text-xs px-3 py-2 rounded-lg mb-3 flex items-center gap-2 ${discValido ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                      {discValido ? <Check className="h-3.5 w-3.5 shrink-0" /> : <AlertTriangle className="h-3.5 w-3.5 shrink-0" />}
                      {discValido
                        ? `Válido até ${discValidoAte?.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}`
                        : "Resultado vencido — refaça o teste para atualizar seu perfil"
                      }
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => downloadDiscRelatorio(candidato.nome, disc)}
                        className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                        <Download className="h-4 w-4" /> Baixar relatório completo
                      </button>
                      {!discValido && (
                        <a href={`/disc/${candidato.id}`} className="flex items-center gap-1.5 rounded-lg border border-[#264478]/30 px-3 py-2 text-sm font-medium text-[#264478] hover:bg-[#264478]/5 transition-colors">
                          Refazer teste DISC
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                      <Star className="h-8 w-8 text-slate-300" />
                    </div>
                    <p className="text-sm font-medium text-slate-700 mb-1">Teste DISC não realizado</p>
                    <p className="text-xs text-slate-400 mb-4">O teste é aplicado durante o processo seletivo ou por convite da Azumi.</p>
                  </div>
                )}

                {/* Testes futuros */}
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <p className="text-xs text-slate-400 mb-3">Em breve</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {["Fit Cultural", "Big Five", "Situacional", "Raciocínio Lógico", "Português"].map((t) => (
                      <div key={t} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2.5 opacity-60">
                        <Lock className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-xs text-slate-500">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </SectionCard>
            )}

            {/* ══ ABA: Meus processos ═════════════════════════════════════ */}
            {activeTab === "processos" && (
              <>
                {estaNoBanco && (
                  <div className="rounded-2xl bg-white p-4 mb-4 flex items-center gap-3" style={{ boxShadow: "0 1px 4px rgba(133,146,173,0.2)" }}>
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#EEF5FF" }}>
                      <Star className="h-5 w-5 text-[#264478]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#264478]">Banco de Talentos Azumi</p>
                      <p className="text-xs text-slate-500">Você está no nosso banco — avisaremos quando surgir uma oportunidade alinhada ao seu perfil.</p>
                    </div>
                  </div>
                )}

                <SectionCard title="Processos ativos" icon={<Briefcase className="h-4 w-4" />}>
                  {ativas.length === 0 ? (
                    <EmptyState msg="Nenhum processo ativo no momento. Quando você se candidatar a uma vaga, acompanhe aqui." />
                  ) : (
                    ativas.map((app) => {
                      const etapaAtual = ETAPAS.find((e) => e.key === app.etapa_azumi);
                      const ordemAtual = etapaAtual?.ordem ?? 0;
                      const cargo = app.job_solicitations?.cargo ?? "Vaga";
                      const empresa = app.job_solicitations?.avulsa_empresa_nome;
                      return (
                        <div key={app.id} className="mb-6 last:mb-0 border border-slate-100 rounded-xl p-4">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-sm font-semibold text-slate-800">{cargo}</h3>
                              {empresa && <p className="text-xs text-slate-500 mt-0.5">{empresa}</p>}
                            </div>
                            {app.data_aplicacao && <p className="text-xs text-slate-400">{fmtData(app.data_aplicacao)}</p>}
                          </div>
                          {/* Timeline */}
                          <div className="space-y-2">
                            {ETAPAS.map((etapa, i) => {
                              const concluida = etapa.ordem < ordemAtual;
                              const atual = etapa.ordem === ordemAtual;
                              return (
                                <div key={etapa.key} className="flex items-center gap-3">
                                  <div className="flex flex-col items-center" style={{ width: 20 }}>
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${concluida ? "bg-emerald-500 text-white" : atual ? "bg-[#264478] text-white ring-2 ring-[#264478]/30 ring-offset-1" : "bg-slate-100 text-slate-400"}`}>
                                      {concluida ? <Check className="h-3 w-3" /> : etapa.ordem}
                                    </div>
                                    {i < ETAPAS.length - 1 && <div className={`w-0.5 h-3 mt-0.5 ${concluida ? "bg-emerald-300" : "bg-slate-200"}`} />}
                                  </div>
                                  <span className={`text-xs ${atual ? "text-[#264478] font-semibold" : concluida ? "text-slate-500" : "text-slate-400"}`}>
                                    {etapa.label}
                                    {atual && <span className="ml-1.5 text-[10px] px-2 py-0.5 rounded-full bg-[#264478]/10 text-[#264478]">Etapa atual</span>}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })
                  )}
                </SectionCard>

                {finalizadas.length > 0 && (
                  <div className="mt-3">
                    <button onClick={() => setVerFinalizadas((v) => !v)} className="text-xs text-slate-500 flex items-center gap-1 mb-3 hover:text-slate-700">
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${verFinalizadas ? "rotate-180" : ""}`} />
                      {verFinalizadas ? "Ocultar" : "Ver"} processos finalizados ({finalizadas.length})
                    </button>
                    {verFinalizadas && finalizadas.map((app) => (
                      <div key={app.id} className="bg-white rounded-xl p-4 mb-3 border border-slate-100 opacity-70" style={{ boxShadow: "0 1px 4px rgba(133,146,173,0.1)" }}>
                        <p className="text-sm font-medium text-slate-700">{app.job_solicitations?.cargo ?? "Vaga"}</p>
                        {app.job_solicitations?.avulsa_empresa_nome && <p className="text-xs text-slate-500">{app.job_solicitations.avulsa_empresa_nome}</p>}
                        <p className="text-xs text-slate-400 mt-1">
                          {app.etapa_azumi === "contratado" ? "🎉 Contratado(a)" : "Processo finalizado"}
                          {app.data_aplicacao && ` · ${fmtData(app.data_aplicacao)}`}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ══ ABA: Diversidade ════════════════════════════════════════ */}
            {activeTab === "diversidade" && (
              <SectionCard title="Diversidade" icon={<Heart className="h-4 w-4" />} onEdit={editDiversidade ? undefined : () => setEditDiversidade(true)}>
                <div className="bg-blue-50 rounded-xl p-4 mb-4 text-xs text-blue-700 leading-relaxed">
                  <p className="font-semibold mb-1">Por que pedimos isso?</p>
                  <p>Estas informações são autodeclaradas e utilizadas exclusivamente para vagas afirmativas e relatórios agregados internos da Azumi RH. <strong>Você não é obrigado(a) a preencher nenhum campo.</strong> Quanto mais você compartilhar, melhor podemos te conectar às oportunidades certas.</p>
                  <a href="https://azumirh.com.br/privacidade" target="_blank" rel="noopener noreferrer" className="underline mt-1 inline-block">Política de Privacidade da Azumi</a>
                </div>

                {editDiversidade ? (
                  <>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <input type="checkbox" id="pcd" checked={divDraft.pcd} onChange={(e) => setDivDraft((p) => ({ ...p, pcd: e.target.checked }))} className="h-4 w-4 rounded" />
                        <label htmlFor="pcd" className="text-sm text-slate-700">Sou Pessoa com Deficiência (PCD)</label>
                      </div>
                      {divDraft.pcd && (
                        <div>
                          <label className={labelCls}>Tipo de deficiência <span className="text-slate-400">(opcional)</span></label>
                          <input className={inputCls} value={divDraft.pcd_tipo} onChange={(e) => setDivDraft((p) => ({ ...p, pcd_tipo: e.target.value }))} placeholder="Ex: auditiva, visual, motora…" />
                        </div>
                      )}
                      <div>
                        <label className={labelCls}>Gênero <span className="text-slate-400">(opcional)</span></label>
                        <select className={inputCls} value={divDraft.genero} onChange={(e) => setDivDraft((p) => ({ ...p, genero: e.target.value }))}>
                          <option value="">Prefiro não informar</option>
                          {GENEROS.map((g) => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Autodeclaração racial <span className="text-slate-400">(opcional)</span></label>
                        <select className={inputCls} value={divDraft.autodeclaracao_racial} onChange={(e) => setDivDraft((p) => ({ ...p, autodeclaracao_racial: e.target.value }))}>
                          <option value="">Prefiro não informar</option>
                          {RACAS.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                      <div className="border-t border-slate-100 pt-4">
                        <div className="flex items-start gap-3">
                          <input type="checkbox" id="consentimento" checked={divDraft.consentimento_diversidade} onChange={(e) => setDivDraft((p) => ({ ...p, consentimento_diversidade: e.target.checked }))} className="h-4 w-4 rounded mt-0.5" />
                          <label htmlFor="consentimento" className="text-xs text-slate-600 leading-relaxed">
                            Consinto que a Azumi RH utilize as informações de diversidade acima exclusivamente para vagas afirmativas e relatórios agregados, conforme a <a href="https://azumirh.com.br/privacidade" target="_blank" rel="noopener noreferrer" className="underline">Política de Privacidade</a>. Posso revogar este consentimento a qualquer momento.
                          </label>
                        </div>
                      </div>
                    </div>
                    <SaveBar onSave={salvarDiversidade} onCancel={() => { setEditDiversidade(false); initDrafts(candidato); }} saving={salvandoDiv} />
                  </>
                ) : (
                  <div className="space-y-2">
                    {candidato.pcd && <Row icon={<Heart className="h-3.5 w-3.5" />} label="PCD" val={candidato.pcd_tipo ? `Sim — ${candidato.pcd_tipo}` : "Sim"} />}
                    {candidato.genero && <Row icon={<Smile className="h-3.5 w-3.5" />} label="Gênero" val={candidato.genero} />}
                    {candidato.autodeclaracao_racial && <Row icon={<Heart className="h-3.5 w-3.5" />} label="Raça/cor" val={candidato.autodeclaracao_racial} />}
                    {candidato.consentimento_diversidade && (
                      <p className="text-xs text-emerald-600 flex items-center gap-1.5 pt-2">
                        <Check className="h-3.5 w-3.5" /> Consentimento registrado em {candidato.consentimento_diversidade_data ? new Date(candidato.consentimento_diversidade_data).toLocaleDateString("pt-BR") : "data desconhecida"}
                      </p>
                    )}
                    {!candidato.pcd && !candidato.genero && !candidato.autodeclaracao_racial && <EmptyState msg="Campos opcionais — preencha apenas se desejar." />}
                  </div>
                )}
              </SectionCard>
            )}
          </div>

          {/* ── Right sidebar ─────────────────────────────────────────────── */}
          <div className="lg:w-[300px] shrink-0 space-y-4">

            {/* DISC card */}
            <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 1px 4px rgba(133,146,173,0.2)" }}>
              <h3 className="text-[13px] font-semibold text-slate-700 mb-3">Perfil Comportamental</h3>
              {disc && discInfo ? (
                <>
                  <div className="flex items-center gap-3 mb-3">
                    <PerfilIlustracao dim={disc.fator_predominante as DiscDim} size={74} />
                    <div>
                      <p className="text-sm font-bold" style={{ color: discInfo.cor }}>{discInfo.nome}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{discInfo.frase}</p>
                    </div>
                  </div>
                  {discValidoAte && (
                    <p className={`text-[11px] mb-3 flex items-center gap-1 ${discValido ? "text-emerald-600" : "text-amber-600"}`}>
                      {discValido ? <Check className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                      {discValido ? `Válido até ${discValidoAte.toLocaleDateString("pt-BR")}` : "Resultado vencido"}
                    </p>
                  )}
                  <button onClick={() => downloadDiscRelatorio(candidato.nome, disc)}
                    className="w-full flex items-center justify-center gap-2 rounded-full py-2.5 text-[12px] font-semibold text-white transition-all hover:opacity-90"
                    style={{ background: discInfo.cor }}>
                    <Download className="h-3.5 w-3.5" /> Baixar relatório completo
                  </button>
                </>
              ) : (
                <p className="text-xs text-slate-400">Teste DISC não realizado ainda.</p>
              )}

              {/* Testes futuros teaser */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <p className="text-[11px] text-slate-400 mb-2">Em breve</p>
                <div className="flex flex-col gap-1.5">
                  {["Fit Cultural", "Big Five", "Raciocínio Lógico"].map((t) => (
                    <div key={t} className="flex items-center gap-2 text-[11px] text-slate-400 opacity-60">
                      <Lock className="h-3 w-3" /> {t}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Serviços Azumi */}
            <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 1px 4px rgba(133,146,173,0.2)" }}>
              <h3 className="text-[13px] font-semibold text-slate-700 mb-3">Serviços Azumi</h3>
              <div className="space-y-3">
                {SERVICOS.map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                    className={`block rounded-xl overflow-hidden bg-gradient-to-r ${s.grad} p-4 text-white hover:opacity-90 transition-opacity`}>
                    <p className="text-[13px] font-semibold leading-tight">{s.label}</p>
                    <p className="text-[11px] text-white/70 mt-1">{s.desc}</p>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Seção de ajuda ────────────────────────────────────────────────── */}
        <div className="mt-6 rounded-2xl bg-white p-5 flex flex-col sm:flex-row items-center gap-4" style={{ boxShadow: "0 1px 4px rgba(133,146,173,0.2)" }}>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-sm font-semibold text-slate-800">Precisa de ajuda ou quer alterar seu acesso?</p>
            <p className="text-xs text-slate-500 mt-0.5">Fale com a gente — estamos aqui para te ajudar.</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <a href="mailto:contato@azumirh.com.br" className="flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">
              <Mail className="h-3.5 w-3.5" /> E-mail
            </a>
            <a href="https://wa.me/5541988350743" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium text-white" style={{ background: "#25D366" }}>
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="py-10 text-center" style={{ background: "hsl(var(--ocean))" }}>
        <div className="flex items-center justify-center gap-4 mb-4">
          <img src={azumiLogoBranca} alt="Azumi RH" style={{ height: 52 }} />
          <div className="w-px h-10 bg-white/20" />
          <img src={CONNECT_LOGO} alt="Connect" style={{ height: 66 }} />
        </div>
        <div className="flex justify-center gap-4 mb-4 opacity-70">
          <a href="https://www.instagram.com/azumirh/" target="_blank" rel="noopener noreferrer" className="text-white hover:opacity-100"><iconify-icon icon="simple-icons:instagram" width="18" height="18" /></a>
          <a href="https://www.linkedin.com/company/azumirh/" target="_blank" rel="noopener noreferrer" className="text-white hover:opacity-100"><iconify-icon icon="simple-icons:linkedin" width="18" height="18" /></a>
          <a href="https://www.facebook.com/azumirhc/" target="_blank" rel="noopener noreferrer" className="text-white hover:opacity-100"><iconify-icon icon="simple-icons:facebook" width="18" height="18" /></a>
          <a href="https://www.tiktok.com/@azumirh" target="_blank" rel="noopener noreferrer" className="text-white hover:opacity-100"><iconify-icon icon="simple-icons:tiktok" width="18" height="18" /></a>
        </div>
        <p className="text-white/50 text-xs">
          © {new Date().getFullYear()} Azumi RH ·{" "}
          <a href="https://azumirh.com.br/privacidade" target="_blank" rel="noopener noreferrer" className="underline hover:text-white/80">Política de Privacidade</a>
          {" "}· contato@azumirh.com.br
        </p>
      </footer>
    </div>
  );
}

// ── Row helper ────────────────────────────────────────────────────────────────
function Row({ icon, label, val }: { icon: React.ReactNode; label: string; val: string | null | undefined }) {
  if (!val) return null;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-slate-400 shrink-0">{icon}</span>
      <span className="text-slate-500 text-xs w-20 shrink-0">{label}</span>
      <span className="text-slate-700 font-medium">{val}</span>
    </div>
  );
}
