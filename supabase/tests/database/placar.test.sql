-- Testes do banco: bun run db:test (supabase test db)
-- Tudo roda numa transação e é desfeito no final.
begin;

create extension if not exists pgtap with schema extensions;

select plan(42);

-- ------------------------------------------------------------
-- Dados
-- ------------------------------------------------------------

insert into auth.users (id, email)
values
	('aaaaaaaa-0000-0000-0000-000000000001', 'dono@teste.local'),
	('aaaaaaaa-0000-0000-0000-000000000002', 'outro@teste.local');

insert into public."Placar" (creator, public_id, score_increment, team_a_name, team_a_score, team_b_name, team_b_score)
values ('aaaaaaaa-0000-0000-0000-000000000001', 'tst001', 3, 'Casa', 0, 'Fora', 1);

-- Simula o usuário logado (auth.uid() lê o "sub" do JWT)
create function pg_temp.login_as(user_id uuid) returns void language sql as $$
	select set_config('role', 'authenticated', true),
		set_config('request.jwt.claims', json_build_object('sub', user_id, 'role', 'authenticated')::text, true);
$$;

create function pg_temp.logout() returns void language sql as $$
	select set_config('role', 'anon', true), set_config('request.jwt.claims', '{"role":"anon"}', true);
$$;

select ok(
	exists (
		select 1 from pg_publication_tables
		where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'Placar'
	),
	'Placar está na publicação do realtime'
);
select ok(
	exists (
		select 1 from pg_publication_tables
		where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'PlacarEvent'
	),
	'PlacarEvent está na publicação do realtime (animação ao marcar ponto)'
);

-- ------------------------------------------------------------
-- Colunas novas e travas
-- ------------------------------------------------------------

select results_eq(
	$$ select team_a_color, team_b_color, score_size from public."Placar" where public_id = 'tst001' $$,
	$$ values ('azul', 'laranja', 'G') $$,
	'cores e tamanho têm os padrões do handoff'
);

select throws_ok(
	$$ update public."Placar" set team_a_score = -1 where public_id = 'tst001' $$,
	'23514', null, 'pontuação não pode ser negativa'
);
select throws_ok(
	$$ update public."Placar" set score_increment = 0 where public_id = 'tst001' $$,
	'23514', null, 'incremento é no mínimo 1'
);
select throws_ok(
	$$ update public."Placar" set score_increment = 101 where public_id = 'tst001' $$,
	'23514', null, 'incremento é no máximo 100'
);
select throws_ok(
	$$ update public."Placar" set team_a_color = '#51a2ff' where public_id = 'tst001' $$,
	'23514', null, 'cor precisa ser um id da paleta (não hex)'
);
select lives_ok(
	$$ update public."Placar" set team_a_color = 'preto-branco', team_b_color = 'verde-amarelo' where public_id = 'tst001' $$,
	'aceita cores duplas da paleta'
);
select throws_ok(
	$$ update public."Placar" set team_b_color = team_a_color where public_id = 'tst001' $$,
	'23514', null, 'os dois times não podem ter a mesma cor'
);
select throws_ok(
	$$ update public."Placar" set score_size = 'X' where public_id = 'tst001' $$,
	'23514', null, 'tamanho é P, M ou G'
);
select throws_ok(
	$$ update public."Placar" set team_b_name = repeat('a', 25) where public_id = 'tst001' $$,
	'23514', null, 'nome tem no máximo 24 caracteres'
);
select throws_ok(
	$$ update public."Placar" set team_b_name = '' where public_id = 'tst001' $$,
	'23514', null, 'nome não pode ser vazio'
);

-- ------------------------------------------------------------
-- Dono: pontuar, desfazer, reiniciar
-- ------------------------------------------------------------

select pg_temp.login_as('aaaaaaaa-0000-0000-0000-000000000001');

