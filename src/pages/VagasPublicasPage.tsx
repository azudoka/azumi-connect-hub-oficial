import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Heart, MapPin, Clock, DollarSign, Search, X, Upload } from "lucide-react";
import {
  VAGAS_MOCK,
  NIVEL_LABEL,
  MODALIDADE_LABEL,
  CONTRATO_LABEL,
  formatSalario,
  diasAtras,
} from "@/data/vagasPublicasMock";

const NAVY = "#031D38";
const BLUE = "#034C8B";

function Header() {
  return (
    <header
      className="sticky top-0 z-30 w-full"
      style={{ background: NAVY }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div
          className="text-xl font-semibold tracking-tight"
          style={{ fontFamily: "Poppins, Urbanist, system-ui, sans-serif" }}
        >
          <span className="text-white">azumi </span>
          <span style={{ color: "#93C5FD" }}>RH</span>
        </div>
        <a
          href="https://azumirh.com.br"
          target="_blank"
          rel="noreferrer"
          className="text-sm text-white/80 hover:text-white"
        >
          azumirh.com.br
        </a>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer style={{ background: NAVY }} className="mt-16 py-6 text-center text-sm text-white/70">
      © 2026 Azumi RH · azumirh.com.br · contato@azumirh.com.br
    </footer>
  );
}

function BancoTalentosModal({ onClose }: { onClose: () => void }) {
  const [enviado, setEnviado] = useState(false);
  const [form, setForm] = useState({ nome: "", email: "", telefone: "", area: "", arquivo: null as File | null });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome || !form.email || !form.arquivo) return;
    setEnviado(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between rounded-t-xl px-6 py-4 text-white" style={{ background: BLUE }}>
          <h3 className="text-lg font-semibold">Banco de Talentos</h3>
          <button onClick={onClose} aria-label="Fechar"><X className="h-5 w-5" /></button>
        </div>
        {enviado ? (
          <div className="p-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 text-2xl">✓</div>
            <p className="font-semibold text-slate-800">Cadastro enviado!</p>
            <p className="mt-1 text-sm text-slate-600">Entraremos em contato quando surgir uma oportunidade.</p>
            <button onClick={onClose} className="mt-5 rounded-lg px-4 py-2 text-white" style={{ background: BLUE }}>Fechar</button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4 p-6">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Nome *</label>
              <input required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email *</label>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Telefone</label>
              <input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Área de interesse</label>
              <input value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Currículo *</label>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-3 text-sm text-slate-600 hover:bg-slate-50">
                <Upload className="h-4 w-4" />
                <span className="truncate">{form.arquivo?.name ?? "Selecionar arquivo (PDF, DOC)"}</span>
                <input required type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => setForm({ ...form, arquivo: e.target.files?.[0] ?? null })} />
              </label>
            </div>
            <button type="submit" className="w-full rounded-lg py-2.5 text-sm font-medium text-white" style={{ background: BLUE }}>
              Enviar cadastro
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function VagasPublicasPage() {
  const [q, setQ] = useState("");
  const [modalidade, setModalidade] = useState("");
  const [nivel, setNivel] = useState("");
  const [contrato, setContrato] = useState("");
  const [favoritas, setFavoritas] = useState<Set<string>>(new Set());
  const [modalBanco, setModalBanco] = useState(false);

  const filtradas = useMemo(() => {
    return VAGAS_MOCK.filter((v) => {
      if (q && !`${v.titulo} ${v.segmento}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (modalidade && v.modalidade !== modalidade) return false;
      if (nivel && v.nivel !== nivel) return false;
      if (contrato && v.tipo_contrato !== contrato) return false;
      return true;
    });
  }, [q, modalidade, nivel, contrato]);

  function toggleFav(id: string) {
    setFavoritas((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  function scrollToList() {
    document.getElementById("vagas-lista")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div style={{ background: "#F5F7FA", minHeight: "100vh" }}>
      <Header />

      {/* Hero */}
      <section
        className="relative px-6 pb-24 pt-14"
        style={{ background: `linear-gradient(135deg, ${NAVY}, ${BLUE})`, minHeight: 320 }}
      >
        <div className="mx-auto max-w-5xl text-center text-white">
          <h1 className="text-3xl font-semibold sm:text-4xl">Encontre sua próxima oportunidade</h1>
          <p className="mt-2 text-white/80">Vagas selecionadas pela Azumi RH</p>
        </div>

        <div className="mx-auto mt-8 max-w-4xl rounded-xl bg-white p-3 shadow-xl sm:p-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_180px_180px_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Qual vaga você procura?"
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm focus:border-slate-400 focus:outline-none"
              />
            </div>
            <select value={modalidade} onChange={(e) => setModalidade(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-slate-400 focus:outline-none">
              <option value="">Todas modalidades</option>
              <option value="presencial">Presencial</option>
              <option value="remoto">Remoto</option>
              <option value="hibrido">Híbrido</option>
            </select>
            <select value={nivel} onChange={(e) => setNivel(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-slate-400 focus:outline-none">
              <option value="">Todos níveis</option>
              <option value="estagio">Estágio</option>
              <option value="junior">Júnior</option>
              <option value="pleno">Pleno</option>
              <option value="senior">Sênior</option>
              <option value="especialista">Especialista</option>
            </select>
            <button onClick={scrollToList} className="rounded-lg px-5 py-2.5 text-sm font-medium text-white" style={{ background: BLUE }}>
              Buscar vagas
            </button>
          </div>
        </div>
      </section>

      {/* Lista */}
      <section id="vagas-lista" className="mx-auto -mt-10 max-w-6xl px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-800">{filtradas.length} vagas encontradas</h2>
          <select value={contrato} onChange={(e) => setContrato(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
            <option value="">Todos contratos</option>
            <option value="clt">CLT</option>
            <option value="pj">PJ</option>
            <option value="estagio">Estágio</option>
            <option value="temporario">Temporário</option>
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtradas.map((v) => {
            const urgente = v.nivel_urgencia === "urgente";
            const fav = favoritas.has(v.id);
            return (
              <article key={v.id} className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md flex flex-col">
                {urgente && <div className="h-1 w-full bg-red-500" />}
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold text-slate-900">{v.titulo}</h3>
                      <p className="truncate text-sm text-slate-500">{v.empresa}</p>
                    </div>
                    <button onClick={() => toggleFav(v.id)} aria-label="Salvar" className="text-slate-400 hover:text-red-500">
                      <Heart className={`h-5 w-5 ${fav ? "fill-red-500 text-red-500" : ""}`} />
                    </button>
                  </div>

                  <div className="mt-3 space-y-1.5 text-sm text-slate-600">
                    <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-slate-400" /> {v.local_trabalho}</div>
                    <div className="flex items-center gap-2"><DollarSign className="h-3.5 w-3.5 text-slate-400" /> {formatSalario(v.salario_de, v.salario_ate)}</div>
                    <div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-slate-400" /> {v.carga_horaria}</div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">{MODALIDADE_LABEL[v.modalidade] ?? v.modalidade}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">{NIVEL_LABEL[v.nivel] ?? v.nivel}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">{CONTRATO_LABEL[v.tipo_contrato] ?? v.tipo_contrato}</span>
                    {urgente && <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Urgente</span>}
                    {v.tem_comissao && <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">+ Comissão</span>}
                  </div>

                  {v.descricao && (
                    <p className="mt-3 text-sm text-slate-600 line-clamp-2">{v.descricao}</p>
                  )}

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
                    <span className="text-slate-400">{diasAtras(v.created_at)}</span>
                    <Link to={`/vagas/${v.id}`} className="font-medium" style={{ color: BLUE }}>
                      Ver detalhes →
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {filtradas.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
            Nenhuma vaga encontrada com esses filtros.
          </div>
        )}
      </section>

      {/* Banco de talentos */}
      <section className="mx-auto mt-14 max-w-6xl px-6">
        <div
          className="overflow-hidden rounded-2xl p-8 text-white sm:p-10"
          style={{ background: `linear-gradient(135deg, ${NAVY}, ${BLUE})` }}
        >
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-xl font-semibold">Não encontrou a vaga ideal?</h3>
              <p className="mt-1 text-white/80">Cadastre seu currículo em nosso banco de talentos.</p>
            </div>
            <button onClick={() => setModalBanco(true)} className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold" style={{ color: NAVY }}>
              Banco de talentos
            </button>
          </div>
        </div>
      </section>

      <Footer />

      {modalBanco && <BancoTalentosModal onClose={() => setModalBanco(false)} />}
    </div>
  );
}
