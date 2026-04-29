import { PageHeader } from "@/components/PageHeader";
import { Sparkles, Mail } from "lucide-react";

export default function ClienteHubIndisponivelPage() {
  return (
    <div>
      <PageHeader
        title="Hub de Pessoas"
        subtitle="Onde colaboradores, líderes e CEO acompanham a operação humana da sua empresa."
      />
      <div className="bg-card border border-border rounded-2xl shadow-card p-8 max-w-2xl">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold mb-2">Em implantação para sua empresa</h2>
            <p className="text-sm text-muted-foreground mb-4">
              O Hub de colaboradores e líderes ainda não está ativo na sua conta. Fale com seu consultor Azumi para
              ativar esta funcionalidade e dar acesso ao seu time.
            </p>
            <a
              href="mailto:ana.beatriz@azumi.com.br"
              className="inline-flex items-center gap-2 h-9 px-4 rounded-full bg-primary text-primary-foreground text-sm font-medium"
            >
              <Mail className="h-4 w-4" /> Falar com consultor
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
