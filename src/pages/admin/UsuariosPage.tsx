import { useMemo, useState } from "react";
import {
  Plus, Search, Copy, Check, Pencil, UserX, Mail, MoreHorizontal,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Role = "admin" | "consultor" | "cliente_recorrente" | "cliente_avulso";

interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: Role;
  empresa: string;
  ativo: boolean;
  ultimaAtividade: string;
  iniciais: string;
}

const MOCK: Usuario[] = [
  { id: "U-001", nome: "Marina Costa",  email: "marina@azumi.com.br",      role: "admin",              empresa: "Azumi",          ativo: true,  ultimaAtividade: "há 5 min",   iniciais: "MC" },
  { id: "U-002", nome: "Rafael Lima",   email: "rafael@azumi.com.br",      role: "consultor",          empresa: "Azumi",          ativo: true,  ultimaAtividade: "há 2 h",     iniciais: "RL" },
  { id: "U-003", nome: "Camila Souza",  email: "camila@empresax.com.br",   role: "cliente_recorrente", empresa: "Empresa X",      ativo: true,  ultimaAtividade: "ontem",      iniciais: "CS" },
  { id: "U-004", nome: "João Pedro",    email: "joao@startupy.com.br",     role: "cliente_avulso",     empresa: "Startup Y",      ativo: false, ultimaAtividade: "há 12 dias", iniciais: "JP" },
  { id: "U-005", nome: "Ana Beatriz",   email: "ana@azumi.com.br",         role: "consultor",          empresa: "Azumi",          ativo: true,  ultimaAtividade: "há 30 min",  iniciais: "AB" },
  { id: "U-006", nome: "Lucas Martins", email: "lucas@grupozeta.com.br",   role: "cliente_recorrente", empresa: "Grupo Zeta",     ativo: true,  ultimaAtividade: "há 1 dia",   iniciais: "LM" },
  { id: "U-007", nome: "Patrícia Reis", email: "patricia@nuvemcorp.com",   role: "cliente_avulso",     empresa: "Nuvem Corp",     ativo: false, ultimaAtividade: "há 1 mês",   iniciais: "PR" },
  { id: "U-008", nome: "Diego Alves",   email: "diego@azumi.com.br",       role: "admin",              empresa: "Azumi",          ativo: true,  ultimaAtividade: "agora",      iniciais: "DA" },
];

const ROLE_LABEL: Record<Role, string> = {
  admin: "Admin",
  consultor: "Consultor",
  cliente_recorrente: "Cliente Recorrente",
  cliente_avulso: "Cliente Avulso",
};

function RoleBadge({ role }: { role: Role }) {
  const map: Record<Role, string> = {
    admin:              "bg-[#8B5CF6]/15 text-[#8B5CF6] border-[#8B5CF6]/30",
    consultor:          "bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/30",
    cliente_recorrente: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
    cliente_avulso:     "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };
  return (
    <span className={cn("badge-pill", map[role])}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {ROLE_LABEL[role]}
    </span>
  );
}

function CopyButton({ value }: { value: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(value);
        setDone(true);
        setTimeout(() => setDone(false), 1200);
      }}
      className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      title="Copiar"
    >
      {done ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

export default function UsuariosPage() {
  const [busca, setBusca] = useState("");
  const [filtroRole, setFiltroRole] = useState<Role | "all">("all");
  const [novoOpen, setNovoOpen] = useState(false);
  const [usuarios, setUsuarios] = useState<Usuario[]>(MOCK);
  const [editarUsuario, setEditarUsuario] = useState<Usuario | null>(null);
  const [desativarUsuario, setDesativarUsuario] = useState<Usuario | null>(null);

  const lista = useMemo(() => {
    return usuarios.filter((u) => {
      if (filtroRole !== "all" && u.role !== filtroRole) return false;
      if (busca && !`${u.nome} ${u.email} ${u.empresa}`.toLowerCase().includes(busca.toLowerCase())) return false;
      return true;
    });
  }, [busca, filtroRole]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuários"
        subtitle="Gestão de usuários internos e externos"
        actions={
          <Button
            onClick={() => setNovoOpen(true)}
            className="rounded-[100px] bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white"
          >
            <Plus className="h-4 w-4" /> Novo usuário
          </Button>
        }
      />

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, e-mail ou empresa…"
            className="pl-9 rounded-[100px]"
          />
        </div>
        <Select value={filtroRole} onValueChange={(v) => setFiltroRole(v as Role | "all")}>
          <SelectTrigger className="w-full md:w-64 rounded-[100px]">
            <SelectValue placeholder="Filtrar por role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="consultor">Consultor</SelectItem>
            <SelectItem value="cliente_recorrente">Cliente Recorrente</SelectItem>
            <SelectItem value="cliente_avulso">Cliente Avulso</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-[28%]">Nome</TableHead>
              <TableHead className="w-[24%]">E-mail</TableHead>
              <TableHead className="w-[16%]">Role</TableHead>
              <TableHead className="w-[16%]">Empresa</TableHead>
              <TableHead className="w-[8%]">Status</TableHead>
              <TableHead className="w-[8%] text-right pr-6">Última atividade</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lista.map((u) => (
              <TableRow key={u.id} className="group">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-md bg-[#034C8B] text-white flex items-center justify-center text-xs font-semibold">
                      {u.iniciais}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium">{u.nome}</span>
                      <CopyButton value={u.id} />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{u.email}</TableCell>
                <TableCell><RoleBadge role={u.role} /></TableCell>
                <TableCell>{u.empresa}</TableCell>
                <TableCell>
                  <span className={cn(
                    "badge-pill",
                    u.ativo
                      ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
                      : "bg-[#424447]/20 text-muted-foreground border-border",
                  )}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {u.ativo ? "Ativo" : "Inativo"}
                  </span>
                </TableCell>
                <TableCell className="text-right pr-6">
                  <div className="flex items-center justify-end gap-1">
                    <span className="text-xs text-muted-foreground mr-2">{u.ultimaAtividade}</span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                      <button className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground" title="Editar role">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground" title="Reenviar convite">
                        <Mail className="h-3.5 w-3.5" />
                      </button>
                      <button className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive" title="Desativar">
                        <UserX className="h-3.5 w-3.5" />
                      </button>
                      <button className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground" title="Mais">
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {lista.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={novoOpen} onOpenChange={setNovoOpen}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle>Novo usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" placeholder="Nome completo" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" placeholder="email@empresa.com" />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Selecione a role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="consultor">Consultor</SelectItem>
                  <SelectItem value="cliente_recorrente">Cliente Recorrente</SelectItem>
                  <SelectItem value="cliente_avulso">Cliente Avulso</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="empresa">Empresa</Label>
              <Input id="empresa" placeholder="Nome da empresa" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNovoOpen(false)} className="rounded-[100px]">Cancelar</Button>
            <Button onClick={() => setNovoOpen(false)} className="rounded-[100px] bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white">Criar usuário</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
