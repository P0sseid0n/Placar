# Placar

O Placar é um projeto para ajudar pessoas que precisam contabilizar e compartilhar em tempo real pontos de qualquer tarefa, seja um jogo de futebol, um jogo de cartas, um jogo de tabuleiro, etc.

## Tecnologias 🔧

Nuxt.js - Vue.js - Pinia - Supabase - Scss

## Roadmap 🗺️

## Como rodar o projeto 🚀

Requer o [Docker](https://www.docker.com/) rodando. O Supabase roda localmente via [Supabase CLI](https://supabase.com/docs/guides/local-development).

1. Clone o projeto.
2. Instale as dependências com `bun install`.
3. Suba o Supabase local com `bun run db:start`. A migration em `supabase/migrations` cria a tabela e as políticas de acesso.
4. Crie o `.env` a partir do `.env.example` e preencha `SUPABASE_KEY` com a `PUBLISHABLE_KEY` mostrada pelo `bun run db:status`.
5. Rode o projeto com `bun run dev`.

### Login com Discord

1. Crie um app no [Discord Developer Portal](https://discord.com/developers/applications) e adicione o redirect `http://127.0.0.1:54321/auth/v1/callback`.
2. Crie o `supabase/.env` a partir do `supabase/.env.example` com o client id e o secret do app.
3. Reinicie o Supabase com `bun run db:stop` e `bun run db:start`.

### Comandos do banco

- `bun run db:start` / `bun run db:stop`: sobe e para o Supabase local
- `bun run db:status`: mostra URLs e chaves
- `bun run db:reset`: recria o banco e reaplica as migrations
- `bun run db:test`: roda os testes do banco (pgTAP, em `supabase/tests/`)
- `bun run database`: regenera `app/types/database.types.ts` a partir do banco local
- Studio: http://127.0.0.1:54323

## Testes 🧪

Os testes usam Vitest com o ambiente do Nuxt (`@nuxt/test-utils`).

- `bun run test`: modo watch
- `bun run test:run`: roda uma vez
- `bun run test:coverage`: gera o relatório em `coverage/index.html`

> Use `bun run test`, e não `bun test`: este último chama o runner do Bun em vez do Vitest.

## Contribuição 🤝

Toda contribuição é bem-vinda, desde melhoria de design a novas features. Sinta-se a vontade para abrir uma issue ou um pull request.

## Licença 📝

Esse projeto está sob a licença MIT. Veja o arquivo [LICENSE](./LICENSE.md) para mais detalhes.
