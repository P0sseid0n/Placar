# Relatório do projeto Placar — base para o design das telas

Levantamento feito a partir do código do repositório (branch `nuxt-4`, outubro de 2026). Caminhos relativos à raiz do projeto.

**Sobre as cores:** o Tailwind 4 define as cores em `oklch`. Os valores hex abaixo foram convertidos a partir desses valores e são equivalentes, não aparecem escritos assim no código. Os únicos hex/rgba escritos literalmente no código estão marcados como **(literal)**.

---

## 1. Stack

| Item | O que é usado |
|---|---|
| Framework | Nuxt 4.5 (Vue 3), com SSR (padrão do Nuxt, sem `ssr: false`) |
| Linguagem | TypeScript |
| Estilos | Tailwind CSS 4 (classes utilitárias nos templates) + um pouco de CSS global em `app/app.vue` e `app/assets/style.css`. Não usa CSS Modules, SCSS nem styled-components. O README cita "Scss", mas não existe SCSS no projeto. |
| Componentes | Nuxt UI 4.11 (`UApp`, `UButton`, `UModal`, `UCard`, `UForm`, `UFormField`, `UInput`, `USeparator`, `UIcon`, toasts via `useToast`) |
| Ícones | `@nuxt/icon` 2.5 com coleções Iconify: `material-symbols`, `iconamoon`, `simple-icons` e `mingcute` (esta última não está instalada; é buscada remotamente). Além disso, existem SVGs próprios em `app/components/icons/`. |
| Fonte | Open Sans, carregada pelo `@nuxt/fonts` (que vem com o Nuxt UI) |
| Estado | Pinia está instalado, mas não existe nenhuma store |
| Backend | Supabase (Postgres + Auth), via `@nuxtjs/supabase` 2 |
| Formulários | Validação com `zod` no modal de criação |
| Testes | Vitest + `@nuxt/test-utils` |

### Autenticação com Discord
- **Botão:** "Entrar com Discord", na tela `/`. Ele chama `client.auth.signInWithOAuth({ provider: 'discord' })` (`app/pages/index.vue`).
- **Fluxo:** o usuário vai ao Discord, volta pelo callback do Supabase e é redirecionado para `/`. Lá, um `watchEffect` vê que existe usuário e manda para `/painel`.
- **Regras de rota** (`nuxt.config.ts` → `supabase.redirectOptions`):
  - `login: '/'` e `callback: '/'`;
  - `include: ['/painel']`: só `/painel` exige login;
  - `exclude: ['/id/*']`: o placar é público.
- **Logout:** botão "Sair" no cabeçalho do painel (`client.auth.signOut()`). Depois do logout, o cabeçalho redireciona para `/`.
- **Dados do usuário usados na interface:** apenas `user.user_metadata.full_name`, exibido no cabeçalho do painel.
- **Avatar:** não existe na interface. O Supabase também preenche `user_metadata` com outros dados vindos do Discord (como `avatar_url`), mas o código não lê nenhum deles.
- **Identificação do dono:** usa `user.sub`, o id do usuário no Supabase.

### Tempo real
**Não existe.** Há um código de Supabase Realtime (`postgres_changes` em `UPDATE`) em `app/pages/id/[id].vue`, mas ele está todo **comentado**. Também não há polling. O serviço de realtime está desativado no Supabase local (`supabase/config.toml`).

Consequência: quem está vendo um placar só vê mudanças ao recarregar a página. Isso vale até para o dono (ver seção 8).

---

## 2. Tokens visuais

### Tema
- **Só o tema escuro.** O color mode do Nuxt UI está desligado (`ui: { colorMode: false }`), e a classe `dark` está fixa no `<html>` (`nuxt.config.ts`).
- **Troca de tema:** não existe. O tema claro também não é usado.
- **Configuração de cores do Nuxt UI** (`app/app.config.ts`): `primary: 'indigo'` e `neutral: 'zinc'`.

### Cores

**Base do Nuxt UI no modo escuro** (com `neutral = zinc`; valores de `node_modules/@nuxt/ui/dist/runtime/index.css`, classe `.dark`):

