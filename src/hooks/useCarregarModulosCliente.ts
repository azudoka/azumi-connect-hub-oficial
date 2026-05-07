import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useModulos } from "@/context/ModulesContext";
import { carregarConfigCliente } from "@/services/modulosCliente";
import { CONFIG_DEFAULT } from "@/config/modules";

// TODO: substituir por empresaId real quando o Auth ligar ao Supabase.
// O campo correto será algo como usuario.empresaId (uuid da empresa na tabela).
const CLIENTE_DEMO_ID = "demo";

/** Converte o nome da empresa em slug para usar como clienteId temporário. */
function slugifyEmpresa(nome: string): string {
  return nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "") || CLIENTE_DEMO_ID;
}

/**
 * Carrega a config de módulos do cliente logado ao montar/trocar usuário.
 * Deve ser usado dentro de <AuthProvider> e <ModulesProvider>.
 *
 * Ao fazer logout (usuario = null) reseta para CONFIG_DEFAULT.
 */
export function useCarregarModulosCliente() {
  const { usuario } = useAuth();
  const { setConfig } = useModulos();

  useEffect(() => {
    if (!usuario) {
      // logout: volta ao default
      setConfig(CONFIG_DEFAULT);
      return;
    }

    // TODO: trocar por usuario.empresaId quando Auth real existir.
    const clienteId = usuario.empresaNome
      ? slugifyEmpresa(usuario.empresaNome)
      : CLIENTE_DEMO_ID;

    let cancelado = false;

    carregarConfigCliente(clienteId).then((config) => {
      if (!cancelado) setConfig(config);
    });

    return () => {
      cancelado = true;
    };
  // Roda novamente só quando o usuário troca (login/logout)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario?.id]);
}
