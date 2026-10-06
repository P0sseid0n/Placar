# Contribuindo com o Placar

Obrigado pelo interesse! Para bugs e ideias, abra uma [issue](https://github.com/P0sseid0n/Placar/issues). Para mudanças grandes (telas novas, banco, dependências), converse numa issue antes de começar. O Roadmap do [README](./README.md) lista o que já está planejado.

## Ambiente

Siga a seção "Como rodar o projeto" do [README](./README.md) (precisa de Bun e Docker). Para testar sem configurar o Discord, use os usuários do `supabase/seed.sql`; a senha está no comentário do topo do arquivo.

## Fluxo

1. Crie uma branch a partir da `main` (ex.: `cor-dupla-times`).
2. Faça commits pequenos, em português e com o verbo no presente: `Adiciona …`, `Corrige …`, `Remove …`.
3. Abra o pull request explicando o que mudou e por quê. Se mudar alguma tela, inclua prints de desktop e celular.

## Convenções

- **Estilo:** o Prettier formata e ordena as classes do Tailwind (`bun run format`), e o ESLint verifica o código (`bun run lint`).
- **Idioma:** textos, comentários e mensagens em português; nomes no código em inglês.
- **Organização:** lógica pura em `app/utils/` (com testes) e acesso ao Supabase em `app/services/`.
- **Visual:** use os tokens de `app/assets/style.css` e siga o design em `docs/placar-design/`. O app é só tema escuro e precisa funcionar a partir de 360px.
- **Acessibilidade:** `aria-label` em botões só com ícone e `<label>` em campos.
- **Banco:**
    - toda mudança vai numa migration nova (`bunx supabase migration new nome`), sem editar as que já estão na `main`;
    - tabelas novas precisam de RLS;
    - regras importantes ficam no banco, com teste em `supabase/tests/`;
    - depois de mudar o schema, regenere os tipos com `bun run database`.
- **Segredos:** nunca faça commit de chaves; o `.env` e o `supabase/.env` ficam fora do git.

## Antes do pull request

```bash
bun run lint && bun run format:check && bun run test:run && bun run build
bun run db:test   # se mexeu no banco
```

Use `bun run test:run`, e não `bun test` (que chama o runner do Bun em vez do Vitest).

## Licença

Ao contribuir, você concorda que sua contribuição será distribuída sob a [licença MIT](./LICENSE.md).