| Token | Valor | Hex | Uso |
|---|---|---|---|
| `--ui-bg` (fundo da página, `body`) | zinc-900 | `#18181b` | fundo de todas as telas |
| `--ui-bg-elevated` / `--ui-bg-muted` | zinc-800 | `#27272a` | fundo de botões `subtle`, hover de botões `ghost`, modais/cards do Nuxt UI |
| `--ui-bg-accented` | zinc-700 | `#3f3f46` | hover de botões `subtle` |
| `--ui-bg-inverted` | branco | `#ffffff` | fundo dos botões `neutral` + `solid` |
| `--ui-text` (texto padrão) | zinc-200 | `#e4e4e7` | texto do corpo |
| `--ui-text-highlighted` | branco | `#ffffff` | títulos do Nuxt UI |
| `--ui-text-toned` | zinc-300 | `#d4d4d8` | — |
| `--ui-text-muted` | zinc-400 | `#9f9fa9` | textos secundários do Nuxt UI (ex.: label do separador) |
| `--ui-text-dimmed` | zinc-500 | `#71717b` | — |
| `--ui-text-inverted` | zinc-900 | `#18181b` | texto dos botões `neutral` + `solid` |
| `--ui-border` | zinc-800 | `#27272a` | bordas padrão |
| `--ui-border-muted` / `--ui-border-accented` | zinc-700 | `#3f3f46` | anel (ring) dos botões `subtle` |

**Cores semânticas do Nuxt UI.** No modo escuro, o Nuxt UI usa o tom 400 de cada cor:

| Papel | Cor | Hex (tom 400) | Usado no projeto? |
|---|---|---|---|
| primary | indigo | `#7c86ff` | **não**: nenhum componente usa `color="primary"`; todos os botões usam `neutral` ou `error` |
| secondary | blue (padrão) | `#51a2ff` | não |
| success | green (padrão) | `#05df72` | não |
| info | blue (padrão) | `#51a2ff` | não |
| warning | yellow (padrão) | `#fdc700` | não |
| error | red (padrão) | `#ff6467` | botão "Apagar placar" (`variant="ghost"`) e toast "Erro ao criar placar" |

**Cores escritas diretamente nas classes ou no CSS do projeto:**

| Onde | Classe / valor | Hex |
|---|---|---|
| Fundo de `/painel` e da página de erro | `bg-zinc-900` | `#18181b` |
| Borda inferior do cabeçalho do painel | `border-zinc-800` | `#27272a` |
| Ícone do estado vazio do painel | `text-zinc-500` | `#71717b` |
| Card (`.container-card`): anel | `ring-gray-600/50` → hover `ring-gray-600/75` | `#4a5565` a 50% / 75% |
| Card (`.container-card`): fundo | `bg-zinc-800/10` → hover `bg-zinc-800/25` | `#27272a` a 10% / 25% |
| Botão da seta na tela de login | `bg-white/5` → hover `bg-white/10` | `#ffffff` a 5% / 10% |
| Texto dos cards e do link da página de erro | `text-white` | `#ffffff` |
| Spinner de carregamento (`LoadingIcon.vue`) | `stroke="#ffffff"` **(literal)** | `#ffffff` |
| Barra de rolagem (thumb), em `app/app.vue` | `rgba(245, 245, 250, 0.2)` → hover `rgba(245, 245, 250, 0.4)` **(literal)** | `#f5f5fa` a 20% / 40% |
| Variável `--success-color`, em `app/app.vue` | `#3080e2` **(literal)** | definida, mas **não é usada** em lugar nenhum |

**Opacidades usadas como hierarquia de texto:** `opacity-50` (o "#" antes dos IDs), `opacity-60` (pontuação nos cards), `opacity-75` (subtítulos), `opacity-80` (estado vazio) e `opacity-90`.

### Tipografia

**Família:** `--font-sans: 'Open Sans', sans-serif` (`app/assets/style.css`). Os arquivos `.woff2` são baixados no build pelo `@nuxt/fonts`.

**Pesos usados:**
- `font-normal` 400
- `font-medium` 500 (também o padrão dos botões do Nuxt UI)
- `font-semibold` 600
- `font-bold` 700

**Tamanhos usados** (escala do Tailwind 4; tamanho / altura de linha):

