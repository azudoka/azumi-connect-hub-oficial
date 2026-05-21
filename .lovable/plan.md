# Plano de correções — Trial + Cliente

Muita coisa misturada. Vou organizar em ondas para entregar valor rápido e validar antes de avançar.

## Onda 1 — Consistência do Trial (prioridade máxima)

**Problema:** Dados do trial estão misturados com dados de empresas reais. Páginas mostram informações que não batem.

1. **Vagas do trial** (`/cliente/atracao`)
   - Hoje aparece "Kentaki Foods" no card de cima e "Empresa Demo" no de baixo. Tudo deve ser **"Empresa Demo"** quando `role === "trial"`.
   - Garantir que `vagasDemo` em `mockDemoData.ts` seja usado **exclusivamente** para o trial em todas as derivações (lista, contagens, detalhe).

2. **Detalhe da vaga trial** (`/cliente/atracao/:id`)
   - Hoje mostra só "Sobre o processo" genérico.
   - Para vaga **"Em andamento"** → mostrar candidatos enviados (lista de perfis) usando `candidatosDemo`.
   - Para vaga **"Finalizada"** → mostrar o(s) aprovado(s) e resumo de fechamento.

3. **Avatares quadrados** — varrer páginas do cliente/projetos e trocar qualquer `rounded-full` em avatar por `rounded-lg` (regra de memória do projeto).

## Onda 2 — Aprovação de entregável com contexto

**Problema:** Cliente recebe "Matriz de cargos preliminar" para aprovar mas não tem como visualizar o que está aprovando, nem conversar com o consultor.

Dentro do card de aprovação (`ClienteProjetoDetalhe.tsx`), adicionar:
- **Link "Visualizar documento"** (mock — abre placeholder de visualizador)
- **Histórico da conversa** entre consultor e cliente sobre aquele entregável (drawer ou seção colapsável, dados mock)
- Manter botões "Aprovar" e "Solicitar ajuste" como estão

## Onda 3 — Chat nas Solicitações

**Problema:** Drawer da solicitação abre "Nenhuma mensagem ainda" e só tem input. Precisa do histórico real.

Em `SolicitacoesClientePage.tsx`:
- Popular cada solicitação mock com uma thread de mensagens (cliente ↔ consultor)
- Suportar mensagens com **arquivo anexado** e **link** (badges visuais no balão)
- Mensagens permanecem em estado local da sessão ao "Enviar"

## Onda 4 — Documentos cliente igual ao admin

**Problema:** `/cliente/documentos` está no formato antigo (lista por categoria). Admin já tem o novo formato (cards com thumbnail, badges, ações).

- Replicar o layout de cards do `admin/DocumentosPage.tsx` em `cliente/ClienteDocumentosPage.tsx` e na visão do consultor
- Cliente **não tem** botão "Inserir documento"
- Cliente **tem** ações: Abrir (link), Comentar, Assinar (mock)

## Onda 5 — Identificação da empresa no header do cliente

**Problema:** Logado como Felipe (Horizonte), não aparece em lugar nenhum qual é a empresa dele.

- Mostrar nome da empresa no header do `AppLayout` quando `role === "cliente"` (ao lado/abaixo do nome do usuário)
- Avaliar slot do logo da empresa (hoje placeholder "your app will live here" — investigar se é overlay do editor ou componente real)

## Onda 6 — Hub: gate por contratação

**Problema:** Botão "Hub" leva todo mundo pro Hub, mesmo cliente que não contratou.

- Se cliente **tem Hub contratado** → entra direto nos módulos contratados
- Se cliente **não tem Hub** → página de **apresentação comercial** (`HubTrialPresentation.tsx` já existe — revisar/expandir): hero visual, benefícios, módulos disponíveis, CTA "Fale com seu consultor"
- Menu lateral do Hub: mostra **todos** os módulos, mas só os contratados são clicáveis. Os demais aparecem com cadeado + tooltip "Não incluso no seu plano"
- Botão de upgrade no Hub vira **"Contratar módulos"** e abre modal listando módulos não contratados

## Onda 7 — Horas: esconder do cliente o que não é dele

- Revisar `ClienteHorasPage.tsx` e remover/esconder colunas e métricas internas (a definir contigo numa rodada dedicada — apenas identificar e listar nessa onda, sem decidir)

---

## Detalhes técnicos

- Arquivos principais envolvidos: `VagasClientePage.tsx`, `AtracaoRouter.tsx`, `ClienteProjetoDetalhe.tsx`, `SolicitacoesClientePage.tsx`, `ClienteDocumentosPage.tsx`, `AppLayout.tsx`, `Header.tsx`, `HubLayout.tsx`, `HubTrialPresentation.tsx`, `SidebarHub.tsx`, `mockDemoData.ts`, `mock.ts`.
- Zero alteração no layout das páginas que não estão na lista. Sem novos componentes salvo onde explicitamente necessário (visualizador de doc, gate de módulo).
- Sem alteração de backend — tudo segue mock em memória.

---

## Como sugiro executar

Faço **Onda 1 + Onda 2 + Onda 3** nesta rodada (são as que destravam teste do fluxo trial). Você valida, e nas próximas rodadas seguimos Ondas 4, 5, 6, 7 separadamente para não virar caos.

Confirma se faz sentido começar por essas três ou se quer reordenar?
