import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { Plus, X, Send, Eye, Upload, Link2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

const U: React.CSSProperties = { fontFamily: "var(--font-body)" };

type Categoria = "interno" | "externo";
type TipoComunicado = "atualizacao" | "aviso" | "endomarketing" | "alerta" | "evento";

const TIPO_MAP: Record<TipoComunicado, { label: string; hex: string; bg: string; border: string }> = {
  atualizacao:   { label: "Atualização",  hex: "hsl(var(--primary))", bg: "#EFF6FF", border: "#BFDBFE" },
  aviso:         { label: "Aviso",        hex: "#F59E0B", bg: "#FFFBEB", border: "#FDE68A" },
  endomarketing: { label: "Endomarketing",hex: "#EC4899", bg: "#FDF2F8", border: "#FBCFE8" },
  alerta:        { label: "Alerta",       hex: "#EF4444", bg: "#FFF1F2", border: "#FECACA" },
  evento:        { label: "Evento",       hex: "hsl(var(--highlight))", bg: "#F5F3FF", border: "#DDD6FE" },
};

const GRAD: Record<TipoComunicado, string> = {
  endomarketing: "linear-gradient(135deg,#EC4899,hsl(var(--highlight)))",
  evento:        "linear-gradient(135deg,hsl(var(--highlight)),hsl(var(--primary)))",
  alerta:        "linear-gradient(135deg,#EF4444,#F97316)",
  aviso:         "linear-gradient(135deg,#F59E0B,#EF4444)",
  atualizacao:   "linear-gradient(135deg,hsl(var(--connect-ink)),hsl(var(--primary)))",
};

const REACOES_LIST = ["❤️","👍","😂","🎉","🔥"] as const;

interface Comentario { id: string; autor: string; iniciais: string; texto: string; hora: string; }
interface Leitor { nome: string; iniciais: string; vistEm: string; }
interface Comunicado {
  id: string;
  titulo: string;
  corpo: string;
  coverUrl?: string;
  categoria: Categoria;
  tipo: TipoComunicado;
  autor: string;
  iniciais: string;
  data: string;
  leitores: Leitor[];
  comentarios: Comentario[];
  reacoes: Record<string, number>;
  minhasReacoes: string[];
}

let NEXT_ID = 6;
const MOCK_INICIAL: Comunicado[] = [
  {
    id: "C-001",
    titulo: "Atualização da política de férias 2026",
    corpo: "Comunicamos que a política de férias foi atualizada para 2026. Os colaboradores poderão fracionar em até 3 períodos, com mínimo de 5 dias corridos cada.",
    coverUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
    categoria: "interno",
    tipo: "atualizacao",
    autor: "Patricia Lima",
    iniciais: "PL",
    data: "20/04/2026",
    leitores: [
      { nome: "Ana Beatriz", iniciais: "AB", vistEm: "20/04 09:30" },
      { nome: "Rafael Lima", iniciais: "RL", vistEm: "20/04 11:10" },
      { nome: "Camila Souza", iniciais: "CS", vistEm: "21/04 08:00" },
    ],
    comentarios: [
      { id: "cm1", autor: "Ana Beatriz", iniciais: "AB", texto: "Ótima notícia! Muito mais flexibilidade.", hora: "09:32" },
      { id: "cm2", autor: "Rafael Lima",  iniciais: "RL", texto: "Perfeito, obrigado pela comunicação.", hora: "11:15" },
    ],
    reacoes: { "❤️": 5, "👍": 8, "😂": 0, "🎉": 3, "🔥": 1 },
    minhasReacoes: ["👍"],
  },
  {
    id: "C-002",
    titulo: "Boas-vindas à Kentaki Foods!",
    corpo: "Damos as boas-vindas à Kentaki Foods como novo cliente Ongoing da Azumi. Estamos felizes em fazer parte dessa jornada!",
    coverUrl: "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=600&q=80",
    categoria: "externo",
    tipo: "endomarketing",
    autor: "Patricia Lima",
    iniciais: "PL",
    data: "18/04/2026",
    leitores: [
      { nome: "Mariana Souza", iniciais: "MS", vistEm: "18/04 14:00" },
    ],
    comentarios: [
      { id: "cm3", autor: "Mariana Souza", iniciais: "MS", texto: "Que alegria fazer parte da Azumi!", hora: "14:05" },
    ],
    reacoes: { "❤️": 12, "👍": 7, "😂": 2, "🎉": 9, "🔥": 4 },
    minhasReacoes: ["❤️", "🎉"],
  },
  {
    id: "C-003",
    titulo: "Reunião geral — quarta às 10h",
    corpo: "Pauta: resultados de Q1, diretrizes para Q2 e apresentação dos novos clientes. Presença obrigatória para todo o time.",
    categoria: "interno",
    tipo: "aviso",
    autor: "Ana Beatriz",
    iniciais: "AB",
    data: "22/04/2026",
    leitores: [
      { nome: "Patricia Lima", iniciais: "PL", vistEm: "22/04 09:00" },
    ],
    comentarios: [],
    reacoes: { "❤️": 1, "👍": 5, "😂": 0, "🎉": 0, "🔥": 0 },
    minhasReacoes: [],
  },
];

function Av({ ini, size = 28 }: { ini: string; size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "hsl(var(--connect-ink))", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.4, fontWeight: 700, flexShrink: 0, ...U }}>
      {ini}
    </div>
  );
}

