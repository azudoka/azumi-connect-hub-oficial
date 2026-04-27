import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Download, FileText, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type StatusHolerite = "disponivel" | "pendente";
const statusStyle: Record<StatusHolerite, { label: string; cls: string }> = {
  disponivel: { label: "Disponível", cls: "bg-success/15 text-success border-success/30" },
  pendente: { label: "Pendente", cls: "bg-warning/15 text-warning border-warning/30" },
};

const meses = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

interface Holerite {
  id: string;
  ano: number;
  mes: number; // 0-11
  status: StatusHolerite;
}

const holerites: Holerite[] = [
  { id: "h1", ano: 2026, mes: 2, status: "disponivel" },
  { id: "h2", ano: 2026, mes: 1, status: "disponivel" },
  { id: "h3", ano: 2026, mes: 0, status: "disponivel" },
  { id: "h4", ano: 2025, mes: 11, status: "disponivel" },
  { id: "h5", ano: 2025, mes: 10, status: "disponivel" },
  { id: "h6", ano: 2025, mes: 9, status: "pendente" },
  { id: "h7", ano: 2025, mes: 8, status: "disponivel" },
  { id: "h8", ano: 2025, mes: 7, status: "disponivel" },
];

export default function ColaboradorHolerites() {
  const hoje = new Date();
  const [ano, setAno] = useState<string>(String(hoje.getFullYear()));

  const filtrados = useMemo(() => {
    const anoNum = Number(ano);
    return holerites
      .filter((h) => h.ano === anoNum)
      .filter((h) => {
        // Não exibir holerites de meses futuros
        if (h.ano > hoje.getFullYear()) return false;
        if (h.ano === hoje.getFullYear() && h.mes > hoje.getMonth()) return false;
        return true;
      })
      .sort((a, b) => b.mes - a.mes);
  }, [ano, hoje]);

  return (
    <div>
      <PageHeader
        title="Holerites"
        subtitle="Acesse e baixe seus holerites mensais."
        actions={
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Ano:</span>
            <Select value={ano} onValueChange={setAno}>
              <SelectTrigger className="w-[110px] rounded-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      {filtrados.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl shadow-card">
          <EmptyState
            icon={Wallet}
            title="Nenhum holerite disponível ainda."
            description="Quando seu próximo holerite for liberado, ele aparecerá aqui."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtrados.map((h) => (
            <div
              key={h.id}
              className="bg-card border border-border rounded-2xl p-5 shadow-card card-hover flex flex-col"
            >
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-display font-semibold">
                    {meses[h.mes]} {h.ano}
                  </div>
                  <div className="text-xs text-muted-foreground">Competência mensal</div>
                </div>
                <span className={cn("badge-pill ml-auto shrink-0", statusStyle[h.status].cls)}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                  {statusStyle[h.status].label}
                </span>
              </div>

              <Button
                disabled={h.status !== "disponivel"}
                onClick={() => toast.info("Download simulado — integração pendente.")}
                className="rounded-full mt-5"
                variant="outline"
              >
                <Download className="h-4 w-4 mr-1.5" />
                Baixar PDF
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
