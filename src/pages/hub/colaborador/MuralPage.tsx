import { PageHeader } from "@/components/PageHeader";
import { useEffect, useState } from "react";
import { comunicadosMock, type ComunicadoHub } from "@/data/hubMock";
import { HubModal } from "@/components/hub/HubModal";
import { Heart, MessageCircle, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

const tagCls: Record<string, string> = {
  Endomarketing: "bg-pink-500/15 text-pink-600",
  Atualização: "bg-blue-500/15 text-blue-600",
  Aviso: "bg-amber-500/15 text-amber-600",
  Alerta: "bg-red-500/15 text-red-600",
  Evento: "bg-emerald-500/15 text-emerald-600",
};

// TODO: substituir por chamada real ao Supabase quando a tabela estiver pronta:
//   import { supabase } from "@/lib/supabaseClient";
//   const { data } = await supabase.from("comunicados").select("*").order("data", { ascending: false });
//   return (data ?? []) as ComunicadoHub[];
async function fetchComunicados(): Promise<ComunicadoHub[]> {
  return comunicadosMock;
}

export default function MuralPage() {
  const [comunicados, setComunicados] = useState<ComunicadoHub[]>([]);
  const [aberto, setAberto] = useState<ComunicadoHub | null>(null);
  const [curtidos, setCurtidos] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchComunicados().then(setComunicados);
  }, []);

  function toggleCurtir(id: string) {
    setCurtidos((p) => ({ ...p, [id]: !p[id] }));
  }

  return (
    <div>
      <PageHeader title="Comunicados" subtitle="Novidades, eventos e avisos do seu time." />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {comunicados.map((c) => {
          const liked = curtidos[c.id];
          return (
            <article
              key={c.id}
              className="bg-card border border-border rounded-2xl shadow-card overflow-hidden flex flex-col hover:border-primary/40 transition-colors"
            >
              <button onClick={() => setAberto(c)} className="text-left">
                <div className="aspect-[16/10] bg-muted overflow-hidden relative">
                  <img src={c.capa} alt={c.titulo} className="w-full h-full object-cover" loading="lazy" />
                  <span className={cn("absolute top-3 left-3 text-[11px] font-medium px-2 py-0.5 rounded-full", tagCls[c.categoria] || "bg-secondary")}>
                    {c.categoria}
                  </span>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <div className="h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-semibold">
                        {c.autor.slice(0, 1)}
                      </div>
                      {c.autor}
                    </div>
                    <span className="font-data">{c.data}</span>
                  </div>
                  <h3 className="font-display font-semibold text-base">{c.titulo}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{c.conteudo}</p>
                </div>
              </button>
              <div className="px-4 py-3 border-t border-border flex items-center gap-4 text-xs text-muted-foreground">
                <button onClick={() => toggleCurtir(c.id)} className="flex items-center gap-1 hover:text-primary transition-colors">
                  <Heart className={cn("h-3.5 w-3.5", liked && "fill-red-500 text-red-500")} />
                  {c.curtidas + (liked ? 1 : 0)}
                </button>
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-3.5 w-3.5" />
                  {c.comentarios}
                </span>
                <span className="flex items-center gap-1 ml-auto">
                  <Eye className="h-3.5 w-3.5" />
                  {c.visualizacoes}
                </span>
              </div>
            </article>
          );
        })}
      </div>

      <HubModal open={!!aberto} onClose={() => setAberto(null)} size="lg">
        {aberto && (
          <>
            <div className="aspect-[16/9] bg-muted">
              <img src={aberto.capa} alt={aberto.titulo} className="w-full h-full object-cover" />
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", tagCls[aberto.categoria] || "bg-secondary")}>
                  {aberto.categoria}
                </span>
                <span className="text-xs text-muted-foreground font-data">{aberto.data}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-semibold">
                  {aberto.autor.slice(0, 1)}
                </div>
                <div>
                  <div className="text-sm font-medium">{aberto.autor}</div>
                  <div className="text-xs text-muted-foreground">{aberto.cargo}</div>
                </div>
              </div>
              <h2 className="font-display text-xl font-semibold">{aberto.titulo}</h2>
              <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">{aberto.conteudo}</p>
              <div className="flex items-center gap-5 pt-4 border-t border-border text-sm">
                <button onClick={() => toggleCurtir(aberto.id)} className="flex items-center gap-1.5 hover:text-primary transition-colors">
                  <Heart className={cn("h-4 w-4", curtidos[aberto.id] && "fill-red-500 text-red-500")} />
                  {aberto.curtidas + (curtidos[aberto.id] ? 1 : 0)} curtidas
                </button>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <MessageCircle className="h-4 w-4" />
                  {aberto.comentarios} comentários
                </span>
                <span className="flex items-center gap-1.5 ml-auto text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  {aberto.visualizacoes} viram
                </span>
              </div>
            </div>
          </>
        )}
      </HubModal>
    </div>
  );
}
