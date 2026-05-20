import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Eye, Send, X } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

const U: React.CSSProperties = { fontFamily: "'Urbanist',sans-serif" };

type TipoComunicado = "atualizacao" | "aviso" | "endomarketing" | "alerta" | "evento";

const TIPO_MAP: Record<TipoComunicado, { label: string; hex: string; bg: string; border: string }> = {
  atualizacao:   { label: "Atualização",  hex: "#3B82F6", bg: "#EFF6FF", border: "#BFDBFE" },
  aviso:         { label: "Aviso",        hex: "#F59E0B", bg: "#FFFBEB", border: "#FDE68A" },
  endomarketing: { label: "Endomarketing",hex: "#EC4899", bg: "#FDF2F8", border: "#FBCFE8" },
  alerta:        { label: "Alerta",       hex: "#EF4444", bg: "#FFF1F2", border: "#FECACA" },
  evento:        { label: "Evento",       hex: "#8B5CF6", bg: "#F5F3FF", border: "#DDD6FE" },
};

const GRAD: Record<TipoComunicado, string> = {
  endomarketing: "linear-gradient(135deg,#EC4899,#8B5CF6)",
  evento:        "linear-gradient(135deg,#8B5CF6,#3B82F6)",
  alerta:        "linear-gradient(135deg,#EF4444,#F97316)",
  aviso:         "linear-gradient(135deg,#F59E0B,#EF4444)",
  atualizacao:   "linear-gradient(135deg,#031D38,#3B82F6)",
};

const REACOES_LIST = ["❤️","👍","😂","🎉","🔥"] as const;

interface Comentario { id: string; autor: string; iniciais: string; texto: string; hora: string; }
interface Comunicado {
  id: string; titulo: string; corpo: string; coverUrl?: string;
  tipo: TipoComunicado; autor: string; iniciais: string; data: string;
  lido: boolean; visualizacoes: number;
  comentarios: Comentario[];
  reacoes: Record<string, number>;
  minhasReacoes: string[];
}

const MOCK_CLIENTE: Comunicado[] = [
  {
    id: "K-001",
    titulo: "Bem-vinda à Azumi, Kentaki Foods!",
    corpo: "É com muito prazer que formalizamos o início da nossa parceria. Estamos comprometidos em ser o braço de RH estratégico da Kentaki Foods.",
    coverUrl: "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=600&q=80",
    tipo: "endomarketing", autor: "Patricia Lima", iniciais: "PL", data: "18/04/2026",
    lido: true, visualizacoes: 4,
    comentarios: [{ id: "c1", autor: "Mariana Souza", iniciais: "MS", texto: "Que alegria! Estamos animados com essa parceria.", hora: "14:05" }],
    reacoes: { "❤️": 5, "👍": 3, "😂": 0, "🎉": 4, "🔥": 2 },
    minhasReacoes: ["❤️"],
  },
  {
    id: "K-002",
    titulo: "Relatório HRaaS — Abril 2026 publicado",
    corpo: "O relatório de operações de abril já está disponível na aba Documentos. Confira os indicadores e o resumo das ações realizadas.",
    tipo: "atualizacao", autor: "Patricia Lima", iniciais: "PL", data: "05/05/2026",
    lido: false, visualizacoes: 1,
    comentarios: [],
    reacoes: { "❤️": 0, "👍": 2, "😂": 0, "🎉": 0, "🔥": 0 },
    minhasReacoes: [],
  },
  {
    id: "K-003",
    titulo: "Agenda: reunião de alinhamento — 28/05",
    corpo: "Marcaremos uma reunião de alinhamento trimestral para alinhar os próximos passos. Detalhes serão enviados por e-mail em breve.",
    tipo: "aviso", autor: "Ana Beatriz", iniciais: "AB", data: "12/05/2026",
    lido: false, visualizacoes: 2,
    comentarios: [],
    reacoes: { "❤️": 0, "👍": 1, "😂": 0, "🎉": 0, "🔥": 0 },
    minhasReacoes: [],
  },
];

function Av({ ini, size = 28 }: { ini: string; size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "#031D38", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.4, fontWeight: 700, flexShrink: 0, ...U }}>
      {ini}
    </div>
  );
}

