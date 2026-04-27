import { PageHeader } from "@/components/PageHeader";
import { useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { humorHistorico } from "@/data/mock";
import { Heart, BookOpen, Megaphone, GraduationCap, MessagesSquare, X, Wallet } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const moods = [
  { v: 5, label: "Ótimo", emoji: "😄", color: "bg-success/20 hover:bg-success/30 border-success/40" },
  { v: 4, label: "Bem", emoji: "🙂", color: "bg-success/10 hover:bg-success/20 border-success/30" },
  { v: 3, label: "Ok", emoji: "😐", color: "bg-warning/15 hover:bg-warning/25 border-warning/30" },
  { v: 2, label: "Não muito bem", emoji: "😕", color: "bg-warning/10 hover:bg-warning/20 border-warning/40" },
  { v: 1, label: "Mal", emoji: "😞", color: "bg-destructive/10 hover:bg-destructive/20 border-destructive/30" },
];

export default function ColaboradorInicio() {
  const [selecionado, setSelecionado] = useState<number | null>(null);
  const [confete, setConfete] = useState(false);
  const [modalEmpatico, setModalEmpatico] = useState(false);

  function escolherHumor(v: number) {
    setSelecionado(v);
    if (v >= 4) {
      setConfete(true);
      setTimeout(() => setConfete(false), 2500);
    } else if (v <= 2) {
      setModalEmpatico(true);
    }
  }

  return (
    <div className="relative">
      {confete && (
        <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
          {Array.from({ length: 40 }).map((_, i) => (
            <span
              key={i}
              className="absolute top-0 animate-fade-in"
              style={{
                left: `${Math.random() * 100}%`,
                width: 8, height: 14,
                background: ["hsl(var(--primary))", "hsl(var(--highlight))", "hsl(var(--warning))", "hsl(var(--success))"][i % 4],
                transform: `rotate(${Math.random() * 360}deg)`,
                animation: `fall 2.4s ${Math.random() * 0.5}s linear forwards`,
                borderRadius: 2,
              }}
            />
          ))}
          <style>{`@keyframes fall { to { transform: translateY(100vh) rotate(720deg); opacity: 0.5; } }`}</style>
        </div>
      )}

      <PageHeader title="Olá, Marina! Como você está hoje?" subtitle="Sua resposta é confidencial e ajuda você e seu líder a cuidarem do clima." />

      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {moods.map((m) => (
            <button
              key={m.v}
              onClick={() => escolherHumor(m.v)}
              className={cn(
                "rounded-xl border p-5 flex flex-col items-center gap-2 transition-all hover:scale-105 hover:shadow-violet",
                m.color,
                selecionado === m.v && "ring-2 ring-primary scale-105"
              )}
            >
              <span className="text-4xl">{m.emoji}</span>
              <span className="text-sm font-medium">{m.label}</span>
            </button>
          ))}
        </div>
        {selecionado && selecionado >= 4 && (
          <div className="mt-4 text-sm text-success text-center animate-fade-in">
            Que ótimo saber! Tenha um excelente dia 💜
          </div>
        )}
        {selecionado === 3 && (
          <div className="mt-4 text-sm text-muted-foreground text-center">
            Obrigada por compartilhar. Estamos por aqui se precisar.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <h3 className="font-display font-semibold mb-3">Seu humor nos últimos 30 dias</h3>
          <div className="h-48">
            <ResponsiveContainer>
              <LineChart data={humorHistorico}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="dia" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} domain={[1, 5]} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="v" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: "hsl(var(--highlight))" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-3">
          <QuickCard icon={Megaphone} title="Comunicados" desc="3 novos comunicados" />
          <QuickCard icon={Wallet} title="Holerites" desc="Março 2026 disponível" to="/hub/colaborador/holerites" />
          <QuickCard icon={BookOpen} title="Políticas" desc="1 política aguarda ciência" />
          <QuickCard icon={GraduationCap} title="Treinamentos" desc="2 cursos em andamento" />
          <QuickCard icon={MessagesSquare} title="Solicitações" desc="1 solicitação aberta" to="/hub/colaborador/solicitacoes" />
        </div>
      </div>

      {modalEmpatico && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-card border border-border rounded-2xl shadow-elevated max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Heart className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display font-semibold">Estamos aqui por você</h3>
                <p className="text-xs text-muted-foreground">Como podemos te ajudar agora?</p>
              </div>
              <button onClick={() => setModalEmpatico(false)} className="ml-auto h-8 w-8 rounded-md hover:bg-secondary flex items-center justify-center">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 mt-4">
              {[
                "Quero conversar com meu líder",
                "Quero conversar com o RH",
                "Quero ser procurado(a) em breve",
                "Só queria registrar, obrigado",
              ].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setModalEmpatico(false)}
                  className="w-full text-left px-4 py-3 rounded-lg border border-border hover:border-primary/40 hover:bg-secondary text-sm transition-colors"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function QuickCard({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 card-hover flex items-center gap-3">
      <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-muted-foreground truncate">{desc}</div>
      </div>
    </div>
  );
}
