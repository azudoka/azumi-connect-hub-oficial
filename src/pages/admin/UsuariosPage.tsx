import { useMemo, useState } from "react";
import { Plus, Search, Pencil, UserX, Mail, MoreHorizontal, Shield } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type RoleUsuario = "admin" | "consultor" | "cliente_recorrente" | "cliente_avulso" | "trial";
type StatusUsuario = "ativo" | "inativo" | "trial" | "pendente";

interface PermissaoItem { key: string; label: string; grupo: string }

interface Usuario {
  id: string; nome: string; email: string; role: RoleUsuario;
  status: StatusUsuario; empresa?: string; trialExpira?: string;
  permissoes: string[]; iniciais: string; ultimaAtividade: string;
}

const TODAS_PERMISSOES: PermissaoItem[] = [
  { key: "projetos.ver", label: "Ver projetos", grupo: "Operações" },
  { key: "projetos.editar", label: "Editar projetos", grupo: "Operações" },
  { key: "horas.ver", label: "Ver horas", grupo: "Operações" },
  { key: "solicitacoes.ver", label: "Ver solicitações", grupo: "Operações" },
  { key: "atracao.ver", label: "Ver Atração & Hunting", grupo: "Operações" },
  { key: "clientes.ver", label: "Ver clientes", grupo: "Gestão" },
  { key: "financeiro.ver", label: "Ver financeiro", grupo: "Gestão" },
  { key: "relatorios.ver", label: "Ver relatórios", grupo: "Gestão" },
  { key: "relatorios.criar", label: "Criar relatórios", grupo: "Gestão" },
  { key: "documentos.ver", label: "Ver documentos", grupo: "Gestão" },
  { key: "documentos.criar", label: "Criar documentos", grupo: "Gestão" },
  { key: "auditoria.ver", label: "Ver auditoria", grupo: "Gestão" },
  { key: "calendario.ver", label: "Ver calendário", grupo: "Plataforma" },
  { key: "calendario.criar", label: "Criar eventos", grupo: "Plataforma" },
  { key: "comunicados.ver", label: "Ver comunicados", grupo: "Plataforma" },
  { key: "comunicados.criar", label: "Criar comunicados", grupo: "Plataforma" },
  { key: "analytics.ver", label: "Ver analytics", grupo: "Analytics" },
  { key: "analytics.nps", label: "Ver NPS", grupo: "Analytics" },
  { key: "usuarios.gerenciar", label: "Gerenciar usuários", grupo: "Admin" },
  { key: "empresas.ver", label: "Ver empresas", grupo: "Admin" },
];

const PERMISSOES_PADRAO: Record<RoleUsuario, string[]> = {
  admin: TODAS_PERMISSOES.map((p) => p.key),
  consultor: ["projetos.ver","projetos.editar","solicitacoes.ver","atracao.ver","clientes.ver","relatorios.ver","relatorios.criar","documentos.ver","documentos.criar","auditoria.ver","calendario.ver","calendario.criar","comunicados.ver","comunicados.criar","analytics.ver","analytics.nps"],
  cliente_recorrente: ["projetos.ver","solicitacoes.ver","atracao.ver","relatorios.ver","documentos.ver","calendario.ver","comunicados.ver"],
  cliente_avulso: ["projetos.ver","solicitacoes.ver","atracao.ver","documentos.ver"],
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
  ativo: "Ativo", inativo: "Inativo", trial: "Trial", pendente: "Pendente",
};
const EMPRESAS = ["Kentaki Foods","Tech Plural","Grupo Maverick","Studio Mira","Alvo Digital"];
const MODULOS_TRIAL = ["Atração & Hunting","Projetos","Solicitações","Documentos","Comunicados","Calendário"];

const ROLE_BADGE: Record<RoleUsuario, string> = {
  admin: "bg-violet-500/15 text-violet-600",
  consultor: "bg-blue-500/15 text-blue-600",
  cliente_recorrente: "bg-emerald-500/15 text-emerald-600",
  cliente_avulso: "bg-green-400/15 text-green-600",
  trial: "bg-amber-500/15 text-amber-600",
};
const STATUS_BADGE: Record<StatusUsuario, string> = {
  ativo: "bg-emerald-500/15 text-emerald-600",
  trial: "bg-amber-500/15 text-amber-600",
  pendente: "bg-blue-500/15 text-blue-600",
  inativo: "bg-muted text-muted-foreground",
};

