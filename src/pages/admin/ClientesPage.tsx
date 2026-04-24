import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Briefcase,
  FileText,
  AlertTriangle,
  MoreHorizontal,
  Plus,
  Search,
  Mail,
  Phone,
  MapPin,
  UserCircle2,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { consultores } from "@/data/mock";
import type { StatusKey } from "@/data/mock";

// =====================================================================
// Tipos & Mock
// =====================================================================

type EmpresaStatus = "ativa" | "inativa" | "prospecto";

interface ClienteEmpresa {
  id: string;
  nome: string;
  segmento: string;
  status: EmpresaStatus;
  cidade: string;
  estado: string;
  consultor: string;
  projetos: number;
  faturasAbertas: number;
}

interface Contato {
  id: string;
  nome: string;
  empresaId: string;
  empresa: string;
  cargo: string;
  email: string;
  telefone: string;
  consultor: string;
}

const EMPRESAS_INICIAIS: ClienteEmpresa[] = [
  { id: "kentaki",    nome: "Kentaki Foods",  segmento: "Alimentação",       status: "ativa",     cidade: "São Paulo", estado: "SP", consultor: "Ana Beatriz",   projetos: 2, faturasAbertas: 1 },
  { id: "mira",       nome: "Studio Mira",    segmento: "Beleza & Bem-estar",status: "ativa",     cidade: "Curitiba",  estado: "PR", consultor: "Camila Torres", projetos: 1, faturasAbertas: 0 },
  { id: "maverick",   nome: "Grupo Maverick", segmento: "Varejo",            status: "ativa",     cidade: "Curitiba",  estado: "PR", consultor: "Rafael Moura",  projetos: 1, faturasAbertas: 0 },
  { id: "techplural", nome: "Tech Plural",    segmento: "Tecnologia",        status: "prospecto", cidade: "Remoto",    estado: "SP", consultor: "Ana Beatriz",   projetos: 1, faturasAbertas: 1 },
  { id: "alvo",       nome: "Alvo Digital",   segmento: "Marketing",         status: "ativa",     cidade: "São Paulo", estado: "SP", consultor: "Rafael Moura",  projetos: 1, faturasAbertas: 1 },
];

const CONTATOS_INICIAIS: Contato[] = [
  { id: "ct1", nome: "Carolina Mendes", empresaId: "kentaki",    empresa: "Kentaki Foods",  cargo: "Diretora de RH",      email: "carolina@kentaki.com.br",   telefone: "(11) 91234-5678", consultor: "Ana Beatriz" },
  { id: "ct2", nome: "Roberto Faria",   empresaId: "kentaki",    empresa: "Kentaki Foods",  cargo: "Gerente Financeiro",  email: "roberto@kentaki.com.br",    telefone: "(11) 99876-5432", consultor: "Ana Beatriz" },
  { id: "ct3", nome: "Priya Sharma",    empresaId: "mira",       empresa: "Studio Mira",    cargo: "CEO",                 email: "priya@studiomira.com.br",   telefone: "(41) 98765-4321", consultor: "Camila Torres" },
  { id: "ct4", nome: "Lucas Drummond",  empresaId: "maverick",   empresa: "Grupo Maverick", cargo: "Head de Pessoas",     email: "lucas@maverick.com.br",     telefone: "(41) 99123-4567", consultor: "Rafael Moura" },
  { id: "ct5", nome: "Felipe Nunes",    empresaId: "techplural", empresa: "Tech Plural",    cargo: "CTO",                 email: "felipe@techplural.com.br",  telefone: "(11) 97654-3210", consultor: "Ana Beatriz" },
  { id: "ct6", nome: "Beatriz Campos",  empresaId: "alvo",       empresa: "Alvo Digital",   cargo: "CMO",                 email: "beatriz@alvodigital.com.br",telefone: "(11) 95432-1098", consultor: "Rafael Moura" },
];

const SEGMENTOS = [
  "Alimentação",
  "Beleza & Bem-estar",
  "Varejo",
  "Tecnologia",
  "Marketing",
  "Indústria",
  "Serviços",
  "Educação",
];

const ESTADOS = ["SP", "PR", "RJ", "MG", "SC", "RS"];

// =====================================================================
// Helpers
// =====================================================================

const getIniciais = (nome: string) =>
  nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

// Cor derivada do nome (HSL via tokens) — usa hue determinístico
const getAvatarTone = (nome: string) => {
  let h = 0;
  for (let i = 0; i < nome.length; i++) h = (h * 31 + nome.charCodeAt(i)) % 360;
  // Aplicado via inline style com HSL puro mas usando saturação/luminância seguras para tema
  return { backgroundColor: `hsl(${h} 60% 88%)`, color: `hsl(${h} 55% 28%)` };
};

