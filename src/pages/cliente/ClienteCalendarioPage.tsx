import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X, Clock, MapPin, ExternalLink, Download } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { eventosDemo } from "@/data/mockDemoData";
import { eventosValore } from "@/data/mockValoreData";

const U: React.CSSProperties = { fontFamily: "'Urbanist',sans-serif" };

type EventoTipo =
  | "feriado_nacional"
  | "feriado_obrigatorio"
  | "reuniao"
  | "entrevista"
  | "prazo"
  | "ferias"
  | "comunicado"
  | "outros";

interface Evento {
  id: string;
  titulo: string;
  data: string;
  hora?: string;
  local?: string;
  descricao?: string;
  tipo: EventoTipo;
  outrosNome?: string;
  outrosCor?: string;
}

const TIPO_HEX: Record<EventoTipo, string> = {
  feriado_nacional: "#EC4899",
  feriado_obrigatorio: "#EF4444",
  reuniao: "#3B82F6",
  entrevista: "#8B5CF6",
  prazo: "#F97316",
  ferias: "#10B981",
  comunicado: "#06B6D4",
  outros: "#64748B",
};
const TIPO_LABEL: Record<EventoTipo, string> = {
  feriado_nacional: "Feriado nacional",
  feriado_obrigatorio: "Feriado obrigatório",
  reuniao: "Reunião",
  entrevista: "Entrevista",
  prazo: "Prazo de entregável",
  ferias: "Férias",
  comunicado: "Comunicado/Evento",
  outros: "Outros",
};
const NOMES_MES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];
const DIAS_SEM = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
const ANOS = [2025, 2026, 2027];

const HOJE = new Date();
const Y0 = HOJE.getFullYear();
const M0 = HOJE.getMonth();
const fmt = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const EVENTOS_CLIENTE: Evento[] = [
  { id: "C-1", titulo: "Reunião de alinhamento mensal", data: fmt(new Date(Y0, M0, 14)), hora: "09:00", tipo: "reuniao", local: "Google Meet", descricao: "Reunião mensal de alinhamento com a consultora Azumi." },
  { id: "C-2", titulo: "Prazo — Relatório HRaaS Abril", data: fmt(new Date(Y0, M0, 5)), tipo: "prazo", descricao: "Data limite para assinatura de ciência do relatório de abril." },
  { id: "C-3", titulo: "Entrevista — Dev Pleno", data: fmt(new Date(Y0, M0, 20)), hora: "14:30", tipo: "entrevista", local: "Google Meet", descricao: "Entrevista com candidato para a vaga de Desenvolvedor Pleno." },
  { id: "C-4", titulo: "Feriado — Tiradentes", data: fmt(new Date(Y0, M0, 21)), tipo: "feriado_nacional" },
  { id: "C-5", titulo: "Wellbeing Day", data: fmt(new Date(Y0, M0, 28)), hora: "09:00", tipo: "comunicado", descricao: "Evento de bem-estar para toda a equipe Azumi." },
  { id: "C-6", titulo: "Prazo — Aprovação cronograma", data: fmt(new Date(Y0, M0, 10)), tipo: "prazo", descricao: "Prazo para aprovação do cronograma do projeto Mapeamento de Cargos." },
];

function getCor(e: Evento) {
  return e.tipo === "outros" && e.outrosCor ? e.outrosCor : TIPO_HEX[e.tipo];
}
function getLabel(e: Evento) {
  return e.tipo === "outros" && e.outrosNome ? e.outrosNome : TIPO_LABEL[e.tipo];
}