| Classe | Tamanho | Altura de linha | Onde |
|---|---|---|---|
| `text-xs` | 12px | 16px | nomes dos times nos cards do painel |
| `text-base` | 16px | 24px | subtítulo e input da tela de login, valor da pontuação em `/id`, link da página de erro, botões `xl` |
| `text-lg` | 18px | 28px | "Bem-vindo(a) ao", "Pontuação" |
| `text-xl` | 20px | 28px | ID nos cards, título do modal de configurações |
| `text-2xl` | 24px | 32px | mensagem de erro, ícone de pessoa no cabeçalho, seta nos cards |
| `text-3xl` | 30px | 36px | pontuação nos cards, ícone de seta no botão da tela de login |
| `text-5xl` | 48px | 1 | "Placar" no cabeçalho do painel e em `/id` |
| `text-8xl` | 96px | 1 | "Placar" na tela de login |
| `text-9xl` | 128px | 1 | código do erro (ex.: 404), ícone do estado vazio |
| `text-[2vw]` | 2% da largura da tela | `leading-none` (1) | nomes dos times em `/id` |
| `text-[20vw]` | 20% da largura da tela | `leading-none` (1) | pontuação dos times em `/id` |
| `text-md` | **não existe no Tailwind**; a classe não tem efeito e o texto fica com o tamanho herdado (16px) | — | nome do usuário no cabeçalho, "Nenhum placar criado ainda" |
| `text-sm` | 14px | 20px | botões `lg` do Nuxt UI |

### Raios de borda
- `--ui-radius: 0.25rem` (4px), a base do Nuxt UI.
- Botões do Nuxt UI: `rounded-md`, que equivale a 6px.
- `rounded` (4px): input e botão de seta da tela de login.
- `rounded-md` (6px): seta dos cards.
- `rounded-lg` (8px): cards do painel e link da página de erro.
- Barra de rolagem: `border-radius: 40px` **(literal)**.

### Espaçamentos
Base do Tailwind: `--spacing: 0.25rem` (4px). Valores relevantes:

**Tela de login**
- Entre o bloco do título e o bloco de ações: `gap-32` (128px).
- Separador "Ou": `my-12` (48px).
- Abaixo de "Entre para criar um placar": `mb-8` (32px).

**Painel**
- Margem lateral do conteúdo e do cabeçalho: `px-[10%]`, com um `px-[3%]` interno.
- Distância entre cards: `gap-8` (32px).
- Estado vazio: `py-16` (64px).

**Placar (`/id`)**
- Margem lateral do cabeçalho: `px-[10%]`.
- Margem lateral da área dos times: `px-[5%]`.
- Entre os botões + e −: `gap-4` (16px).

**Alturas fixas**
- Cabeçalhos e rodapé: `h-32` (128px).
- Botão do Discord e input de ID: `h-12` (48px).
- Botão de seta da tela de login: `h-10 w-10` (40px).

**Botões do Nuxt UI** (padding do componente):
- `lg`: `px-3 py-2` (12px × 8px), `gap-2`;
- `xl`: o mesmo padding, com texto 16px e ícone de 24px.

### Sombras
**Não existe** nenhuma sombra definida no código do projeto.

### Larguras máximas
- `max-w-80` (320px): bloco de ações da tela de login.
- Cards do painel: `w-64` (256px) × `h-36` (144px).
- Classe `container` (cabeçalho e conteúdo do painel): 100% da largura, limitada pelos breakpoints (640, 768, 1024, 1280 e 1536px).
- `--ui-container: 80rem` (1280px): definido pelo Nuxt UI, mas não usado diretamente.

### Breakpoints
- **Disponíveis** (padrão do Tailwind): `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px, `2xl` 1536px.
- **Usados:** só **um**. É o `md:` no grid do modal "Criando placar" (`grid-cols-1` → `md:grid-cols-[1fr_64px_1fr]`).
- O resto do layout não tem nenhuma adaptação para celular. As telas usam tamanhos fixos, porcentagens e `vw`.

### Conteúdo dos arquivos de tema

Não existe `tailwind.config` nem `globals.css`; o Tailwind 4 é configurado por CSS.

`app/assets/style.css`:
```css
@import 'tailwindcss' theme(static);
@import '@nuxt/ui';

@theme {
	--font-sans: 'Open Sans', sans-serif;
}

:root {
	color-scheme: dark;
}

@layer components {
	.container-card {
		@apply border-0 ring-1 ring-inset ring-gray-600/50 bg-zinc-800/10 hover:bg-zinc-800/25 hover:ring-gray-600/75;
	}
}
```

`app/app.config.ts`:
```ts
export default defineAppConfig({
	ui: {
		colors: {
			primary: 'indigo',
			neutral: 'zinc',
		},
	},
})
```

`app/app.vue` (bloco `<style>`, sem a parte comentada):
```css
:root {
	--success-color: #3080e2;
}

