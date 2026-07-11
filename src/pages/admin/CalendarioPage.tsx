import { useMemo, useState } from "react";
import {
  ChevronLeft, ChevronRight, Plus, X, MapPin, Clock, Users,
  Download, ExternalLink, StickyNote,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

/* ─── Tipos ─── */
type EventoTipo = "feriado_nacional" | "feriado_obrigatorio" | "reuniao" | "entrevista" | "prazo" | "ferias" | "comunicado" | "outros";
type Visibilidade = "interno" | "empresa" | "todos";

interface ConviteResposta { status: "pendente" | "aceito" | "recusado"; justificativa?: string; }
interface Convidado { nome: string; iniciais: string; resposta: ConviteResposta; }

interface Evento {
  id: string;
  titulo: string;
  data: string;
  hora?: string;
  local?: string;
  descricao?: string;
  nota?: string;
  coverUrl?: string;
  tipo: EventoTipo;
  outrosNome?: string;
  outrosCor?: string;
  visibilidade: Visibilidade;
  empresa?: string;
  convidados?: Convidado[];
}

const TIPO_LABEL: Record<EventoTipo, string> = {
  feriado_nacional:    "Feriado nacional",
  feriado_obrigatorio: "Feriado obrigatório",
  reuniao:             "Reunião",
  entrevista:          "Entrevista",
  prazo:               "Prazo de entregável",
  ferias:              "Férias",
  comunicado:          "Comunicado/Evento",
  outros:              "Outros",
};

const TIPO_HEX: Record<EventoTipo, string> = {
  feriado_nacional:    "#EC4899",
  feriado_obrigatorio: "#EF4444",
  reuniao:             "hsl(var(--primary))",
  entrevista:          "hsl(var(--highlight))",
  prazo:               "#F97316",
  ferias:              "#10B981",
  comunicado:          "#06B6D4",
  outros:              "#64748B",
};

const HOJE = new Date();
const Y0 = HOJE.getFullYear();
const M0 = HOJE.getMonth();
const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const NOMES_MES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const DIAS_SEM  = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
const EMPRESAS  = ["Kentaki Foods","Tech Plural","Grupo Maverick","Studio Mira","Alvo Digital"];
const USUARIOS  = [
  { nome: "Mariana Souza",   iniciais: "MS" },
  { nome: "Rafael Lima",     iniciais: "RL" },
  { nome: "Ana Beatriz",     iniciais: "AB" },
  { nome: "Camila Torres",   iniciais: "CT" },
];
const ANOS = [Y0 - 1, Y0, Y0 + 1];

let NEXT_ID = 12;
const MOCK_EVENTOS: Evento[] = [
  { id:"EV-1",  titulo:"Reunião de Planejamento Q2",     data:fmt(new Date(Y0,M0,3)),  hora:"10:00", tipo:"reuniao",             visibilidade:"interno",  convidados:[{ nome:"Ana Beatriz", iniciais:"AB", resposta:{ status:"aceito" } },{ nome:"Rafael Lima", iniciais:"RL", resposta:{ status:"pendente" } }] },
  { id:"EV-2",  titulo:"Entrevista — Dev Pleno",         data:fmt(new Date(Y0,M0,5)),  hora:"14:30", tipo:"entrevista",          visibilidade:"interno" },
  { id:"EV-3",  titulo:"Prazo Diagnóstico DISC",         data:fmt(new Date(Y0,M0,10)),               tipo:"prazo",               visibilidade:"empresa",  empresa:"Kentaki Foods" },
  { id:"EV-4",  titulo:"Feriado — Tiradentes",           data:fmt(new Date(Y0,M0,21)),               tipo:"feriado_nacional",    visibilidade:"todos" },
  { id:"EV-5",  titulo:"Reunião com Kentaki Foods",      data:fmt(new Date(Y0,M0,14)), hora:"09:00", tipo:"reuniao",             visibilidade:"empresa",  empresa:"Kentaki Foods" },
  { id:"EV-6",  titulo:"Férias — Ana Beatriz",           data:fmt(new Date(Y0,M0,18)),               tipo:"ferias",              visibilidade:"interno" },
  { id:"EV-7",  titulo:"Entrevista — Designer Sênior",   data:fmt(new Date(Y0,M0,22)), hora:"16:00", tipo:"entrevista",          visibilidade:"interno" },
  { id:"EV-8",  titulo:"Prazo entrega Relatório Q1",     data:fmt(new Date(Y0,M0,28)),               tipo:"prazo",               visibilidade:"empresa",  empresa:"Grupo Maverick" },
  { id:"EV-9",  titulo:"Convenção Coletiva",             data:fmt(new Date(Y0,M0,26)),               tipo:"feriado_obrigatorio", visibilidade:"todos" },
  { id:"EV-10", titulo:"Wellbeing Day",                  data:fmt(new Date(Y0,M0,5)),  hora:"15:00", tipo:"comunicado",          visibilidade:"todos",    descricao:"Evento de bem-estar para toda a equipe." },
  { id:"EV-11", titulo:"Team Building",                  data:fmt(new Date(Y0,M0,5)),  hora:"18:00", tipo:"outros",              outrosNome:"Confraternização", outrosCor:"#F59E0B", visibilidade:"interno" },
];

function startOfWeek(d: Date) { const r = new Date(d); r.setDate(d.getDate()-d.getDay()); return r; }
function getCor(e: Evento): string { return e.tipo === "outros" && e.outrosCor ? e.outrosCor : TIPO_HEX[e.tipo]; }
function getLabel(e: Evento): string { return e.tipo === "outros" && e.outrosNome ? e.outrosNome : TIPO_LABEL[e.tipo]; }

function googleCalendarUrl(ev: Evento): string {
  const base = "https://calendar.google.com/calendar/render?action=TEMPLATE";
  const d = ev.data.replace(/-/g,"");
  const dates = ev.hora
    ? `${d}T${ev.hora.replace(":","")}00/${d}T${ev.hora.replace(":","")}00`
    : `${d}/${d}`;
  return `${base}&text=${encodeURIComponent(ev.titulo)}&dates=${dates}${ev.local ? `&location=${encodeURIComponent(ev.local)}` : ""}${ev.descricao ? `&details=${encodeURIComponent(ev.descricao)}` : ""}`;
}

function downloadICS(ev: Evento) {
  const d = ev.data.replace(/-/g,"");
  const dtstart = ev.hora ? `${d}T${ev.hora.replace(":","")}00` : d;
  const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${ev.titulo}\nDTSTART:${dtstart}\nDTEND:${dtstart}\n${ev.local?`LOCATION:${ev.local}\n`:""}${ev.descricao?`DESCRIPTION:${ev.descricao}\n`:""}END:VEVENT\nEND:VCALENDAR`;
  const blob = new Blob([ics],{type:"text/calendar"});
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${ev.titulo}.ics`; a.click();
}

function EventoTooltip({ ev }: { ev: Evento }) {
  const cor = getCor(ev);
  return (
    <div style={{ position:"absolute", bottom:"calc(100% + 6px)", left:0, zIndex:50, minWidth:200, maxWidth:260, background:"white", border:"1px solid #E4E6EA", borderRadius:10, padding:10, boxShadow:"0 8px 24px rgba(0,0,0,.12)", fontFamily:"var(--font-body)", pointerEvents:"none" }}>
      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
        <span style={{ width:8, height:8, borderRadius:2, background:cor }} />
        <span style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:".06em", color:cor }}>{getLabel(ev)}</span>
      </div>
      <div style={{ fontSize:13, fontWeight:600, color:"#0F172A", marginBottom:4 }}>{ev.titulo}</div>
      {ev.hora && <div style={{ fontSize:11, color:"#64748B" }}>🕐 {ev.hora}</div>}
      {ev.local && <div style={{ fontSize:11, color:"#64748B" }}>📍 {ev.local}</div>}
      {ev.empresa && <div style={{ fontSize:11, color:"#64748B" }}>🏢 {ev.empresa}</div>}
    </div>
  );
}

