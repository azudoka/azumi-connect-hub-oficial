import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { empresas } from "@/data/mock";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function Empresas() {
  const navigate = useNavigate();
  const [novaOpen, setNovaOpen] = useState(false);
  const [nomeEmpresa, setNomeEmpresa] = useState("");
  return (
    <div>
      <PageHeader
        title="Empresas"
        subtitle="Todos os clientes ativos da Azumi"
        actions={
          <button className="h-9 px-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center gap-1.5">
            <Plus className="h-4 w-4" /> Nova empresa
          </button>
        }
      />

      <div className="mb-4 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input className="w-full h-9 pl-9 pr-3 rounded-lg bg-secondary border border-input focus:border-primary outline-none text-sm" placeholder="Buscar empresa…" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {empresas.map((e) => (
          <Link key={e.id} to={`/app/empresas/${e.id}`} className="bg-card border border-border rounded-xl p-5 card-hover">
            <div className="flex items-start justify-between gap-3">
              <div className="h-11 w-11 rounded-lg bg-gradient-brand flex items-center justify-center text-white font-display font-semibold">
                {e.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </div>
              <StatusBadge status="ativa" />
            </div>
            <h3 className="mt-3 font-display font-semibold">{e.nome}</h3>
            <p className="text-xs text-muted-foreground">{e.segmento} · {e.colaboradores} colaboradores</p>
            <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
              Consultor: <span className="text-foreground font-medium">{e.consultor}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
