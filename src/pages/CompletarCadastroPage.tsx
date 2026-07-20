import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AzumiLogo } from "@/components/brand/AzumiLogo";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

const ESCOLARIDADES = [
  "Ensino Fundamental", "Ensino Médio", "Técnico/Tecnólogo",
  "Superior incompleto", "Superior completo", "Pós-graduação/MBA", "Mestrado/Doutorado",
];

interface CandidatoData {
  id: string;
  nome: string | null;
  email: string | null;
  telefone: string | null;
  cpf: string | null;
  escolaridade: string | null;
  linkedin: string | null;
  cidade: string | null;
  curriculo_url: string | null;
  job_solicitations?: { cargo: string | null; avulsa_empresa_nome: string | null } | null;
}

export default function CompletarCadastroPage() {
  const { token } = useParams<{ token: string }>();

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [concluido, setConcluido] = useState(false);
  const [cand, setCand] = useState<CandidatoData | null>(null);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");
  const [escolaridade, setEscolaridade] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [cidade, setCidade] = useState("");
  const [curriculo, setCurriculo] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!token) { setErro("Link inválido."); setCarregando(false); return; }
    (async () => {
      const { data, error } = await (supabase as any)
        .from("candidates")
        .select("id, nome, email, telefone, cpf, escolaridade, linkedin, cidade, curriculo_url, job_solicitations!candidates_job_id_fkey(cargo, avulsa_empresa_nome)")
        .eq("token_completar_cadastro", token)
        .maybeSingle();
      if (error || !data) { setErro("Link não encontrado ou já utilizado."); setCarregando(false); return; }
      setCand(data);
      setNome(data.nome ?? "");
      setEmail(data.email ?? "");
      setTelefone(data.telefone ?? "");
      setCpf(data.cpf ?? "");
      setEscolaridade(data.escolaridade ?? "");
      setLinkedin(data.linkedin ?? "");
      setCidade(data.cidade ?? "");
      setCarregando(false);
    })();
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!cand || !nome.trim()) return;
    setEnviando(true);
    try {
      const updates: Record<string, string | null> = {
        nome: nome.trim(),
        email: email.trim() || null,
        telefone: telefone.trim() || null,
        cpf: cpf.trim() || null,
        escolaridade: escolaridade || null,
        linkedin: linkedin.trim() || null,
        cidade: cidade.trim() || null,
        token_completar_cadastro: null,
      };

      if (curriculo) {
        const ext = curriculo.name.split(".").pop();
        const path = `${cand.id}/curriculo.${ext}`;
        const { error: errUp } = await supabase.storage.from("curriculos").upload(path, curriculo, { upsert: true });
        if (!errUp) {
          const { data: pub } = supabase.storage.from("curriculos").getPublicUrl(path);
          updates.curriculo_url = pub.publicUrl;
          updates.curriculo_nome = curriculo.name;
        }
      }

      const { error } = await (supabase as any).from("candidates").update(updates).eq("id", cand.id);
      if (error) throw error;
      setConcluido(true);
    } catch (err) {
      toast.error("Erro ao salvar: " + (err instanceof Error ? err.message : "tente novamente"));
    } finally {
      setEnviando(false);
    }
  }

  const empresa = cand?.job_solicitations?.avulsa_empresa_nome ?? "Azumi RH";
  const vaga = cand?.job_solicitations?.cargo ?? "vaga";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border px-6 py-4">
        <AzumiLogo className="h-7" />
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          {carregando && (
            <div className="flex flex-col items-center gap-3 text-muted-foreground py-20">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="text-sm">Carregando...</span>
            </div>
          )}

          {!carregando && erro && (
            <div className="flex flex-col items-center gap-3 text-center py-20">
              <XCircle className="h-10 w-10 text-destructive" />
              <p className="font-semibold text-lg">Link inválido</p>
              <p className="text-muted-foreground text-sm">{erro}</p>
            </div>
          )}

          {!carregando && concluido && (
            <div className="flex flex-col items-center gap-3 text-center py-20">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <p className="font-semibold text-xl">Cadastro concluído!</p>
              <p className="text-muted-foreground text-sm max-w-xs">
                Seu perfil foi enviado para a equipe da Azumi RH. Em breve entraremos em contato sobre a vaga de <strong>{vaga}</strong>.
              </p>
            </div>
          )}

          {!carregando && !erro && !concluido && cand && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <h1 className="text-xl font-semibold">Complete seu cadastro</h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Processo seletivo para <strong>{vaga}</strong> — {empresa}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-medium">Nome completo *</label>
                  <input required value={nome} onChange={(e) => setNome(e.target.value)} className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium">E-mail</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Telefone / WhatsApp</label>
                  <input value={telefone} onChange={(e) => setTelefone(e.target.value)} className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium">CPF</label>
                  <input value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="000.000.000-00" className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Cidade / Estado</label>
                  <input value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Ex: São Paulo / SP" className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Escolaridade</label>
                  <select value={escolaridade} onChange={(e) => setEscolaridade(e.target.value)} className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm">
                    <option value="">Selecione...</option>
                    {ESCOLARIDADES.map((e) => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium">LinkedIn (opcional)</label>
                  <input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="linkedin.com/in/..." className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm" />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-medium">Currículo {cand.curriculo_url ? "(novo arquivo substitui o atual)" : "(opcional)"}</label>
                  <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setCurriculo(e.target.files?.[0] ?? null)} className="w-full text-sm text-muted-foreground file:mr-3 file:h-8 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:text-sm file:font-medium file:text-foreground hover:file:bg-secondary/80" />
                  {cand.curriculo_url && !curriculo && (
                    <a href={cand.curriculo_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline">Ver currículo atual</a>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={enviando || !nome.trim()}
                className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-semibold text-sm inline-flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Enviar cadastro
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
