import { useEffect, useState } from "react";
import {
  Camera,
  Download,
  KeyRound,
  Mail,
  MoreHorizontal,
  Plus,
  Trash2,
  UserCircle2,
  Shield,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/PageHeader";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

// =====================================================================
// Tipos & Mocks — Usuários da plataforma
// =====================================================================

type RoleUsuario = "admin" | "consultor" | "cliente_recorrente" | "cliente_avulso" | "trial";
type StatusUsuario = "ativo" | "inativo" | "trial" | "pendente";

interface PermissaoItem {
  key: string;
  label: string;
  grupo: string;
}

interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: RoleUsuario;
  status: StatusUsuario;
  empresa?: string;
  trialExpira?: string;
  permissoes: string[];
}

const TODAS_PERMISSOES: PermissaoItem[] = [
  { key: "projetos.ver",        label: "Ver projetos",              grupo: "Operações" },
  { key: "projetos.editar",     label: "Editar projetos",           grupo: "Operações" },
  { key: "horas.ver",           label: "Ver horas",                 grupo: "Operações" },
  { key: "solicitacoes.ver",    label: "Ver solicitações",          grupo: "Operações" },
  { key: "atracao.ver",         label: "Ver Atração & Hunting",     grupo: "Operações" },
  { key: "clientes.ver",        label: "Ver clientes",              grupo: "Gestão" },
  { key: "financeiro.ver",      label: "Ver financeiro",            grupo: "Gestão" },
  { key: "gestao_conta.ver",    label: "Ver Gestão de Conta",       grupo: "Gestão" },
  { key: "relatorios.ver",      label: "Ver relatórios",            grupo: "Gestão" },
  { key: "relatorios.criar",    label: "Criar relatórios",          grupo: "Gestão" },
  { key: "documentos.ver",      label: "Ver documentos",            grupo: "Gestão" },
  { key: "documentos.criar",    label: "Criar documentos",          grupo: "Gestão" },
  { key: "auditoria.ver",       label: "Ver auditoria",             grupo: "Gestão" },
  { key: "calendario.ver",      label: "Ver calendário",            grupo: "Plataforma" },
  { key: "calendario.criar",    label: "Criar eventos",             grupo: "Plataforma" },
  { key: "comunicados.ver",     label: "Ver comunicados",           grupo: "Plataforma" },
  { key: "comunicados.criar",   label: "Criar comunicados",         grupo: "Plataforma" },
  { key: "analytics.ver",       label: "Ver analytics",             grupo: "Analytics" },
  { key: "analytics.nps",       label: "Ver NPS",                   grupo: "Analytics" },
  { key: "usuarios.gerenciar",  label: "Gerenciar usuários",        grupo: "Admin" },
  { key: "empresas.ver",        label: "Ver empresas",              grupo: "Admin" },
];

const PERMISSOES_PADRAO: Record<RoleUsuario, string[]> = {
  admin: TODAS_PERMISSOES.map((p) => p.key),
  consultor: [
    "projetos.ver","projetos.editar","solicitacoes.ver","atracao.ver",
    "clientes.ver","relatorios.ver","relatorios.criar",
    "documentos.ver","documentos.criar","auditoria.ver",
    "calendario.ver","calendario.criar","comunicados.ver","comunicados.criar",
    "analytics.ver","analytics.nps",
  ],
  cliente_recorrente: [
    "projetos.ver","solicitacoes.ver","atracao.ver",
    "gestao_conta.ver","relatorios.ver","documentos.ver",
    "calendario.ver","comunicados.ver",
  ],
  cliente_avulso: [
    "projetos.ver","solicitacoes.ver","atracao.ver","documentos.ver",
  ],
  trial: [],
};

const ROLE_LABEL: Record<RoleUsuario, string> = {
  admin: "Administrador",
  consultor: "Consultor",
  cliente_recorrente: "Cliente Recorrente",
  cliente_avulso: "Cliente Avulso",
  trial: "Trial",
};

const STATUS_LABEL: Record<StatusUsuario, string> = {
  ativo: "Ativo",
  inativo: "Inativo",
  trial: "Trial",
  pendente: "Pendente",
};

