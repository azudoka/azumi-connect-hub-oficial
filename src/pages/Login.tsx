import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, ShieldCheck } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Login() {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  useEffect(() => {
    if (user) {
      navigate(user.papel === "admin" ? "/app/dashboard" : "/portal", {
        replace: true,
      });
    }
  }, [user, navigate]);

  const entrarComoAdmin = () => {
    login({ nome: "Ana Beatriz", papel: "admin" });
    navigate("/app/dashboard");
  };

  const entrarComoCliente = () => {
    login({ nome: "Ana Beatriz", papel: "cliente" });
    navigate("/portal");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12 text-foreground">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 h-12 w-12 rounded-xl bg-gradient-brand flex items-center justify-center font-logo text-xl font-bold text-white">
          A
        </div>
        <h1 className="font-display text-3xl font-semibold text-gradient-brand">
          Azumi RH
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Plataforma de gestão
        </p>
      </div>

      <Card className="w-full max-w-md">
        <CardContent className="p-6 space-y-3">
          <h2 className="font-display text-base font-semibold text-center mb-2">
            Selecione um perfil para entrar
          </h2>

          <Button
            onClick={entrarComoAdmin}
            className="w-full h-14 justify-start gap-3 text-sm"
          >
            <ShieldCheck className="h-5 w-5 shrink-0" />
            <div className="flex flex-col items-start leading-tight">
              <span className="font-semibold">Entrar como Administrador</span>
              <span className="text-[11px] font-normal opacity-80">
                Painel completo · Ana Beatriz
              </span>
            </div>
          </Button>

          <Button
            variant="outline"
            onClick={entrarComoCliente}
            className="w-full h-14 justify-start gap-3 text-sm"
          >
            <Briefcase className="h-5 w-5 shrink-0" />
            <div className="flex flex-col items-start leading-tight">
              <span className="font-semibold">
                Entrar como Cliente (Kentaki Foods)
              </span>
              <span className="text-[11px] font-normal text-muted-foreground">
                Portal do Cliente
              </span>
            </div>
          </Button>

          <p className="pt-2 text-center text-[11px] text-muted-foreground">
            Ambiente de demonstração — sem autenticação real
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
