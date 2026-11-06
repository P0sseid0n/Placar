-- Limites contra abuso. O app fala direto com o banco (Supabase), então qualquer limite
-- que conte de verdade precisa estar aqui, e não só na interface.
--
--   - placares por usuário: no máximo 200 no total e 30 por hora;
--   - jogadas por placar: no máximo 30 a cada 10 segundos;
--   - histórico: cada placar guarda só as 500 jogadas mais recentes;
--   - pontos por clique: de 1 a 100 (o mesmo limite do formulário, SCORE_INCREMENT_MAX em app/utils/placar.ts);
--   - ID público: 6 caracteres, só letras minúsculas e números (o mesmo formato que a página /id/[id] aceita).
--
-- Para mudar um limite, crie uma migration nova que recrie a função correspondente.

-- ============================================================
-- Pontos por clique: de 1 a 100
-- ============================================================

update public."Placar" set score_increment = 100 where score_increment > 100;

alter table public."Placar"
	add constraint "Placar_score_increment_max_check" check (score_increment <= 100);

-- ============================================================
-- Formato do ID público
-- ============================================================

-- NOT VALID: vale para placares novos e alterados. Versões antigas do app geravam IDs em outro formato,
-- e esses placares já não abrem na página /id/[id], então não há o que migrar.
alter table public."Placar"
	add constraint "Placar_public_id_format_check" check (public_id ~ '^[0-9a-z]{6}$') not valid;

-- ============================================================
-- Placares por usuário
-- ============================================================

create function public.placar_check_create_limits()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
	v_total integer;
	v_last_hour integer;
begin
	-- Trava por usuário até o fim da transação: dois inserts simultâneos não passam juntos do limite
	perform pg_advisory_xact_lock(hashtextextended('placar_create:' || new.creator::text, 0));

	select count(*), count(*) filter (where created_at > now() - interval '1 hour')
	into v_total, v_last_hour
	from public."Placar"
	where creator = new.creator;

	if v_total >= 200 then
		raise exception 'Você chegou ao limite de 200 placares. Apague algum para criar outro.'
			using errcode = 'P0001', hint = 'placar_limit_total';
	end if;

	if v_last_hour >= 30 then
		raise exception 'Você criou muitos placares na última hora. Tente de novo mais tarde.'
			using errcode = 'P0001', hint = 'placar_limit_rate';
	end if;

	return new;
end;
$$;

create trigger "Placar_check_create_limits"
	before insert on public."Placar"
	for each row execute function public.placar_check_create_limits();

-- ============================================================
-- Jogadas por placar
-- ============================================================

create function public.placar_event_check_rate()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
	-- placar_add_points já trava a linha do placar (for update), então as jogadas de um placar entram em fila
	if (
		select count(*)
		from public."PlacarEvent"
		where placar_id = new.placar_id and created_at > now() - interval '10 seconds'
	) >= 30 then
		raise exception 'Muitas jogadas em pouco tempo. Espere alguns segundos.'
			using errcode = 'P0001', hint = 'placar_event_rate';
	end if;

	return new;
end;
$$;

create trigger "PlacarEvent_check_rate"
	before insert on public."PlacarEvent"
	for each row execute function public.placar_event_check_rate();

-- Mantém só as 500 jogadas mais recentes de cada placar ("Desfazer" volta até 500 jogadas)
create function public.placar_event_trim()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
	delete from public."PlacarEvent"
	where placar_id = new.placar_id
		and id in (
			select id
			from public."PlacarEvent"
			where placar_id = new.placar_id
			order by created_at desc, id desc
			offset 500
		);

	return null;
end;
$$;

create trigger "PlacarEvent_trim"
	after insert on public."PlacarEvent"
	for each row execute function public.placar_event_trim();

-- As funções só servem aos triggers: ninguém as chama pela API
revoke execute on function public.placar_check_create_limits() from public, anon, authenticated;
revoke execute on function public.placar_event_check_rate() from public, anon, authenticated;
revoke execute on function public.placar_event_trim() from public, anon, authenticated;
