import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Building2, MapPin, Clock, DollarSign, Briefcase, GraduationCap, Sun, FileText, Upload, ArrowLeft } from "lucide-react";
import {
  VAGAS_MOCK,
  NIVEL_LABEL,
  MODALIDADE_LABEL,
  CONTRATO_LABEL,
  TURNO_LABEL,
  formatSalario,
} from "@/data/vagasPublicasMock";

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
  const vaga = VAGAS_MOCK.find((v) => v.id === id);

  const [form, setForm] = useState({ nome: "", email: "", telefone: "", linkedin: "", arquivo: null as File | null, mensagem: "" });
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");

  if (!vaga) return <NotFound />;

  const urgente = vaga.nivel_urgencia === "urgente";

  const detalhes: Detalhe[] = [
    { icon: MapPin, label: "Local", value: vaga.local_trabalho },
    { icon: Briefcase, label: "Modalidade", value: MODALIDADE_LABEL[vaga.modalidade] ?? vaga.modalidade },
    { icon: FileText, label: "Contrato", value: CONTRATO_LABEL[vaga.tipo_contrato] ?? vaga.tipo_contrato },
    { icon: GraduationCap, label: "Nível", value: NIVEL_LABEL[vaga.nivel] ?? vaga.nivel },
    { icon: Clock, label: "Carga horária", value: vaga.carga_horaria },
    { icon: Sun, label: "Turno", value: TURNO_LABEL[vaga.turno] ?? vaga.turno },
    { icon: DollarSign, label: "Salário", value: formatSalario(vaga.salario_de, vaga.salario_ate) },
  ].filter((d) => !!d.value);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome || !form.email || !form.arquivo) {
      setErro("Preencha nome, email e currículo.");
      return;
    }
    setErro("");
    setEnviado(true);
  }

  return (
    <div style={{ background: "#F5F7FA", minHeight: "100vh" }}>
      <Header />

      <div className="mx-auto max-w-[1000px] px-6 py-8">
        <Link to="/vagas" className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> Voltar para vagas
        </Link>

        <div className="mt-5 flex flex-col gap-6 lg:flex-row">
          {/* Principal */}
          <main className="min-w-0 flex-1 space-y-5">
            {urgente && (
              <div className="rounded-lg bg-orange-100 px-4 py-3 text-sm font-medium text-orange-800">
                ⚡ Vaga urgente — candidate-se o quanto antes
              </div>
            )}

            <div className="rounded-xl border border-slate-200 bg-white p-6">
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
            </div>

            {vaga.descricao && (
              <section className="rounded-xl border border-slate-200 bg-white p-6">
                <h2 className="mb-3 text-lg font-semibold text-slate-900">Sobre a vaga</h2>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{vaga.descricao}</p>
              </section>
            )}

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
          </main>

          {/* Lateral */}
          <aside className="w-full lg:w-[320px] lg:shrink-0">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:sticky lg:top-20">
              <div className="px-5 py-4 text-white" style={{ background: BLUE }}>
                <h3 className="text-base font-semibold">Candidatar-se</h3>
                {(vaga.salario_de || vaga.salario_ate) && (
                  <p className="mt-0.5 text-sm text-white/90">{formatSalario(vaga.salario_de, vaga.salario_ate)}</p>
                )}
              </div>

              {enviado ? (
                <div className="p-6 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 text-2xl">✓</div>
                  <p className="font-semibold text-slate-800">Candidatura enviada!</p>
                  <p className="mt-1 text-sm text-slate-600">Entraremos em contato em breve.</p>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-3 p-5">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">Nome completo *</label>
                    <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">Email *</label>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">Telefone</label>
                    <input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">LinkedIn</label>
                    <input value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">Currículo *</label>
                    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2.5 text-xs text-slate-600 hover:bg-slate-50">
                      <Upload className="h-4 w-4" />
                      <span className="truncate">{form.arquivo?.name ?? "PDF, DOC, DOCX — máx 5MB"}</span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0] ?? null;
                          if (f && f.size > 5 * 1024 * 1024) {
                            setErro("Arquivo maior que 5MB");
                            return;
                          }
                          setForm({ ...form, arquivo: f });
                        }}
                      />
                    </label>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">Mensagem (opcional)</label>
                    <textarea
                      maxLength={500}
                      rows={3}
                      value={form.mensagem}
                      onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
                    />
                    <p className="mt-1 text-right text-[10px] text-slate-400">{form.mensagem.length}/500</p>
                  </div>

                  {erro && <p className="text-xs text-red-600">{erro}</p>}

                  <button type="submit" className="h-12 w-full rounded-lg text-sm font-semibold text-white" style={{ background: BLUE }}>
                    Enviar candidatura →
                  </button>
                  <p className="text-center text-[11px] text-slate-500">
                    Ao candidatar-se, seus dados serão enviados à Azumi RH.
                  </p>
                </form>
              )}
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}
