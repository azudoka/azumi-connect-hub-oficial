import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Copy, Check, Download, Building2, Users, Briefcase, Clock,
  Receipt, FileSignature, LayoutGrid, ArrowLeft,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type Plano = "START" | "ONGOING" | "GROWTH";
type StatusConta = "ativa" | "inadimplente" | "pausada";

interface EmpresaMock {
  id: string;
  nome: string;
  plano: Plano;
  status: StatusConta;
  cnpj: string;
  consultor: string;
  horasContratadas: number;
  horasUsadas: number;
  projetosAtivos: number;
  npsMedio: number;
}

const EMPRESA_MOCK: EmpresaMock = {
  id: "EMP-0001",
  nome: "Empresa X",
  plano: "ONGOING",
  status: "ativa",
  cnpj: "12.345.678/0001-90",
  consultor: "Marina Costa",
  horasContratadas: 80,
  horasUsadas: 54,
  projetosAtivos: 3,
  npsMedio: 8.7,
};

const VAGAS = [
  { id: "VAG-0142", titulo: "Dev Pleno React",  status: "Em triagem",  candidatos: 12 },
  { id: "VAG-0140", titulo: "Designer Product", status: "Entrevistas", candidatos: 7  },
  { id: "VAG-0138", titulo: "Tech Lead",        status: "Concluída",   candidatos: 21 },
];

const PROJETOS = [
  { id: "PRJ-0021", nome: "Reestruturação Comercial", status: "Em andamento", inicio: "01/03/2026", fim: "30/06/2026" },
  { id: "PRJ-0019", nome: "Onboarding Liderança",     status: "Em andamento", inicio: "10/02/2026", fim: "10/05/2026" },
  { id: "PRJ-0014", nome: "Diagnóstico DISC",         status: "Concluído",    inicio: "05/01/2026", fim: "20/02/2026" },
];

const HORAS = [
  { consultor: "Marina Costa", horas: 22.5, tarefas: 14 },
  { consultor: "Rafael Lima",  horas: 18.0, tarefas: 9  },
  { consultor: "Ana Beatriz",  horas: 13.5, tarefas: 7  },
];

type StatusBoleto = "pago" | "aberto" | "atrasado";
const BOLETOS: { id: string; venc: string; valor: string; status: StatusBoleto }[] = [
  { id: "BOL-2026-04", venc: "10/04/2026", valor: "R$ 12.500,00", status: "pago"     },
  { id: "BOL-2026-03", venc: "10/03/2026", valor: "R$ 12.500,00", status: "pago"     },
  { id: "BOL-2026-05", venc: "10/05/2026", valor: "R$ 12.500,00", status: "aberto"   },
  { id: "BOL-2026-02", venc: "10/02/2026", valor: "R$ 12.500,00", status: "atrasado" },
];

const CONTRATOS = [
  { id: "CT-001", nome: "Contrato_2026.pdf",          assinado: "20/02/2026" },
  { id: "CT-002", nome: "Aditivo_Horas_Extra.pdf",    assinado: "15/03/2026" },
];

const USUARIOS = [
  { id: "U-003", nome: "Camila Souza",  email: "camila@empresax.com.br", iniciais: "CS", ativo: true  },
  { id: "U-009", nome: "Bruno Mendes",  email: "bruno@empresax.com.br",  iniciais: "BM", ativo: true  },
  { id: "U-010", nome: "Helena Pires",  email: "helena@empresax.com.br", iniciais: "HP", ativo: false },
];

