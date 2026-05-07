import { PageHeader } from "@/components/PageHeader";
import { guiasMock, type GuiaTipo } from "@/data/hubMock";
import { FileText, Play, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const tipoMeta: Record<GuiaTipo, { icon: any; cls: string; cta: string }> = {
  PDF: { icon: FileText, cls: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30", cta: "Abrir PDF" },
  Vídeo: { icon: Play, cls: "bg-blue-500/15 text-blue-600 border-blue-500/30", cta: "Ver vídeo" },
  "Link externo": { icon: ExternalLink, cls: "bg-violet-500/15 text-violet-600 border-violet-500/30", cta: "Abrir link" },
};

export default function GuiasPage() {
  return (
    <div>
      <PageHeader title="Guias Internos" subtitle="Materiais práticos para o seu dia a dia." />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {guiasMock.map((g) => {
          const meta = tipoMeta[g.tipo];
          const Icon = meta.icon;
          return (
            <article
              key={g.id}
              className="bg-card border border-border rounded-2xl shadow-card overflow-hidden flex flex-col hover:border-primary/40 transition-colors"
            >
              <div className="aspect-[16/9] bg-muted overflow-hidden">
                <img src={g.capa} alt={g.titulo} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="p-4 flex flex-col gap-3 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn("inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border", meta.cls)}>
                    <Icon className="h-3 w-3" />
                    {g.tipo}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                    {g.categoria}
                  </span>
                </div>
                <div>
                  <h3 className="font-display font-semibold text-base">{g.titulo}</h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{g.descricao}</p>
                </div>
                <div className="mt-auto pt-2">
                  <a
                    href={g.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                  >
                    <Icon className="h-4 w-4" />
                    {meta.cta}
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
