-- Cores dos times passam a ser guardadas pelo id da paleta (docs/placar-design/HANDOFF.md).
-- A paleta (16 cores: 8 sólidas e 8 duplas) fica em app/utils/teamColors.ts; a lista de ids do CHECK abaixo
-- precisa ser a mesma. Para mudar a paleta, crie uma migration nova.

alter table public."Placar"
	drop constraint "Placar_team_a_color_check",
	drop constraint "Placar_team_b_color_check";

-- As 6 cores antigas (hex) correspondem às 6 primeiras sólidas; qualquer outro valor vira o padrão
update public."Placar"
set
	team_a_color = case lower(team_a_color)
		when '#51a2ff' then 'azul'
		when '#ff8904' then 'laranja'
		when '#05df72' then 'verde'
		when '#a684ff' then 'roxo'
		when '#fb64b6' then 'rosa'
		when '#fdc700' then 'amarelo'
		else 'azul'
	end,
	team_b_color = case lower(team_b_color)
		when '#51a2ff' then 'azul'
		when '#ff8904' then 'laranja'
		when '#05df72' then 'verde'
		when '#a684ff' then 'roxo'
		when '#fb64b6' then 'rosa'
		when '#fdc700' then 'amarelo'
		else 'laranja'
	end;

-- Os dois times não podem ter a mesma cor (o seletor já impede); desempata dados antigos
update public."Placar"
set team_b_color = case when team_a_color = 'laranja' then 'azul' else 'laranja' end
where team_a_color = team_b_color;

alter table public."Placar"
	alter column team_a_color set default 'azul',
	alter column team_b_color set default 'laranja',
	add constraint "Placar_team_a_color_check" check (team_a_color in (
		'azul', 'laranja', 'verde', 'roxo', 'rosa', 'amarelo', 'vermelho', 'preto',
		'preto-branco', 'preto-vermelho', 'amarelo-azul', 'verde-branco',
		'azul-branco', 'vermelho-branco', 'verde-amarelo', 'preto-amarelo'
	)),
	add constraint "Placar_team_b_color_check" check (team_b_color in (
		'azul', 'laranja', 'verde', 'roxo', 'rosa', 'amarelo', 'vermelho', 'preto',
		'preto-branco', 'preto-vermelho', 'amarelo-azul', 'verde-branco',
		'azul-branco', 'vermelho-branco', 'verde-amarelo', 'preto-amarelo'
	)),
	add constraint "Placar_team_colors_differ_check" check (team_a_color <> team_b_color);
