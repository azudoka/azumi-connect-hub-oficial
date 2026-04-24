import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-foreground">
      <p className="font-display text-8xl font-bold text-primary/20 leading-none">
        404
      </p>
      <h1 className="mt-6 font-display text-2xl font-semibold tracking-tight">
        Página não encontrada
      </h1>
      <p className="mt-2 max-w-md text-center text-sm text-muted-foreground">
        O endereço que você tentou acessar não existe ou foi movido.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={() => navigate("/app/dashboard")}>
          Voltar ao Dashboard
        </Button>
        <Button variant="outline" onClick={() => navigate("/portal")}>
          Ir para o Portal
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
