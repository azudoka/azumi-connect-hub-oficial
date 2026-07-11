import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Building2, MapPin, Clock, DollarSign, Briefcase, GraduationCap, Sun, FileText, ArrowLeft, Zap, Lock, Instagram, Linkedin, Globe } from "lucide-react";
import {
  VAGAS_MOCK,
  NIVEL_LABEL,
  MODALIDADE_LABEL,
  CONTRATO_LABEL,
  TURNO_LABEL,
  formatSalario,
  type VagaPublica,
} from "@/data/vagasPublicasMock";
import { getVaga } from "@/services/vagasService";
import CandidaturaModal from "@/components/candidatura/CandidaturaModal";
import { AzumiLogo } from "@/components/brand/AzumiLogo";
import { CategoryTag } from "@/components/CategoryTag";

function Header() {
  return (
    <header className="sticky top-0 z-30 w-full bg-[hsl(var(--ocean))]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/vagas">
          <AzumiLogo light product="Connect" size={20} hideSubtitle />
        </Link>
        <a
          href="https://azumirh.com.br"
          target="_blank"
          rel="noreferrer"
          className="font-sans text-sm text-white/80 hover:text-white"
        >
          azumirh.com.br
        </a>
      </div>
    </header>
  );
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

function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="font-display text-2xl font-semibold text-foreground">Vaga não encontrada</h1>
        <p className="mt-2 font-sans text-muted-foreground">Esta vaga pode ter sido encerrada ou removida.</p>
        <Link to="/vagas" className="btn-primary mt-6 inline-flex">
          <ArrowLeft className="h-4 w-4" /> Voltar para vagas
        </Link>
      </div>
      <Footer />
    </div>
  );
}

type Detalhe = { icon: React.ComponentType<{ className?: string }>; label: string; value: string | null };

export default function VagaPublicaDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const [vaga, setVaga] = useState<VagaPublica | null | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalBanco, setModalBanco] = useState(false);

  useEffect(() => {
    if (!id) { setVaga(null); return; }
    getVaga(id).then((r) => {
      if (!r) { setVaga(null); return; }
      setVaga({
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
        beneficios: (r.beneficios ?? []).join(","),
        created_at: r.criado_em,
      });
    }).catch(() => setVaga(null));
  }, [id]);

  if (vaga === undefined) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-md px-6 py-24 text-center font-sans text-muted-foreground">Carregando…</div>
        <Footer />
      </div>
    );
  }

  if (!vaga) return <NotFound />;

  const urgente = vaga.nivel_urgencia === "urgente";

  const detalhes: Detalhe[] = [
    { icon: MapPin, label: "Local", value: vaga.local_trabalho },
    { icon: Briefcase, label: "Modalidade", value: MODALIDADE_LABEL[vaga.modalidade] ?? vaga.modalidade },
    { icon: FileText, label: "Contrato", value: CONTRATO_LABEL[vaga.tipo_contrato] ?? vaga.tipo_contrato },
    { icon: GraduationCap, label: "Nível", value: NIVEL_LABEL[vaga.nivel] ?? vaga.nivel },
    { icon: Clock, label: "Carga horária", value: vaga.carga_horaria },
    { icon: Sun, label: "Turno", value: TURNO_LABEL[vaga.turno] ?? vaga.turno },
    { icon: DollarSign, label: "Salário", value: formatSalario(vaga.salario_de, vaga.salario_ate, vaga.salario_fixo) },
  ].filter((d) => !!d.value);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="mx-auto max-w-[1000px] px-6 py-8">
        <Link to="/vagas" className="inline-flex items-center gap-1.5 font-sans text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Voltar para vagas
        </Link>

        <div className="mt-5 space-y-5">
          {urgente && (
            <div className="flex items-center gap-2 rounded-lg bg-[hsl(var(--warning)/0.15)] px-4 py-3 font-sans text-sm font-medium text-[hsl(var(--warning))]">
              <Zap className="h-4 w-4 shrink-0" /> Vaga urgente — candidate-se o quanto antes
            </div>
          )}

          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Building2 className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 font-sans text-sm text-muted-foreground">
                    {vaga.confidencial && <Lock className="h-3 w-3 shrink-0" />}
                    {vaga.empresa}
                  </p>
                  <h1 className="font-display text-2xl font-semibold text-foreground">{vaga.titulo}</h1>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <CategoryTag categoria="modalidade">
                      {MODALIDADE_LABEL[vaga.modalidade] ?? vaga.modalidade}
                    </CategoryTag>
                    <CategoryTag categoria="nivel">
                      {NIVEL_LABEL[vaga.nivel] ?? vaga.nivel}
                    </CategoryTag>
                    <CategoryTag categoria="contrato">
                      {CONTRATO_LABEL[vaga.tipo_contrato] ?? vaga.tipo_contrato}
                    </CategoryTag>
                  </div>
                </div>
              </div>
              <button onClick={() => setModalOpen(true)} className="btn-primary w-full shrink-0 justify-center sm:w-auto">
                Quero me candidatar →
              </button>
            </div>
          </div>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="mb-4 font-display text-lg font-semibold text-foreground">Detalhes da vaga</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {detalhes.map((d) => (
                <div key={d.label} className="flex items-start gap-3">
                  <d.icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-sans text-xs uppercase tracking-wide text-muted-foreground">{d.label}</p>
                    <p className="font-sans text-sm font-medium text-foreground">{d.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {vaga.beneficios && vaga.beneficios.split(",").map((b) => b.trim()).filter(Boolean).length > 0 && (
            <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <h2 className="mb-3 font-display text-lg font-semibold text-foreground">Benefícios</h2>
              <div className="flex flex-wrap gap-2">
                {vaga.beneficios.split(",").map((b) => b.trim()).filter(Boolean).map((b) => (
                  <span key={b} className="rounded-full border border-border bg-muted px-3 py-1 font-sans text-xs text-foreground">
                    {b}
                  </span>
                ))}
              </div>
            </section>
          )}

          {vaga.descricao && (
            <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <h2 className="mb-3 font-display text-lg font-semibold text-foreground">Sobre a vaga</h2>
              <p className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/85">{vaga.descricao}</p>
            </section>
          )}

          {/* CTA banco de talentos */}
          <div className="brand-gradient-bg rounded-2xl px-6 py-12 text-center text-white">
            <h3 className="font-display text-2xl font-semibold">Não encontrou a vaga ideal?</h3>
            <p className="mx-auto mt-3 max-w-xl font-sans text-sm text-white/80">
              Cadastre-se no nosso banco de talentos e entraremos em contato quando surgir uma oportunidade para o seu perfil.
            </p>
            <button
              onClick={() => setModalBanco(true)}
              className="mt-6 inline-flex h-12 items-center rounded-full bg-white px-8 font-sans text-sm font-semibold text-primary shadow-card transition hover:bg-white/90"
            >
              Quero entrar no banco de talentos →
            </button>
          </div>
        </div>
      </div>

      <Footer />

      <CandidaturaModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        modo="vaga"
        vagaId={vaga.id}
        vagaTitulo={vaga.titulo}
      />
      <CandidaturaModal
        open={modalBanco}
        onClose={() => setModalBanco(false)}
        modo="banco"
      />
    </div>
  );
}