function PostCard({ c, onSelect, onReagir }: { c: Comunicado; onSelect: () => void; onReagir: (e: string) => void }) {
  const tipo = TIPO_MAP[c.tipo];
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onSelect} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ position: "relative", background: "white", borderRadius: 14, border: c.lido ? "1px solid #E4E6EA" : "2px solid #3B82F6", overflow: "hidden", cursor: "pointer", transition: "all .15s", boxShadow: hov ? "0 8px 24px rgba(3,29,56,.10)" : "0 1px 2px rgba(3,29,56,.04)", transform: hov ? "translateY(-2px)" : "none", display: "flex", flexDirection: "column" }}>
      {!c.lido && <div style={{ position: "absolute", top: 8, right: 8, zIndex: 2, width: 10, height: 10, borderRadius: "50%", background: "#3B82F6", boxShadow: "0 0 0 3px white" }} />}
      <div style={{ position: "relative", width: "100%", aspectRatio: "1/1", background: GRAD[c.tipo] }}>
        {c.coverUrl ? (
          <img src={c.coverUrl} alt={c.titulo} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>📢</div>
        )}
        <div style={{ position: "absolute", top: 10, left: 10 }}>
          <span style={{ padding: "3px 9px", borderRadius: 20, background: tipo.bg, color: tipo.hex, fontSize: 10, fontWeight: 700, border: `1px solid ${tipo.border}`, ...U }}>{tipo.label}</span>
        </div>
      </div>
      <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "#64748B", ...U }}>
          <Av ini={c.iniciais} size={22} />
          <span style={{ fontWeight: 600, color: "#031D38" }}>{c.autor}</span>
          <span>·</span>
          <span>{c.data}</span>
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#031D38", lineHeight: 1.3, ...U }}>{c.titulo}</div>
        <div style={{ fontSize: 12, color: "#64748B", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", ...U }}>{c.corpo}</div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {REACOES_LIST.map(emoji => {
            const count = c.reacoes[emoji] ?? 0;
            const ativo = c.minhasReacoes.includes(emoji);
            return (
              <button key={emoji} onClick={e => { e.stopPropagation(); onReagir(emoji); }}
                style={{ display: "flex", alignItems: "center", gap: 3, padding: "2px 7px", borderRadius: 20, border: `1px solid ${ativo ? "#3B82F6" : "#E4E6EA"}`, background: ativo ? "#EFF6FF" : "white", cursor: "pointer", fontSize: 12, fontWeight: 600, color: ativo ? "#3B82F6" : "#64748B", ...U }}>
                {emoji}{count > 0 && <span>{count}</span>}
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 14, fontSize: 11, color: "#94A3B8", paddingTop: 6, borderTop: "1px solid #F0F5FF", ...U }}>
          <span>💬 {c.comentarios.length}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Eye size={12} /> {c.visualizacoes}</span>
        </div>
      </div>
    </div>
  );
}

