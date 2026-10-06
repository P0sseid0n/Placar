-- Realtime da página /id/[id]: quem assiste recebe as mudanças do placar na hora.
-- Só a tabela Placar: toda jogada (somar, desfazer, reiniciar) também atualiza a linha do placar
-- na mesma transação, então a página recarrega "Últimas jogadas" quando o placar muda.
-- As políticas de leitura (públicas) continuam valendo para as mensagens do realtime.
alter publication supabase_realtime add table public."Placar";
