# Placar — handoff do redesign (v2)

Este pacote traz o redesign de todas as telas do Placar e as instruções para implementar no projeto Nuxt 4 + Nuxt UI 4 + Tailwind 4 + Supabase.

## Como usar este pacote

- `designs/*.dc.html` são as telas de referência. São HTML com estilos inline: leia a marcação e os estilos como especificação visual (cores, tamanhos, espaçamentos, textos). Ignore `support.js`, `<x-dc>`, `<sc-if>`, `<sc-for>`, `{{...}}` e o bloco `<script type="text/x-dc">` — é o runtime da ferramenta de design. A lógica dentro desse script mostra o comportamento esperado (validação, estados, desfazer).
- Os textos em português dos designs são os textos finais.
- Mantenha Nuxt UI onde fizer sentido (`UButton`, `UModal`, `UInput`, toasts), customizando via `app.config.ts` e classes, ou crie componentes próprios quando o Nuxt UI não chegar no visual.

| Design | Rota / arquivo no projeto |
|---|---|
| `Main.dc.html` | `/` — `app/pages/index.vue` |
| `Painel.dc.html` | `/painel` — `app/pages/painel.vue`, `Header.vue`, `PlacarItem.vue` |
| `PainelVazio.dc.html` | `/painel` estados vazio / carregando / erro |
| `CriarPlacar.dc.html` | `CreatePlacarModal.vue` |
| `Placar.dc.html` | `/id/[id]` visto pelo dono — `app/pages/id/[id].vue` |
| `PlacarVisitante.dc.html` | `/id/[id]` visto por visitante |
| `Configuracoes.dc.html` | `ConfigPlacarModal.vue` (passar a renderizar em `[id].vue`) |
| `Erro.dc.html` | `app/error.vue` |
| `DesignSystem.dc.html` | referência de tokens e componentes |

## 1. Tokens

### Cores
| Nome | Hex | Uso |
|---|---|---|
| Fundo | `#18181b` (zinc-900) | fundo de todas as telas |
| Superfície (novo) | `#1d1d20` | cards, painéis, modais, campos de busca |
| Elevado | `#27272a` (zinc-800) | bordas, botão secundário, chips |
| Acentuado | `#3f3f46` (zinc-700) | anéis de campos e botões secundários, hover |
| Discreto | `#52525c` (zinc-600) | “#” do ID, “:” entre placares |
| Primário | `#ffffff` | botões principais, títulos, números |
| Texto | `#e4e4e7` / forte `#d4d4d8` | corpo |
| Texto suave | `#9f9fa9` | rótulos, apoio, time que está perdendo |
| Texto apagado | `#71717b` | contadores, dicas |
| Erro | `#ff6467` | apagar, validação |
| Sucesso | `#05df72` | toast de sucesso, selo “Ao vivo” |

Cores de time (novas): Azul `#51a2ff`, Laranja `#ff8904`, Verde `#05df72`, Roxo `#a684ff`, Rosa `#fb64b6`, Amarelo `#fdc700`. Fundo do monograma = cor + alfa `24` (≈14%).

Sugestão: declarar em `app/assets/style.css` dentro de `@theme` (`--color-surface: #1d1d20;` etc.).

### Tipografia
- Texto: Open Sans 400/500/600/700 (já existe).
- Números (placar, resumo, `+1`, VS, dígitos de erro): **Barlow Condensed 600/700** — adicionar via `@nuxt/fonts` e expor como `--font-score` em `@theme`. Usar `font-variant-numeric: tabular-nums`.
- IDs em `ui-monospace`.
- Escala: marca 64–112; título de página 30–40/700; nome no placar 20–34/700; título de modal 24/700; seção 16/600; corpo 15–18; apoio 12–13.

### Raios, bordas e elevação
- Raios: 6 (chip de ID), 8 (botões de cabeçalho), 10 (botões grandes, campos), 12 (cards, +1), 16 (destaque, histórico), 20 (painéis de time e modais), 24 (telão), 999 (selos, avatar).
- Bordas como anel interno: `box-shadow: inset 0 0 0 1px #27272a` (ou `ring-1 ring-inset`).
- Sombras só em modal (`0 32px 80px rgba(0,0,0,.6)`) e toast.
- Overlay de modal: `#09090b` a 72% + `backdrop-blur` 4px.
- Fundo texturizado (login, erro, painel vazio): `radial-gradient(rgba(255,255,255,.05) 1px, transparent 1px)` a cada 24px.

### Marca
Logomarca: quadrado branco arredondado com duas barras verticais escuras (a segunda a 45% de opacidade) + “Placar” em Open Sans 700. Trocar o favicon padrão do Nuxt por essa marca.

## 2. Telas

