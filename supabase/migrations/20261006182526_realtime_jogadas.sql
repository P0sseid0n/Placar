-- A animação ao marcar ponto (HANDOFF, seção 5) dispara quando chega uma jogada nova pelo realtime.
-- A página escuta só INSERT em PlacarEvent, filtrado pelo placar (placar_id=eq.<id>): reiniciar e desfazer
-- apagam jogadas (DELETE, que o realtime não filtra e a página ignora), então atualizam o número sem animar.
-- A leitura das jogadas é pública (RLS), e as mensagens do realtime seguem as mesmas políticas.
alter publication supabase_realtime add table public."PlacarEvent";
