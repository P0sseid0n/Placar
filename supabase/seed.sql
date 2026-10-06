-- Dados de teste do banco LOCAL (aplicados no `bun run db:reset`).
-- Usuários com e-mail e senha, para testar sem configurar o Discord.
-- vazio@placar.test não tem placares (estado vazio do painel).
-- Senha dos três usuários: teste-03944b853815

-- Usuários
insert into auth.users (
	instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
	raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
	confirmation_token, recovery_token, email_change_token_new, email_change
)
values
	(
		'00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated',
		'dono@placar.test', crypt('teste-03944b853815', gen_salt('bf')), now(),
		'{"provider":"email","providers":["email"]}', '{"full_name":"Dono de Teste"}', now(), now(), '', '', '', ''
	),
	(
		'00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated',
		'outro@placar.test', crypt('teste-03944b853815', gen_salt('bf')), now(),
		'{"provider":"email","providers":["email"]}', '{"full_name":"Outro Usuário"}', now(), now(), '', '', '', ''
	),
	(
		'00000000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'authenticated', 'authenticated',
		'vazio@placar.test', crypt('teste-03944b853815', gen_salt('bf')), now(),
		'{"provider":"email","providers":["email"]}', '{"full_name":"Sem Placares"}', now(), now(), '', '', '', ''
	)
on conflict (id) do nothing;

insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select gen_random_uuid(), u.id, u.id::text, jsonb_build_object('sub', u.id::text, 'email', u.email), 'email', now(), now(), now()
from auth.users u
where u.id in ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333')
	and not exists (select 1 from auth.identities i where i.user_id = u.id and i.provider = 'email');

-- Placares
insert into public."Placar" (creator, public_id, score_increment, team_a_name, team_a_score, team_b_name, team_b_score, created_at)
values
	('11111111-1111-1111-1111-111111111111', 'teste1', 1, 'Time Azul', 12, 'Time Laranja', 9, now() - interval '5 minutes'),
	('11111111-1111-1111-1111-111111111111', 'teste2', 3, 'Corinthians', 0, 'Palmeiras', 0, now() - interval '2 days'),
	('22222222-2222-2222-2222-222222222222', 'outro1', 1, 'Time do outro', 4, 'Visitantes', 7, now() - interval '1 hour')
on conflict (public_id) do nothing;