const EMPRESAS_MOCK = ["Kentaki Foods", "Tech Plural", "Grupo Maverick", "Studio Mira", "Alvo Digital"];

const USUARIOS_INICIAIS: Usuario[] = [
  {
    id: "u1", nome: "Patricia Lima", email: "patricia@azumirh.com.br",
    role: "admin", status: "ativo",
    permissoes: PERMISSOES_PADRAO.admin,
  },
  {
    id: "u2", nome: "Ana Beatriz", email: "ana@azumirh.com.br",
    role: "consultor", status: "ativo",
    permissoes: PERMISSOES_PADRAO.consultor,
  },
  {
    id: "u3", nome: "Mariana Souza", email: "mariana@kentaki.com",
    role: "cliente_recorrente", status: "ativo", empresa: "Kentaki Foods",
    permissoes: PERMISSOES_PADRAO.cliente_recorrente,
  },
  {
    id: "u4", nome: "Carlos Demo", email: "carlos@empresa.com",
    role: "trial", status: "trial", empresa: "Empresa Demo",
    trialExpira: "2026-06-01",
    permissoes: ["projetos.ver","atracao.ver"],
  },
];

// =====================================================================
// Tipos & Mock
// =====================================================================

type ConsultorStatus = "ativo" | "inativo";

interface ConsultorTeam {
  id: string;
  nome: string;
  cargo: string;
  email: string;
  taxa: number;
  status: ConsultorStatus;
}

const CONSULTORES_INICIAIS: ConsultorTeam[] = [
  { id: "ab", nome: "Ana Beatriz",   cargo: "Consultora Sênior", email: "ana@azumirh.com.br",    taxa: 85, status: "ativo" },
  { id: "ct", nome: "Camila Torres", cargo: "Consultora Pleno",  email: "camila@azumirh.com.br", taxa: 80, status: "ativo" },
  { id: "rm", nome: "Rafael Moura",  cargo: "Consultor Pleno",   email: "rafael@azumirh.com.br", taxa: 80, status: "ativo" },
];

const FUSOS = [
  { value: "America/Sao_Paulo", label: "America/Sao_Paulo (GMT-3)" },
  { value: "America/Manaus",    label: "America/Manaus (GMT-4)" },
  { value: "America/Belem",     label: "America/Belem (GMT-3)" },
  { value: "America/Fortaleza", label: "America/Fortaleza (GMT-3)" },
];

// =====================================================================
// Helpers
// =====================================================================

const getIniciais = (nome: string) =>
  nome.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");

const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// Cor de avatar derivada do nome — mesmo padrão do ClientesPage
const getAvatarTone = (nome: string) => {
  let h = 0;
  for (let i = 0; i < nome.length; i++) h = (h * 31 + nome.charCodeAt(i)) % 360;
  return { backgroundColor: `hsl(${h} 60% 88%)`, color: `hsl(${h} 55% 28%)` };
};

// =====================================================================
// Página
// =====================================================================