function googleCalendarUrl(ev: Evento) {
  const d = ev.data.replace(/-/g, "");
  const dates = ev.hora
    ? `${d}T${ev.hora.replace(":", "")}00/${d}T${ev.hora.replace(":", "")}00`
    : `${d}/${d}`;
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    ev.titulo,
  )}&dates=${dates}${ev.local ? `&location=${encodeURIComponent(ev.local)}` : ""}${
    ev.descricao ? `&details=${encodeURIComponent(ev.descricao)}` : ""
  }`;
}
function downloadICS(ev: Evento) {
  const d = ev.data.replace(/-/g, "");
  const dtstart = ev.hora ? `${d}T${ev.hora.replace(":", "")}00` : d;
  const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${ev.titulo}\nDTSTART:${dtstart}\nDTEND:${dtstart}\n${ev.local ? `LOCATION:${ev.local}\n` : ""}${ev.descricao ? `DESCRIPTION:${ev.descricao}\n` : ""}END:VEVENT\nEND:VCALENDAR`;
  const blob = new Blob([ics], { type: "text/calendar" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${ev.titulo}.ics`;
  a.click();
}

function startOfWeek(d: Date) {
  const r = new Date(d);
  r.setDate(d.getDate() - d.getDay());
  return r;
}

function Tooltip({ ev }: { ev: Evento }) {
  const cor = getCor(ev);
  return (
    <div
      style={{
        position: "absolute",
        bottom: "calc(100% + 6px)",
        left: 0,
        zIndex: 50,
        minWidth: 200,
        maxWidth: 260,
        background: "white",
        border: "1px solid #E4E6EA",
        borderRadius: 10,
        padding: 10,
        boxShadow: "0 8px 24px rgba(0,0,0,.12)",
        ...U,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#64748B", marginBottom: 4 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: cor }} />
        {getLabel(ev)}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", marginBottom: 4 }}>{ev.titulo}</div>
      {ev.hora && <div style={{ fontSize: 11, color: "#64748B" }}>🕐 {ev.hora}</div>}
      {ev.local && <div style={{ fontSize: 11, color: "#64748B" }}>📍 {ev.local}</div>}
    </div>
  );
}

function EventoBtn({ ev, onClick }: { ev: Evento; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  const cor = getCor(ev);
  return (
    <div style={{ position: "relative" }} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <button
        onClick={onClick}
        style={{
          width: "100%",
          textAlign: "left",
          background: `${cor}1A`,
          border: `1px solid ${cor}40`,
          borderLeft: `3px solid ${cor}`,
          borderRadius: 6,
          padding: "3px 6px",
          fontSize: 11,
          color: "#0F172A",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 4,
          overflow: "hidden",
          ...U,
        }}
      >
        {ev.hora && <span style={{ fontWeight: 600, fontSize: 10 }}>{ev.hora}</span>}
        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1 }}>{ev.titulo}</span>
      </button>
      {hov && <Tooltip ev={ev} />}
    </div>
  );
}

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,.55)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div style={{ background: "white", borderRadius: 14, maxWidth: 480, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,.25)" }}>
        {children}
      </div>
    </div>
  );
}

export default function ClienteCalendarioPage() {
  const { usuario } = useAuth();
  const isDemoUser = usuario?.role === "trial";
  const isValoreUser = usuario?.empresaId === "valore";
  const [view, setView] = useState<"mes" | "semana">("mes");
  const [cursor, setCursor] = useState(new Date(Y0, M0, 1));
  const [anoFiltro, setAnoFiltro] = useState(Y0);
  const [evSel, setEvSel] = useState<Evento | null>(null);

  function nav(delta: number) {
    const r = new Date(cursor);
    if (view === "mes") r.setMonth(r.getMonth() + delta);
    else r.setDate(r.getDate() + delta * 7);
    setCursor(r);
  }
  function irParaAno(ano: number) {
    setAnoFiltro(ano);
    setCursor(new Date(ano, cursor.getMonth(), 1));
  }

  const eventosLista: Evento[] = useMemo(() => {
    const fonte = isDemoUser ? eventosDemo : isValoreUser ? eventosValore : null;
    if (!fonte) return EVENTOS_CLIENTE;
    return fonte.map((e) => {
      const d = new Date(e.data);
      const tipo: EventoTipo = e.tipo === "feriado" ? "feriado_nacional" : (e.tipo as EventoTipo);
      return {
        id: e.id,
        titulo: e.titulo,
        data: fmt(d),
        hora: e.hora,
        tipo,
      };
    });
  }, [isDemoUser, isValoreUser]);

  const eventosPorData = useMemo(() => {
    const m = new Map<string, Evento[]>();
    eventosLista.forEach((e) => {
      const arr = m.get(e.data) ?? [];
      arr.push(e);
      m.set(e.data, arr);
    });
    return m;
  }, [eventosLista]);


  const cells = useMemo(() => {
    if (view === "mes") {
      const ini = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
      const fim = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
      const start = startOfWeek(ini);
      const total = Math.ceil((fim.getDate() + ini.getDay()) / 7) * 7;
      return Array.from({ length: total }, (_, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        return d;
      });
    } else {
      const start = startOfWeek(cursor);
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        return d;
      });
    }
  }, [view, cursor]);

  const titulo =
    view === "mes"
      ? `${NOMES_MES[cursor.getMonth()]} ${cursor.getFullYear()}`
      : (() => {
          const s = startOfWeek(cursor);
          const e = new Date(s);
          e.setDate(s.getDate() + 6);
          return `${s.getDate()}/${s.getMonth() + 1} – ${e.getDate()}/${e.getMonth() + 1}`;
        })();

  const MAX_VIS = view === "mes" ? 3 : 12;

  const btnIcon: React.CSSProperties = {
    height: 34,
    width: 34,
    borderRadius: 100,
    border: "1px solid #E4E6EA",
    background: "white",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <div style={U}>
      <PageHeader title="Calendário" subtitle="Eventos, reuniões e prazos do seu projeto com a Azumi." />

      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
        <select
          value={anoFiltro}
          onChange={(e) => irParaAno(Number(e.target.value))}
          style={{
            height: 34,
            borderRadius: 100,
            border: "1px solid #E4E6EA",
            padding: "0 12px",
            fontSize: 13,
            ...U,
            outline: "none",
            background: "white",
            cursor: "pointer",
          }}
        >
          {ANOS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <button onClick={() => nav(-1)} style={btnIcon}>
          <ChevronLeft size={16} />
        </button>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#0F172A", minWidth: 160, textAlign: "center" }}>{titulo}</div>
        <button onClick={() => nav(1)} style={btnIcon}>
          <ChevronRight size={16} />
        </button>
        <button
          onClick={() => setCursor(new Date())}
          style={{
            height: 34,
            padding: "0 14px",
            borderRadius: 100,
            border: "1px solid #E4E6EA",
            background: "white",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            ...U,
          }}
        >
          Hoje
        </button>

        <div style={{ marginLeft: "auto", display: "flex", gap: 4, background: "#F1F5F9", borderRadius: 100, padding: 3 }}>
          {(["mes", "semana"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                height: 28,
                padding: "0 14px",
                borderRadius: 100,
                border: "none",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                background: view === v ? "white" : "transparent",
                color: view === v ? "#0F172A" : "#64748B",
                boxShadow: view === v ? "0 1px 4px rgba(0,0,0,.08)" : "none",
                ...U,
              }}
            >
              {v === "mes" ? "Mês" : "Semana"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: "white", border: "1px solid #E4E6EA", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", background: "#F8FAFC", borderBottom: "1px solid #E4E6EA" }}>
          {DIAS_SEM.map((d) => (
            <div key={d} style={{ padding: "10px 0", textAlign: "center", fontSize: 11, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: ".05em" }}>
              {d}
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)" }}>
          {cells.map((d, i) => {
            const key = fmt(d);
            const evs = eventosPorData.get(key) ?? [];
            const sameMonth = view === "semana" || d.getMonth() === cursor.getMonth();
            const isHoje = key === fmt(new Date());
            return (
              <div
                key={i}
                style={{
                  minHeight: view === "mes" ? 110 : 360,
                  borderRight: (i + 1) % 7 === 0 ? "none" : "1px solid #F1F5F9",
                  borderBottom: "1px solid #F1F5F9",
                  padding: 6,
                  background: sameMonth ? "white" : "#FAFBFC",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: sameMonth ? "#0F172A" : "#CBD5E1",
                      width: 22,
                      height: 22,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "50%",
                      background: isHoje ? "#3B82F6" : "transparent",
                      ...(isHoje ? { color: "white" } : {}),
                    }}
                  >
                    {d.getDate()}
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {evs.slice(0, MAX_VIS).map((e) => (
                    <EventoBtn key={e.id} ev={e} onClick={() => setEvSel(e)} />
                  ))}
                  {evs.length > MAX_VIS && (
                    <span style={{ fontSize: 10, color: "#64748B", padding: "0 4px" }}>+{evs.length - MAX_VIS} mais</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 12 }}>
        {(Object.keys(TIPO_LABEL) as EventoTipo[])
          .filter((t) => t !== "outros")
          .map((t) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748B" }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: TIPO_HEX[t] }} />
              {TIPO_LABEL[t]}
            </div>
          ))}
      </div>

      <Modal open={!!evSel} onClose={() => setEvSel(null)}>
        {evSel && (
          <div style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 12, height: 12, borderRadius: "50%", background: getCor(evSel) }} />
                <div style={{ fontSize: 17, fontWeight: 700, color: "#0F172A" }}>{evSel.titulo}</div>
              </div>
              <button onClick={() => setEvSel(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8" }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{ fontSize: 11, color: "#64748B", textTransform: "uppercase", letterSpacing: ".05em" }}>{getLabel(evSel)}</span>
              {evSel.hora && (
                <div style={{ fontSize: 13, color: "#374151", display: "flex", alignItems: "center", gap: 6 }}>
                  <Clock size={14} /> {evSel.data} · {evSel.hora}
                </div>
              )}
              {!evSel.hora && <div style={{ fontSize: 13, color: "#374151" }}>{evSel.data}</div>}
              {evSel.local && (
                <div style={{ fontSize: 13, color: "#374151", display: "flex", alignItems: "center", gap: 6 }}>
                  <MapPin size={14} /> {evSel.local}
                </div>
              )}
              {evSel.descricao && <p style={{ fontSize: 13, color: "#64748B", margin: 0, lineHeight: 1.5 }}>{evSel.descricao}</p>}
              <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                <a
                  href={googleCalendarUrl(evSel)}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    height: 32,
                    padding: "0 12px",
                    borderRadius: 8,
                    background: "#3B82F6",
                    color: "white",
                    fontSize: 12,
                    fontWeight: 600,
                    textDecoration: "none",
                    ...U,
                  }}
                >
                  <ExternalLink size={13} /> Google Calendar
                </a>
                <button
                  onClick={() => downloadICS(evSel)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    height: 32,
                    padding: "0 12px",
                    borderRadius: 8,
                    border: "1px solid #E4E6EA",
                    background: "white",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#374151",
                    cursor: "pointer",
                    ...U,
                  }}
                >
                  <Download size={13} /> Apple / .ics
                </button>
                <button
                  onClick={() => setEvSel(null)}
                  style={{
                    marginLeft: "auto",
                    height: 32,
                    padding: "0 14px",
                    borderRadius: 8,
                    border: "1px solid #E4E6EA",
                    background: "white",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    color: "#374151",
                    ...U,
                  }}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
