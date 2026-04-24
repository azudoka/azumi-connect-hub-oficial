import { toast } from "sonner";
import { CheckCircle2, Download, FileText, Wallet } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { StatusKey } from "@/data/mock";

interface Fatura {
  id: string;
  referencia: string;
  valor: number;
  vencimento: string;
  status: "pago" | "atrasado";
}

const faturas: Fatura[] = [
  {
    id: "FAT-2026-0001",
    referencia: "Mar/2026 — Mapeamento de Cargos",
    valor: 8500,
    vencimento: "15/04/2026",
    status: "atrasado",
  },
  {
    id: "FAT-2026-0006",
    referencia: "Fev/2026 — Mapeamento de Cargos",
    valor: 8500,
    vencimento: "15/03/2026",
    status: "pago",
  },
];

const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const statusMap: Record<Fatura["status"], { key: StatusKey; label: string }> = {
  pago: { key: "concluida", label: "Pago" },
  atrasado: { key: "atrasada", label: "Em atraso" },
};

export default function PortalFinanceiro() {
  const totalFaturado = faturas.reduce((s, f) => s + f.valor, 0);
  const aPagar = faturas
    .filter((f) => f.status === "atrasado")
    .reduce((s, f) => s + f.valor, 0);
  const pago = faturas
    .filter((f) => f.status === "pago")
    .reduce((s, f) => s + f.valor, 0);

  const handleBaixar = () => toast.info("Em breve");

  return (
    <>
      <PageHeader
        title="Financeiro"
        subtitle="Faturas emitidas para a Kentaki Foods"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          label="Total faturado"
          value={formatBRL(totalFaturado)}
          icon={FileText}
        />
        <KpiCard label="A pagar" value={formatBRL(aPagar)} icon={Wallet} />
        <KpiCard label="Pago" value={formatBRL(pago)} icon={CheckCircle2} />
      </div>

      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold mb-3">Faturas</h2>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº Fatura</TableHead>
                  <TableHead>Referência</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {faturas.map((f) => {
                  const s = statusMap[f.status];
                  return (
                    <TableRow key={f.id}>
                      <TableCell className="font-data">{f.id}</TableCell>
                      <TableCell>{f.referencia}</TableCell>
                      <TableCell className="font-data tabular-nums">
                        {formatBRL(f.valor)}
                      </TableCell>
                      <TableCell className="font-data tabular-nums">
                        {f.vencimento}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={s.key}>{s.label}</StatusBadge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleBaixar}
                          className="gap-2"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Baixar boleto
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
