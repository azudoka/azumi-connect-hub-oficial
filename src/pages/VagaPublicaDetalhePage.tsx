import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Building2, MapPin, Clock, DollarSign, Briefcase, GraduationCap, Sun, FileText, ArrowLeft } from "lucide-react";
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

const NAVY = "#031D38";
const BLUE = "#034C8B";

function Header() {
  return (
    <header className="sticky top-0 z-30 w-full" style={{ background: NAVY }}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          to="/vagas"
          className="text-xl font-semibold tracking-tight"
          style={{ fontFamily: "Poppins, Urbanist, system-ui, sans-serif" }}
        >
          <span className="text-white">azumi </span>
          <span style={{ color: "#93C5FD" }}>RH</span>
        </Link>
        <a href="https://azumirh.com.br" target="_blank" rel="noreferrer" className="text-sm text-white/80 hover:text-white">
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

function NotFound() {
  return (
    <div style={{ background: "#F5F7FA", minHeight: "100vh" }}>
      <Header />
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="text-2xl font-semibold text-slate-800">Vaga não encontrada</h1>
        <p className="mt-2 text-slate-600">Esta vaga pode ter sido encerrada ou removida.</p>
        <Link to="/vagas" className="mt-6 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white" style={{ background: BLUE }}>
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
      <div style={{ background: "#F5F7FA", minHeight: "100vh" }}>
        <Header />
        <div className="mx-auto max-w-md px-6 py-24 text-center text-slate-500">Carregando…</div>
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
    <div style={{ background: "#F5F7FA", minHeight: "100vh" }}>
      <Header />

      <div className="mx-auto max-w-[1000px] px-6 py-8">
        <Link to="/vagas" className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> Voltar para vagas
        </Link>

        <div className="mt-5 space-y-5">
          {urgente && (
            <div className="rounded-lg bg-orange-100 px-4 py-3 text-sm font-medium text-orange-800">
              ⚡ Vaga urgente — candidate-se o quanto antes
            </div>
          )}

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                  <Building2 className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-slate-500">{vaga.empresa}</p>
                  <h1 className="text-2xl font-semibold text-slate-900">{vaga.titulo}</h1>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">{MODALIDADE_LABEL[vaga.modalidade] ?? vaga.modalidade}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">{NIVEL_LABEL[vaga.nivel] ?? vaga.nivel}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">{CONTRATO_LABEL[vaga.tipo_contrato] ?? vaga.tipo_contrato}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(true)}
                className="h-12 shrink-0 rounded-lg px-6 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
                style={{ background: BLUE }}
              >
                Quero me candidatar →
              </button>
            </div>
          </div>

          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Detalhes da vaga</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {detalhes.map((d) => (
                <div key={d.label} className="flex items-start gap-3">
                  <d.icon className="mt-0.5 h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">{d.label}</p>
                    <p className="text-sm font-medium text-slate-800">{d.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {vaga.beneficios && vaga.beneficios.split(",").map((b) => b.trim()).filter(Boolean).length > 0 && (
            <section className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="mb-3 text-lg font-semibold text-slate-900">Benefícios</h2>
              <div className="flex flex-wrap gap-2">
                {vaga.beneficios.split(",").map((b) => b.trim()).filter(Boolean).map((b) => (
                  <span key={b} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700">{b}</span>
                ))}
              </div>
            </section>
          )}

          {vaga.descricao && (
            <section className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="mb-3 text-lg font-semibold text-slate-900">Sobre a vaga</h2>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{vaga.descricao}</p>
            </section>
          )}

          {/* CTA banco de talentos */}
          <div
            className="rounded-xl px-6 py-12 text-center text-white"
            style={{ background: NAVY }}
          >
            <h3 className="text-2xl font-semibold">Não encontrou a vaga ideal?</h3>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/80">
              Cadastre-se no nosso banco de talentos e entraremos em contato quando surgir uma oportunidade para o seu perfil.
            </p>
            <button
              onClick={() => setModalBanco(true)}
              className="mt-6 h-12 rounded-lg bg-white px-8 text-sm font-semibold shadow-sm transition hover:bg-white/90"
              style={{ color: BLUE }}
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
