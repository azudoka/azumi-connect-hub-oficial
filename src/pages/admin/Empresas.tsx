import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Search, Building2, X, ChevronDown } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

// ── Constantes ─────────────────────────────────────────────────────

const HORAS_POR_PLANO: Record<string, number> = {
  start: 15,
  ongoing: 25,
  growth: 40,
};

const LIMITE_FRENTES: Record<string, number> = {
  start: 2,
  ongoing: 3,
  growth: 5,
};

const FRENTES_HRAAS = [
  { key: "recrutamento",   label: "Recrutamento & Seleção" },
  { key: "onboarding",     label: "Onboarding" },
  { key: "processos_rh",   label: "Processos de RH" },
  { key: "compliance",     label: "Compliance" },
  { key: "cargos_sal",     label: "Cargos e Salários" },
  { key: "people_analytics", label: "People Analytics" },
  { key: "treinamento",    label: "Treinamento & Desenvolvimento" },
  { key: "beneficios",     label: "Benefícios" },
];

const MODULOS_GTM: Record<string, string[]> = {
  essencial: ["Diagnóstico comercial", "Pitch deck", "Mapeamento de mercado"],
  completo:  ["Diagnóstico comercial", "Pitch deck", "Mapeamento de mercado", "Estratégia de entrada", "Playbook de vendas", "Treinamento do time"],
};

type CompanyRow = {
  id: string;
  name: string;
  status: string;
  service_type: string;
  plan: string | null;
  logo_url: string | null;
};

type ConsultorRow = { id: string; full_name: string };

// ── Helpers ────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{children}</Label>;
}

