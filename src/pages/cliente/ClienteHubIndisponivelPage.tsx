import { Navigate } from "react-router-dom";

// Em ambiente demo, o Hub do Colaborador está liberado.
// Esta rota apenas redireciona para o Hub.
export default function ClienteHubIndisponivelPage() {
  return <Navigate to="/hub/colaborador/inicio" replace />;
}
