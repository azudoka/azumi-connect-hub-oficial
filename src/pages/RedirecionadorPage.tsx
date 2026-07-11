import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function RedirecionadorPage() {
  const { codigo } = useParams<{ codigo: string }>();
  const [erro, setErro] = useState(false);

  useEffect(() => {
    if (!codigo) { setErro(true); return; }
    (async () => {
      const { data, error } = await supabase
        .from("connect_short_links")
        .select("id, destino_url, cliques")
        .eq("codigo", codigo)
        .maybeSingle();
      if (error || !data) { setErro(true); return; }
      supabase
        .from("connect_short_links")
        .update({ cliques: (data.cliques ?? 0) + 1 })
        .eq("id", data.id)
        .then();
      window.location.replace(data.destino_url);
    })();
  }, [codigo]);

  if (erro) {
    return (
      <div className="flex min-h-screen items-center justify-center text-center px-6">
        <div>
          <p className="text-lg font-medium text-slate-800">Link não encontrado ou expirado.</p>
          <p className="text-sm text-slate-500 mt-1">
            Confira o link recebido ou entre em contato com a Azumi RH.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center text-slate-500 text-sm">
      Redirecionando…
    </div>
  );
}