function EventoBtn({ ev, onClick }: { ev: Evento; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  const cor = getCor(ev);
  return (
    <div style={{ position:"relative" }} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <button onClick={onClick} style={{ width:"100%", textAlign:"left", padding:"3px 6px", borderRadius:6, border:`1px solid ${cor}33`, background:`${cor}14`, fontSize:11, cursor:"pointer", display:"flex", alignItems:"center", gap:5, fontFamily:"var(--font-body)", overflow:"hidden" }}>
        <span style={{ width:6, height:6, borderRadius:2, background:cor, flexShrink:0 }} />
        {ev.hora && <span style={{ color:"#64748B", fontWeight:600 }}>{ev.hora}</span>}
        <span style={{ color:"#0F172A", fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{ev.titulo}</span>
      </button>
      {hov && <EventoTooltip ev={ev} />}
    </div>
  );
}

function Modal({ open, onClose, title, children, maxWidth = 520 }: { open:boolean; onClose:()=>void; title:string; children:React.ReactNode; maxWidth?:number }) {
  if (!open) return null;
  return (
    <div onClick={(e) => { if(e.target===e.currentTarget) onClose(); }}
      style={{ position:"fixed", inset:0, background:"rgba(15,23,42,.5)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:"white", borderRadius:16, width:"100%", maxWidth, maxHeight:"90vh", overflow:"auto", boxShadow:"0 24px 60px rgba(0,0,0,.25)" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px", borderBottom:"1px solid #F0F5FF" }}>
          <h3 style={{ margin:0, fontSize:16, fontWeight:700, color:"#0F172A", fontFamily:"var(--font-body)" }}>{title}</h3>
          <button onClick={onClose} style={{ background:"transparent", border:"none", cursor:"pointer", padding:4, borderRadius:6, color:"#64748B" }}><X size={18} /></button>
        </div>
        <div style={{ padding:20 }}>{children}</div>
      </div>
    </div>
  );
}

const inp: React.CSSProperties = { width:"100%", height:36, borderRadius:8, border:"1px solid #E4E6EA", padding:"0 10px", fontSize:13, fontFamily:"var(--font-body)", outline:"none", boxSizing:"border-box" };
const lbl: React.CSSProperties = { fontSize:11, fontWeight:700, textTransform:"uppercase" as const, color:"#64748B", letterSpacing:".06em", display:"block", marginBottom:5, fontFamily:"var(--font-body)" };
const sel: React.CSSProperties = { ...inp, cursor:"pointer", background:"white" };

export default function CalendarioPage() {
  const [view, setView]     = useState<"mes"|"semana">("mes");
  const [cursor, setCursor] = useState(new Date(Y0, M0, 1));
  const [anoFiltro, setAnoFiltro] = useState<number>(Y0);
  const [eventos, setEventos] = useState<Evento[]>(MOCK_EVENTOS);
  const [evSel, setEvSel]   = useState<Evento | null>(null);
  const [novoOpen, setNovoOpen] = useState(false);

  const [fTitulo, setFTitulo]     = useState("");
  const [fData, setFData]         = useState("");
  const [fHora, setFHora]         = useState("");
  const [fTipo, setFTipo]         = useState<EventoTipo>("reuniao");
  const [fOutrosNome, setFOutrosNome] = useState("");
  const [fOutrosCor, setFOutrosCor]   = useState("#64748B");
  const [fVis, setFVis]           = useState<Visibilidade>("interno");
  const [fEmpresa, setFEmpresa]   = useState("");
  const [fLocal, setFLocal]       = useState("");
  const [fDesc, setFDesc]         = useState("");
  const [fNota, setFNota]         = useState("");
  const [fCoverUrl, setFCoverUrl] = useState("");
  const [fConvidados, setFConvidados] = useState<string[]>([]);

  const [convidadoModal, setConvidadoModal] = useState<{ ev: Evento; convidado: Convidado } | null>(null);
  const [justificativa, setJustificativa]   = useState("");

  const eventosPorData = useMemo(() => {
    const m = new Map<string, Evento[]>();
    eventos.forEach(e => { const arr = m.get(e.data) ?? []; arr.push(e); m.set(e.data, arr); });
    return m;
  }, [eventos]);

  function nav(delta: number) {
    const r = new Date(cursor);
    if (view === "mes") r.setMonth(r.getMonth()+delta);
    else r.setDate(r.getDate()+delta*7);
    setCursor(r);
  }

  function irParaAno(ano: number) {
    setAnoFiltro(ano);
    setCursor(new Date(ano, cursor.getMonth(), 1));
  }

  const cells = useMemo(() => {
    if (view === "mes") {
      const ini = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
      const fim = new Date(cursor.getFullYear(), cursor.getMonth()+1, 0);
      const start = startOfWeek(ini);
      const total = Math.ceil((fim.getDate()+ini.getDay())/7)*7;
      return Array.from({length:total},(_,i) => { const d=new Date(start); d.setDate(start.getDate()+i); return d; });
    } else {
      const start = startOfWeek(cursor);
      return Array.from({length:7},(_,i) => { const d=new Date(start); d.setDate(start.getDate()+i); return d; });
    }
  }, [view, cursor]);

  const titulo = view === "mes"
    ? `${NOMES_MES[cursor.getMonth()]} ${cursor.getFullYear()}`
    : (() => { const s=startOfWeek(cursor); const e=new Date(s); e.setDate(s.getDate()+6); return `${s.getDate()}/${s.getMonth()+1} – ${e.getDate()}/${e.getMonth()+1}, ${e.getFullYear()}`; })();

  function criarEvento() {
    if (!fTitulo.trim() || !fData) return;
    const novo: Evento = {
      id: `EV-${NEXT_ID++}`,
      titulo: fTitulo.trim(),
      data: fData,
      hora: fHora || undefined,
      tipo: fTipo,
      outrosNome: fTipo==="outros" ? fOutrosNome : undefined,
      outrosCor:  fTipo==="outros" ? fOutrosCor  : undefined,
      visibilidade: fVis,
      empresa: fVis==="empresa" ? fEmpresa : undefined,
      local: fLocal || undefined,
      descricao: fDesc || undefined,
      nota: fNota || undefined,
      coverUrl: fCoverUrl || undefined,
      convidados: fConvidados.map(nome => {
        const u = USUARIOS.find(u => u.nome === nome)!;
        return { nome: u.nome, iniciais: u.iniciais, resposta:{ status:"pendente" as const } };
      }),
    };
    setEventos(prev => [...prev, novo]);
    setNovoOpen(false);
    setFTitulo(""); setFData(""); setFHora(""); setFTipo("reuniao"); setFOutrosNome(""); setFOutrosCor("#64748B");
    setFVis("interno"); setFEmpresa(""); setFLocal(""); setFDesc(""); setFNota(""); setFCoverUrl(""); setFConvidados([]);
  }

  function responderConvite(aceitar: boolean) {
    if (!convidadoModal) return;
    const novaResp: ConviteResposta = { status: aceitar?"aceito":"recusado", justificativa: aceitar?undefined:justificativa };
    setEventos(prev => prev.map(e => {
      if (e.id !== convidadoModal.ev.id) return e;
      return { ...e, convidados: (e.convidados??[]).map(c => c.nome!==convidadoModal.convidado.nome ? c : { ...c, resposta: novaResp }) };
    }));
    setEvSel(prev => {
      if (!prev || prev.id!==convidadoModal.ev.id) return prev;
      return { ...prev, convidados: (prev.convidados??[]).map(c => c.nome!==convidadoModal.convidado.nome ? c : { ...c, resposta: novaResp }) };
    });
    setConvidadoModal(null); setJustificativa("");
  }

  const MAX_VIS = view==="mes" ? 3 : 12;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendário"
        subtitle="Eventos, prazos, entrevistas e feriados"
        actions={
          <button onClick={() => setNovoOpen(true)}
            style={{ height:36, padding:"0 18px", borderRadius:100, background:"hsl(var(--primary))", border:"none", color:"white", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6, fontFamily:"var(--font-body)" }}>
            <Plus size={16} /> Novo evento
          </button>
        }
      />

      <div style={{ display:"flex", flexWrap:"wrap", gap:12, alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
          <select value={anoFiltro} onChange={(e) => irParaAno(Number(e.target.value))}
            style={{ height:34, borderRadius:100, border:"1px solid #E4E6EA", padding:"0 12px", fontSize:13, fontFamily:"var(--font-body)", outline:"none", background:"white", cursor:"pointer" }}>
            {ANOS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <button onClick={() => nav(-1)} style={{ height:34, width:34, borderRadius:100, border:"1px solid #E4E6EA", background:"white", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><ChevronLeft size={16} /></button>
          <div style={{ minWidth:180, textAlign:"center", fontWeight:700, fontSize:14, fontFamily:"var(--font-body)", color:"#0F172A" }}>{titulo}</div>
          <button onClick={() => nav(1)} style={{ height:34, width:34, borderRadius:100, border:"1px solid #E4E6EA", background:"white", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><ChevronRight size={16} /></button>
          <button onClick={() => setCursor(new Date())}
            style={{ height:34, padding:"0 14px", borderRadius:100, border:"1px solid #E4E6EA", background:"white", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"var(--font-body)" }}>Hoje</button>
        </div>

        <div style={{ display:"inline-flex", padding:3, background:"#F1F5F9", borderRadius:100 }}>
          {(["mes","semana"] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              style={{ height:28, padding:"0 14px", borderRadius:100, border:"none", fontSize:12, fontWeight:600, cursor:"pointer", background:view===v?"white":"transparent", color:view===v?"#0F172A":"#64748B", boxShadow:view===v?"0 1px 4px rgba(0,0,0,.08)":"none", fontFamily:"var(--font-body)" }}>
              {v==="mes"?"Mês":"Semana"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ borderRadius:12, border:"1px solid #E4E6EA", background:"white", overflow:"hidden" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", background:"#F8FAFC" }}>
          {DIAS_SEM.map(d => (
            <div key={d} style={{ padding:"8px 10px", fontSize:11, fontWeight:700, color:"#64748B", textAlign:"center", textTransform:"uppercase", letterSpacing:".06em", fontFamily:"var(--font-body)" }}>{d}</div>
          ))}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)" }}>
          {cells.map((d, i) => {
            const key = fmt(d);
            const evs = eventosPorData.get(key) ?? [];
            const sameMonth = view==="semana" || d.getMonth()===cursor.getMonth();
            const isHoje = key===fmt(new Date());
            return (
              <div key={i} style={{ borderTop:"1px solid #F0F5FF", borderLeft:i%7===0?"none":"1px solid #F0F5FF", padding:6, minHeight:view==="semana"?260:100, display:"flex", flexDirection:"column", gap:4, background:sameMonth?"white":"#F8FAFC" }}>
                <div style={{ display:"flex", justifyContent:"flex-end" }}>
                  <span style={{ height:24, width:24, display:"inline-flex", alignItems:"center", justifyContent:"center", borderRadius:6, fontSize:12, fontWeight:600, background:isHoje?"hsl(var(--primary))":"transparent", color:isHoje?"white":sameMonth?"#0F172A":"#94A3B8", fontFamily:"var(--font-body)" }}>{d.getDate()}</span>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:3, overflow:"hidden" }}>
                  {evs.slice(0, MAX_VIS).map(e => (
                    <EventoBtn key={e.id} ev={e} onClick={() => setEvSel(e)} />
                  ))}
                  {evs.length > MAX_VIS && (
                    <span style={{ fontSize:10, color:"#64748B", padding:"0 6px", fontFamily:"var(--font-body)" }}>+{evs.length-MAX_VIS} mais</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display:"flex", flexWrap:"wrap", gap:12, padding:14, borderRadius:12, border:"1px solid #E4E6EA", background:"white" }}>
        {(Object.keys(TIPO_LABEL) as EventoTipo[]).filter(t => t!=="outros").map(t => (
          <span key={t} style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:12, color:"#374151", fontFamily:"var(--font-body)" }}>
            <span style={{ width:10, height:10, borderRadius:3, background:TIPO_HEX[t] }} />
            {TIPO_LABEL[t]}
          </span>
        ))}
      </div>

      <Modal open={!!evSel} onClose={() => setEvSel(null)} title={evSel?.titulo ?? ""} maxWidth={560}>
        {evSel && (() => {
          const cor = getCor(evSel);
          return (
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {evSel.coverUrl && (
                <img src={evSel.coverUrl} alt="capa" style={{ width:"100%", height:160, objectFit:"cover", borderRadius:10, border:"1px solid #E4E6EA" }} onError={(e) => (e.currentTarget.style.display="none")} />
              )}

              <div style={{ display:"flex", flexWrap:"wrap", gap:8, alignItems:"center" }}>
                <span style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"4px 10px", borderRadius:100, background:`${cor}14`, color:cor, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:".06em", fontFamily:"var(--font-body)" }}>
                  <span style={{ width:8, height:8, borderRadius:2, background:cor }} />
                  {getLabel(evSel)}
                </span>
                <span style={{ padding:"4px 10px", borderRadius:100, background:"#F1F5F9", color:"#475569", fontSize:11, fontWeight:600, fontFamily:"var(--font-body)" }}>
                  {evSel.visibilidade==="interno"?"Interno":evSel.visibilidade==="empresa"?`Empresa: ${evSel.empresa}`:"Para todos"}
                </span>
              </div>

              <div style={{ display:"flex", flexDirection:"column", gap:6, fontSize:13, color:"#374151", fontFamily:"var(--font-body)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}><Clock size={14} color="#64748B" /> {evSel.data}{evSel.hora ? ` · ${evSel.hora}` : ""}</div>
                {evSel.local && <div style={{ display:"flex", alignItems:"center", gap:6 }}><MapPin size={14} color="#64748B" /> {evSel.local}</div>}
                {evSel.descricao && <p style={{ margin:0, color:"#475569", lineHeight:1.5 }}>{evSel.descricao}</p>}
                {evSel.nota && (
                  <div style={{ display:"flex", gap:6, padding:10, borderRadius:8, background:"#FEF3C7", color:"#78350F", fontSize:12 }}>
                    <StickyNote size={14} /> {evSel.nota}
                  </div>
                )}
              </div>

              {(evSel.convidados??[]).length > 0 && (
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:".06em", color:"#64748B", marginBottom:8, fontFamily:"var(--font-body)" }}>
                    <Users size={12} /> Convidados
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                    {(evSel.convidados??[]).map((c,i) => (
                      <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:8, borderRadius:8, border:"1px solid #F0F5FF", fontFamily:"var(--font-body)" }}>
                        <span style={{ width:26, height:26, borderRadius:6, background:"linear-gradient(135deg,hsl(var(--connect-ink)),hsl(var(--primary)))", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:10, fontWeight:700 }}>{c.iniciais}</span>
                        <span style={{ fontSize:13, color:"#0F172A", fontWeight:600 }}>{c.nome}</span>
                        <span style={{ marginLeft:"auto", fontSize:11, fontWeight:700, color: c.resposta.status==="aceito"?"#10B981":c.resposta.status==="recusado"?"#EF4444":"#94A3B8" }}>
                          {c.resposta.status==="aceito"?"Aceitou":c.resposta.status==="recusado"?"Recusou":"Pendente"}
                        </span>
                        {c.resposta.status==="pendente" && (
                          <button onClick={() => { setConvidadoModal({ev:evSel,convidado:c}); setJustificativa(""); }}
                            style={{ fontSize:11, height:24, padding:"0 8px", borderRadius:6, border:"1px solid #E4E6EA", background:"white", cursor:"pointer", fontFamily:"var(--font-body)" }}>Responder</button>
                        )}
                        {c.resposta.justificativa && <span style={{ fontSize:11, color:"#94A3B8", fontStyle:"italic" }}>"{c.resposta.justificativa.slice(0,20)}…"</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display:"flex", gap:8, flexWrap:"wrap", paddingTop:10, borderTop:"1px solid #F0F5FF" }}>
                <a href={googleCalendarUrl(evSel)} target="_blank" rel="noopener noreferrer"
                  style={{ display:"flex", alignItems:"center", gap:5, height:32, padding:"0 12px", borderRadius:8, border:"1px solid #E4E6EA", background:"white", fontSize:12, fontWeight:600, color:"#374151", textDecoration:"none", fontFamily:"var(--font-body)" }}>
                  <ExternalLink size={14} /> Google Calendar
                </a>
                <button onClick={() => downloadICS(evSel)}
                  style={{ display:"flex", alignItems:"center", gap:5, height:32, padding:"0 12px", borderRadius:8, border:"1px solid #E4E6EA", background:"white", fontSize:12, fontWeight:600, color:"#374151", cursor:"pointer", fontFamily:"var(--font-body)" }}>
                  <Download size={14} /> Apple / .ics
                </button>
                <button onClick={() => setEvSel(null)}
                  style={{ marginLeft:"auto", height:32, padding:"0 14px", borderRadius:8, border:"1px solid #E4E6EA", background:"white", fontSize:13, fontWeight:600, cursor:"pointer", color:"#374151", fontFamily:"var(--font-body)" }}>Fechar</button>
              </div>
            </div>
          );
        })()}
      </Modal>

      <Modal open={!!convidadoModal} onClose={() => setConvidadoModal(null)} title="Responder convite" maxWidth={400}>
        {convidadoModal && (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <p style={{ margin:0, fontSize:13, color:"#475569", fontFamily:"var(--font-body)" }}>
              Responda ao convite para <strong>{convidadoModal.ev.titulo}</strong> em nome de <strong>{convidadoModal.convidado.nome}</strong>.
            </p>
            <div>
              <label style={lbl}>Justificativa (obrigatória para recusar)</label>
              <textarea value={justificativa} onChange={e => setJustificativa(e.target.value)} rows={3}
                style={{ ...inp, height:"auto", padding:"8px 10px", resize:"vertical" as const }} placeholder="Ex: Conflito de agenda, reunião interna…" />
            </div>
            <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
              <button onClick={() => setConvidadoModal(null)} style={{ height:34, padding:"0 14px", borderRadius:8, border:"1px solid #E4E6EA", background:"white", fontSize:13, cursor:"pointer", color:"#374151", fontFamily:"var(--font-body)" }}>Cancelar</button>
              <button onClick={() => responderConvite(false)} disabled={!justificativa.trim()}
                style={{ height:34, padding:"0 14px", borderRadius:8, border:"none", background:"#EF4444", color:"white", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"var(--font-body)", opacity:!justificativa.trim()?0.5:1 }}>Recusar</button>
              <button onClick={() => responderConvite(true)}
                style={{ height:34, padding:"0 14px", borderRadius:8, border:"none", background:"#10B981", color:"white", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"var(--font-body)" }}>Aceitar</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={novoOpen} onClose={() => setNovoOpen(false)} title="Novo evento" maxWidth={540}>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div><label style={lbl}>Título *</label><input value={fTitulo} onChange={e => setFTitulo(e.target.value)} style={inp} placeholder="Nome do evento" /></div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <div><label style={lbl}>Data *</label><input type="date" value={fData} onChange={e => setFData(e.target.value)} style={inp} /></div>
            <div><label style={lbl}>Hora</label><input type="time" value={fHora} onChange={e => setFHora(e.target.value)} style={inp} /></div>
          </div>

          <div>
            <label style={lbl}>Tipo</label>
            <select value={fTipo} onChange={e => setFTipo(e.target.value as EventoTipo)} style={sel}>
              {(Object.keys(TIPO_LABEL) as EventoTipo[]).map(t => (
                <option key={t} value={t}>{TIPO_LABEL[t]}</option>
              ))}
            </select>
          </div>

          {fTipo==="outros" && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:10, alignItems:"end" }}>
              <div><label style={lbl}>Nome do tipo *</label><input value={fOutrosNome} onChange={e => setFOutrosNome(e.target.value)} style={inp} placeholder="Ex: Confraternização" /></div>
              <div>
                <label style={lbl}>Cor</label>
                <input type="color" value={fOutrosCor} onChange={e => setFOutrosCor(e.target.value)}
                  style={{ width:36, height:36, borderRadius:8, border:"1px solid #E4E6EA", padding:2, cursor:"pointer" }} />
              </div>
            </div>
          )}

          <div>
            <label style={lbl}>Visibilidade</label>
            <select value={fVis} onChange={e => setFVis(e.target.value as Visibilidade)} style={sel}>
              <option value="interno">Time interno</option>
              <option value="empresa">Empresa específica</option>
              <option value="todos">Para todos</option>
            </select>
          </div>

          {fVis==="empresa" && (
            <div>
              <label style={lbl}>Empresa *</label>
              <select value={fEmpresa} onChange={e => setFEmpresa(e.target.value)} style={sel}>
                <option value="">Selecione a empresa</option>
                {EMPRESAS.map(em => <option key={em} value={em}>{em}</option>)}
              </select>
            </div>
          )}

          <div><label style={lbl}>Local</label><input value={fLocal} onChange={e => setFLocal(e.target.value)} style={inp} placeholder="Ex: Sala de reunião, Google Meet…" /></div>

          <div><label style={lbl}>Descrição</label><textarea value={fDesc} onChange={e => setFDesc(e.target.value)} rows={3} style={{ ...inp, height:"auto", padding:"8px 10px", resize:"vertical" as const }} placeholder="Detalhes do evento…" /></div>

          <div><label style={lbl}>Nota interna <span style={{ fontWeight:400, textTransform:"none" as const }}>(só visível para o time)</span></label><textarea value={fNota} onChange={e => setFNota(e.target.value)} rows={2} style={{ ...inp, height:"auto", padding:"8px 10px", resize:"vertical" as const }} placeholder="Ex: Confirmar sala antes do evento…" /></div>

          <div><label style={lbl}>Imagem de capa <span style={{ fontWeight:400, textTransform:"none" as const }}>(URL)</span></label><input value={fCoverUrl} onChange={e => setFCoverUrl(e.target.value)} style={inp} placeholder="https://…" />
            {fCoverUrl && <img src={fCoverUrl} alt="preview" style={{ marginTop:7, width:"100%", height:100, objectFit:"cover", borderRadius:8, border:"1px solid #E4E6EA" }} onError={(e) => (e.currentTarget.style.display="none")} />}
          </div>

          <div>
            <label style={lbl}>Convidar usuários da plataforma</label>
            <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
              {USUARIOS.map(u => (
                <label key={u.nome} style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:13, color:"#374151", fontFamily:"var(--font-body)" }}>
                  <input type="checkbox" checked={fConvidados.includes(u.nome)} onChange={e => setFConvidados(prev => e.target.checked ? [...prev,u.nome] : prev.filter(n=>n!==u.nome))} style={{ width:14, height:14 }} />
                  <span style={{ width:24, height:24, borderRadius:6, background:"linear-gradient(135deg,hsl(var(--connect-ink)),hsl(var(--primary)))", display:"inline-flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:9, fontWeight:700 }}>{u.iniciais}</span>
                  {u.nome}
                </label>
              ))}
            </div>
          </div>

          <div style={{ display:"flex", justifyContent:"flex-end", gap:8, paddingTop:8, borderTop:"1px solid #F0F5FF" }}>
            <button onClick={() => setNovoOpen(false)} style={{ height:34, padding:"0 14px", borderRadius:8, border:"1px solid #E4E6EA", background:"white", fontSize:13, cursor:"pointer", color:"#374151", fontFamily:"var(--font-body)" }}>Cancelar</button>
            <button onClick={criarEvento} disabled={!fTitulo.trim()||!fData}
              style={{ height:34, padding:"0 18px", borderRadius:8, border:"none", background:"hsl(var(--primary))", color:"white", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"var(--font-body)", opacity:(!fTitulo.trim()||!fData)?0.5:1 }}>Criar evento</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
