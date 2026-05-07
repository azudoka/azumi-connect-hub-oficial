## Objetivo

Entregar o MVP visual+navegacional do **Azumi Hub – visão Colaborador**, espelhado nos prints do Hub antigo e do Connect, com todas as rotas funcionando (sem páginas em branco/erro), cards bonitos e modais centralizados padronizados.

Tudo será **mock** (dados em memória), sem mexer em backend. Não removo nada existente — só substituo páginas-stub e crio as faltantes.

---

## Escopo desta rodada

### 1. Acesso ao Hub no ambiente demo
- No `ClienteHubIndisponivelPage` (e em qualquer guard que esteja barrando), liberar acesso quando o usuário for demo → redirecionar `/hub` → `/hub/colaborador/inicio`.
- Adicionar rotas-atalho `/hub/politicas`, `/hub/guias`, `/hub/treinamentos`, `/hub/comunicados`, `/hub/ajuda` que redirecionam para a versão `/hub/colaborador/...` (compatibilidade).

### 2. Home do Colaborador (`/hub/colaborador/inicio`)
Refatorar `ColaboradorInicio` para refletir o print:
- Saudação grande “Olá, [nome] 👋” + chip “Tempo de casa”.
- 1ª linha: card Termômetro de humor (emoji + texto) + 4 KPIs (Comunicados novos, Políticas vigentes, Treinamentos disponíveis, Minhas solicitações).
- Seção “Políticas Internas” (3 cards resumidos com link “Ver todas”).
- Seção “Comunicados recentes” (3 itens com prioridade/data/título/snippet/“x leram”).
- Sidebar direita: Destaque do mês + Promovidos + Próximos eventos (mock).

### 3. Políticas Internas (`/hub/colaborador/politicas`)
- Grid 3 colunas com capa, título, categoria, tag (Obrigatória/Complementar/Informativa), versão, “x/y assinaturas” e badge de status (Visualizada / Assinada / Em revisão).
- Filtro por chips: Todas / Governança / Operação / Compliance / RH.
- **Modal de política** central (com `useScrollLock`): capa, título, meta, botão “Visualizar PDF”, contadores e botão “Assinar ciência” (mock muda para Assinada).

### 4. Guias Internos (`/hub/colaborador/guias`) — NOVA
- Grid 3 col., cada card: badge de tipo (PDF/Vídeo/Link externo), badge de categoria, capa, título, descrição, ação primária (`Abrir PDF` / `Ver vídeo` / `Abrir link`).
- Sem modal — botões usam `target="_blank"` para o mock URL.

### 5. Treinamentos (`/hub/colaborador/treinamentos`)
- Grid de cards: badge modalidade (Presencial/Online), data, título, instrutor + 3 mini-KPIs (Carga horária, Participantes, SLA).
- **Modal detalhado** (centralizado): título, modalidade+data, instrutor, carga, participantes, SLA + bloco “Materiais” com 2 links.

### 6. Mural / Comunicados (`/hub/colaborador/mural`)
- Renomear visualmente para “Comunicados” (rota mantida + alias `/hub/colaborador/comunicados`).
- Cards com capa, tag, autor+data, título, snippet, rodapé com curtidas/comentários/visualizações.
- **Modal de comunicado** estilo post: imagem grande, tag, autor+data, título, conteúdo, rodapé com curtir (mock toggle), comentários (contagem), “x viram”.

### 7. Ajuda → “Fale com a Azumi” (`/hub/colaborador/ajuda`)
- Reescrever a página para um formulário: Categoria (Dúvidas gerais/Sugestão/Problema técnico/Outro), Descrição, botão “Enviar mensagem”.
- Aviso destacado: “Este NÃO é o canal formal de denúncias. Para isso, use o módulo de Governança.”

### 8. Novo componente de Modal padrão
Criar `src/components/hub/HubModal.tsx`: backdrop centralizado, scroll lock, `max-h-[90vh]` com scroll interno, botão fechar — reutilizado por Políticas, Treinamentos e Comunicados.

### 9. Mocks compartilhados
Centralizar em `src/data/hubMock.ts`: `politicasMock`, `guiasMock`, `treinamentosMock`, `comunicadosMock` (com capas usando `https://images.unsplash.com/...` ou imagens já existentes).

---

## Fora de escopo (não mexo agora)
- Visões Líder e CEO do Hub.
- Backend/persistência real (tudo mock).
- Comentários reais no mural (só contadores).
- Canal de denúncias formal (fica para o módulo Governança).
- Benefícios / Holerites / Férias (já existem; só verifico se as rotas abrem sem erro).

---

## Detalhes técnicos

- Reutilizo `useScrollLock` + `ScrollLock` já existentes.
- Cards seguem padrão `bg-card border border-border rounded-2xl shadow-card`.
- Tokens semânticos do `index.css` (sem cores hardcoded).
- Imagens dos mocks: usar `https://images.unsplash.com/...` (consistente com o que já é usado no projeto).
- Não removo nenhum arquivo; só edito/crio.

## Arquivos previstos

**Criar**
- `src/components/hub/HubModal.tsx`
- `src/data/hubMock.ts`
- `src/pages/hub/colaborador/GuiasPage.tsx`

**Editar**
- `src/App.tsx` (rotas-atalho + libera acesso demo)
- `src/pages/hub/ColaboradorInicio.tsx` (refatora home)
- `src/pages/hub/colaborador/PoliticasColabPage.tsx` (cards + modal)
- `src/pages/hub/colaborador/TreinamentosColabPage.tsx` (cards + modal)
- `src/pages/hub/colaborador/MuralPage.tsx` (cards + modal)
- `src/pages/hub/colaborador/AjudaPage.tsx` (formulário “Fale com a Azumi”)
- `src/components/layout/SidebarHub.tsx` (adicionar item “Guias Internos”)
- `src/pages/cliente/ClienteHubIndisponivelPage.tsx` (CTA para entrar no Hub demo)
