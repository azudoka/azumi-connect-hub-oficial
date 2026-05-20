import { useState, type ReactNode } from "react";
import { Lock, Sparkles, ArrowRight } from "lucide-react";
import { useAuth, type ModuloSlug } from "@/context/AuthContext";
import { UpgradePlanoModal } from "@/components/UpgradePlanoModal";

interface ModuloGuardProps {
  modulo: ModuloSlug;
  children: ReactNode;
  apenasOperar?: boolean;
}

// Descrição curta do que cada módulo entrega — guia o cliente a entender o valor.
const MODULO_DESCRICAO: Partial<Record<ModuloSlug, string>> = {
  atracao: "Pipeline completo de recrutamento e seleção: vagas, candidatos, DISC, pareceres e shortlist da Azumi.",
  performance: "Ciclos de avaliação de desempenho, feedbacks e PDIs estruturados para sua equipe.",
  governanca: "Auditoria, compliance interno e governança de processos de RH.",
  regulamentacao: "Acompanhamento de NRs, convenções coletivas e exigências regulatórias.",
  politicas: "Construção e revisão de políticas internas com a curadoria da Azumi.",
  engenharia_pessoas: "Arquitetura de cargos, salários e trilhas de carreira.",
  endomarketing: "Comunicação interna, pesquisa de clima e programas de engajamento.",
  dp: "Departamento Pessoal: holerites, férias, afastamentos e CCT.",
  contabilidade: "Folha de pagamento, FGTS, DARF, prazos e relatórios contábeis.",
  juridico: "Processos trabalhistas, compliance e suporte jurídico de RH.",
};

export function ModuloGuard({ modulo, children, apenasOperar = false }: ModuloGuardProps) {
  const { hasModulo, podeOperar, usuario } = useAuth();
  const [openUpgrade, setOpenUpgrade] = useState(false);

  const liberado = apenasOperar ? podeOperar(modulo) : hasModulo(modulo);
  if (liberado) return <>{children}</>;

  const descricao =
    MODULO_DESCRICAO[modulo] ??
    "Este módulo amplia as capacidades da sua operação de RH dentro do Azumi Connect.";

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6" style={{ fontFamily: "'Urbanist', sans-serif" }}>
      <div className="bg-card border border-border rounded-2xl overflow-hidden max-w-xl w-full shadow-sm">
        <div className="h-32 bg-gradient-to-br from-[#031D38] via-[#1D4E89] to-[#8B5CF6] flex items-center justify-center">
          <div className="h-16 w-16 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center ring-1 ring-white/20">
            <Lock className="h-8 w-8 text-white" />
          </div>
        </div>
        <div className="p-7 text-center">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#8B5CF6] mb-2">
            <Sparkles className="h-3 w-3" /> Módulo bloqueado
          </div>
          <h2 className="text-xl font-bold mb-2 text-foreground">
            Este módulo não está disponível no seu plano atual
          </h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
            {descricao}
          </p>
          <button
            type="button"
            onClick={() => setOpenUpgrade(true)}
            className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg text-sm font-semibold text-white hover:opacity-95 transition-opacity"
            style={{ background: "#8B5CF6" }}
          >
            Conheça os planos <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <UpgradePlanoModal
        open={openUpgrade}
        onClose={() => setOpenUpgrade(false)}
        planoAtual={usuario?.plano ?? null}
      />
    </div>
  );
}

export default ModuloGuard;