const MOCK_USUARIOS: Usuario[] = [
  { id:"U-001", nome:"Patricia Lima",   email:"patricia@azumirh.com.br", role:"admin",              status:"ativo",   iniciais:"PL", ultimaAtividade:"agora",      permissoes: PERMISSOES_PADRAO.admin },
  { id:"U-002", nome:"Ana Beatriz",     email:"ana@azumirh.com.br",      role:"consultor",          status:"ativo",   iniciais:"AB", ultimaAtividade:"há 30 min",  permissoes: PERMISSOES_PADRAO.consultor },
  { id:"U-003", nome:"Rafael Moura",    email:"rafael@azumirh.com.br",   role:"consultor",          status:"ativo",   iniciais:"RM", ultimaAtividade:"há 2h",      permissoes: PERMISSOES_PADRAO.consultor },
  { id:"U-004", nome:"Mariana Souza",   email:"mariana@kentaki.com",     role:"cliente_recorrente", status:"ativo",   iniciais:"MS", ultimaAtividade:"ontem",      empresa:"Kentaki Foods", permissoes: PERMISSOES_PADRAO.cliente_recorrente },
  { id:"U-005", nome:"Carlos Demo",     email:"demo@azumirh.com.br",     role:"trial",              status:"trial",   iniciais:"CD", ultimaAtividade:"há 1h",      empresa:"Empresa Demo", trialExpira:"2026-06-30", permissoes:["projetos.ver","atracao.ver"] },
  { id:"U-006", nome:"João Pedro",      email:"joao@startupy.com.br",    role:"cliente_avulso",     status:"inativo", iniciais:"JP", ultimaAtividade:"há 12 dias", empresa:"Startup Y", permissoes: PERMISSOES_PADRAO.cliente_avulso },
];