/* width */
::-webkit-scrollbar {
	width: 8px;
}

/* Track */
::-webkit-scrollbar-track {
	background: transparent;
}

/* Handle */
::-webkit-scrollbar-thumb {
	background: rgba(245, 245, 250, 0.2);
	border-radius: 40px;
}

::-webkit-scrollbar-thumb:hover {
	background: rgba(245, 245, 250, 0.4);
}
```
O mesmo `app.vue` ainda tem um bloco grande de CSS **comentado**, de um cabeçalho antigo:
- altura de 128px;
- `h1` com 40px e peso 700;
- botões com 40px de altura, `padding: 0 32px` e `border-radius: 8px`.

`nuxt.config.ts` (trecho de tema):
```ts
app: { head: { htmlAttrs: { class: 'dark' } } },
ui: { colorMode: false },
```

---

## 3. Telas e rotas

Existem **4 telas**: 3 rotas e a página de erro global.

### 3.1 Login / Início — `/`
- **Arquivo:** `app/pages/index.vue`
- **Título da aba:** "Placar | Login"
- **Quem acessa:** visitantes. Quem já está logado é redirecionado automaticamente para `/painel`.

**Layout:** tela cheia (`h-screen`), tudo centralizado vertical e horizontalmente.

**Elementos, de cima para baixo:**
1. "Bem-vindo(a) ao": 18px, peso 500, 75% de opacidade.
2. "Placar": 96px, peso 700.
3. "Entre para criar um placar": 16px, peso 400, 75% de opacidade.
4. Botão **"Entrar com Discord"**:
   - ícone `i-simple-icons-discord`;
   - largura total, 48px de altura;
   - estilo `neutral`/`solid`: fundo branco, texto `#18181b`.
5. Separador horizontal com o texto **"Ou"** (75% de opacidade).
6. Campo de texto com placeholder **"Digite o ID do Placar"**:
   - texto centralizado, 48px de altura, estilo `.container-card`;
   - `maxlength="7"`.
7. Botão quadrado de 40px **dentro do campo, à direita**:
   - ícone `i-iconamoon-arrow-right-2-light`;
   - fundo branco a 5%.

**Ações:**
- **"Entrar com Discord":** login OAuth (seção 1) e, depois, `/painel`.
- **Digitação no campo:**
  - remove tudo que não é letra ou número;
  - converte para minúsculas;
  - coloca "#" no início (ex.: digitar `ABC` vira `#abc`).
- **Enter no campo ou clique na seta:**
  - vai para `/id/<id>` se o ID tiver 6 ou mais caracteres;
  - com menos de 6, **não acontece nada** e não aparece nenhuma mensagem.

**Estados:**
- **Carregando:** não existe. O botão do Discord não mostra carregamento.
- **Erro:** não existe. Falha no login não é mostrada.
- **ID inválido:** não existe feedback.
- **Vazio** e **sem permissão:** não se aplicam.

### 3.2 Painel — `/painel`
- **Arquivo:** `app/pages/painel.vue`, com os componentes `Header`, `CreatePlacarModal` e `PlacarItem`
- **Título da aba:** "Placar"
- **Quem acessa:** só usuários logados. Visitantes são redirecionados para `/` pelo módulo do Supabase, e o `Header` também redireciona para `/` se não houver usuário.

**Elementos:**
1. **Cabeçalho** (`app/components/Header.vue`):
   - 128px de altura, borda inferior `#27272a`;
   - organizado em três colunas.

   | Coluna | Conteúdo |
   |---|---|
   | Esquerda (25%) | Botão **"Sair"**: ícone `i-mingcute-align-arrow-left-line`, `neutral`/`subtle`, tamanho `xl`, carregamento automático ao clicar |
   | Centro | **"Placar"**: 48px, peso 700 |
   | Direita (25%) | Ícone `i-material-symbols-person` (24px) e o nome do usuário (`full_name`), peso 600 |

2. Botão **"Criar placar"**:
   - ícone `i-material-symbols-add-rounded`;
   - `neutral`/`solid`, tamanho `lg`;
   - alinhado à esquerda.
3. **Lista de placares:** cards (`PlacarItem`) em linhas que quebram, centralizados, com 32px de espaço entre eles.
4. **Estado vazio:**
   - ícone `i-material-symbols-inbox-rounded` (128px, `#71717b`);
   - texto **"Nenhum placar criado ainda"**.