function CopyBtn({ value }: { value: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(value); setDone(true); setTimeout(() => setDone(false), 1200); }}
      className="opacity-0 group-hover:opacity-100 inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-opacity"
      title="Copiar"
    >
      {done ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

function PlanoBadge({ p }: { p: Plano }) {
  const map: Record<Plano, string> = {
    START:   "bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/30",
    ONGOING: "bg-[#8B5CF6]/15 text-[#8B5CF6] border-[#8B5CF6]/30",
    GROWTH:  "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  };
  return <span className={cn("badge-pill", map[p])}>{p}</span>;
}

function StatusContaBadge({ s }: { s: StatusConta }) {
  const map: Record<StatusConta, string> = {
    ativa:         "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
    inadimplente:  "bg-destructive/15 text-destructive border-destructive/30",
    pausada:       "bg-amber-500/15 text-amber-500 border-amber-500/30",
  };
  const label = { ativa: "Ativa", inadimplente: "Inadimplente", pausada: "Pausada" }[s];
  return (
    <span className={cn("badge-pill", map[s])}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

function StatusBoletoBadge({ s }: { s: StatusBoleto }) {
  const map: Record<StatusBoleto, { l: string; c: string }> = {
    pago:     { l: "Pago",      c: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30" },
    aberto:   { l: "Em aberto", c: "bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/30" },
    atrasado: { l: "Atrasado",  c: "bg-destructive/15 text-destructive border-destructive/30" },
  };
  return <span className={cn("badge-pill", map[s].c)}>{map[s].l}</span>;
}

export default function EmpresaDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const empresa = { ...EMPRESA_MOCK, id: id ?? EMPRESA_MOCK.id };
  const consumoPct = Math.round((empresa.horasUsadas / empresa.horasContratadas) * 100);

  const [usuarios, setUsuarios] = useState(USUARIOS);

  return (
    <div className="space-y-6">
      <Link to="/app/empresas" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar para empresas
      </Link>

      <PageHeader
        title={empresa.nome}
        subtitle={`${empresa.id} · CNPJ ${empresa.cnpj}`}
        actions={
          <div className="flex items-center gap-2">
            <PlanoBadge p={empresa.plano} />
            <StatusContaBadge s={empresa.status} />
          </div>
        }
      />

      {/* Header card */}
      <div className="rounded-xl border border-border bg-card p-5 flex items-center gap-4">
        <div className="h-16 w-16 rounded-md bg-[#034C8B] text-white flex items-center justify-center font-display font-semibold text-xl">
          {empresa.nome.split(" ").map((p) => p[0]).slice(0, 2).join("")}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm text-muted-foreground">Consultor responsável</div>
          <div className="font-medium">{empresa.consultor}</div>
        </div>
        <Button className="rounded-[100px] bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white">Editar empresa</Button>
      </div>

      <Tabs defaultValue="visao" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto rounded-[100px] p-1 h-auto">
          <TabsTrigger value="visao"     className="rounded-[100px]"><LayoutGrid    className="h-3.5 w-3.5 mr-1.5" /> Visão Geral</TabsTrigger>
          <TabsTrigger value="vagas"     className="rounded-[100px]"><Briefcase     className="h-3.5 w-3.5 mr-1.5" /> Vagas</TabsTrigger>
          <TabsTrigger value="projetos"  className="rounded-[100px]"><Building2     className="h-3.5 w-3.5 mr-1.5" /> Projetos</TabsTrigger>
          <TabsTrigger value="horas"     className="rounded-[100px]"><Clock         className="h-3.5 w-3.5 mr-1.5" /> Horas</TabsTrigger>
          <TabsTrigger value="boletos"   className="rounded-[100px]"><Receipt       className="h-3.5 w-3.5 mr-1.5" /> Boletos</TabsTrigger>
          <TabsTrigger value="contratos" className="rounded-[100px]"><FileSignature className="h-3.5 w-3.5 mr-1.5" /> Contratos</TabsTrigger>
          <TabsTrigger value="usuarios"  className="rounded-[100px]"><Users         className="h-3.5 w-3.5 mr-1.5" /> Usuários</TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="visao" className="mt-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Horas consumidas</div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-semibold tabular-nums">{empresa.horasUsadas}</span>
                <span className="text-sm text-muted-foreground">/ {empresa.horasContratadas} h</span>
              </div>
              <div className="mt-3 h-2 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-[#3B82F6]" style={{ width: `${consumoPct}%` }} />
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{consumoPct}% utilizado</div>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Projetos ativos</div>
              <div className="mt-2 text-3xl font-semibold tabular-nums">{empresa.projetosAtivos}</div>
              <div className="mt-1 text-xs text-muted-foreground">{PROJETOS.length} no total</div>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">NPS médio</div>
              <div className="mt-2 text-3xl font-semibold tabular-nums">{empresa.npsMedio.toFixed(1)}</div>
              <div className="mt-1 text-xs text-muted-foreground">últimos 90 dias</div>
            </div>
          </div>
        </TabsContent>

        {/* Vagas */}
        <TabsContent value="vagas" className="mt-5">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-[24%]">Código</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-6">Candidatos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {VAGAS.map((v) => (
                  <TableRow key={v.id} className="group">
                    <TableCell>
                      <Link to={`/app/atracao/${v.id}`} className="inline-flex items-center gap-1.5 font-mono text-sm text-[#3B82F6] hover:underline">
                        {v.id}
                      </Link>
                      <CopyBtn value={v.id} />
                    </TableCell>
                    <TableCell className="font-medium">{v.titulo}</TableCell>
                    <TableCell><span className="badge-pill bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/30">{v.status}</span></TableCell>
                    <TableCell className="text-right pr-6 tabular-nums">{v.candidatos}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Projetos */}
        <TabsContent value="projetos" className="mt-5">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-[20%]">Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Início</TableHead>
                  <TableHead>Fim previsto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {PROJETOS.map((p) => (
                  <TableRow key={p.id} className="group">
                    <TableCell>
                      <Link to={`/app/projetos/${p.id}`} className="font-mono text-sm text-[#3B82F6] hover:underline">{p.id}</Link>
                      <CopyBtn value={p.id} />
                    </TableCell>
                    <TableCell className="font-medium">{p.nome}</TableCell>
                    <TableCell><span className="badge-pill bg-[#8B5CF6]/15 text-[#8B5CF6] border-[#8B5CF6]/30">{p.status}</span></TableCell>
                    <TableCell className="text-muted-foreground text-sm">{p.inicio}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{p.fim}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Horas */}
        <TabsContent value="horas" className="mt-5">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>Consultor</TableHead>
                  <TableHead className="text-right">Horas</TableHead>
                  <TableHead className="text-right pr-6">Tarefas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {HORAS.map((h) => (
                  <TableRow key={h.consultor}>
                    <TableCell className="font-medium">{h.consultor}</TableCell>
                    <TableCell className="text-right tabular-nums">{h.horas.toFixed(1)} h</TableCell>
                    <TableCell className="text-right pr-6 tabular-nums">{h.tarefas}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Boletos */}
        <TabsContent value="boletos" className="mt-5">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-[20%]">Código</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-6">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {BOLETOS.map((b) => (
                  <TableRow key={b.id} className="group">
                    <TableCell>
                      <span className="font-mono text-sm text-[#3B82F6]">{b.id}</span>
                      <CopyBtn value={b.id} />
                    </TableCell>
                    <TableCell className="text-sm">{b.venc}</TableCell>
                    <TableCell className="font-medium tabular-nums">{b.valor}</TableCell>
                    <TableCell><StatusBoletoBadge s={b.status} /></TableCell>
                    <TableCell className="text-right pr-6">
                      <Button size="sm" variant="outline" className="rounded-[100px]">
                        <Download className="h-3.5 w-3.5" /> Baixar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Contratos */}
        <TabsContent value="contratos" className="mt-5">
          <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
            {CONTRATOS.map((c) => (
              <div key={c.id} className="flex items-center gap-4 px-5 py-3 hover:bg-muted/30 group">
                <div className="h-10 w-10 rounded-md bg-[#3B82F6]/10 text-[#3B82F6] flex items-center justify-center">
                  <FileSignature className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{c.nome}</div>
                  <div className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
                    <span className="font-mono">{c.id}</span><CopyBtn value={c.id} />
                    <span>· assinado em {c.assinado}</span>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="rounded-[100px]">
                  <Download className="h-3.5 w-3.5" /> Download
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Usuários */}
        <TabsContent value="usuarios" className="mt-5">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>Usuário</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead className="text-right pr-6">Acesso</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuarios.map((u) => (
                  <TableRow key={u.id} className="group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-md bg-[#034C8B] text-white flex items-center justify-center text-xs font-semibold">
                          {u.iniciais}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium">{u.nome}</span>
                          <CopyBtn value={u.id} />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell className="text-right pr-6">
                      <Switch
                        checked={u.ativo}
                        onCheckedChange={(v) => setUsuarios((s) => s.map((x) => x.id === u.id ? { ...x, ativo: v } : x))}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
