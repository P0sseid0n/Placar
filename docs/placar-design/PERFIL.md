# Placar — modal de perfil do usuário

Complementa o `HANDOFF.md`. Referência visual: `designs/Perfil.dc.html` (e `designs/Painel.dc.html` para o gatilho). Mesmas regras de leitura dos designs: estilos inline são a especificação; ignore o runtime da ferramenta (`support.js`, `<x-dc>`, `<sc-if>`, `<sc-for>`, `{{...}}`).

## Onde abre
- No cabeçalho do `/painel`, o chip com avatar + nome vira um botão (`aria-label="Abrir perfil"`) que abre o modal. Não é uma rota nova.
- Criar `app/components/ProfileModal.vue` com `v-model` (aberto/fechado), usando `UModal` ou um modal próprio no visual do design.

## Estrutura
Modal de até 560px de largura, raio 20, fundo `#1d1d20`, anel `#27272a`, overlay `#09090b` a 72% com blur de 4px.

**Altura e rolagem:** o modal tem `max-height` igual à altura da janela menos 48px. Topo e rodapé ficam fixos; só a área entre eles rola (`overflow-y: auto; overscroll-behavior: contain`). A página por trás nunca rola.

**Topo (fixo)**
- Capa de 80px: fundo `#18181b` com grade de pontos brancos a 6% a cada 16px e faixa de 4px no rodapé da capa, metade azul `#51a2ff` e metade laranja `#ff8904` (cores da marca, não de um placar).
- Botão fechar (X) no canto superior direito da capa.
- Avatar de 76px sobrepondo a capa em 38px, com anel de 5px na cor do fundo do modal. Usar `user_metadata.avatar_url` do Discord; sem foto, mostrar a inicial do nome sobre `#3f3f46`. O avatar fica acima da capa (z-index).
- À direita do avatar, começando abaixo da capa: nome (`user_metadata.full_name`, 22px/700, uma linha com reticências) e “Conectado com Discord” (13px, `#9f9fa9`, ícone do Discord).
- Abas “Perfil” e “Configurações” (`role="tablist"`, `role="tab"`, `aria-selected`), 48px de altura, ativa em branco com sublinhado de 2px; inativa em `#9f9fa9`.

**Aba Perfil**
- O usuário é organizador (cria placares, não joga), então nada de estatísticas de pontos. Três blocos lado a lado: “Placares criados” (número em Barlow Condensed 34px), “Último placar criado” (tempo relativo, ex.: “há 2 min”) e “Organizador desde” (mês/ano abreviado do `created_at` do usuário, ex.: “out. 2026”).
- Linha de apoio: “Nome e foto vêm da sua conta do Discord.”

**Aba Configurações**
- Seção “Conta”:
  - Texto “Você pode entrar de novo a qualquer momento.” + botão secundário “Sair da conta” (faz `signOut` e vai para `/`).
  - Bloco de perigo (fundo vermelho a 5%, anel vermelho a 30%): “Excluir conta” + “Apaga sua conta e todos os seus placares. Não dá para desfazer.” e botão “Excluir” (contorno vermelho).
  - Ao clicar em “Excluir”, o texto muda para “Tem certeza? Seus {n} placares serão apagados junto com a conta.” e aparecem “Cancelar” e “Sim, excluir” (fundo `#ff6467`, texto `#18181b`). Confirmando: exclui, faz logout e vai para `/`.

**Rodapé (fixo)**: só o botão “Fechar”, nas duas abas.

## Backend
- Exclusão de conta precisa rodar no servidor (a chave de service role não pode ir para o navegador): criar uma rota `server/api/account.delete.ts` ou uma Edge Function do Supabase que valida o usuário da sessão e chama `auth.admin.deleteUser(id)`. Os placares já são apagados em cascata (`creator` referencia `auth.users` com `on delete cascade`); confirmar isso na migration.
- Os dados da aba Perfil vêm da mesma consulta do painel (placares filtrados por `creator`: contagem e o `created_at` mais recente).

## Aceite
- Abre pelo chip do cabeçalho; fecha pelo X, pelo “Fechar”, pelo Esc e clicando fora.
- Foco preso no modal enquanto aberto; volta para o chip ao fechar.
- Em telas baixas, só o meio rola; em celular (≥ 360px) o modal ocupa a largura com 16px de margem.
- Botões só com ícone têm `aria-label`.