function PostCard({ c, onSelect, onReagir }: { c: Comunicado; onSelect: () => void; onReagir: (emoji: string) => void }) {
  const tipo = TIPO_MAP[c.tipo];
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background: "white", borderRadius: 14, border: "1px solid #E4E6EA", overflow: "hidden", cursor: "pointer", transition: "all .15s", boxShadow: hovered ? "0 8px 24px rgba(3,29,56,.10)" : "0 1px 2px rgba(3,29,56,.04)", transform: hovered ? "translateY(-2px)" : "none", display: "flex", flexDirection: "column" }}
    >
      <div style={{ position: "relative", width: "100%", aspectRatio: "1/1", background: GRAD[c.tipo] }}>
        {c.coverUrl ? (
          <img src={c.coverUrl} alt={c.titulo} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>📢</div>
        )}
        <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 6 }}>
          <span style={{ padding: "3px 9px", borderRadius: 20, background: tipo.bg, color: tipo.hex, fontSize: 10, fontWeight: 700, border: `1px solid ${tipo.border}`, ...U }}>{tipo.label}</span>
          <span style={{ padding: "3px 9px", borderRadius: 20, background: "rgba(255,255,255,.95)", color: "hsl(var(--connect-ink))", fontSize: 10, fontWeight: 700, ...U }}>
            {c.categoria === "interno" ? "Interno" : "Externo"}
          </span>
        </div>
      </div>

      <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "#64748B", ...U }}>
          <Av ini={c.iniciais} size={22} />
          <span style={{ fontWeight: 600, color: "hsl(var(--connect-ink))" }}>{c.autor}</span>
          <span>·</span>
          <span>{c.data}</span>
        </div>

        <div style={{ fontSize: 14, fontWeight: 700, color: "hsl(var(--connect-ink))", lineHeight: 1.3, ...U }}>{c.titulo}</div>
        <div style={{ fontSize: 12, color: "#64748B", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", ...U }}>{c.corpo}</div>

        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {REACOES_LIST.map(emoji => {
            const count = c.reacoes[emoji] ?? 0;
            const ativo = c.minhasReacoes.includes(emoji);
            return (
              <button key={emoji} onClick={e => { e.stopPropagation(); onReagir(emoji); }}
                style={{ display: "flex", alignItems: "center", gap: 3, padding: "2px 7px", borderRadius: 20, border: `1px solid ${ativo ? "hsl(var(--primary))" : "#E4E6EA"}`, background: ativo ? "#EFF6FF" : "white", cursor: "pointer", fontSize: 12, fontWeight: 600, color: ativo ? "hsl(var(--primary))" : "#64748B", transition: "all .15s", ...U }}>
                {emoji}{count > 0 && <span>{count}</span>}
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 14, fontSize: 11, color: "#94A3B8", paddingTop: 6, borderTop: "1px solid #F0F5FF", ...U }}>
          <span>💬 {c.comentarios.length}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Eye size={12} /> {c.leitores.length}</span>
        </div>
      </div>
    </div>
  );
}

function DetalheModal({ c, onClose, onReagir, onAddComentario }: {
  c: Comunicado; onClose: () => void;
  onReagir: (emoji: string) => void;
  onAddComentario: (texto: string) => void;
}) {
  const [novoComent, setNovoComent] = useState("");
  const tipo = TIPO_MAP[c.tipo];

  const enviar = () => {
    if (!novoComent.trim()) return;
    onAddComentario(novoComent.trim());
    setNovoComent("");
  };

  const isNarrow = typeof window !== "undefined" && window.innerWidth < 820;
  return createPortal(
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, background: "rgba(3,29,56,.6)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, overflowY: "auto" }}>
      <div style={{ background: "white", borderRadius: 14, width: "100%", maxWidth: 720, maxHeight: "90vh", display: "grid", gridTemplateColumns: isNarrow ? "1fr" : "1fr 340px", overflow: "hidden", boxShadow: "0 20px 50px rgba(0,0,0,.25)" }}>
        <div style={{ background: GRAD[c.tipo], display: "flex", alignItems: "center", justifyContent: "center", minHeight: isNarrow ? 180 : "auto" }}>
          {c.coverUrl ? (
            <img src={c.coverUrl} alt={c.titulo} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ fontSize: 80 }}>📢</div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", maxHeight: isNarrow ? "60vh" : "90vh" }}>
          <div style={{ padding: 16, borderBottom: "1px solid #F0F5FF", display: "flex", gap: 10 }}>
            <Av ini={c.iniciais} size={36} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--connect-ink))", ...U }}>{c.autor}</span>
                <span style={{ padding: "2px 7px", borderRadius: 20, background: tipo.bg, color: tipo.hex, fontSize: 10, fontWeight: 700, border: `1px solid ${tipo.border}`, ...U }}>{tipo.label}</span>
                <span style={{ padding: "2px 7px", borderRadius: 20, background: "#F0F5FF", color: "hsl(var(--connect-ink))", fontSize: 10, fontWeight: 700, ...U }}>
                  {c.categoria === "interno" ? "Interno" : "Externo"}
                </span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "hsl(var(--connect-ink))", marginTop: 4, ...U }}>{c.titulo}</div>
              <div style={{ fontSize: 12, color: "#64748B", marginTop: 4, lineHeight: 1.5, ...U }}>{c.corpo}</div>
            </div>
            <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748B", padding: 4, height: "fit-content" }}>
              <X size={18} />
            </button>
          </div>

          <div style={{ padding: "10px 16px", borderBottom: "1px solid #F0F5FF", display: "flex", gap: 4, flexWrap: "wrap" }}>
            {REACOES_LIST.map(emoji => {
              const count = c.reacoes[emoji] ?? 0;
              const ativo = c.minhasReacoes.includes(emoji);
              return (
                <button key={emoji} onClick={() => onReagir(emoji)}
                  style={{ display: "flex", alignItems: "center", gap: 3, padding: "3px 9px", borderRadius: 20, border: `1px solid ${ativo ? "hsl(var(--primary))" : "#E4E6EA"}`, background: ativo ? "#EFF6FF" : "white", cursor: "pointer", fontSize: 12, fontWeight: 700, color: ativo ? "hsl(var(--primary))" : "#64748B", transition: "all .15s", ...U }}>
                  {emoji}{count > 0 && <span>{count}</span>}
                </button>
              );
            })}
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8, display: "flex", alignItems: "center", gap: 6, ...U }}>
                <Eye size={12} /> {c.leitores.length} visualizações
              </div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {c.leitores.map((l, i) => (
                  <div key={i} title={`${l.nome} — ${l.vistEm}`}>
                    <Av ini={l.iniciais} size={26} />
                  </div>
                ))}
                {c.leitores.length === 0 && <span style={{ fontSize: 12, color: "#94A3B8", ...U }}>Ninguém viu ainda.</span>}
              </div>
            </div>

            <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8, ...U }}>
              💬 {c.comentarios.length} comentário{c.comentarios.length !== 1 ? "s" : ""}
            </div>
            {c.comentarios.length === 0 && (
              <div style={{ fontSize: 12, color: "#94A3B8", ...U }}>Seja o primeiro a comentar.</div>
            )}
            {c.comentarios.map(cm => (
              <div key={cm.id} style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <Av ini={cm.iniciais} size={28} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ background: "#F0F5FF", borderRadius: 12, padding: "7px 10px" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "hsl(var(--connect-ink))", ...U }}>{cm.autor}</span>{" "}
                    <span style={{ fontSize: 12, color: "#374151", ...U }}>{cm.texto}</span>
                  </div>
                  <span style={{ fontSize: 10, color: "#94A3B8", marginLeft: 10, ...U }}>{cm.hora}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: 12, borderTop: "1px solid #F0F5FF", display: "flex", gap: 6 }}>
            <input value={novoComent} onChange={e => setNovoComent(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); enviar(); } }}
              placeholder="Escreva um comentário…"
              style={{ flex: 1, height: 34, borderRadius: 8, border: "1px solid #E4E6EA", padding: "0 10px", fontSize: 13, fontFamily: "var(--font-body)", outline: "none" }}
            />
            <button onClick={enviar} style={{ height: 34, width: 34, borderRadius: 8, background: "hsl(var(--primary))", border: "none", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );

}

