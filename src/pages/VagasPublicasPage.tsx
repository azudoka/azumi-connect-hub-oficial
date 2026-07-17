import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Search, Lock, Zap, Instagram, Linkedin, Globe, ExternalLink } from "lucide-react";
import capaVagas from "@/assets/brand/capa-vagas.png";
import {
  VAGAS_MOCK,
  MODALIDADE_LABEL,
  type VagaPublica,
} from "@/data/vagasPublicasMock";
import { listarVagasPublicadas, type VagaSupabase } from "@/services/vagasService";
import CandidaturaModal from "@/components/candidatura/CandidaturaModal";
import { AzumiLogo } from "@/components/brand/AzumiLogo";

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

  function scrollToList() {
    document.getElementById("vagas-lista")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ── HERO — capa existente, logo em destaque, botão central ── */}
      <section className="relative overflow-hidden" style={{ minHeight: 460 }}>
        <div className="absolute inset-0">
          <img src={capaVagas} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-brand-bg opacity-[0.94]" />
        <div className="absolute inset-0 bg-black/15" />

        {/* Topbar — logo com destaque + redes sociais */}
        <div className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <div className="rounded-xl bg-card/95 px-4 py-2.5 shadow-elevated backdrop-blur-sm">
            <AzumiLogo product="Connect" size={26} hideSubtitle />
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://www.instagram.com/azumirh/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram da Azumi RH"
              className="text-white/80 hover:text-white transition-colors"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="https://www.linkedin.com/company/azumirh"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn da Azumi RH"
              className="text-white/80 hover:text-white transition-colors"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a
              href="https://azumirh.com.br"
              target="_blank"
              rel="noreferrer"
              aria-label="Site da Azumi RH"
              className="text-white/80 hover:text-white transition-colors"
            >
              <Globe className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div className="relative z-10 mx-auto mt-6 max-w-4xl px-6 text-center text-white">
          <h1 className="font-display text-4xl font-bold sm:text-6xl leading-tight text-white">
            Encontre sua próxima{" "}
            <span className="font-black underline decoration-4 decoration-blue-400 underline-offset-4">oportunidade</span>{" "}
            de trabalho com a{" "}
            <span className="font-black underline decoration-4 decoration-blue-400 underline-offset-4">Azumi RH</span>.
          </h1>
          <p className="mt-3 font-sans text-white/75 text-lg">Vagas selecionadas pela nossa equipe especializada em RH</p>
        </div>

        {/* Botão central — igual ao "Conheça as vagas" da referência */}
        <div className="relative z-10 flex justify-center mt-8 pb-10">
          <button
            onClick={scrollToList}
            className="rounded-full bg-card px-8 py-3.5 font-sans text-sm font-semibold text-foreground shadow-elevated hover:brightness-95 transition-all inline-flex items-center gap-2"
          >
            Conheça as vagas <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* ── SOBRE A AZUMI ── */}
      <section className="mx-auto max-w-4xl px-6 py-16 text-center">
        <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Sobre a empresa
        </h2>
        <p className="font-display text-2xl sm:text-3xl font-bold text-foreground leading-snug">
          Conectamos <span className="text-primary">pessoas</span> e <span className="text-primary">empresas</span> de um jeito humano. 💙
        </p>
        <p className="mt-5 font-sans text-muted-foreground leading-relaxed">
          Somos a <strong>Azumi RH</strong>, uma consultoria que une <em>tecnologia</em> e{" "}
          <em>sensibilidade</em> para encontrar o match certo entre talentos e empresas.
          Acreditamos que recrutamento de verdade é sobre <strong>gente</strong>, não só sobre currículo.
        </p>
        <p className="mt-3 font-sans text-muted-foreground leading-relaxed">
          Valorizamos quem caminha com a gente — <strong>autonomia</strong>, <strong>cuidado</strong> e{" "}
          <em>transparência</em> guiam cada processo seletivo que conduzimos. ✨
        </p>
        <div className="mt-6 flex items-center justify-center gap-5">
          <a
            href="https://www.instagram.com/azumirh/"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram da Azumi RH"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <Instagram className="h-5 w-5" />
          </a>
          <a
            href="https://www.linkedin.com/company/azumirh"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn da Azumi RH"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <Linkedin className="h-5 w-5" />
          </a>
          <a
            href="https://azumirh.com.br"
            target="_blank"
            rel="noreferrer"
            aria-label="Site da Azumi RH"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <Globe className="h-5 w-5" />
          </a>
        </div>
      </section>

      {/* ── FILTROS ── */}
      <section className="mx-auto max-w-5xl px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block font-sans text-sm font-medium text-foreground mb-1.5">Nome da vaga</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Pesquisar pelo nome da vaga"
                className="w-full rounded-lg border border-border bg-card pl-9 pr-3 py-2.5 font-sans text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block font-sans text-sm font-medium text-foreground mb-1.5">Modelo de atuação</label>
            <select
              value={modalidade}
              onChange={(e) => setModalidade(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-3 py-2.5 font-sans text-sm text-foreground focus:border-primary focus:outline-none"
            >
              <option value="">Escolha uma opção</option>
              <option value="presencial">Presencial</option>
              <option value="remoto">Remoto</option>
              <option value="hibrido">Híbrido</option>
            </select>
          </div>
          <div>
            <label className="block font-sans text-sm font-medium text-foreground mb-1.5">Localização</label>
            <select
              value={nivel}
              onChange={(e) => setNivel(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-3 py-2.5 font-sans text-sm text-foreground focus:border-primary focus:outline-none"
            >
              <option value="">Escolha uma opção</option>
              <option value="estagio">Estágio</option>
              <option value="junior">Júnior</option>
              <option value="pleno">Pleno</option>
              <option value="senior">Sênior</option>
              <option value="especialista">Especialista</option>
            </select>
          </div>
        </div>
      </section>

      {/* ── LISTA — formato texto, linha por linha, igual à referência ── */}
      <section id="vagas-lista" className="mx-auto mt-10 max-w-5xl px-6 pb-16">
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
            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">Vagas</h2>
            <div className="space-y-3">
              {filtradas.map((v) => {
                const urgente = v.nivel_urgencia === "urgente";
                return (
                  <Link
                    key={v.id}
                    to={`/vagas/${v.id}`}
                    className="group flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-5 py-4 hover:border-primary/40 hover:shadow-card transition-all"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-sans font-semibold text-foreground">{v.titulo}</span>
                        {urgente && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-destructive">
                            <Zap className="h-3 w-3" /> Urgente
                          </span>
                        )}
                        {v.confidencial && <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                      </div>
                      <div className="mt-1 flex items-center gap-3 flex-wrap font-sans text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {v.local_trabalho}</span>
                        <span>·</span>
                        <span>{MODALIDADE_LABEL[v.modalidade] ?? v.modalidade}</span>
                      </div>
                    </div>
                    <svg className="h-5 w-5 text-muted-foreground shrink-0 group-hover:text-primary group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
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