export default function ConfiguracoesPage() {
  const { usuario } = useAuth();
  const isAdmin = usuario?.role === "admin";
  const [tab, setTab] = useState("perfil");

  // ---- Usuários da plataforma ----
  const [usuarios, setUsuarios] = useState<Usuario[]>(USUARIOS_INICIAIS);
  const [convidarOpen, setConvidarOpen] = useState(false);
  const [permissoesOpen, setPermissoesOpen] = useState<Usuario | null>(null);

  // ---- Perfil ----
  const [nome, setNome]         = useState("Ana Beatriz");
  const [email, setEmail]       = useState("ana@azumirh.com.br");
  const [telefone, setTelefone] = useState("(41) 99999-0000");
  const [cargo, setCargo]       = useState("Consultora Sênior");
  const [senhaOpen, setSenhaOpen] = useState(false);

  const handleSalvarPerfil = () => {
    if (!nome.trim() || !email.trim()) {
      toast.error("Nome e e-mail são obrigatórios.");
      return;
    }
    toast.success("Perfil atualizado com sucesso");
  };

  // ---- Equipe ----
  const [time, setTime] = useState<ConsultorTeam[]>(CONSULTORES_INICIAIS);
  const [novoMembroOpen, setNovoMembroOpen] = useState(false);
  const [editarMembro, setEditarMembro] = useState<ConsultorTeam | null>(null);
  const [inativarId, setInativarId] = useState<string | null>(null);

  const confirmarInativacao = () => {
    if (!inativarId) return;
    setTime((prev) =>
      prev.map((c) => (c.id === inativarId ? { ...c, status: "inativo" } : c))
    );
    toast.success("Consultor inativado.");
    setInativarId(null);
  };

  // ---- Sistema ----
  const [emailNotif, setEmailNotif]   = useState(true);
  const [encerraTimer, setEncerraTimer] = useState(true);
  const [resumoSemanal, setResumoSemanal] = useState(false);
  const [fuso, setFuso] = useState("America/Sao_Paulo");
  const [encerrarContaOpen, setEncerrarContaOpen] = useState(false);

  return (
    <div>
      <PageHeader
        title="Configurações"
        subtitle="Gerencie seu perfil, sua equipe e preferências do sistema"
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="perfil">Meu perfil</TabsTrigger>
          <TabsTrigger value="equipe">Equipe</TabsTrigger>
          <TabsTrigger value="sistema">Sistema</TabsTrigger>
        </TabsList>

        {/* =================== PERFIL =================== */}
        <TabsContent value="perfil" className="space-y-5">
          <Card className="p-6">
            <div className="flex flex-col items-center gap-3 mb-6">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-2xl bg-primary/15 text-primary font-semibold">
                  {getIniciais(nome) || "AB"}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.info("Em breve")}
              >
                <Camera className="h-3.5 w-3.5 mr-1.5" /> Alterar foto
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome completo</Label>
                <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tel">Telefone</Label>
                <Input id="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo</Label>
                <Input id="cargo" value={cargo} onChange={(e) => setCargo(e.target.value)} />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={handleSalvarPerfil}>Salvar alterações</Button>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h3 className="font-display text-base font-semibold">Segurança</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Mantenha sua conta protegida atualizando sua senha periodicamente.
                </p>
              </div>
              <Button variant="outline" onClick={() => setSenhaOpen(true)}>
                <KeyRound className="h-4 w-4 mr-1.5" /> Alterar senha
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* =================== EQUIPE =================== */}
        <TabsContent value="equipe" className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-semibold">Consultores</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Gerencie os consultores que têm acesso à plataforma.
              </p>
            </div>
            <Button onClick={() => setNovoMembroOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Adicionar consultor
            </Button>
          </div>

          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Consultor</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Taxa/hora</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {time.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback
                            className="text-xs font-semibold"
                            style={getAvatarTone(c.nome)}
                          >
                            {getIniciais(c.nome)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{c.nome}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{c.cargo}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-sm">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        {c.email}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "badge-pill border",
                          c.status === "ativo"
                            ? "bg-success/15 text-success border-success/30"
                            : "bg-muted text-muted-foreground border-border"
                        )}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                        {c.status === "ativo" ? "Ativo" : "Inativo"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-data tabular-nums">
                      {formatBRL(c.taxa)}/h
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditarMembro(c)}>
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            disabled={c.status === "inativo"}
                            className="text-destructive focus:text-destructive"
                            onClick={() => setInativarId(c.id)}
                          >
                            Inativar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* =================== SISTEMA =================== */}
        <TabsContent value="sistema" className="space-y-5">
          <Card className="p-6 space-y-5">
            <h3 className="font-display text-base font-semibold">Preferências</h3>

            <SettingRow
              title="Modo escuro"
              description="Alterna entre tema claro e escuro."
            >
              <Switch
                onCheckedChange={() => toast.info("Tema gerenciado pelo sistema")}
              />
            </SettingRow>

            <Separator />

            <SettingRow
              title="Notificações por e-mail"
              description="Receba alertas importantes por e-mail."
            >
              <Switch
                checked={emailNotif}
                onCheckedChange={(v) => {
                  setEmailNotif(v);
                  toast.success("Preferência salva");
                }}
              />
            </SettingRow>

            <Separator />

            <SettingRow
              title="Encerramento automático de timer às 18h"
              description="Encerra timers ativos automaticamente ao final do expediente."
            >
              <Switch
                checked={encerraTimer}
                onCheckedChange={(v) => {
                  setEncerraTimer(v);
                  toast.success("Preferência salva");
                }}
              />
            </SettingRow>

            <Separator />

            <SettingRow
              title="Resumo semanal por e-mail"
              description="Envie um resumo consolidado da operação toda segunda-feira."
            >
              <Switch
                checked={resumoSemanal}
                onCheckedChange={(v) => {
                  setResumoSemanal(v);
                  toast.success("Preferência salva");
                }}
              />
            </SettingRow>

            <Separator />

            <div className="flex items-end justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px] space-y-2">
                <Label>Fuso horário</Label>
                <Select value={fuso} onValueChange={setFuso}>
                  <SelectTrigger className="max-w-[280px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FUSOS.map((f) => (
                      <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => toast.success("Fuso horário atualizado")}>
                Salvar fuso
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h3 className="font-display text-base font-semibold">Dados pessoais</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Exporte uma cópia de todos os seus dados.
                </p>
              </div>
              <Button variant="outline" onClick={() => toast.info("Em breve")}>
                <Download className="h-4 w-4 mr-1.5" /> Exportar meus dados
              </Button>
            </div>
          </Card>

          <Card className="p-6 border-destructive/50">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h3 className="font-display text-base font-semibold text-destructive">
                  Zona de perigo
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Esta ação é permanente e não pode ser desfeita.
                </p>
              </div>
              <Button variant="destructive" onClick={() => setEncerrarContaOpen(true)}>
                <Trash2 className="h-4 w-4 mr-1.5" /> Encerrar conta
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* =================== Dialog: Alterar senha =================== */}
      <AlterarSenhaDialog open={senhaOpen} onOpenChange={setSenhaOpen} />

      {/* =================== Dialog: Novo consultor =================== */}
      <ConsultorDialog
        open={novoMembroOpen}
        onOpenChange={setNovoMembroOpen}
        onSave={(c) => {
          setTime((prev) => [...prev, { ...c, id: `m-${Date.now()}` }]);
          toast.success(`Consultor "${c.nome}" adicionado`);
        }}
      />

      {/* =================== Dialog: Editar consultor =================== */}
      <ConsultorDialog
        open={!!editarMembro}
        onOpenChange={(o) => !o && setEditarMembro(null)}
        initial={editarMembro ?? undefined}
        onSave={(c) => {
          if (!editarMembro) return;
          setTime((prev) => prev.map((m) => (m.id === editarMembro.id ? { ...m, ...c } : m)));
          toast.success("Consultor atualizado");
          setEditarMembro(null);
        }}
      />

      {/* =================== Dialog: Inativar =================== */}
      <Dialog open={!!inativarId} onOpenChange={(o) => !o && setInativarId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inativar consultor</DialogTitle>
            <DialogDescription>
              O consultor perderá acesso à plataforma. Você poderá reativá-lo futuramente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInativarId(null)}>Voltar</Button>
            <Button variant="destructive" onClick={confirmarInativacao}>Inativar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* =================== Dialog: Encerrar conta =================== */}
      <EncerrarContaDialog open={encerrarContaOpen} onOpenChange={setEncerrarContaOpen} />
    </div>
  );
}