function DetalheModal({ c, onClose, onReagir, onAddComentario }: { c: Comunicado; onClose: () => void; onReagir: (e: string) => void; onAddComentario: (t: string) => void }) {
  const [novoComent, setNovoComent] = useState("");
  const tipo = TIPO_MAP[c.tipo];
  const enviar = () => { if (!novoComent.trim()) return; onAddComentario(novoComent.trim()); setNovoComent(""); };
  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, background: "rgba(3,29,56,.6)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "white", borderRadius: 14, width: "100%", maxWidth: 900, maxHeight: "90vh", display: "grid", gridTemplateColumns: "1fr 380px", overflow: "hidden" }}>
        <div style={{ background: GRAD[c.tipo], display: "flex", alignItems: "center", justifyContent: "center" }}>
          {c.coverUrl ? <img src={c.coverUrl} alt={c.titulo} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ fontSize: 80 }}>📢</div>}
        </div>
        <div style={{ display: "flex", flexDirection: "column", height: "90vh", maxHeight: "90vh" }}>
          <div style={{ padding: 16, borderBottom: "1px solid #F0F5FF", display: "flex", gap: 10 }}>
            <Av ini={c.iniciais} size={36} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#031D38", ...U }}>{c.autor}</span>
                <span style={{ padding: "2px 7px", borderRadius: 20, background: tipo.bg, color: tipo.hex, fontSize: 10, fontWeight: 700, border: `1px solid ${tipo.border}`, ...U }}>{tipo.label}</span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#031D38", marginTop: 4, ...U }}>{c.titulo}</div>
              <div style={{ fontSize: 12, color: "#64748B", marginTop: 4, lineHeight: 1.5, ...U }}>{c.corpo}</div>
            </div>
            <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748B", padding: 4, height: "fit-content" }}><X size={18} /></button>
          </div>
          <div style={{ padding: "10px 16px", borderBottom: "1px solid #F0F5FF", display: "flex", gap: 4, flexWrap: "wrap" }}>
            {REACOES_LIST.map(emoji => {
              const count = c.reacoes[emoji] ?? 0; const ativo = c.minhasReacoes.includes(emoji);
              return <button key={emoji} onClick={() => onReagir(emoji)} style={{ display: "flex", alignItems: "center", gap: 3, padding: "3px 9px", borderRadius: 20, border: `1px solid ${ativo ? "#3B82F6" : "#E4E6EA"}`, background: ativo ? "#EFF6FF" : "white", cursor: "pointer", fontSize: 12, fontWeight: 700, color: ativo ? "#3B82F6" : "#64748B", ...U }}>{emoji}{count > 0 && <span>{count}</span>}</button>;
            })}
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8, display: "flex", alignItems: "center", gap: 6, ...U }}>
              <Eye size={12} /> {c.visualizacoes} visualizações
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: ".06em", marginTop: 14, marginBottom: 8, ...U }}>
              💬 {c.comentarios.length} comentário{c.comentarios.length !== 1 ? "s" : ""}
            </div>
            {c.comentarios.length === 0 && <div style={{ fontSize: 12, color: "#94A3B8", ...U }}>Seja o primeiro a comentar.</div>}
            {c.comentarios.map(cm => (
              <div key={cm.id} style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <Av ini={cm.iniciais} size={28} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ background: "#F0F5FF", borderRadius: 12, padding: "7px 10px" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#031D38", ...U }}>{cm.autor}</span>{" "}
                    <span style={{ fontSize: 12, color: "#374151", ...U }}>{cm.texto}</span>
                  </div>
                  <span style={{ fontSize: 10, color: "#94A3B8", marginLeft: 10, ...U }}>{cm.hora}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: 12, borderTop: "1px solid #F0F5FF", display: "flex", gap: 6 }}>
            <input value={novoComent} onChange={e => setNovoComent(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); enviar(); } }} placeholder="Escreva um comentário…" style={{ flex: 1, height: 34, borderRadius: 8, border: "1px solid #E4E6EA", padding: "0 10px", fontSize: 13, fontFamily: "'Urbanist',sans-serif", outline: "none" }} />
            <button onClick={enviar} style={{ height: 34, width: 34, borderRadius: 8, background: "#3B82F6", border: "none", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Send size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ClienteComunicadosPage() {
  const [lista, setLista]     = useState<Comunicado[]>(MOCK_CLIENTE);
  const [detalhe, setDetalhe] = useState<Comunicado | null>(null);

  const abrirDetalhe = (c: Comunicado) => {
    setLista(prev => prev.map(x => x.id === c.id ? { ...x, lido: true } : x));
    setDetalhe({ ...c, lido: true });
  };

  const reagir = (id: string, emoji: string) => {
    setLista(prev => prev.map(c => {
      if (c.id !== id) return c;
      const ja = c.minhasReacoes.includes(emoji);
      return { ...c, reacoes: { ...c.reacoes, [emoji]: Math.max(0, (c.reacoes[emoji] ?? 0) + (ja ? -1 : 1)) }, minhasReacoes: ja ? c.minhasReacoes.filter(e => e !== emoji) : [...c.minhasReacoes, emoji] };
    }));
    setDetalhe(prev => {
      if (!prev || prev.id !== id) return prev;
      const ja = prev.minhasReacoes.includes(emoji);
      return { ...prev, reacoes: { ...prev.reacoes, [emoji]: Math.max(0, (prev.reacoes[emoji] ?? 0) + (ja ? -1 : 1)) }, minhasReacoes: ja ? prev.minhasReacoes.filter(e => e !== emoji) : [...prev.minhasReacoes, emoji] };
    });
  };

  const addComentario = (id: string, texto: string) => {
    const novo: Comentario = { id: crypto.randomUUID(), autor: "Mariana Souza", iniciais: "MS", texto, hora: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) };
    setLista(prev => prev.map(c => c.id !== id ? c : { ...c, comentarios: [...c.comentarios, novo] }));
    setDetalhe(prev => prev?.id === id ? { ...prev, comentarios: [...prev.comentarios, novo] } : prev);
  };

  const naoLidos = lista.filter(c => !c.lido).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingBottom: 40 }}>
      <PageHeader
        title="Comunicados"
        subtitle={naoLidos > 0 ? `${naoLidos} não lido${naoLidos !== 1 ? "s" : ""}` : "Você está em dia!"}
      />
      {lista.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#94A3B8", fontFamily: "'Urbanist',sans-serif", fontSize: 13 }}>Nenhum comunicado disponível.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {lista.map(c => (
            <PostCard key={c.id} c={c} onSelect={() => abrirDetalhe(c)} onReagir={emoji => reagir(c.id, emoji)} />
          ))}
        </div>
      )}
      {detalhe && (
        <DetalheModal c={detalhe} onClose={() => setDetalhe(null)} onReagir={emoji => reagir(detalhe.id, emoji)} onAddComentario={texto => addComentario(detalhe.id, texto)} />
      )}
    </div>
  );
}
