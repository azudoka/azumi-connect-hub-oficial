import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AzumiLogo } from "@/components/brand/AzumiLogo";

interface Props {
  nomeCandidato: string;
  onAceitar: () => void;
}

export function DiscIntroConsentimento({ nomeCandidato, onAceitar }: Props) {
  const [aceito, setAceito] = useState(false);

  return (
    <div className="max-w-lg mx-auto text-center py-10 px-6">
      <AzumiLogo product="Connect" size={32} className="mx-auto mb-8" />

      <h1 className="text-2xl font-display font-bold mb-2">
        Olá, {nomeCandidato}!
      </h1>
      <p className="text-muted-foreground mb-6 text-sm">
        Você foi convidado(a) a completar seu Perfil Comportamental DISC.
      </p>

      <div className="bg-secondary/50 rounded-2xl p-6 text-left space-y-4 mb-6">
        <div>
          <p className="text-sm font-semibold text-foreground mb-1">O que é o teste DISC?</p>
          <p className="text-sm text-muted-foreground">
            Um teste rápido (cerca de 10 minutos) que ajuda a entender como você se
            comporta no trabalho — sua forma de se comunicar, tomar decisões e lidar
            com desafios. Não existe resposta certa ou errada.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground mb-1">Por que isso importa?</p>
          <p className="text-sm text-muted-foreground">
            O resultado ajuda a Azumi RH e as empresas parceiras a entender melhor
            seu perfil e encontrar oportunidades que combinam com você.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground mb-1">Como funciona?</p>
          <p className="text-sm text-muted-foreground">
            Para cada bloco de palavras, você indica qual descreve mais você
            e qual descreve menos. Não há tempo limite — responda com calma.
          </p>
        </div>
      </div>

      <label className="flex items-start gap-3 text-sm text-left mb-6 cursor-pointer">
        <input
          type="checkbox"
          checked={aceito}
          onChange={(e) => setAceito(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
        />
        <span className="text-muted-foreground leading-relaxed">
          Li e entendi do que se trata o teste, e aceito responder de forma sincera,
          sendo eu mesmo(a) quem está respondendo.
        </span>
      </label>

      <Button disabled={!aceito} onClick={onAceitar} className="w-full">
        Iniciar teste DISC
      </Button>
    </div>
  );
}