function Section({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground border-b border-border pb-1">{titulo}</p>
      {children}
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────────

export default function Empresas() {
  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);

  // Modal
  const [novaOpen, setNovaOpen] = useState(false);
  const [salvando, setSalvando] = useState(false);

  // Tipo de serviço
  const [tipoServico, setTipoServico] = useState<"hraas" | "gotomarket">("hraas");

  // Campos comuns
  const [nomeEmpresa, setNomeEmpresa] = useState("");
  const [emailEmpresa, setEmailEmpresa] = useState("");
  const [statusEmpresa, setStatusEmpresa] = useState<"active" | "inactive">("active");

  // HRaaS
  const [planoSelecionado, setPlanoSelecionado] = useState<"start" | "ongoing" | "growth">("ongoing");
  const [horasManual, setHorasManual] = useState<number | "">("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploadandoLogo, setUploadandoLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [possuiFiliais, setPossuiFiliais] = useState(false);
  const [filiais, setFiliais] = useState<string[]>([""]);
  const [frentesSelecionadas, setFrentesSelecionadas] = useState<string[]>([]);

  // Go to Market
  const [pacoteGtm, setPacoteGtm] = useState<"essencial" | "completo">("essencial");
  const [consultorId, setConsultorId] = useState("");
  const [consultores, setConsultores] = useState<ConsultorRow[]>([]);

  // ── Carregar empresas ──────────────────────────────────────────

  async function carregarEmpresas() {
    setCarregando(true);
    const { data } = await supabase
      .from("companies")
      .select("id, name, status, service_type, plan, logo_url")
      .order("name");
    setCompanies((data ?? []) as CompanyRow[]);
    setCarregando(false);
  }

  useEffect(() => { carregarEmpresas(); }, []);

  // ── Carregar consultores (para GTM) ───────────────────────────

  useEffect(() => {
    if (!novaOpen || tipoServico !== "gotomarket") return;
    supabase
      .from("users_profile")
      .select("id, full_name")
      .in("role", ["azumi_admin", "azumi_consultor", "admin", "consultor"])
      .order("full_name")
      .then(({ data }) => setConsultores((data ?? []) as ConsultorRow[]));
  }, [novaOpen, tipoServico]);

  // ── Upload logo ────────────────────────────────────────────────

  async function handleUploadLogo(file: File) {
    setUploadandoLogo(true);
    try {
      const ext = file.name.split(".").pop() ?? "png";
      const path = `logos/empresa_${Date.now()}.${ext}`;
      const { data: upData, error } = await supabase.storage
        .from("public-applications")
        .upload(path, file, { upsert: false });
      if (error) throw error;
      const { data: urlData } = supabase.storage
        .from("public-applications")
        .getPublicUrl(upData.path);
      setLogoUrl(urlData.publicUrl);
    } catch (e: any) {
      toast.error("Erro ao enviar logo: " + e.message);
    } finally {
      setUploadandoLogo(false);
    }
  }

  // ── Frentes ───────────────────────────────────────────────────

  function toggleFrente(key: string) {
    setFrentesSelecionadas((prev) => {
      if (prev.includes(key)) return prev.filter((k) => k !== key);
      if (prev.length >= LIMITE_FRENTES[planoSelecionado]) return prev;
      return [...prev, key];
    });
  }

  // ── Filiais ───────────────────────────────────────────────────

  function addFilial() { setFiliais((f) => [...f, ""]); }
  function setFilial(i: number, v: string) {
    setFiliais((f) => f.map((x, j) => (j === i ? v : x)));
  }
  function removeFilial(i: number) {
    setFiliais((f) => f.filter((_, j) => j !== i));
  }

  // ── Reset modal ───────────────────────────────────────────────

  function resetModal() {
    setTipoServico("hraas");
    setNomeEmpresa("");
    setEmailEmpresa("");
    setStatusEmpresa("active");
    setPlanoSelecionado("ongoing");
    setHorasManual("");
    setLogoUrl(null);
    setPossuiFiliais(false);
    setFiliais([""]);
    setFrentesSelecionadas([]);
    setPacoteGtm("essencial");
    setConsultorId("");
  }

  // ── Criar empresa ─────────────────────────────────────────────

  async function criarEmpresa() {
    if (!nomeEmpresa.trim()) { toast.error("Nome da empresa é obrigatório."); return; }
    if (tipoServico === "gotomarket" && !consultorId) {
      toast.error("Selecione o consultor responsável."); return;
    }
    setSalvando(true);

    const payload: Record<string, unknown> = {
      name: nomeEmpresa.trim(),
      email: emailEmpresa.trim() || null,
      status: statusEmpresa,
      service_type: tipoServico,
    };

    if (tipoServico === "hraas") {
      payload.plan = planoSelecionado;
      payload.monthly_hours = horasManual !== "" ? Number(horasManual) : HORAS_POR_PLANO[planoSelecionado];
      payload.logo_url = logoUrl;
      payload.has_branches = possuiFiliais;
      payload.branches = possuiFiliais
        ? filiais.filter(Boolean).map((nome) => ({ nome }))
        : [];
      payload.client_modules = frentesSelecionadas;
    } else {
      payload.gotomarket_enabled = true;
      payload.gotomarket_plan = pacoteGtm;
      payload.gotomarket_modules = MODULOS_GTM[pacoteGtm];
      payload.consultor_responsavel_id = consultorId;
    }

    const { error } = await supabase.from("companies").insert(payload as any);
    setSalvando(false);
    if (error) { toast.error("Erro ao criar empresa: " + error.message); return; }
    toast.success(`Empresa "${nomeEmpresa}" criada com sucesso.`);
    setNovaOpen(false);
    resetModal();
    carregarEmpresas();
  }

  // ── Lista ─────────────────────────────────────────────────────

  const filtradas = companies.filter((c) =>
    !busca || c.name.toLowerCase().includes(busca.toLowerCase())
  );

  // ── Render ────────────────────────────────────────────────────

  return (
    <div>
      <PageHeader
        title="Empresas"
        subtitle="Todos os clientes ativos da Azumi"
        actions={
          <button
            onClick={() => setNovaOpen(true)}
            className="h-9 px-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> Nova empresa
          </button>
        }
      />

      <div className="mb-4 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full h-9 pl-9 pr-3 rounded-lg bg-secondary border border-input focus:border-primary outline-none text-sm"
          placeholder="Buscar empresa…"
        />
      </div>

      {carregando ? (
        <div className="text-sm text-muted-foreground py-8 text-center">Carregando…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtradas.map((c) => (
            <Link
              key={c.id}
              to={`/app/empresas/${c.id}`}
              className="bg-card border border-border rounded-xl p-5 card-hover"
            >
              <div className="flex items-start justify-between gap-3">
                {c.logo_url ? (
                  <img src={c.logo_url} alt={c.name} className="h-11 w-11 rounded-lg object-contain bg-secondary p-1 shrink-0" />
                ) : (
                  <div className="h-11 w-11 rounded-lg bg-[image:linear-gradient(135deg,hsl(var(--primary)),hsl(var(--primary-glow)))] flex items-center justify-center text-white font-display font-semibold shrink-0">
                    {c.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                )}
                <StatusBadge status={c.status === "active" ? "ativa" : "inativa"} />
              </div>
              <h3 className="mt-3 font-display font-semibold">{c.name}</h3>
              <p className="text-xs text-muted-foreground">
                {c.service_type === "gotomarket" ? "Go to Market" : "HRaaS Service"}
                {c.plan ? ` · Plano ${c.plan.charAt(0).toUpperCase() + c.plan.slice(1)}` : ""}
              </p>
            </Link>
          ))}

          {!carregando && filtradas.length === 0 && (
            <div className="col-span-3 py-12 text-center text-sm text-muted-foreground">
              {busca ? "Nenhuma empresa encontrada." : "Nenhuma empresa cadastrada ainda."}
            </div>
          )}
        </div>
      )}

      {/* ── Modal Nova Empresa ─────────────────────────────────────────── */}
      {novaOpen && (
        <div
          className="fixed inset-0 z-[100] overflow-y-auto bg-[hsl(var(--background)/0.7)] backdrop-blur-sm animate-fade-in"
          onClick={() => { setNovaOpen(false); resetModal(); }}
        >
          <div className="flex min-h-full items-center justify-center p-4">
            <div
              className="relative w-full max-w-lg bg-background rounded-2xl shadow-elevated flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
            {/* Header */}
            <div className="sticky top-0 bg-background z-10 flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-display font-semibold text-foreground">Nova empresa</h2>
              <button
                onClick={() => { setNovaOpen(false); resetModal(); }}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-5">

              {/* Tipo de serviço */}
              <Section titulo="Tipo de serviço">
                <div className="grid grid-cols-2 gap-2">
                  {(["hraas", "gotomarket"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTipoServico(t)}
                      className={`h-10 rounded-lg border text-sm font-medium transition-colors ${
                        tipoServico === t
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {t === "hraas" ? "HRaaS Service" : "Go to Market"}
                    </button>
                  ))}
                </div>
              </Section>

              {/* Dados comuns */}
              <Section titulo="Dados da empresa">
                <div className="space-y-1.5">
                  <FieldLabel>Nome {tipoServico === "gotomarket" ? "(pessoa física ou empresa)" : ""} *</FieldLabel>
                  <Input
                    value={nomeEmpresa}
                    onChange={(e) => setNomeEmpresa(e.target.value)}
                    placeholder={tipoServico === "hraas" ? "Ex: Kentaki Foods" : "Ex: João da Silva"}
                  />
                </div>
                <div className="space-y-1.5">
                  <FieldLabel>E-mail</FieldLabel>
                  <Input
                    type="email"
                    value={emailEmpresa}
                    onChange={(e) => setEmailEmpresa(e.target.value)}
                    placeholder="contato@empresa.com.br"
                  />
                </div>
                <div className="space-y-1.5">
                  <FieldLabel>Status</FieldLabel>
                  <select
                    value={statusEmpresa}
                    onChange={(e) => setStatusEmpresa(e.target.value as "active" | "inactive")}
                    className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm"
                  >
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                  </select>
                </div>
              </Section>

              {/* ── HRaaS fields ── */}
              {tipoServico === "hraas" && (
                <>
                  <Section titulo="Plano e horas">
                    <div className="space-y-1.5">
                      <FieldLabel>Plano</FieldLabel>
                      <div className="grid grid-cols-3 gap-2">
                        {(["start", "ongoing", "growth"] as const).map((p) => (
                          <button
                            key={p}
                            onClick={() => {
                              setPlanoSelecionado(p);
                              setHorasManual("");
                              setFrentesSelecionadas((prev) =>
                                prev.slice(0, LIMITE_FRENTES[p])
                              );
                            }}
                            className={`h-10 rounded-lg border text-sm font-medium flex flex-col items-center justify-center leading-tight transition-colors ${
                              planoSelecionado === p
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border text-muted-foreground hover:border-primary/50"
                            }`}
                          >
                            <span className="capitalize">{p}</span>
                            <span className="text-[10px] opacity-70">{HORAS_POR_PLANO[p]}h/mês</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <FieldLabel>Horas mensais (ajuste pontual)</FieldLabel>
                      <Input
                        type="number"
                        min={1}
                        value={horasManual}
                        onChange={(e) => setHorasManual(e.target.value === "" ? "" : Number(e.target.value))}
                        placeholder={`Padrão: ${HORAS_POR_PLANO[planoSelecionado]}h`}
                      />
                    </div>
                  </Section>

                  <Section titulo="Logo da empresa">
                    <div className="flex items-center gap-3">
                      {logoUrl ? (
                        <div className="relative">
                          <img src={logoUrl} alt="Logo" className="h-14 w-14 rounded-lg object-contain bg-secondary p-1 border border-border" />
                          <button
                            onClick={() => setLogoUrl(null)}
                            className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <div
                          className="h-14 w-14 rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                          onClick={() => logoInputRef.current?.click()}
                        >
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <button
                          onClick={() => logoInputRef.current?.click()}
                          disabled={uploadandoLogo}
                          className="text-sm font-medium text-primary hover:underline disabled:opacity-50"
                        >
                          {uploadandoLogo ? "Enviando…" : logoUrl ? "Trocar logo" : "Enviar logo"}
                        </button>
                        <p className="text-xs text-muted-foreground">PNG, JPG ou SVG</p>
                      </div>
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleUploadLogo(f);
                          e.target.value = "";
                        }}
                      />
                    </div>
                  </Section>

                  <Section titulo="Filiais">
                    <div className="flex items-center justify-between">
                      <FieldLabel>Possui filiais?</FieldLabel>
                      <button
                        onClick={() => setPossuiFiliais((v) => !v)}
                        className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${
                          possuiFiliais ? "bg-primary" : "bg-secondary border border-border"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform mt-0.5 ${
                            possuiFiliais ? "translate-x-4" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </div>
                    {possuiFiliais && (
                      <div className="space-y-2">
                        {filiais.map((nome, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <Input
                              value={nome}
                              onChange={(e) => setFilial(i, e.target.value)}
                              placeholder={`Filial ${i + 1}`}
                              className="flex-1"
                            />
                            {filiais.length > 1 && (
                              <button
                                onClick={() => removeFilial(i)}
                                className="p-1.5 rounded text-muted-foreground hover:text-destructive"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={addFilial}
                          className="text-sm text-primary hover:underline"
                        >
                          + Adicionar filial
                        </button>
                      </div>
                    )}
                  </Section>

                  <Section titulo={`Frentes contratadas (máx. ${LIMITE_FRENTES[planoSelecionado]} no plano ${planoSelecionado})`}>
                    <div className="grid grid-cols-2 gap-2">
                      {FRENTES_HRAAS.map(({ key, label }) => {
                        const selecionada = frentesSelecionadas.includes(key);
                        const limite = frentesSelecionadas.length >= LIMITE_FRENTES[planoSelecionado];
                        const desabilitada = !selecionada && limite;
                        return (
                          <button
                            key={key}
                            disabled={desabilitada}
                            onClick={() => toggleFrente(key)}
                            title={desabilitada ? `Limite de ${LIMITE_FRENTES[planoSelecionado]} frentes para o plano ${planoSelecionado}` : undefined}
                            className={`h-9 rounded-lg border px-3 text-sm text-left transition-colors ${
                              selecionada
                                ? "border-primary bg-primary/10 text-primary font-medium"
                                : desabilitada
                                ? "border-border/50 text-muted-foreground/40 cursor-not-allowed"
                                : "border-border text-foreground hover:border-primary/50"
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {frentesSelecionadas.length} de {LIMITE_FRENTES[planoSelecionado]} selecionada(s)
                    </p>
                  </Section>
                </>
              )}

              {/* ── Go to Market fields ── */}
              {tipoServico === "gotomarket" && (
                <>
                  <Section titulo="Pacote">
                    <div className="grid grid-cols-2 gap-2">
                      {(["essencial", "completo"] as const).map((p) => (
                        <button
                          key={p}
                          onClick={() => setPacoteGtm(p)}
                          className={`h-10 rounded-lg border text-sm font-medium transition-colors ${
                            pacoteGtm === p
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:border-primary/50"
                          }`}
                        >
                          {p === "essencial" ? "Essencial" : "Completo"}
                        </button>
                      ))}
                    </div>
                    <div className="rounded-lg bg-secondary/50 border border-border p-3 space-y-1">
                      <p className="text-xs font-medium text-foreground mb-1">Entregáveis incluídos:</p>
                      {MODULOS_GTM[pacoteGtm].map((m) => (
                        <p key={m} className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" /> {m}
                        </p>
                      ))}
                    </div>
                  </Section>

                  <Section titulo="Consultor responsável">
                    <div className="space-y-1.5">
                      <FieldLabel>Consultor *</FieldLabel>
                      <select
                        value={consultorId}
                        onChange={(e) => setConsultorId(e.target.value)}
                        className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm"
                      >
                        <option value="">Selecionar consultor…</option>
                        {consultores.map((c) => (
                          <option key={c.id} value={c.id}>{c.full_name}</option>
                        ))}
                      </select>
                    </div>
                  </Section>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-background border-t border-border px-6 py-4 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => { setNovaOpen(false); resetModal(); }}
                disabled={salvando}
              >
                Cancelar
              </Button>
              <Button onClick={criarEmpresa} disabled={salvando || !nomeEmpresa.trim()}>
                {salvando ? "Criando…" : "Criar empresa"}
              </Button>
            </div>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}