// =====================================================================
// SettingRow
// =====================================================================

function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}

// =====================================================================
// Dialog: Alterar senha
// =====================================================================

function AlterarSenhaDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [atual, setAtual] = useState("");
  const [nova, setNova]   = useState("");
  const [conf, setConf]   = useState("");

  const reset = () => { setAtual(""); setNova(""); setConf(""); };

  const handleSave = () => {
    if (!atual) {
      toast.error("Informe sua senha atual.");
      return;
    }
    if (nova.length < 8) {
      toast.error("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (nova !== conf) {
      toast.error("A confirmação não confere com a nova senha.");
      return;
    }
    toast.success("Senha alterada com sucesso");
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Alterar senha</DialogTitle>
          <DialogDescription>
            Use uma senha forte com pelo menos 8 caracteres.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Senha atual</Label>
            <Input type="password" value={atual} onChange={(e) => setAtual(e.target.value)} autoComplete="current-password" />
          </div>
          <div className="space-y-2">
            <Label>Nova senha</Label>
            <Input type="password" value={nova} onChange={(e) => setNova(e.target.value)} autoComplete="new-password" />
          </div>
          <div className="space-y-2">
            <Label>Confirmar nova senha</Label>
            <Input type="password" value={conf} onChange={(e) => setConf(e.target.value)} autoComplete="new-password" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave}>Atualizar senha</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// =====================================================================
// Dialog: Adicionar / Editar consultor
// =====================================================================

function ConsultorDialog({
  open,
  onOpenChange,
  initial,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: ConsultorTeam;
  onSave: (c: Omit<ConsultorTeam, "id">) => void;
}) {
  const isEdit = !!initial;
  const [nome, setNome]   = useState("");
  const [email, setEmail] = useState("");
  const [cargo, setCargo] = useState("");
  const [taxa, setTaxa]   = useState<string>("");
  const [status, setStatus] = useState<ConsultorStatus>("ativo");

  // Sincroniza campos quando o dialog abre (reset para novo / preenche para edição)
  useEffect(() => {
    if (open) {
      setNome(initial?.nome ?? "");
      setEmail(initial?.email ?? "");
      setCargo(initial?.cargo ?? "");
      setTaxa(initial?.taxa?.toString() ?? "");
      setStatus(initial?.status ?? "ativo");
    }
  }, [open, initial]);

  const handleSave = () => {
    const taxaNum = parseFloat(taxa.replace(",", "."));
    if (!nome.trim() || !email.trim() || !cargo.trim() || !taxaNum || taxaNum <= 0) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    onSave({
      nome: nome.trim(),
      email: email.trim(),
      cargo: cargo.trim(),
      taxa: taxaNum,
      status,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar consultor" : "Adicionar consultor"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Atualize os dados do consultor."
              : "Cadastre um novo consultor com acesso à plataforma."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nome <span className="text-destructive">*</span></Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome completo" />
          </div>
          <div className="space-y-2">
            <Label>E-mail <span className="text-destructive">*</span></Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nome@azumirh.com.br" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Cargo <span className="text-destructive">*</span></Label>
              <Input value={cargo} onChange={(e) => setCargo(e.target.value)} placeholder="Ex: Consultor Pleno" />
            </div>
            <div className="space-y-2">
              <Label>Taxa/hora (R$) <span className="text-destructive">*</span></Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={taxa}
                onChange={(e) => setTaxa(e.target.value)}
                placeholder="80,00"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as ConsultorStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave}>{isEdit ? "Salvar alterações" : "Adicionar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// =====================================================================
// Dialog: Encerrar conta
// =====================================================================

function EncerrarContaDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [conf, setConf] = useState("");
  const podeEncerrar = conf === "ENCERRAR";

  const handleClose = (v: boolean) => {
    onOpenChange(v);
    if (!v) setConf("");
  };

  const handleEncerrar = () => {
    toast.error("Funcionalidade bloqueada neste ambiente");
    setConf("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-destructive flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Encerrar conta
          </DialogTitle>
          <DialogDescription>
            Esta ação é permanente e não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
            <p className="font-medium text-destructive flex items-center gap-1.5">
              <UserCircle2 className="h-4 w-4" /> O que acontece em seguida
            </p>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground list-disc pl-5">
              <li>Seu acesso é revogado imediatamente</li>
              <li>Projetos ativos serão reatribuídos</li>
              <li>Histórico financeiro fica retido pelo período legal</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label>
              Digite{" "}
              <span className="font-mono font-semibold text-destructive">ENCERRAR</span>{" "}
              para confirmar
            </Label>
            <Input
              value={conf}
              onChange={(e) => setConf(e.target.value)}
              placeholder="ENCERRAR"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>Cancelar</Button>
          <Button
            variant="destructive"
            disabled={!podeEncerrar}
            onClick={handleEncerrar}
          >
            Encerrar conta permanentemente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