function CriarModal({ onClose, onCreate }: { onClose: () => void; onCreate: (c: Omit<Comunicado, "id" | "leitores" | "comentarios" | "reacoes" | "minhasReacoes">) => void }) {
  const [titulo, setTitulo]       = useState("");
  const [corpo, setCorpo]         = useState("");
  const [tipo, setTipo]           = useState<TipoComunicado>("atualizacao");
  const [categoria, setCategoria] = useState<Categoria>("interno");
  const [coverUrl, setCoverUrl]   = useState("");
  const [coverMode, setCoverMode] = useState<"url" | "upload">("url");

  const salvar = () => {
    if (!titulo.trim() || !corpo.trim()) return;
    const hoje = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
    onCreate({ titulo: titulo.trim(), corpo: corpo.trim(), tipo, categoria, coverUrl: coverUrl.trim() || undefined, autor: "Patricia Lima", iniciais: "PL", data: hoje });
    onClose();
  };

  const lbl: React.CSSProperties = { fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#64748B", letterSpacing: ".06em", display: "block", marginBottom: 5, ...U };
  const inp: React.CSSProperties = { width: "100%", height: 36, borderRadius: 8, border: "1px solid #E4E6EA", padding: "0 10px", fontSize: 13, fontFamily: "var(--font-body)", outline: "none", boxSizing: "border-box" };

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, background: "rgba(3,29,56,.6)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "white", borderRadius: 14, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ padding: 16, borderBottom: "1px solid #F0F5FF", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "hsl(var(--connect-ink))", ...U }}>Novo comunicado</div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748B" }}><X size={18} /></button>
        </div>
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={lbl}>Tipo</label>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {(Object.keys(TIPO_MAP) as TipoComunicado[]).map(t => {
                const m = TIPO_MAP[t]; const ativo = tipo === t;
                return <button key={t} onClick={() => setTipo(t)} style={{ height: 26, padding: "0 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: "pointer", border: `1px solid ${ativo ? m.border : "#E4E6EA"}`, background: ativo ? m.bg : "white", color: ativo ? m.hex : "#64748B", ...U }}>{m.label}</button>;
              })}
            </div>
          </div>
          <div>
            <label style={lbl}>Categoria</label>
            <div style={{ display: "flex", gap: 5 }}>
              {(["interno","externo"] as Categoria[]).map(cat => (
                <button key={cat} onClick={() => setCategoria(cat)} style={{ height: 28, padding: "0 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer", border: "1px solid", background: categoria === cat ? "hsl(var(--connect-ink))" : "white", color: categoria === cat ? "white" : "#64748B", borderColor: categoria === cat ? "hsl(var(--connect-ink))" : "#E4E6EA", ...U }}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={lbl}>Título *</label>
            <input value={titulo} onChange={e => setTitulo(e.target.value)} style={inp} placeholder="Ex.: Novidade importante" />
          </div>
          <div>
            <label style={lbl}>Conteúdo *</label>
            <textarea value={corpo} onChange={e => setCorpo(e.target.value)} rows={4} style={{ ...inp, height: "auto", padding: "8px 10px", resize: "vertical" }} placeholder="Escreva o comunicado…" />
          </div>
          <div>
            <label style={lbl}>Imagem de capa <span style={{ fontWeight: 400, textTransform: "none" }}>— 1:1 recomendado</span></label>
            <div style={{ display: "flex", gap: 5, marginBottom: 7 }}>
              {([["url","URL",Link2],["upload","Upload",Upload]] as const).map(([m, l, Icon]) => (
                <button key={m} onClick={() => setCoverMode(m)} style={{ height: 26, padding: "0 10px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1px solid", display: "flex", alignItems: "center", gap: 3, background: coverMode === m ? "hsl(var(--connect-ink))" : "white", color: coverMode === m ? "white" : "#64748B", borderColor: coverMode === m ? "hsl(var(--connect-ink))" : "#E4E6EA", ...U }}>
                  <Icon size={10} />{l}
                </button>
              ))}
            </div>
            <input value={coverUrl} onChange={e => setCoverUrl(e.target.value)} style={inp} placeholder={coverMode === "url" ? "https://..." : "Upload disponível em breve"} disabled={coverMode === "upload"} />
            {coverUrl && <img src={coverUrl} alt="preview" style={{ marginTop: 8, width: "100%", aspectRatio: "1/1", objectFit: "cover", borderRadius: 10, border: "1px solid #E4E6EA" }} />}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 8, borderTop: "1px solid #F0F5FF" }}>
            <button onClick={onClose} style={{ height: 34, padding: "0 14px", borderRadius: 8, background: "white", border: "1px solid #E4E6EA", fontSize: 13, cursor: "pointer", color: "#374151", ...U }}>Cancelar</button>
            <button onClick={salvar} disabled={!titulo.trim() || !corpo.trim()} style={{ height: 34, padding: "0 18px", borderRadius: 8, background: "hsl(var(--connect-ink))", border: "none", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: (!titulo.trim() || !corpo.trim()) ? 0.5 : 1, ...U }}>Publicar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ComunicadosPage() {
  const [lista, setLista]         = useState<Comunicado[]>(MOCK_INICIAL);
  const [detalhe, setDetalhe]     = useState<Comunicado | null>(null);
  const [criarOpen, setCriarOpen] = useState(false);
  const [filtroTipo, setFiltroTipo]   = useState<TipoComunicado | "todos">("todos");
  const [filtroCateg, setFiltroCateg] = useState<Categoria | "todos">("todos");

  const filtrados = useMemo(() => lista.filter(c => {
    if (filtroTipo !== "todos" && c.tipo !== filtroTipo) return false;
    if (filtroCateg !== "todos" && c.categoria !== filtroCateg) return false;
    return true;
  }), [lista, filtroTipo, filtroCateg]);

  const reagir = (id: string, emoji: string) => {
    setLista(prev => prev.map(c => {
      if (c.id !== id) return c;
      const ja = c.minhasReacoes.includes(emoji);
      return {
        ...c,
        reacoes: { ...c.reacoes, [emoji]: Math.max(0, (c.reacoes[emoji] ?? 0) + (ja ? -1 : 1)) },
        minhasReacoes: ja ? c.minhasReacoes.filter(e => e !== emoji) : [...c.minhasReacoes, emoji],
      };
    }));
    setDetalhe(prev => {
      if (!prev || prev.id !== id) return prev;
      const ja = prev.minhasReacoes.includes(emoji);
      return {
        ...prev,
        reacoes: { ...prev.reacoes, [emoji]: Math.max(0, (prev.reacoes[emoji] ?? 0) + (ja ? -1 : 1)) },
        minhasReacoes: ja ? prev.minhasReacoes.filter(e => e !== emoji) : [...prev.minhasReacoes, emoji],
      };
    });
  };

  const addComentario = (id: string, texto: string) => {
    const novo: Comentario = { id: crypto.randomUUID(), autor: "Patricia Lima", iniciais: "PL", texto, hora: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) };
    setLista(prev => prev.map(c => c.id !== id ? c : { ...c, comentarios: [...c.comentarios, novo] }));
    setDetalhe(prev => prev?.id === id ? { ...prev, comentarios: [...prev.comentarios, novo] } : prev);
  };

  const criar = (dados: Omit<Comunicado, "id" | "leitores" | "comentarios" | "reacoes" | "minhasReacoes">) => {
    const novo: Comunicado = { id: `C-00${NEXT_ID++}`, ...dados, leitores: [], comentarios: [], reacoes: { "❤️": 0, "👍": 0, "😂": 0, "🎉": 0, "🔥": 0 }, minhasReacoes: [] };
    setLista(prev => [novo, ...prev]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingBottom: 40 }}>
      <PageHeader
        title="Comunicados"
        subtitle="Feed de comunicações internas e externas"
        actions={
          <button onClick={() => setCriarOpen(true)} style={{ height: 36, padding: "0 16px", borderRadius: 100, background: "hsl(var(--primary))", border: "none", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-body)" }}>
            <Plus size={14} /> Novo comunicado
          </button>
        }
      />

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {(["todos","interno","externo"] as const).map(cat => (
          <button key={cat} onClick={() => setFiltroCateg(cat)}
            style={{ height: 28, padding: "0 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1px solid", background: filtroCateg === cat ? "hsl(var(--connect-ink))" : "white", color: filtroCateg === cat ? "white" : "#64748B", borderColor: filtroCateg === cat ? "hsl(var(--connect-ink))" : "#E4E6EA", fontFamily: "var(--font-body)" }}>
            {cat === "todos" ? "Todos" : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
        <div style={{ width: 1, background: "#E4E6EA", margin: "0 4px" }} />
        {([{ value: "todos" as const, label: "Todos os tipos" }, ...(Object.entries(TIPO_MAP) as [TipoComunicado, typeof TIPO_MAP[TipoComunicado]][]).map(([v, m]) => ({ value: v, label: m.label }))]).map(t => (
          <button key={t.value} onClick={() => setFiltroTipo(t.value as TipoComunicado | "todos")}
            style={{ height: 28, padding: "0 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1px solid", background: filtroTipo === t.value ? "hsl(var(--primary))" : "white", color: filtroTipo === t.value ? "white" : "#64748B", borderColor: filtroTipo === t.value ? "hsl(var(--primary))" : "#E4E6EA", fontFamily: "var(--font-body)" }}>
            {t.label}
          </button>
        ))}
      </div>

      {filtrados.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#94A3B8", fontFamily: "var(--font-body)", fontSize: 13 }}>
          Nenhum comunicado encontrado.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {filtrados.map(c => (
            <PostCard key={c.id} c={c} onSelect={() => setDetalhe(c)} onReagir={emoji => reagir(c.id, emoji)} />
          ))}
        </div>
      )}

      {detalhe && (
        <DetalheModal
          c={detalhe}
          onClose={() => setDetalhe(null)}
          onReagir={emoji => reagir(detalhe.id, emoji)}
          onAddComentario={texto => addComentario(detalhe.id, texto)}
        />
      )}

      {criarOpen && <CriarModal onClose={() => setCriarOpen(false)} onCreate={criar} />}
    </div>
  );
}
