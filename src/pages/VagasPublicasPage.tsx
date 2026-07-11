import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Heart, MapPin, Clock, DollarSign, Search, Lock, Zap, Instagram, Linkedin, Globe, ExternalLink } from "lucide-react";
import capaVagas from "@/assets/brand/capa-vagas.png";
import {
  VAGAS_MOCK,
  NIVEL_LABEL,
  MODALIDADE_LABEL,
  CONTRATO_LABEL,
  formatSalario,
  diasAtras,
  type VagaPublica,
} from "@/data/vagasPublicasMock";
import { listarVagasPublicadas, type VagaSupabase } from "@/services/vagasService";
import CandidaturaModal from "@/components/candidatura/CandidaturaModal";
import { AzumiLogo } from "@/components/brand/AzumiLogo";
import { CategoryTag } from "@/components/CategoryTag";

function supabaseToPublica(r: VagaSupabase): VagaPublica {
  return {
    id: r.id,
    titulo: r.titulo,
    empresa: r.confidencial ? "Empresa confidencial" : r.empresa,
    logo: null,
    segmento: r.tipo ?? "—",
    nivel: r.nivel ?? "",
    modalidade: r.modalidade ?? "",
    tipo_contrato: r.tipo_contrato ?? "",
    salario_de: r.salario_de,
    salario_ate: r.salario_ate,
    salario_fixo: r.salario_fixo,
    confidencial: r.confidencial,
    tem_comissao: r.tem_comissao ?? false,
    local_trabalho: r.local_trabalho ?? "",
    carga_horaria: r.carga_horaria ?? "",
    turno: r.turno ?? "",
    nivel_urgencia: r.nivel_urgencia,
    descricao: r.descricao ?? "",
    created_at: r.criado_em,
  };
}

function Footer() {
  return (
    <footer className="mt-16 bg-[hsl(var(--ocean))] py-8 text-center font-sans text-sm text-white/70">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6">
        <div className="flex items-center gap-4">
          <a
            href="https://www.instagram.com/azumirh/"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram da Azumi RH"
            className="text-white/70 transition hover:text-white"
          >
            <Instagram className="h-5 w-5" />
          </a>
          <a
            href="https://www.linkedin.com/company/azumirh"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn da Azumi RH"
            className="text-white/70 transition hover:text-white"
          >
            <Linkedin className="h-5 w-5" />
          </a>
          <a
            href="https://azumirh.com.br"
            target="_blank"
            rel="noreferrer"
            aria-label="Site da Azumi RH"
            className="text-white/70 transition hover:text-white"
          >
            <Globe className="h-5 w-5" />
          </a>
        </div>
        <p>© 2026 Azumi RH · azumirh.com.br · contato@azumirh.com.br</p>
      </div>
    </footer>
  );
}

