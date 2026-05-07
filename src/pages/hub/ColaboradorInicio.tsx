import { PageHeader } from "@/components/PageHeader";
import { useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { politicasMock, comunicadosMock } from "@/data/hubMock";
import {
  Megaphone, BookOpen, GraduationCap, ClipboardList, Smile, Trophy, Calendar, ArrowRight,
  Heart, MessageCircle, Eye,
} from "lucide-react";

const moods = [
  { emoji: "😄", label: "Ótimo" },
  { emoji: "🙂", label: "Bem" },
  { emoji: "😐", label: "Ok" },
  { emoji: "😕", label: "Não muito bem" },
  { emoji: "😞", label: "Mal" },
];

const prioridadeCls: Record<string, string> = {
  Alta: "bg-red-500/15 text-red-600",
  Média: "bg-amber-500/15 text-amber-600",
  Baixa: "bg-emerald-500/15 text-emerald-600",
};

const comunicadosRecentes = comunicadosMock.slice(0, 3).map((c, i) => ({
  ...c,
  prioridade: ["Alta", "Média", "Baixa"][i],
  leram: 35 - i * 7,
  total: 48,
}));

export default function ColaboradorInicio() {
  const [humor, setHumor] = useState<number | null>(null);

  return (
    <div>
      <PageHeader
        title="Olá, Ana Carolina 👋"
        subtitle="Bem-vinda à sua Wiki Organizacional. Confira as novidades."
        actions={
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-xs font-medium">
            <Calendar className="h-3.5 w-3.5" /> Tempo de casa: 4 anos e 1 mês
          </span>
        }
      />

      {/* Termômetro + KPIs */}
      <div className="grid grid-cols-12 gap-4 mb-6">
        <div className="col-span-12 md:col-span-5 bg-card border border-border rounded-2xl shadow-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-lg bg-amber-500/15 text-amber-600 flex items-center justify-center">
              <Smile className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display font-semibold">Termômetro de Humor</div>
              <div className="text-xs text-muted-foreground">Como você está hoje? 💛</div>
            </div>
          </div>
          <div className="flex gap-2">
            {moods.map((m, i) => (
              <button
                key={i}
                onClick={() => setHumor(i)}
                className={cn(
                  "flex-1 rounded-lg border py-2 text-2xl transition-all hover:scale-110",
                  humor === i ? "border-primary bg-primary/10 scale-110" : "border-border"
                )}
                title={m.label}
              >
                {m.emoji}
              </button>
            ))}
          </div>
        </div>

        <div className="col-span-12 md:col-span-7 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard icon={Megaphone} value={3} label="Comunicados novos" />
          <KpiCard icon={BookOpen} value={5} label="Políticas vigentes" />
          <KpiCard icon={GraduationCap} value={4} label="Treinamentos" />
          <KpiCard icon={ClipboardList} value={1} label="Minhas solicitações" />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Políticas */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-lg font-semibold">Políticas Internas</h2>
              <Link to="/hub/colaborador/politicas" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                Ver todas <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {politicasMock.slice(0, 3).map((p) => (
                <Link
                  key={p.id}
                  to="/hub/colaborador/politicas"
                  className="bg-card border border-border rounded-2xl shadow-card overflow-hidden hover:border-primary/40 transition-colors"
                >
                  <div className="aspect-[16/9] bg-muted overflow-hidden">
                    <img src={p.capa} alt={p.titulo} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="h-1 bg-primary" />
                  <div className="p-3">
                    <div className="font-display font-semibold text-sm">{p.titulo}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{p.categoria} · {p.versao}</div>
                    <div className="text-xs text-muted-foreground mt-1">{p.assinaturas}/{p.total} assinaturas</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Comunicados */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-lg font-semibold">Comunicados recentes</h2>
              <Link to="/hub/colaborador/mural" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                Ver todos <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="space-y-3">
              {comunicadosRecentes.map((c) => (
                <Link
                  key={c.id}
                  to="/hub/colaborador/mural"
                  className="block bg-card border border-border rounded-2xl shadow-card p-4 hover:border-primary/40 transition-colors"
                >
                  <div className="flex gap-4">
                    <div className="h-16 w-16 rounded-lg bg-muted overflow-hidden shrink-0">
                      <img src={c.capa} alt="" className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full", prioridadeCls[c.prioridade])}>
                          {c.prioridade}
                        </span>
                        <span className="text-xs text-muted-foreground font-data">{c.data}</span>
                      </div>
                      <div className="font-display font-semibold text-sm">{c.titulo}</div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{c.conteudo}</p>
                      <div className="text-[11px] text-muted-foreground mt-1">{c.leram}/{c.total} leram</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar direita */}
        <aside className="col-span-12 lg:col-span-4 space-y-4">
          <div className="bg-card border border-border rounded-2xl shadow-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="h-4 w-4 text-amber-500" />
              <h3 className="font-display font-semibold text-sm">Destaque do Mês</h3>
            </div>
            <div className="flex flex-col items-center text-center py-3">
              <div className="h-16 w-16 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xl font-semibold mb-2">A</div>
              <div className="font-medium">Ana Carolina Silva</div>
              <div className="text-xs text-muted-foreground">Analista de Marketing</div>
              <span className="mt-2 text-[11px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600">⭐ Colaborador(a) do Mês</span>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl shadow-card p-5">
            <h3 className="font-display font-semibold text-sm mb-3">🏅 Promovidos</h3>
            <div className="space-y-3">
              {[
                { n: "Rafael Almeida", c: "Engenheiro de Dados" },
                { n: "Fernanda Lima", c: "Tech Lead" },
              ].map((p) => (
                <div key={p.n} className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center text-xs font-semibold">
                    {p.n.slice(0, 1)}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{p.n}</div>
                    <div className="text-xs text-muted-foreground">{p.c}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl shadow-card p-5">
            <h3 className="font-display font-semibold text-sm mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" /> Próximos eventos
            </h3>
            <Link to="/hub/colaborador/onboarding" className="text-xs text-primary hover:underline">
              Ver calendário completo →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, value, label }: { icon: any; value: number; label: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl shadow-card p-4 flex items-center gap-3">
      <div className="h-10 w-10 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-display font-bold leading-none">{value}</div>
        <div className="text-xs text-muted-foreground truncate mt-1">{label}</div>
      </div>
    </div>
  );
}