### Login (`index.vue`)
- Duas colunas (empilham abaixo de ~900px): à esquerda “Bem-vindo(a) ao” + logomarca + “Placar”, descrição, prévia de placar ao vivo animada (oculta abaixo de 900px) e 3 destaques; à direita card “Entrar”.
- Botão “Entrar com Discord” branco, 52px, mostrar `loading` ao clicar.
- Campo “ID do placar” com `<label>` visível, “#” fixo à esquerda, contador `n/6`, seta que fica branca só com 6 caracteres. Sanitizar (só `a-z0-9`, minúsculas, máx. 6).
- Enter/clique com ID incompleto mostra erro abaixo do campo (“Digite o ID do placar.” / “O ID tem 6 letras ou números.”) — hoje não acontece nada.

### Painel (`painel.vue`)
- Cabeçalho de 72px: logomarca à esquerda; à direita chip com avatar do Discord (`user_metadata.avatar_url`, fallback inicial) + nome, e botão-ícone “Sair”.
- “Seu painel” / “Olá, {primeiro nome}” + botão “Criar placar”.
- Resumo: placares criados, pontos marcados (soma), empatados agora.
- “Continuar de onde parou”: placar mais recente em destaque.
- “Todos os placares”: busca por time ou ID (filtro no cliente), ordenação (mais recentes / mais antigos / mais pontos), grade de cards + card tracejado “Novo placar”.
- Card (`PlacarItem.vue`): chip `#public_id`, tempo relativo de `created_at`, duas linhas time (barra de cor + nome + número), quem perde em `#9f9fa9`, rodapé com “{líder} por {n}” ou “Empate”.
- **Corrigir:** filtrar por `creator = user.id`; linkar por `public_id` (hoje usa o id numérico).
- Estados (`PainelVazio.dc.html`): vazio com 3 passos, carregando com skeleton, erro com “Tentar novamente” (usar o `status`/`error` do `useAsyncData`).

### Novo placar (`CreatePlacarModal.vue`)
- Título “Novo placar”, prévia `0 : 0` ao vivo, nome + seletor de cor por time (cor do outro time desativada), stepper de pontuação (mín. 1), botões “Cancelar” e “Criar placar”.
- Manter as mensagens de validação atuais do zod.

### Placar — dono (`[id].vue`)
- Cabeçalho de 72px: “← Painel”, logomarca, selo “Ao vivo”, “Compartilhar” (copia o link) e botão-ícone de configurações.
- Chips: `#id` (copia o ID), “+N por clique”, “Criado há …”.
- Dois painéis de time: faixa de cor no topo, monograma, nome, selo “Na frente”, número grande (tamanho P/M/G), botões “−” (64px, desativado no 0) e “+N” (branco, largo). Painel do líder com anel na cor do time.
- Centro: “VS” + diferença ou “Empate”.
- “Últimas jogadas” com “Desfazer”.
- Toasts do Nuxt UI no lugar de `window.alert`.
- **Corrigir:** atualizar a tela após +/− (atualização otimista + realtime); não deixar pontuação negativa; renderizar o modal de configurações.

### Placar — visitante
- Mesmo layout sem controles; “← Início”; chip “Você está assistindo”; “Última jogada: …”.
- Botão “Modo telão”: esconde cabeçalho e chips (usar Fullscreen API se disponível).

### Configurações (`ConfigPlacarModal.vue`)
- Título “Configurações” + “{A} x {B} · #id”.
- Editar nomes dos times, pontuação por clique, tamanho dos números (P/M/G com prévia).
- “Reiniciar” com confirmação inline; zona de perigo “Apagar” com confirmação e, ao apagar, ir para `/painel`.
- Rodapé “Cancelar” / “Salvar alterações”.

### Erro (`error.vue`)
- Logomarca no topo, código em placas de dígito, título + texto por código (404/400/500), botões “Voltar para o início” e “Ir para o painel”. Corrigir “Error desconhecido” → “Erro desconhecido”.
- Fazer `[id].vue` lançar `createError` 404/400 em vez de ficar no spinner.

## 3. Dados e backend (nova migration)
- `Placar`: adicionar `team_a_color text`, `team_b_color text` (default `#51a2ff` / `#ff8904`), `score_size text` default `'G'`; `CHECK` de pontuação ≥ 0.
- Histórico (para “Últimas jogadas” e “Desfazer”): tabela `PlacarEvent` (`id`, `placar_id`, `team` 'a'|'b', `delta int`, `score_after int`, `created_at`), RLS: leitura pública, escrita só do criador. Desfazer = aplicar o inverso do último evento e apagá-lo.
- Realtime: reativar o código comentado de `postgres_changes` em `[id].vue` e habilitar realtime no Supabase para `Placar` (e `PlacarEvent`).
- Regerar `database.types.ts`.

## 4. Ordem sugerida
1. Tokens, fontes, logomarca e favicon.
2. Correções de bugs do relatório (link do card, filtro por criador, tela não atualiza, spinner infinito, modal de configurações, acessibilidade).
3. Login, Painel e estados, Erro.
4. Migration (cores, histórico, tamanho) + modal Novo placar + Configurações.
5. Placar dono/visitante, realtime, modo telão.

Cada etapa deve funcionar em celular (≥ 360px) e manter `aria-label` nos botões só com ícone.