**Ações:**
- **"Sair":** logout e volta para `/`.
- **"Criar placar":** abre o modal "Criando placar" (seção 6).
- **Clique em um card:** vai para `/id/<placar.id>`. **Atenção:** usa o id numérico do banco, não o ID público (ver seção 8).

**Estados:**
- **Carregando:** não existe. O status da busca (`placaresStatus`) é lido mas não é usado. Enquanto carrega, a lista está vazia, então aparece o estado vazio.
- **Vazio:** "Nenhum placar criado ainda".
- **Erro:** não existe. Se a busca falhar, também aparece o estado vazio.
- **Sem permissão:** tratado pelo redirecionamento para `/`.

### 3.3 Placar — `/id/[id]`
- **Arquivo:** `app/pages/id/[id].vue`
- **Título da aba:** "Placar | {time A} x {time B}"
- **Quem acessa:** qualquer pessoa com o ID; a rota não exige login. Se o usuário logado for o criador (`user.sub === placar.creator`), aparecem controles extras.

**Elementos:**
1. **Cabeçalho** (128px, três colunas):

   | Coluna | Dono | Visitante |
   |---|---|---|
   | Esquerda (25%) | Botão **"Painel"** (ícone `i-material-symbols-chevron-left-rounded`, `neutral`/`solid`, `xl`), leva a `/painel` | Botão **"Inicio"** (mesmo estilo; está escrito sem acento no código), leva a `/` |
   | Centro | **"Placar"** (48px, peso 700) | **"Placar"** (48px, peso 700) |
   | Direita (25%) | Botão **"Configurações"** (ícone `GearIcon.vue`, `neutral`/`solid`, `xl`) | vazio |

2. Bloco central com **"Pontuação"** (18px, 75% de opacidade) e o valor de `score_increment` abaixo (16px, 90% de opacidade).
3. **Área dos times:** grade de 3 colunas.

   | Coluna | Conteúdo |
   |---|---|
   | Esquerda | Time A |
   | Meio | separador vertical tracejado |
   | Direita | Time B |

   Cada time mostra:
   - o nome, com `2vw`;
   - a pontuação, com `20vw` (números enormes).

   Só para o dono, há dois botões quadrados ao lado de cada time:
   - **+** (`i-material-symbols-add-rounded`);
   - **−** (`i-material-symbols-remove-rounded`).

   Os botões ficam à esquerda do time A e à direita do time B (`neutral`/`solid`, `xl`).
4. **Rodapé** (128px): botão `ghost` com **"#"** (50% de opacidade) seguido do ID público (ex.: `#k3x9a2`).

**Ações:**
- **+ / −:** soma ou subtrai `score_increment` da pontuação do time, no banco.
- **"Configurações":** só muda uma variável (`configModal = true`). **O modal de configurações não é renderizado nessa página**, então o botão não faz nada visível.
- **Clique no ID do rodapé:** copia o ID para a área de transferência e mostra um `window.alert('ID copiado!')`, o alerta nativo do navegador.
- **"Painel" / "Inicio":** navegação.

**Estados:**
- **Carregando:** spinner `LoadingIcon.vue` de 200px, branco, centralizado na tela.
- **Placar não encontrado / ID inválido:**
  - o código gera erros 404 ("Placar não encontrado") e 400 ("ID inválido") dentro do `useAsyncData`;
  - a variável `error` não é usada no template, que só confere se `placar` existe;
  - pelo código, um placar inexistente **fica no spinner para sempre**, em vez de mostrar a página de erro.
- **Sem permissão:** não existe tela própria. O visitante só não vê os controles.
- **Vazio:** não se aplica.

### 3.4 Página de erro — global
- **Arquivo:** `app/error.vue`
- **Quando aparece:** em erros fatais do Nuxt, como rota inexistente (404).
- **Elementos** (fundo `#18181b`, centralizado):
  1. Código do erro (ex.: **404**), com 128px.
  2. Mensagem, com 24px.
  3. Link **"Voltar para a página inicial"**: 48px de altura, padding lateral de 32px, raio de 8px, sem fundo nem borda. Leva a `/`.
- **Textos possíveis da mensagem:**
  - a mensagem original do erro, quando não há `statusMessage`; se nem ela existir, "Erro desconhecido";
  - quando há `statusMessage`:

    | Código | Texto |
    |---|---|
    | 400 | "ID inválido" |
    | 404 | "Placar não encontrado" |
    | 500 | "Erro interno do servidor" |
    | outros | "Error desconhecido" (com o erro de digitação "Error") |

