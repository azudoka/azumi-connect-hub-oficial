import { useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  User as UserIcon,
  Pencil,
  Briefcase,
  FileText,
  Clock,
  Building2,
  Camera,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// ---------- Mock empresa (apenas cliente) ----------
const EMPRESA_MOCK = {
  nome: "Kentaki Foods",
  plano: "Ongoing",
  horasContratadas: 40,
  horasConsumidas: 28,
  logoInicial: "K",
};

// ---------- Helpers ----------
function iniciais(nome?: string) {
  if (!nome) return "U";
  return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function papelLabel(papel?: string) {
  if (papel === "cliente") return "Cliente";
  if (papel === "consultor") return "Consultor";
  if (papel === "admin") return "Administrador";
  return "—";
}

function papelClasses(papel?: string) {
  if (papel === "cliente") return "bg-primary/10 text-primary border-primary/30";
  if (papel === "consultor") return "bg-success/15 text-success border-success/30";
  if (papel === "admin") return "bg-info/15 text-info border-info/30";
  return "bg-muted text-muted-foreground border-border";
}

const PILL_BASE =
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap";

export default function PerfilPage() {
  const { user, usuario, refreshPerfil } = useAuth();
  const isCliente = user?.papel === "cliente";

  const [editMode, setEditMode] = useState(false);
  const [enviandoAvatar, setEnviandoAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    nome: user?.nome ?? "",
    email: "",
    cargo: "",
    celular: "",
  });
  const [snapshot, setSnapshot] = useState(form);

  function startEdit() {
    setSnapshot(form);
    setEditMode(true);
  }

  function cancelEdit() {
    setForm(snapshot);
    setEditMode(false);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.nome.trim()) {
      toast.error("O nome é obrigatório.");
      return;
    }
    setSnapshot(form);
    setEditMode(false);
    toast.success("Perfil atualizado!");
  }

  async function handleUploadAvatar(file: File) {
    if (!usuario?.id) return;
    setEnviandoAvatar(true);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `avatars/${usuario.id}.${ext}`;
      const { data: upData, error: upError } = await supabase.storage
        .from("public-applications")
        .upload(path, file, { upsert: true });
      if (upError) throw upError;
      const { data: urlData } = supabase.storage.from("public-applications").getPublicUrl(upData.path);
      const publicUrl = urlData.publicUrl + `?t=${Date.now()}`;
      const { error: dbError } = await supabase
        .from("users_profile")
        .update({ avatar_url: publicUrl })
        .eq("id", usuario.id);
      if (dbError) throw dbError;
      await refreshPerfil();
      toast.success("Foto atualizada!");
    } catch (e: any) {
      toast.error("Erro ao salvar foto: " + e.message);
    } finally {
      setEnviandoAvatar(false);
    }
  }

  // --- Acesso rápido ---
  const quickLinks = isCliente
    ? [
        { to: "/app/atracao", icon: Briefcase, label: "Minhas Vagas" },
        { to: "/app/solicitacoes", icon: FileText, label: "Solicitações" },
      ]
    : [
        { to: "/app/horas", icon: Clock, label: "Horas" },
        { to: "/app/projetos", icon: Briefcase, label: "Projetos" },
      ];

  // --- Consumo (cliente) ---
  const pct = Math.min(
    100,
    Math.round((EMPRESA_MOCK.horasConsumidas / EMPRESA_MOCK.horasContratadas) * 100)
  );
  const consumoCor =
    pct >= 80 ? "bg-destructive" : pct >= 50 ? "bg-warning" : "bg-primary";

  const subtitle = isCliente
    ? "Suas informações de acesso e dados da empresa"
    : "Suas informações e configurações internas";

  return (
    <div className="flex flex-col gap-5">
      {/* Cabeçalho inline */}
      <div className="border-b border-border pb-4">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
          Meu Perfil
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      </div>

      {/* Card — Dados Pessoais */}
      <form
        onSubmit={handleSubmit}
        className="bg-card/80 backdrop-blur border rounded-2xl p-5"
      >
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-display font-semibold">Dados Pessoais</h2>
          </div>
          {editMode ? (
            <div className="flex items-center gap-2">
              <Button type="button" size="sm" variant="outline" onClick={cancelEdit}>
                Cancelar
              </Button>
              <Button type="submit" size="sm">
                Salvar
              </Button>
            </div>
          ) : (
            <Button type="button" size="sm" variant="outline" onClick={startEdit}>
              <Pencil size={13} />
              Editar
            </Button>
          )}
        </div>

        <div className="flex items-start gap-4 mb-5">
          <div className="relative shrink-0">
            <Avatar className="h-14 w-14">
              {usuario?.avatarUrl && <AvatarImage src={usuario.avatarUrl} alt={form.nome || user?.nome} />}
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground font-semibold">
                {iniciais(form.nome || user?.nome)}
              </AvatarFallback>
            </Avatar>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUploadAvatar(f); e.target.value = ""; }}
            />
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={enviandoAvatar}
              className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center ring-2 ring-background hover:bg-primary/80 disabled:opacity-50"
              title="Alterar foto"
            >
              <Camera className="h-2.5 w-2.5 text-primary-foreground" />
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-base">{form.nome || user?.nome || "—"}</div>
            <div className="mt-1.5">
              <span className={cn(PILL_BASE, papelClasses(user?.papel))}>
                {papelLabel(user?.papel)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="nome">Nome</Label>
            {editMode ? (
              <Input
                id="nome"
                value={form.nome}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                required
              />
            ) : (
              <div className="text-sm py-2 text-muted-foreground">
                {form.nome || "—"}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <div className="text-sm py-2 text-muted-foreground">
              {form.email || "—"}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cargo">Cargo</Label>
            {editMode ? (
              <Input
                id="cargo"
                value={form.cargo}
                onChange={(e) => setForm((f) => ({ ...f, cargo: e.target.value }))}
                placeholder="Ex.: Gerente de RH"
              />
            ) : (
              <div className="text-sm py-2 text-muted-foreground">
                {form.cargo || "—"}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="celular">Celular</Label>
            {editMode ? (
              <Input
                id="celular"
                value={form.celular}
                onChange={(e) => setForm((f) => ({ ...f, celular: e.target.value }))}
                placeholder="(11) 99999-9999"
              />
            ) : (
              <div className="text-sm py-2 text-muted-foreground">
                {form.celular || "—"}
              </div>
            )}
          </div>
        </div>
      </form>

      {/* Card — Empresa & Plano (cliente) */}
      {isCliente && (
        <div className="bg-card/80 backdrop-blur border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-display font-semibold">Empresa & Plano</h2>
          </div>

          <div className="flex items-center gap-4 mb-5">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-xl font-bold shrink-0">
              {EMPRESA_MOCK.logoInicial}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-base">{EMPRESA_MOCK.nome}</div>
              <div className="mt-1.5">
                <span className={cn(PILL_BASE, "bg-primary/10 text-primary border-primary/30")}>
                  Plano {EMPRESA_MOCK.plano}
                </span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-muted-foreground">Consumo mensal</span>
              <span className="font-data text-foreground">
                {EMPRESA_MOCK.horasConsumidas}h / {EMPRESA_MOCK.horasContratadas}h · {pct}%
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", consumoCor)}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Card — Acesso rápido */}
      <div className="bg-card/80 backdrop-blur border rounded-2xl p-5">
        <h2 className="font-display font-semibold mb-4">Acesso rápido</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickLinks.map(({ to, icon: Icon, label }) => (
            <Button
              key={to}
              asChild
              variant="outline"
              className="justify-start h-auto py-3"
            >
              <Link to={to}>
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
