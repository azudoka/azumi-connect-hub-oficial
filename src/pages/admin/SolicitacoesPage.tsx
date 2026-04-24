import { useAuth } from "@/context/AuthContext";
import SolicitacoesClientePage from "@/pages/SolicitacoesClientePage";
import Stub from "@/pages/Stub";

export default function SolicitacoesPage() {
  const { user } = useAuth();
  const isClienteUser = user?.papel === "cliente";

  if (isClienteUser) return <SolicitacoesClientePage />;

  // Visão consultor/admin permanece pendente — substitui o Stub anterior sem mudar o contrato.
  return <Stub title="Solicitações" subtitle="Central de solicitações" />;
}