export default function VagasPublicasPage() {
  const [q, setQ] = useState("");
  const [modalidade, setModalidade] = useState("");
  const [nivel, setNivel] = useState("");
  const [contrato, setContrato] = useState("");
  const [favoritas, setFavoritas] = useState<Set<string>>(new Set());
  const [modalBanco, setModalBanco] = useState(false);
  const [vagasSupabase, setVagasSupabase] = useState<VagaPublica[]>([]);
  const [loadingPublicas, setLoadingPublicas] = useState(true);

  useEffect(() => {
    listarVagasPublicadas()
      .then((rows) => setVagasSupabase(rows.map(supabaseToPublica)))
      .catch(() => {})
      .finally(() => setLoadingPublicas(false));
  }, []);

  const todasVagas = vagasSupabase;

  const filtradas = useMemo(() => {
    return todasVagas.filter((v) => {
      if (q && !`${v.titulo} ${v.segmento}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (modalidade && v.modalidade !== modalidade) return false;
      if (nivel && v.nivel !== nivel) return false;
      if (contrato && v.tipo_contrato !== contrato) return false;
      return true;
    });
  }, [q, modalidade, nivel, contrato, todasVagas]);

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
    <div className="min-h-screen bg-background">
      {/* ── HERO — capa única contínua, logo dentro dela (sem faixa separada) ── */}
      <section className="relative overflow-hidden px-6 pb-24 pt-6" style={{ minHeight: 420 }}>
        <div className="absolute inset-0">
          <img src={capaVagas} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-brand-bg opacity-[0.94]" />
        <div className="absolute inset-0 bg-black/15" />

        <div className="relative z-10 mx-auto flex max-w-6xl items-center justify-between py-3">
          <AzumiLogo light product="Connect" size={28} hideSubtitle />
          <div className="flex items-center gap-3">
            <a
              href="https://www.instagram.com/azumirh/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram da Azumi RH"
              className="text-white/70 hover:text-white transition-colors"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="https://www.linkedin.com/company/azumirh"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn da Azumi RH"
              className="text-white/70 hover:text-white transition-colors"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a
              href="https://azumirh.com.br"
              target="_blank"
              rel="noreferrer"
              aria-label="Site da Azumi RH"
              className="text-white/70 hover:text-white transition-colors"
            >
              <Globe className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div className="relative z-10 mx-auto mt-10 max-w-5xl text-center text-white">
          <h1 className="font-display text-4xl font-bold sm:text-6xl leading-tight text-white">
            Encontre sua próxima{" "}
            <span className="font-black underline decoration-4 decoration-blue-400 underline-offset-4">oportunidade</span>{" "}
            de trabalho com a{" "}
            <span className="font-black underline decoration-4 decoration-blue-400 underline-offset-4">Azumi RH</span>.
          </h1>
          <p className="mt-3 font-sans text-white/75 text-lg">Vagas selecionadas pela nossa equipe especializada em RH</p>
        </div>

        <div className="relative z-10 mx-auto mt-8 max-w-4xl rounded-2xl bg-card p-3 shadow-elevated sm:p-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_180px_180px_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Qual vaga você procura?"
                className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3 font-sans text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <select
              value={modalidade}
              onChange={(e) => setModalidade(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2.5 font-sans text-sm text-foreground focus:border-primary focus:outline-none"
            >
              <option value="">Todas modalidades</option>
              <option value="presencial">Presencial</option>
              <option value="remoto">Remoto</option>
              <option value="hibrido">Híbrido</option>
            </select>
            <select
              value={nivel}
              onChange={(e) => setNivel(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2.5 font-sans text-sm text-foreground focus:border-primary focus:outline-none"
            >
              <option value="">Todos níveis</option>
              <option value="estagio">Estágio</option>
              <option value="junior">Júnior</option>
              <option value="pleno">Pleno</option>
              <option value="senior">Sênior</option>
              <option value="especialista">Especialista</option>
            </select>
            <button onClick={scrollToList} className="btn-primary justify-center">
              Buscar vagas
            </button>
          </div>
        </div>
      </section>

      {/* ── LISTA — fundo claro ── */}
      <section id="vagas-lista" className="mx-auto -mt-10 max-w-6xl px-6">
        {loadingPublicas && (
          <div className="flex justify-center gap-2 py-20 font-sans text-muted-foreground">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Carregando vagas…
          </div>
        )}
        {!loadingPublicas && vagasSupabase.length === 0 && (
          <div className="py-20 text-center font-sans text-muted-foreground">
            <p className="text-lg font-medium text-foreground">Nenhuma vaga disponível no momento.</p>
            <p className="mt-1 text-sm">Volte em breve — novas oportunidades chegam regularmente.</p>
          </div>
        )}
        {!loadingPublicas && vagasSupabase.length > 0 && (
          <>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-display text-lg font-semibold text-foreground">
                {filtradas.length} vagas encontradas
              </h2>
              <select
                value={contrato}
                onChange={(e) => setContrato(e.target.value)}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 font-sans text-sm text-foreground sm:w-auto"
              >
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
                  <article
                    key={v.id}
                    className="card-hover relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card"
                  >
                    {urgente && (
                      <div className="absolute right-4 top-0 z-10 flex items-center gap-1 rounded-b-lg bg-destructive px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-wide text-destructive-foreground">
                        <Zap className="h-3 w-3" /> Urgente
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate font-display font-semibold text-foreground">{v.titulo}</h3>
                          <p className="flex items-center gap-1 truncate font-sans text-sm text-muted-foreground">
                            {v.confidencial && <Lock className="h-3 w-3 shrink-0" />}
                            {v.empresa}
                          </p>
                        </div>
                        <button
                          onClick={() => toggleFav(v.id)}
                          aria-label="Salvar"
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Heart className={`h-5 w-5 ${fav ? "fill-destructive text-destructive" : ""}`} />
                        </button>
                      </div>

                      <div className="mt-3 space-y-1.5 font-sans text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5" /> {v.local_trabalho}
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-3.5 w-3.5" />{" "}
                          {formatSalario(v.salario_de, v.salario_ate, v.salario_fixo)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5" /> {v.carga_horaria}
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <CategoryTag categoria="modalidade">
                          {MODALIDADE_LABEL[v.modalidade] ?? v.modalidade}
                        </CategoryTag>
                        <CategoryTag categoria="nivel">
                          {NIVEL_LABEL[v.nivel] ?? v.nivel}
                        </CategoryTag>
                        <CategoryTag categoria="contrato">
                          {CONTRATO_LABEL[v.tipo_contrato] ?? v.tipo_contrato}
                        </CategoryTag>
                        {v.tem_comissao && (
                          <span className="rounded-full border border-success/30 bg-success/10 px-2 py-0.5 font-sans text-xs font-medium text-success">
                            + Comissão
                          </span>
                        )}
                      </div>

                      {v.descricao && (
                        <p className="mt-3 line-clamp-2 font-sans text-sm text-muted-foreground">
                          {v.descricao}
                        </p>
                      )}

                      <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
                        <span className="font-sans text-xs text-muted-foreground">{diasAtras(v.created_at)}</span>
                        <Link
                          to={`/vagas/${v.id}`}
                          className="btn-outline-brand !px-4 !py-2 !text-xs"
                        >
                          Ver detalhes
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {filtradas.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center font-sans text-muted-foreground">
                Nenhuma vaga encontrada com esses filtros.
              </div>
            )}
          </>
        )}
      </section>

      {/* Banco de talentos */}
      <section className="mx-auto mt-14 max-w-6xl px-6">
        <div className="overflow-hidden rounded-2xl border border-border bg-accent p-8 sm:p-10">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="font-display text-xl font-semibold text-foreground">
                Não encontrou a vaga ideal?
              </h3>
              <p className="mt-1 font-sans text-sm text-muted-foreground">
                Cadastre seu currículo em nosso banco de talentos e receba oportunidades alinhadas ao seu perfil.
              </p>
            </div>
            <button onClick={() => setModalBanco(true)} className="btn-outline-brand w-full sm:w-auto">
              Cadastrar no banco de talentos
            </button>
          </div>
        </div>
      </section>

      <Footer />

      <CandidaturaModal open={modalBanco} onClose={() => setModalBanco(false)} modo="banco" />
    </div>
  );
}