const empresaStatusMap: Record<EmpresaStatus, { key: StatusKey; label: string }> = {
  ativa:     { key: "ativa",      label: "Ativa" },
  inativa:   { key: "cancelada",  label: "Inativa" },
  prospecto: { key: "aguardando", label: "Prospecto" },
};

// =====================================================================
// Componente principal
// =====================================================================

export default function ClientesPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("empresas");

  // ---- Empresas state ----
  const [empresasList, setEmpresasList] = useState<ClienteEmpresa[]>(EMPRESAS_INICIAIS);
  const [filtroSegmento, setFiltroSegmento] = useState("todos");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [busca, setBusca] = useState("");

  const [novaEmpresaOpen, setNovaEmpresaOpen] = useState(false);
  const [inativarId, setInativarId] = useState<string | null>(null);

  const empresasFiltradas = useMemo(() => {
    return empresasList.filter((e) => {
      if (filtroSegmento !== "todos" && e.segmento !== filtroSegmento) return false;
      if (filtroStatus !== "todos" && e.status !== filtroStatus) return false;
      if (busca && !e.nome.toLowerCase().includes(busca.toLowerCase())) return false;
      return true;
    });
  }, [empresasList, filtroSegmento, filtroStatus, busca]);

  const kpis = useMemo(() => {
    const ativas = empresasList.filter((e) => e.status === "ativa").length;
    const projetos = empresasList.reduce((acc, e) => acc + e.projetos, 0);
    const contratos = empresasList.filter((e) => e.status === "ativa").length; // 1 contrato por empresa ativa
    const inadimplentes = empresasList.filter((e) => e.faturasAbertas > 0).length;
    return { ativas, projetos, contratos, inadimplentes };
  }, [empresasList]);

  const confirmarInativacao = () => {
    if (!inativarId) return;
    setEmpresasList((prev) =>
      prev.map((e) => (e.id === inativarId ? { ...e, status: "inativa" } : e))
    );
    toast.success("Empresa inativada.");
    setInativarId(null);
  };

  // ---- Contatos state ----
  const [contatosList, setContatosList] = useState<Contato[]>(CONTATOS_INICIAIS);
  const [filtroEmpresaContato, setFiltroEmpresaContato] = useState("todas");
  const [buscaContato, setBuscaContato] = useState("");
  const [novoContatoOpen, setNovoContatoOpen] = useState(false);

  const contatosFiltrados = useMemo(() => {
    return contatosList.filter((c) => {
      if (filtroEmpresaContato !== "todas" && c.empresaId !== filtroEmpresaContato) return false;
      if (buscaContato && !c.nome.toLowerCase().includes(buscaContato.toLowerCase())) return false;
      return true;
    });
  }, [contatosList, filtroEmpresaContato, buscaContato]);

  // =====================================================================
  // Render
  // =====================================================================

  return (
    <div>
      <PageHeader
        title="Clientes"
        subtitle="Empresas, contatos e relacionamento comercial"
        actions={
          tab === "empresas" ? (
            <Button onClick={() => setNovaEmpresaOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Nova empresa
            </Button>
          ) : (
            <Button onClick={() => setNovoContatoOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Novo contato
            </Button>
          )
        }
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="empresas">Empresas</TabsTrigger>
          <TabsTrigger value="contatos">Contatos</TabsTrigger>
        </TabsList>

        {/* =================== EMPRESAS =================== */}
        <TabsContent value="empresas" className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard label="Empresas ativas" value={String(kpis.ativas)} icon={Building2} />
            <KpiCard label="Projetos em andamento" value={String(kpis.projetos)} icon={Briefcase} />
            <KpiCard label="Contratos vigentes" value={String(kpis.contratos)} icon={FileText} />
            <KpiCard
              label="Inadimplentes"
              value={String(kpis.inadimplentes)}
              icon={AlertTriangle}
              className={cn(kpis.inadimplentes > 0 && "ring-1 ring-destructive/40")}
            />
          </div>

          {/* Filtros */}
          <Card className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar empresa…"
                  className="pl-9"
                />
              </div>

              <Select value={filtroSegmento} onValueChange={setFiltroSegmento}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Segmento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os segmentos</SelectItem>
                  {SEGMENTOS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  <SelectItem value="ativa">Ativa</SelectItem>
                  <SelectItem value="inativa">Inativa</SelectItem>
                  <SelectItem value="prospecto">Prospecto</SelectItem>
                </SelectContent>
              </Select>

              {(busca || filtroSegmento !== "todos" || filtroStatus !== "todos") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setBusca("");
                    setFiltroSegmento("todos");
                    setFiltroStatus("todos");
                  }}
                >
                  Limpar filtros
                </Button>
              )}
            </div>
          </Card>

          {/* Grid de cards */}
          {empresasFiltradas.length === 0 ? (
            <Card>
              <EmptyState
                icon={Building2}
                title="Nenhuma empresa encontrada"
                description="Ajuste os filtros ou cadastre uma nova empresa."
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {empresasFiltradas.map((e) => {
                const meta = empresaStatusMap[e.status];
                return (
                  <Card key={e.id} className="p-5 card-hover">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-14 w-14 rounded-xl">
                        <AvatarFallback
                          className="rounded-xl font-semibold text-base"
                          style={getAvatarTone(e.nome)}
                        >
                          {getIniciais(e.nome)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-display text-lg font-semibold truncate">
                              {e.nome}
                            </h3>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="badge-pill bg-secondary text-secondary-foreground border border-border">
                                {e.segmento}
                              </span>
                              <StatusBadge status={meta.key}>{meta.label}</StatusBadge>
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => toast.info("Edição em breve")}>
                                Editar empresa
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast.info("Em breve")}>
                                Novo projeto
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast.info("Em breve")}>
                                Ver histórico financeiro
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                disabled={e.status === "inativa"}
                                className="text-destructive focus:text-destructive"
                                onClick={() => setInativarId(e.id)}
                              >
                                Inativar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            <span>{e.cidade} / {e.estado}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-semibold">
                                {getIniciais(e.consultor)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-foreground">{e.consultor}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <Briefcase className="h-3.5 w-3.5" />
                            <span>
                              {e.projetos} {e.projetos === 1 ? "projeto" : "projetos"} · {e.faturasAbertas} {e.faturasAbertas === 1 ? "fatura aberta" : "faturas abertas"}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/app/clientes/${e.id}`)}
                          >
                            Ver detalhes
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* =================== CONTATOS =================== */}
        <TabsContent value="contatos" className="space-y-5">
          <Card className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={buscaContato}
                  onChange={(e) => setBuscaContato(e.target.value)}
                  placeholder="Buscar contato…"
                  className="pl-9"
                />
              </div>
              <Select value={filtroEmpresaContato} onValueChange={setFiltroEmpresaContato}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Empresa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as empresas</SelectItem>
                  {empresasList.map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Card>

          <Card className="overflow-hidden">
            {contatosFiltrados.length === 0 ? (
              <EmptyState
                icon={UserCircle2}
                title="Nenhum contato encontrado"
                description="Ajuste os filtros ou cadastre um novo contato."
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Consultor</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contatosFiltrados.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback
                              className="text-[10px] font-semibold"
                              style={getAvatarTone(c.nome)}
                            >
                              {getIniciais(c.nome)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{c.nome}</span>
                        </div>
                      </TableCell>
                      <TableCell>{c.empresa}</TableCell>
                      <TableCell className="text-muted-foreground">{c.cargo}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-sm">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                          {c.email}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-sm">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                          {c.telefone}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">{c.consultor}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/app/clientes/${c.empresaId}`)}>
                              Ver empresa
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.info("Edição em breve")}>
                              Editar contato
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.info("Envio de e-mail em breve")}>
                              Enviar e-mail
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* =================== Dialog: Nova empresa =================== */}
      <NovaEmpresaDialog
        open={novaEmpresaOpen}
        onOpenChange={setNovaEmpresaOpen}
        onCreate={(payload) => {
          const next: ClienteEmpresa = {
            id: `emp-${Date.now()}`,
            nome: payload.nome,
            segmento: payload.segmento,
            status: payload.status,
            cidade: payload.cidade,
            estado: payload.estado,
            consultor: payload.consultor,
            projetos: 0,
            faturasAbertas: 0,
          };
          setEmpresasList((prev) => [next, ...prev]);
          toast.success(`Empresa "${next.nome}" cadastrada.`);
        }}
      />

      {/* =================== Dialog: Novo contato =================== */}
      <NovoContatoDialog
        open={novoContatoOpen}
        onOpenChange={setNovoContatoOpen}
        empresas={empresasList}
        onCreate={(payload) => {
          const empresa = empresasList.find((e) => e.id === payload.empresaId);
          if (!empresa) return;
          const next: Contato = {
            id: `ct-${Date.now()}`,
            nome: payload.nome,
            empresaId: empresa.id,
            empresa: empresa.nome,
            cargo: payload.cargo,
            email: payload.email,
            telefone: payload.telefone,
            consultor: empresa.consultor,
          };
          setContatosList((prev) => [next, ...prev]);
          toast.success(`Contato "${next.nome}" cadastrado.`);
        }}
      />

      {/* =================== Dialog: Inativar empresa =================== */}
      <Dialog open={!!inativarId} onOpenChange={(o) => !o && setInativarId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inativar empresa</DialogTitle>
            <DialogDescription>
              A empresa será marcada como inativa e deixará de receber novas operações.
              Você poderá reativá-la futuramente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInativarId(null)}>Voltar</Button>
            <Button variant="destructive" onClick={confirmarInativacao}>Inativar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// =====================================================================
// Sub-componentes de Dialog
// =====================================================================

interface NovaEmpresaPayload {
  nome: string;
  segmento: string;
  cnpj: string;
  cidade: string;
  estado: string;
  consultor: string;
  status: EmpresaStatus;
}

function NovaEmpresaDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (p: NovaEmpresaPayload) => void;
}) {
  const [nome, setNome] = useState("");
  const [segmento, setSegmento] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [consultor, setConsultor] = useState("");
  const [status, setStatus] = useState<EmpresaStatus>("ativa");

  const reset = () => {
    setNome(""); setSegmento(""); setCnpj(""); setCidade(""); setEstado(""); setConsultor(""); setStatus("ativa");
  };

  const handleSave = () => {
    if (!nome.trim() || !segmento || !cnpj.trim() || !cidade.trim() || !estado || !consultor) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    onCreate({
      nome: nome.trim(),
      segmento,
      cnpj: cnpj.trim(),
      cidade: cidade.trim(),
      estado,
      consultor,
      status,
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova empresa</DialogTitle>
          <DialogDescription>Cadastre uma nova empresa no portfólio.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nome <span className="text-destructive">*</span></Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Acme Ltda." />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Segmento <span className="text-destructive">*</span></Label>
              <Select value={segmento} onValueChange={setSegmento}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {SEGMENTOS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>CNPJ <span className="text-destructive">*</span></Label>
              <Input value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="00.000.000/0000-00" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2 col-span-2">
              <Label>Cidade <span className="text-destructive">*</span></Label>
              <Input value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Ex: São Paulo" />
            </div>
            <div className="space-y-2">
              <Label>Estado <span className="text-destructive">*</span></Label>
              <Select value={estado} onValueChange={setEstado}>
                <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
                <SelectContent>
                  {ESTADOS.map((uf) => (
                    <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Consultor responsável <span className="text-destructive">*</span></Label>
              <Select value={consultor} onValueChange={setConsultor}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {consultores.map((c) => (
                    <SelectItem key={c.id} value={c.nome}>{c.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as EmpresaStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativa">Ativa</SelectItem>
                  <SelectItem value="prospecto">Prospecto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave}>Cadastrar empresa</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface NovoContatoPayload {
  nome: string;
  empresaId: string;
  cargo: string;
  email: string;
  telefone: string;
}

function NovoContatoDialog({
  open,
  onOpenChange,
  empresas,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  empresas: ClienteEmpresa[];
  onCreate: (p: NovoContatoPayload) => void;
}) {
  const [nome, setNome] = useState("");
  const [empresaId, setEmpresaId] = useState("");
  const [cargo, setCargo] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");

  const reset = () => { setNome(""); setEmpresaId(""); setCargo(""); setEmail(""); setTelefone(""); };

  const handleSave = () => {
    if (!nome.trim() || !empresaId || !cargo.trim() || !email.trim() || !telefone.trim()) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    onCreate({
      nome: nome.trim(),
      empresaId,
      cargo: cargo.trim(),
      email: email.trim(),
      telefone: telefone.trim(),
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo contato</DialogTitle>
          <DialogDescription>Cadastre um novo contato vinculado a uma empresa.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nome <span className="text-destructive">*</span></Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome completo" />
          </div>

          <div className="space-y-2">
            <Label>Empresa <span className="text-destructive">*</span></Label>
            <Select value={empresaId} onValueChange={setEmpresaId}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {empresas.map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Cargo <span className="text-destructive">*</span></Label>
            <Input value={cargo} onChange={(e) => setCargo(e.target.value)} placeholder="Ex: Diretor de RH" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>E-mail <span className="text-destructive">*</span></Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nome@empresa.com" />
            </div>
            <div className="space-y-2">
              <Label>Telefone <span className="text-destructive">*</span></Label>
              <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(11) 90000-0000" />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave}>Cadastrar contato</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
