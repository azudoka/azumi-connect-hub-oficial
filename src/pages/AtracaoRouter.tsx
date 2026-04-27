import { useAuth } from "@/context/AuthContext";
import AtracaoLista from "@/pages/admin/AtracaoLista";
import VagasClientePage from "@/pages/VagasClientePage";

export default function AtracaoRouter() {
  const { user } = useAuth();
  if (user?.papel === "cliente") return <VagasClientePage />;
  return <AtracaoLista />;
}