select is(public.placar_add_points('tst001', 'a', 'increment'), 3, 'soma o incremento');
select is(public.placar_add_points('tst001', 'a', 'increment'), 6, 'soma de novo');
select is(public.placar_add_points('tst001', 'b', 'decrement'), 0, 'tirar 3 de 1 para em 0');
select is(public.placar_add_points('tst001', 'b', 'decrement'), 0, 'tirar com o time em 0 não muda nada');

select results_eq(
	$$ select team, delta, score_after from public."PlacarEvent" e
		join public."Placar" p on p.id = e.placar_id
		where p.public_id = 'tst001' order by e.id $$,
	$$ values ('a', 3, 3), ('a', 3, 6), ('b', -1, 0) $$,
	'registra só as jogadas que mudaram o placar, com o delta real'
);

select results_eq(
	$$ select * from public.placar_undo_last('tst001') $$,
	$$ values ('b'::text, 1) $$,
	'desfazer devolve o ponto tirado do time b'
);
select results_eq(
	$$ select * from public.placar_undo_last('tst001') $$,
	$$ values ('a'::text, 3) $$,
	'desfazer de novo volta o time a para 3'
);
select is(
	(select count(*)::int from public."PlacarEvent" e join public."Placar" p on p.id = e.placar_id where p.public_id = 'tst001'),
	1,
	'jogadas desfeitas são apagadas'
);

select public.placar_reset('tst001');

select results_eq(
	$$ select team_a_score, team_b_score from public."Placar" where public_id = 'tst001' $$,
	$$ values (0, 0) $$,
	'reiniciar zera as duas pontuações'
);
select is(
	(select count(*)::int from public."PlacarEvent" e join public."Placar" p on p.id = e.placar_id where p.public_id = 'tst001'),
	0,
	'reiniciar apaga as jogadas'
);
select is_empty(
	$$ select * from public.placar_undo_last('tst001') $$,
	'sem jogadas, desfazer não faz nada'
);

select throws_ok(
	$$ select public.placar_add_points('tst001', 'c', 'increment') $$,
	'22023', null, 'time inválido é recusado'
);
select throws_ok(
	$$ select public.placar_add_points('naoexi', 'a', 'increment') $$,
	'P0002', null, 'placar inexistente é recusado'
);

-- ------------------------------------------------------------
-- Outro usuário: não altera o placar de ninguém
-- ------------------------------------------------------------

select is(public.placar_add_points('tst001', 'a', 'increment'), 3, 'dono volta a pontuar depois de reiniciar');
select pg_temp.login_as('aaaaaaaa-0000-0000-0000-000000000002');

select throws_ok(
	$$ select public.placar_add_points('tst001', 'a', 'increment') $$,
	'P0002', null, 'outro usuário não pontua (RLS esconde o placar para escrita)'
);
select throws_ok(
	$$ select public.placar_reset('tst001') $$,
	'P0002', null, 'outro usuário não reinicia'
);
select throws_ok(
	$$ select * from public.placar_undo_last('tst001') $$,
	'P0002', null, 'outro usuário não desfaz'
);
select throws_ok(
	$$ insert into public."PlacarEvent" (placar_id, team, delta, score_after)
		select id, 'a', 99, 99 from public."Placar" where public_id = 'tst001' $$,
	'42501', null, 'outro usuário não registra jogadas direto na tabela'
);
select is(
	(select count(*)::int from public."PlacarEvent" e join public."Placar" p on p.id = e.placar_id where p.public_id = 'tst001'),
	1,
	'outro usuário vê as jogadas (leitura pública)'
);

-- ------------------------------------------------------------
-- Visitante sem login: só lê
-- ------------------------------------------------------------

select pg_temp.logout();

select is(
	(select team_a_score from public."Placar" where public_id = 'tst001'),
	3,
	'visitante vê a pontuação'
);
select throws_ok(
	$$ select public.placar_add_points('tst001', 'a', 'increment') $$,
	'42501', null, 'visitante não pode chamar as funções'
);

-- ------------------------------------------------------------
-- Limites contra abuso
-- ------------------------------------------------------------

select pg_temp.logout();
set local role postgres;