---

## 4. Modelo de dados

Fonte: `supabase/migrations/20261006024236_create_placar.sql` e `app/types/database.types.ts`.

### Placar (tabela `Placar`)

| Campo | Tipo | Regras |
|---|---|---|
| `id` | bigint | gerado automaticamente; chave primária |
| `created_at` | timestamptz | padrão `now()` |
| `creator` | uuid | obrigatório; id do usuário (`auth.users`); o placar é apagado se o usuário for apagado |
| `public_id` | text | obrigatório e único; é o ID mostrado e usado na URL |
| `score_increment` | integer | padrão 1; o formulário exige no mínimo 1; **sem máximo** |
| `team_a_name` | text | padrão `''`; o formulário exige no mínimo 1 caractere; **sem limite de tamanho** |
| `team_a_score` | integer, pode ser nulo | padrão 0; **sem mínimo** (pode ficar negativo) |
| `team_b_name` | text | igual a `team_a_name` |
| `team_b_score` | integer, pode ser nulo | igual a `team_a_score` |

### Times, pontuação, partidas e usuário
- **Times / jogadores:** não existe uma estrutura própria. São **sempre exatamente 2 times**, guardados como colunas do placar (nome + pontuação). Não existem jogadores.
- **Pontuação:** um inteiro por time. Cada clique soma ou subtrai `score_increment`.
- **Partida / rodada:** não existe.
- **Usuário:** não existe tabela própria. É o usuário do Supabase Auth (`auth.users`), criado no login com Discord.

### ID do placar
- **Como é gerado:** `customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 6)` do `nanoid`, em `app/services/placar.ts`.
- **Formato:** **6 caracteres**, só números e letras minúsculas (ex.: `k3x9a2`).
- **Como aparece na interface:** com um "#" na frente (ex.: `#k3x9a2`).
- **Na URL:** `/id/k3x9a2`.

### Tipos de jogo
- **Suportado:** só pontos com incremento fixo.
- **Não existem:** vitórias, sets, cronômetro, ou tipos de jogo/modalidade.

### Histórico, ranking, reset, edição e desfazer

| Recurso | Situação |
|---|---|
| Histórico | não existe |
| Ranking | não existe |
| Reset | existe no serviço (`resetScore`, zera as duas pontuações) e no modal de configurações, mas o modal não aparece na tela (seção 3.3) |
| Apagar placar | igual ao reset (`deletePlacar`) |
| Edição da pontuação | só pelos botões + / −. Não dá para digitar um valor nem editar os nomes dos times ou o incremento depois de criado. |
| Desfazer | não existe (o − serve como correção manual) |

---

## 5. Permissões e compartilhamento

### Dono x visitante

| Ação | Dono (logado e criador) | Visitante com o ID (logado ou não) |
|---|---|---|
| Ver o placar | sim | sim |
| Somar / subtrair pontos | sim | não (botões ocultos; o banco também bloqueia) |
| Reiniciar / apagar | sim pelo banco (o modal não aparece na tela) | não |
| Ver "Configurações" | sim | não |
| Criar placares | qualquer usuário logado, em `/painel` | — |

No banco (RLS), as regras são:
- leitura pública;
- criação só por usuário logado, em nome próprio;
- alteração e exclusão só pelo criador.

**Lista do painel:** o `/painel` busca **todos** os placares, sem filtrar pelo criador. Como a leitura é pública, um usuário veria os placares de todo mundo na lista (seção 8).

### Compartilhamento
- **Pelo ID:** o rodapé de `/id` copia o ID (só o código, sem a URL). A outra pessoa digita esse ID na tela de login.
- **Pelo link:** a URL `/id/<id>` funciona diretamente, mas não existe botão para copiar o link.
- **QR code:** não existe.

### Modo TV / telão / OBS
- **Modo dedicado:** não existe.
- **A própria tela `/id`** já é tela cheia, com números de 20% da largura da tela, e serve na prática como telão. Mas ela tem cabeçalho e rodapé fixos, e **não se atualiza sozinha**.
- **Overlay para stream** (fundo transparente etc.): não existe.
- **Tamanho de fonte:** existe uma variável sem uso, `fontSize` (`'10vw' | '15vw' | '20vw'`), em `[id].vue`. Ela sugere uma configuração de tamanho planejada.