function iniciaisOf(nome: string) {
  return nome.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>(MOCK_USUARIOS);
  const [busca, setBusca] = useState("");
  const [filtroRole, setFiltroRole] = useState<RoleUsuario | "todos">("todos");

  const [openNovo, setOpenNovo] = useState(false);
  const [openPerm, setOpenPerm] = useState<Usuario | null>(null);
  const [openRole, setOpenRole] = useState<Usuario | null>(null);
  const [openDesativar, setOpenDesativar] = useState<Usuario | null>(null);

  const filtrados = useMemo(() => {
    const q = busca.toLowerCase().trim();
    return usuarios.filter((u) => {
      const matchBusca = !q || u.nome.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchRole = filtroRole === "todos" || u.role === filtroRole;
      return matchBusca && matchRole;
    });
  }, [usuarios, busca, filtroRole]);

  function criarUsuario(novo: Usuario) {
    setUsuarios((prev) => [novo, ...prev]);
    toast.success("Usuário criado");
  }
  function salvarPermissoes(id: string, perms: string[]) {
    setUsuarios((prev) => prev.map((u) => (u.id === id ? { ...u, permissoes: perms } : u)));
    toast.success("Permissões atualizadas");
    setOpenPerm(null);
  }
  function alterarRole(id: string, novaRole: RoleUsuario) {
    setUsuarios((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, role: novaRole, permissoes: PERMISSOES_PADRAO[novaRole] } : u,
      ),
    );
    toast.success("Role alterada");
    setOpenRole(null);
  }
  function desativar(id: string) {
    setUsuarios((prev) => prev.map((u) => (u.id === id ? { ...u, status: "inativo" } : u)));
    toast.success("Usuário desativado");
    setOpenDesativar(null);
  }

  return (
    <div>
      <PageHeader
        title="Usuários"
        subtitle="Gerencie acessos, papéis e permissões."
        actions={
          <Button onClick={() => setOpenNovo(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo usuário
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filtroRole} onValueChange={(v) => setFiltroRole(v as RoleUsuario | "todos")}>
          <SelectTrigger className="w-full sm:w-[220px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas as roles</SelectItem>
            {(Object.keys(ROLE_LABEL) as RoleUsuario[]).map((r) => (
              <SelectItem key={r} value={r}>{ROLE_LABEL[r]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Trial expira</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-gradient-brand flex items-center justify-center text-xs font-semibold text-white shrink-0">
                      {u.iniciais}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{u.nome}</div>
                      <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full", ROLE_BADGE[u.role])}>
                    {ROLE_LABEL[u.role]}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{u.empresa ?? "—"}</TableCell>
                <TableCell>
                  <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full", STATUS_BADGE[u.status])}>
                    {STATUS_LABEL[u.status]}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{u.trialExpira ?? "—"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center gap-1 justify-end">
                    <Button variant="outline" size="sm" onClick={() => setOpenPerm(u)}>
                      <Shield className="h-3.5 w-3.5 mr-1.5" /> Permissões
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setOpenRole(u)}>
                          <Pencil className="h-4 w-4 mr-2" /> Editar role
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.success("Convite reenviado")}>
                          <Mail className="h-4 w-4 mr-2" /> Reenviar convite
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setOpenDesativar(u)}
                        >
                          <UserX className="h-4 w-4 mr-2" /> Desativar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtrados.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-sm text-muted-foreground">
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <NovoUsuarioModal
        open={openNovo}
        onClose={() => setOpenNovo(false)}
        onCreate={criarUsuario}
      />

      <PermissoesModal
        usuario={openPerm}
        onClose={() => setOpenPerm(null)}
        onSave={salvarPermissoes}
      />

      <EditarRoleModal
        usuario={openRole}
        onClose={() => setOpenRole(null)}
        onSave={alterarRole}
      />

      <Dialog open={!!openDesativar} onOpenChange={(o) => !o && setOpenDesativar(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Desativar usuário</DialogTitle>
            <DialogDescription>
              {openDesativar && `Tem certeza que deseja desativar ${openDesativar.nome}? Ele perderá acesso à plataforma.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDesativar(null)}>Cancelar</Button>
            <Button
              variant="destructive"
              onClick={() => openDesativar && desativar(openDesativar.id)}
            >
              Desativar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ───────────── NOVO USUÁRIO ───────────── */
function NovoUsuarioModal({
  open, onClose, onCreate,
}: { open: boolean; onClose: () => void; onCreate: (u: Usuario) => void }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<RoleUsuario>("consultor");
  const [empresa, setEmpresa] = useState<string>("");
  const [trialExpira, setTrialExpira] = useState("");
  const [modulos, setModulos] = useState<string[]>([]);

  function reset() {
    setNome(""); setEmail(""); setRole("consultor");
    setEmpresa(""); setTrialExpira(""); setModulos([]);
  }
  function close() { reset(); onClose(); }

  function submit() {
    if (!nome.trim() || !email.trim()) {
      toast.error("Preencha nome e email"); return;
    }
    const status: StatusUsuario = role === "trial" ? "trial" : "pendente";
    const novo: Usuario = {
      id: `U-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
      nome: nome.trim(),
      email: email.trim(),
      role,
      status,
      empresa: empresa || undefined,
      trialExpira: role === "trial" ? trialExpira || undefined : undefined,
      permissoes: role === "trial" ? [] : PERMISSOES_PADRAO[role],
      iniciais: iniciaisOf(nome),
      ultimaAtividade: "—",
    };
    onCreate(novo);
    close();
  }

  const precisaEmpresa = role === "cliente_recorrente" || role === "cliente_avulso" || role === "trial";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo usuário</DialogTitle>
          <DialogDescription>Crie um novo acesso à plataforma.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nome</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome completo" />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@empresa.com" />
          </div>
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as RoleUsuario)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(ROLE_LABEL) as RoleUsuario[]).map((r) => (
                  <SelectItem key={r} value={r}>{ROLE_LABEL[r]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {precisaEmpresa && (
            <div className="space-y-1.5">
              <Label>Empresa</Label>
              <Select value={empresa} onValueChange={setEmpresa}>
                <SelectTrigger><SelectValue placeholder="Selecione uma empresa" /></SelectTrigger>
                <SelectContent>
                  {EMPRESAS.map((e) => (
                    <SelectItem key={e} value={e}>{e}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {role === "trial" && (
            <>
              <div className="space-y-1.5">
                <Label>Data de expiração do trial</Label>
                <Input type="date" value={trialExpira} onChange={(e) => setTrialExpira(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Módulos liberados no trial</Label>
                <div className="grid grid-cols-2 gap-2">
                  {MODULOS_TRIAL.map((m) => {
                    const checked = modulos.includes(m);
                    return (
                      <label key={m} className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(v) =>
                            setModulos((prev) =>
                              v ? [...prev, m] : prev.filter((x) => x !== m),
                            )
                          }
                        />
                        {m}
                      </label>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={close}>Cancelar</Button>
          <Button onClick={submit}>Criar usuário</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ───────────── PERMISSÕES ───────────── */
function PermissoesModal({
  usuario, onClose, onSave,
}: { usuario: Usuario | null; onClose: () => void; onSave: (id: string, perms: string[]) => void }) {
  const [perms, setPerms] = useState<string[]>([]);

  useMemo(() => {
    if (usuario) setPerms(usuario.permissoes);
  }, [usuario]);

  if (!usuario) return null;

  const grupos = Array.from(new Set(TODAS_PERMISSOES.map((p) => p.grupo)));

  function toggle(key: string) {
    setPerms((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  return (
    <Dialog open={!!usuario} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Permissões — {usuario.nome}</DialogTitle>
          <DialogDescription>
            Ajuste as permissões granulares deste usuário.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {grupos.map((g) => (
            <div key={g}>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">{g}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {TODAS_PERMISSOES.filter((p) => p.grupo === g).map((p) => {
                  const checked = perms.includes(p.key);
                  return (
                    <label key={p.key} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggle(p.key)}
                      />
                      {p.label}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="flex sm:justify-between gap-2">
          <Button
            variant="outline"
            onClick={() => setPerms(PERMISSOES_PADRAO[usuario.role])}
          >
            Restaurar padrão
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button onClick={() => onSave(usuario.id, perms)}>Salvar permissões</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ───────────── EDITAR ROLE ───────────── */
function EditarRoleModal({
  usuario, onClose, onSave,
}: { usuario: Usuario | null; onClose: () => void; onSave: (id: string, role: RoleUsuario) => void }) {
  const [role, setRole] = useState<RoleUsuario>("consultor");

  useMemo(() => { if (usuario) setRole(usuario.role); }, [usuario]);

  if (!usuario) return null;

  return (
    <Dialog open={!!usuario} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar role — {usuario.nome}</DialogTitle>
          <DialogDescription>
            Alterar a role também redefine as permissões para o padrão da nova role.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label>Nova role</Label>
          <Select value={role} onValueChange={(v) => setRole(v as RoleUsuario)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {(Object.keys(ROLE_LABEL) as RoleUsuario[]).map((r) => (
                <SelectItem key={r} value={r}>{ROLE_LABEL[r]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => onSave(usuario.id, role)}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
