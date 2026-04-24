import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
    login({ nome: "Patricia Lima", papel: "admin" });
    navigate("/app/dashboard", { replace: true });
  };

  const entrarComoConsultor = () => {
    login({ nome: "Ana Beatriz", papel: "consultor" });
    navigate("/app/dashboard", { replace: true });
  };

  const entrarComoCliente = () => {
    login({ nome: "Kentaki Foods", papel: "cliente" });
    navigate("/portal", { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-sm">
        <CardContent className="p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-primary">Azumi RH</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Plataforma de gestão
            </p>
          </div>

          <Separator className="my-6" />

          <div className="space-y-3">
            <Button onClick={entrarComoAdmin} className="w-full" size="lg">
              Entrar como Administrador
            </Button>

            <Button
              onClick={entrarComoConsultor}
              variant="secondary"
              className="w-full"
              size="lg"
            >
              Entrar como Consultor — Ana Beatriz
            </Button>

            <Button
              onClick={entrarComoCliente}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Entrar como Cliente — Kentaki Foods
            </Button>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Ambiente de demonstração — sem autenticação real
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