---

## 6. Componentes existentes

### Componentes do projeto (`app/components/`)

**`Header.vue`** — cabeçalho do painel.
- Props: nenhuma.
- Conteúdo: botão "Sair", título "Placar" e nome do usuário.

**`PlacarItem.vue`** — card de um placar no painel.
- Props: `placar` (uma linha da tabela).
- Tamanho: 256×144px, raio de 8px, estilo `.container-card`. É um link.
- Conteúdo:
  - no topo, "#" (50% de opacidade) + o id;
  - abaixo, duas colunas com o nome do time (12px, peso 700) e a pontuação (30px, 60% de opacidade).
- No hover:
  - fundo e anel ficam mais fortes;
  - aparece uma seta (`i-iconamoon-arrow-right-2-light`) no canto superior direito.

**`CreatePlacarModal.vue`** — modal **"Criando placar"**.
- Props: `v-model` (aberto/fechado).
- Campos (todos `UInput` tamanho `xl`):

  | Label | Placeholder | Erro de validação |
  |---|---|---|
  | "Primeiro time" | "Time 1" | "Nome do time A é obrigatório" |
  | "Segundo time" | "Time 2" | "Nome do time B é obrigatório" |
  | "Valor da pontuação" | "1" | "O valor da pontuação deve ser maior que 0" |

- Layout dos campos: no desktop, "Primeiro time", o texto **"vs"** e "Segundo time" ficam lado a lado; "Valor da pontuação" fica embaixo. No celular, tudo fica empilhado.
- Botões:
  - **"Cancelar"** (`ghost`, `lg`): limpa e fecha;
  - **"Salvar"** (`solid`, `lg`): mostra carregamento e, ao terminar, vai para `/id/<novo id>`.
- Erro ao salvar: toast vermelho "Erro ao criar placar", com a mensagem do erro ou "Ocorreu um erro ao criar o placar. Tente novamente mais tarde.".
- Fechar: o modal do Nuxt UI tem botão de fechar (X) no cabeçalho.

**`ConfigPlacarModal.vue`** — modal de configurações.
- Props: `v-model` e `placarId`.
- Conteúdo:
  - título **"Criando Placar"** (título errado, copiado do outro modal);
  - botão **"Reiniciar placar"** (`neutral`/`solid`, `xl`);
  - botão **"Apagar placar"** (`error`/`ghost`, `xl`).
- Comportamento:
  - não tem confirmação nem feedback;
  - depois de apagar, não navega para outra tela;
  - **não é usado em nenhuma tela**.

**Ícones SVG próprios** (`app/components/icons/`):

| Componente | Situação |
|---|---|
| `ArrowLeftIcon.vue` | importado em `[id].vue`, mas não aparece no template |
| `GearIcon.vue` | usado no botão "Configurações" |
| `LoadingIcon.vue` | spinner de 200px, traço branco de 4px, gira em 1s |
| `ExitIcon.vue`, `PlusIcon.vue`, `TrashIcon.vue`, `UserIcon.vue` | **não usados** |

### Componentes do Nuxt UI usados

| Componente | Variantes / props visuais usadas |
|---|---|
| `UButton` | `color`: `neutral` e `error`; `variant`: `solid`, `subtle` e `ghost`; `size`: `lg` e `xl`; `block`; `icon`; `loading` / `loading-auto` |
| `UInput` | `color="neutral"`, `size="xl"`, `type="number"` |
| `UFormField` | com `label` |
| `UForm` | validação com `zod` |
| `UModal` | com `title` ou com `UCard` dentro |
| `UCard` | com slot `header` |
| `USeparator` | horizontal com `label="Ou"`; vertical `type="dashed"` `size="xl"` |
| `UIcon` | `name` |
| Toast (`useToast`) | `color: 'error'` |
| `UApp` | envolve o app (necessário para toasts e modais) |

**Não existem:** avatar, componente de input próprio (a tela de login usa um `<input>` HTML com `.container-card`), badge, tabs, dropdown, tooltip.

### O pequeno ícone verde no rodapé da tela de login
**Ele não existe no código do app.** Provavelmente é o botão flutuante do **Nuxt DevTools**, que mostra o logo verde do Nuxt na parte de baixo da tela. Ele aparece porque `devtools: { enabled: true }` está no `nuxt.config.ts`.
- Só aparece com `bun run dev`, nunca em produção.
- Serve para abrir as ferramentas de desenvolvimento do Nuxt.
- Não deve entrar no design.

