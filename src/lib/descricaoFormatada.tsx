/**
 * Markdown leve, sem dependência externa — pensado pra descrição de vaga.
 * Suporta só o essencial: **negrito**, *itálico*, quebra de linha e listas
 * simples com "- " ou "•" no início da linha. Emoji não precisa de nada
 * especial, o usuário já digita direto (atalho do teclado/emoji picker do SO).
 *
 * Devolve elementos React prontos, não uma string de HTML — evita qualquer
 * risco de injeção (não usa dangerouslySetInnerHTML).
 */
import type { ReactNode } from "react";

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  // Quebra o texto em pedaços por **negrito** e *itálico*, preservando a ordem.
  const parts: ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith("**")) {
      parts.push(<strong key={`${keyPrefix}-b-${i++}`}>{token.slice(2, -2)}</strong>);
    } else {
      parts.push(<em key={`${keyPrefix}-i-${i++}`}>{token.slice(1, -1)}</em>);
    }
    lastIndex = match.index + token.length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts.length > 0 ? parts : [text];
}

export function renderDescricaoFormatada(texto: string): ReactNode {
  const linhas = texto.split("\n");
  return (
    <>
      {linhas.map((linha, idx) => {
        const trimmed = linha.trimStart();
        const isBullet = trimmed.startsWith("- ") || trimmed.startsWith("• ");
        const conteudo = isBullet ? trimmed.slice(2) : linha;

        if (isBullet) {
          return (
            <span key={idx} className="flex gap-2 items-start">
              <span className="text-muted-foreground shrink-0">•</span>
              <span>{renderInline(conteudo, String(idx))}</span>
              {idx < linhas.length - 1 && <br />}
            </span>
          );
        }
        if (linha.trim() === "") {
          return <br key={idx} />;
        }
        return (
          <span key={idx}>
            {renderInline(linha, String(idx))}
            {idx < linhas.length - 1 && <br />}
          </span>
        );
      })}
    </>
  );
}
