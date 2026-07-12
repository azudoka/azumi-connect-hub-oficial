# Fix — Timeline da vaga mock, SLA quebrado, estrelas só na Triagem

## Bug 1 — Estrelas devem aparecer em qualquer etapa

`VagaDetalhe.tsx` (~linha 1595), a condição
`{colunasEstado[c.id] === "Triagem" && (...)}` restringe a exibição
das estrelas só à coluna Triagem — proposital no código, mas errado
pra regra de negócio real: a avaliação é uma métrica interna que deve
ficar visível no card do candidato do início ao fim do processo,
independente da etapa atual.

**Fix**: remover a condição de coluna, deixar sempre visível:
```tsx
{/* Estrelas — avaliação interna, visível em qualquer etapa até o fim do processo */}
<div
  className="flex items-center gap-0.5 pt-0.5"
  title="Avaliação interna (não visível ao cliente)"
  onMouseDown={(e) => e.stopPropagation()}
>
  {/* ...conteúdo interno igual, só tira o "colunasEstado[c.id] === "Triagem" &&" de fora */}
```

Regra adicional pedida pela Patricia: a nota NÃO reseta ao longo do
mesmo processo — só zera se esse candidato entrar num processo NOVO
(outra vaga). Como cada linha de `candidates` já é uma candidatura
específica (um `job_id` por linha), isso já é natural — um novo
processo = uma nova linha em `candidates` com `avaliacao_estrelas`
nulo por padrão. Não precisa de lógica extra pra isso, só confirmar
que não tem nenhum código resetando a nota ao mudar de etapa dentro do
MESMO processo (não deve ter, já que é a mesma linha do banco sendo
atualizada).

## Bug 2 — SLA não é real

Linha ~1255: `<SlaBar percent={vaga.sla} label={... ${vaga.diasAbertos}/${vaga.diasPrevistos} ...} />`
— `vaga.sla`, `vaga.diasAbertos`, `vaga.diasPrevistos` NÃO EXISTEM no
tipo `VagaSupabase` (só existe `vaga.sla_dias`, que é o prazo total
combinado). Calcular de verdade:
```tsx
const diasAbertos = vaga.created_at
  ? Math.floor((Date.now() - new Date(vaga.created_at).getTime()) / (1000 * 60 * 60 * 24))
  : 0;
const diasPrevistos = vaga.sla_dias ?? 30;
const percentSla = Math.min(100, Math.round((diasAbertos / diasPrevistos) * 100));
```
```tsx
<SlaBar percent={percentSla} label={`SLA da vaga · ${diasAbertos}/${diasPrevistos} dias`} />
```
Confirme se `vaga.created_at` já está exposto no tipo `VagaSupabase`
mapeado em `vagasService.ts` — se não estiver, adicione
(`created_at: row.created_at`).

## Bug 3 — Timeline da vaga é 100% mock

Linha 12: `import { vagas, candidatos, etapasVaga, ... } from
"@/data/mock";` — `etapasVaga` é um array fixo, nunca reflete o
progresso real dos candidatos. Por isso trava em "Triagem" mesmo com
candidatos avançados até entrevista com gestor.

**Fix**: derivar a etapa real a partir do progresso MÁXIMO entre todos
os candidatos reais dessa vaga:
```tsx
const progressoCandidatos = candidatosVaga
  .filter((c) => candidatosExtras.find((ex) => ex.id === c.id && ex.origem === "site"))
  .map((c) => colunasEstado[c.id]);

function calcularEtapaAtualVaga(): number {
  // índice mais alto alcançado por QUALQUER candidato real, mapeado pras 6 etapas da timeline
  const ORDEM: Record<string, number> = {
    "Recebido": 2, "Triagem": 2, "Questionário": 3, "Entrevista Azumi": 3,
    "Teste Técnico": 3, "Entrevista Cliente": 4, "Proposta": 5,
    "Contratado": 5, "Reprovado": 5, "Banco de Talentos": 2,
  };
  if (progressoCandidatos.length === 0) return vaga.publicVisible ? 1 : 0;
  return Math.max(1, ...progressoCandidatos.map((c) => ORDEM[c] ?? 1));
}

const etapaAtualIdx = calcularEtapaAtualVaga();

const etapasVagaReal = [
  { nome: "Briefing", inicio: vaga.created_at ? formatDateBR(vaga.created_at) : "—", fim: "—" },
  { nome: "Divulgação", inicio: "—", fim: "—" },
  { nome: "Triagem", inicio: "—", fim: "—" },
  { nome: "Quest/Entrevista", inicio: "—", fim: "—" },
  { nome: "Perfis enviados", inicio: "—", fim: "—" },
  { nome: "Decisão final", inicio: "—", fim: "—" },
].map((e, idx) => ({
  ...e,
  status: idx < etapaAtualIdx ? "concluida" : idx === etapaAtualIdx ? "andamento" : "pendente",
}));
```
Trocar `etapasVaga.map(...)` (linha ~1225) por `etapasVagaReal.map(...)`.
Remover `etapasVaga` do import de `@/data/mock` (linha 12) já que não
é mais usado — confirme que `vagas`/`candidatos`/`comentariosVaga`
ainda são necessários antes de mexer no resto do import, só tire
`etapasVaga` especificamente.

As datas de início/fim de cada etapa (hoje sempre "—") podem ficar
assim por enquanto — calcular datas reais de transição exigiria
guardar histórico de mudança de etapa, que é outra tarefa maior (fora
do escopo agora). O importante é a etapa ATUAL e o status
(concluída/andamento/pendente) refletirem a realidade.

## Teste de fechamento
1. `npm run build` sem erro.
2. Abrir a vaga de Psicólogo Organizacional (a que tem candidato em
   entrevista com gestor) → a Timeline da vaga deve mostrar "Perfis
   enviados" ou além como etapa atual, não mais travado em "Triagem".
3. SLA da vaga mostra dias reais (não `NaN`/`undefined`).
4. Dar estrelas num candidato, movê-lo pra outra coluna do Kanban →
   estrelas continuam aparecendo no card, em qualquer etapa.

Faça commit, push para o GitHub e aguarde o deploy antes de confirmar
conclusão.