---

## 7. Assets

| Asset | Caminho | Descrição |
|---|---|---|
| Logo | não existe | A marca é só o texto "Placar" em Open Sans Bold |
| Favicon | `public/favicon.ico` | 32×32px. É o **logo padrão do Nuxt** (duas montanhas verdes), sem identidade própria; está no projeto desde o primeiro commit |
| Imagens | não existe | — |
| Fontes | geradas no build pelo `@nuxt/fonts` (`.output/public/_fonts/`) | Open Sans |

---

## 8. Pendências

### Começado, mas incompleto
- **Tempo real:** código do Supabase Realtime **comentado** em `[id].vue`.
- **Modal de configurações** (`ConfigPlacarModal.vue`): existe, mas não é usado. O botão "Configurações" não abre nada.
- **Tamanho da fonte do placar:** variável `fontSize` (`10vw`/`15vw`/`20vw`) declarada e não usada em `[id].vue`.
- **Pinia:** instalado, sem nenhuma store.
- **README:** a seção "Roadmap 🗺️" está vazia.
- **Ícones SVG próprios** não usados: `ExitIcon`, `PlusIcon`, `TrashIcon`, `UserIcon`; e `ArrowLeftIcon` importado sem uso.
- **CSS comentado** de um cabeçalho antigo em `app.vue` e variável `--success-color` sem uso.
- **Debug esquecido:** `console.log` em `app/pages/index.vue` (`goToPlacar`) e em `app/services/placar.ts` (`create`).

### Bugs que afetam o design e a experiência
1. **Card do painel leva ao placar errado:** `PlacarItem.vue` mostra e linka o `id` numérico (ex.: `#1`, `/id/1`), mas a página busca pelo `public_id` (ex.: `k3x9a2`). Na prática, clicar num card não deve encontrar o placar.
2. **O dono não vê a própria pontuação mudar:** clicar em + / − atualiza o banco, mas a tela não recarrega o placar e não há realtime.
3. **Placar inexistente fica carregando para sempre** (seção 3.3).
4. **Botão "Configurações" não faz nada** (o modal não é renderizado).
5. **Painel lista os placares de todos os usuários**, e não só os do usuário logado.
6. **Painel sem estado de carregamento ou de erro:** mostra "Nenhum placar criado ainda" enquanto carrega ou se der erro.
7. **ID curto na tela de login:** com menos de 6 caracteres, nada acontece e não há mensagem.
8. **Pontuação pode ficar negativa.**
9. **Ícone do botão "−" do time B** tem um espaço no fim do nome (`"i-material-symbols-remove-rounded "`), o que pode fazer o ícone não aparecer.

### Inconsistências visuais e de texto
- **Título do modal de configurações** é "Criando Placar".
- **"Inicio"** sem acento no botão de `/id`.
- **"Error desconhecido"** na página de erro.
- **Feedback "ID copiado!"** usa `window.alert` nativo, enquanto o resto do app usa toasts do Nuxt UI.
- **Ícones de três origens diferentes:** `material-symbols`, `iconamoon` e `mingcute`, além de SVGs próprios (`GearIcon` no botão "Configurações", enquanto os outros botões usam ícones Iconify).
- **Botão "Sair"** usa a variante `subtle`; os outros botões de cabeçalho usam `solid`.
- **`text-md`** não existe no Tailwind (nome do usuário e texto do estado vazio ficam com o tamanho herdado).
- **Cor primária (indigo) definida e nunca usada:** todos os botões são `neutral` (brancos), então não há cor de destaque nem diferença visual entre ação principal e secundária.
- **Separador vertical em `/id`** ocupa uma coluna inteira da grade de 3 colunas, do mesmo tamanho dos times.
- **Fundos repetidos:** `bg-zinc-900` é repetido no painel e na página de erro, mas não em `/` e `/id` (lá vem do `body`, mesma cor).
- **Sem layout para celular:**
  - medidas fixas (cabeçalhos de 128px, título de 96px, cards de 256px);
  - porcentagens (`px-[10%]`);
  - `vw` (nomes dos times com `2vw` ficam muito pequenos em telas estreitas).
- **Sem acessibilidade básica:**
  - o botão de seta da tela de login e os botões + / − não têm texto ou `aria-label`;
  - o input de ID não tem `label`.
- **Favicon e marca:** o favicon é o logo padrão do Nuxt.
