import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, MessageSquare, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Categoria = "duvida" | "sugestao" | "tecnico" | "outro";
const categoriaLabel: Record<Categoria, string> = {
  duvida: "Dúvidas gerais",
  sugestao: "Sugestão de melhoria",
  tecnico: "Problema técnico",
  outro: "Outro",
};

export default function AjudaPage() {
  const [categoria, setCategoria] = useState<Categoria>("duvida");
  const [descricao, setDescricao] = useState("");

  function enviar() {
    if (descricao.trim().length < 10) {
      toast.error("Descreva sua mensagem com pelo menos 10 caracteres.");
      return;
    }
    toast.success("Mensagem enviada para a Azumi! Em breve entraremos em contato.");
    setDescricao("");
    setCategoria("duvida");
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title="Fale com a Azumi" subtitle="Tire dúvidas, envie sugestões ou relate problemas." />

      <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 mb-6 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm">
          <div className="font-semibold text-amber-700 dark:text-amber-400">Este NÃO é o canal formal de denúncias.</div>
          <p className="text-muted-foreground mt-0.5">
            Para reportar assédio, fraude ou violações ao código de conduta, use o módulo de Governança (Canal de Denúncias).
          </p>
        </div>
      </div>

      <section className="bg-card border border-border rounded-2xl shadow-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold">Nova mensagem</h2>
            <p className="text-xs text-muted-foreground">Resposta em até 1 dia útil.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-xs">Categoria</Label>
            <Select value={categoria} onValueChange={(v) => setCategoria(v as Categoria)}>
              <SelectTrigger className="mt-1 bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(categoriaLabel) as Categoria[]).map((c) => (
                  <SelectItem key={c} value={c}>
                    {categoriaLabel[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs">Descrição</Label>
            <Textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={5}
              className="mt-1 bg-card"
              placeholder="Conte para a Azumi como podemos te ajudar..."
            />
          </div>

          <div className="flex justify-end">
            <Button className="rounded-full" onClick={enviar}>
              <Send className="h-4 w-4 mr-1.5" />
              Enviar mensagem
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