select throws_ok(
	$$ insert into public."Placar" (creator, public_id, team_a_name, team_b_name)
		values ('aaaaaaaa-0000-0000-0000-000000000002', 'ABC-12', 'A', 'B') $$,
	'23514', null, 'ID público precisa ter 6 letras minúsculas ou números'
);

-- 30 placares do usuário 2 na última hora
insert into public."Placar" (creator, public_id, team_a_name, team_b_name)
select 'aaaaaaaa-0000-0000-0000-000000000002', 'u2' || lpad(n::text, 4, '0'), 'A', 'B'
from generate_series(1, 30) n;

select pg_temp.login_as('aaaaaaaa-0000-0000-0000-000000000002');
select throws_ok(
	$$ insert into public."Placar" (creator, public_id, team_a_name, team_b_name)
		values ('aaaaaaaa-0000-0000-0000-000000000002', 'u2hora', 'A', 'B') $$,
	'P0001', 'Você criou muitos placares na última hora. Tente de novo mais tarde.',
	'no máximo 30 placares por hora'
);

-- Os 30 ficam antigos e o usuário chega a 200 placares
select pg_temp.logout();
set local role postgres;
update public."Placar" set created_at = now() - interval '2 hours'
where creator = 'aaaaaaaa-0000-0000-0000-000000000002';
insert into public."Placar" (creator, public_id, team_a_name, team_b_name, created_at)
select 'aaaaaaaa-0000-0000-0000-000000000002', 'u2' || lpad(n::text, 4, '0'), 'A', 'B', now() - interval '2 hours'
from generate_series(31, 200) n;

select pg_temp.login_as('aaaaaaaa-0000-0000-0000-000000000002');
select throws_ok(
	$$ insert into public."Placar" (creator, public_id, team_a_name, team_b_name)
		values ('aaaaaaaa-0000-0000-0000-000000000002', 'u2tota', 'A', 'B') $$,
	'P0001', 'Você chegou ao limite de 200 placares. Apague algum para criar outro.',
	'no máximo 200 placares por usuário'
);

-- Jogadas: no máximo 30 a cada 10 segundos por placar
select lives_ok(
	$$ select public.placar_add_points('u20001', 'a', 'increment') from generate_series(1, 30) $$,
	'aceita 30 jogadas seguidas'
);
select throws_ok(
	$$ select public.placar_add_points('u20001', 'a', 'increment') $$,
	'P0001', 'Muitas jogadas em pouco tempo. Espere alguns segundos.',
	'recusa a 31ª jogada em 10 segundos'
);

-- Histórico: só as 500 jogadas mais recentes
select pg_temp.logout();
set local role postgres;
insert into public."PlacarEvent" (placar_id, team, delta, score_after, created_at)
select p.id, 'a', 1, n, now() - interval '1 hour' + n * interval '1 second'
from public."Placar" p, generate_series(1, 510) n
where p.public_id = 'u20002'
order by n;

select is(
	(select count(*)::int from public."PlacarEvent" e join public."Placar" p on p.id = e.placar_id where p.public_id = 'u20002'),
	500,
	'guarda no máximo 500 jogadas por placar'
);
select is(
	(select min(score_after) from public."PlacarEvent" e join public."Placar" p on p.id = e.placar_id where p.public_id = 'u20002'),
	11,
	'apaga as jogadas mais antigas'
);

-- ------------------------------------------------------------
-- Excluir conta: placares e jogadas do usuário vão junto (cascata)
-- ------------------------------------------------------------

select pg_temp.logout();
set local role postgres;

delete from auth.users where id = 'aaaaaaaa-0000-0000-0000-000000000001';

select is(
	(select count(*)::int from public."Placar" where public_id = 'tst001'),
	0,
	'excluir o usuário apaga os placares dele'
);
select is(
	(select count(*)::int from public."PlacarEvent" e
		where not exists (select 1 from public."Placar" p where p.id = e.placar_id)),
	0,
	'e as jogadas desses placares'
);

select * from finish();
rollback;
