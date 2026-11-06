<script setup lang="ts">
useHead({ title: 'Placar | Termos de Uso' })
useSeoMeta({
	description: 'As regras para usar o Placar: conta, placares públicos, uso aceitável e responsabilidades.',
})

const ISSUES_URL = 'https://github.com/P0sseid0n/Placar/issues'
</script>

<template>
	<LegalPage title="Termos de Uso" updated-at="5 de novembro de 2026">
		<p>
			Estes termos explicam as regras para usar o Placar (<strong>placar.p0sseid0n.dev</strong>). Ao entrar com
			sua conta ou usar o site, você concorda com eles. Se não concordar, não use o Placar.
		</p>

		<h2>1. O que é o Placar</h2>
		<p>
			O Placar é um app para marcar e compartilhar a pontuação de disputas em tempo real. Quem cria um placar
			controla os pontos; quem tem o ID ou o link acompanha ao vivo. O Placar é mantido por P0sseid0n.
		</p>

		<h2>2. Conta e login</h2>
		<ul>
			<li>
				Para criar e controlar placares, você entra com sua conta do Google ou do Discord. Para assistir, não
				precisa de conta.
			</li>
			<li>
				Você precisa ter a idade mínima exigida pelo serviço que usar para entrar e seguir também os termos dele
				(<a href="https://policies.google.com/terms" target="_blank" rel="noopener">Termos do Google</a> ou
				<a href="https://discord.com/terms" target="_blank" rel="noopener">Termos de Serviço do Discord</a>).
			</li>
			<li>
				Você é responsável pelo que for feito com a sua conta. Se perceber um acesso estranho, saia da conta e
				revogue o acesso do Placar no Google ou no Discord.
			</li>
		</ul>

		<h2>3. Placares são públicos</h2>
		<p>
			Qualquer pessoa com o ID ou o link de um placar pode ver os nomes dos times, as cores, os pontos e as
			últimas jogadas. Só quem criou o placar pode alterá-lo. Não coloque nos nomes dos times nada que você não
			queira que outras pessoas vejam, como dados pessoais.
		</p>

		<h2>4. Uso aceitável</h2>
		<p>Ao usar o Placar, você não pode:</p>
		<ul>
			<li>
				colocar nos placares conteúdo ofensivo, discriminatório, ilegal ou que viole direitos de outras pessoas;
			</li>
			<li>tentar acessar ou alterar placares e contas que não são seus;</li>
			<li>sobrecarregar o serviço (por exemplo, criando placares ou pontos em massa por automação);</li>
			<li>explorar falhas de segurança em vez de avisá-las.</li>
		</ul>
		<p>
			Placares e contas que descumprirem essas regras podem ser apagados ou bloqueados, sem aviso. Se encontrar
			uma falha de segurança, avise pelo canal de contato no fim desta página.
		</p>

		<h2>5. Seu conteúdo</h2>
		<p>
			O que você coloca nos placares (nomes dos times e pontos) continua sendo seu. Você permite que o Placar
			guarde e mostre esse conteúdo para quem tiver o ID ou o link, só para o app funcionar. Você pode apagar
			qualquer placar a qualquer momento nas configurações dele.
		</p>

		<h2>6. Disponibilidade</h2>
		<p>
			O Placar é oferecido <strong>no estado em que se encontra</strong>. Fazemos o possível para que funcione
			bem, mas não garantimos que ele vai estar sempre no ar, sem erros ou que os dados nunca serão perdidos.
			Funções podem mudar, sair ou passar a ser pagas, e o serviço pode ser encerrado. Se isso acontecer,
			avisaremos no site com antecedência sempre que possível.
		</p>

		<h2>7. Limitação de responsabilidade</h2>
		<p>
			Na medida permitida pela lei, o Placar não se responsabiliza por prejuízos causados pelo uso ou pela
			impossibilidade de usar o serviço, como um placar fora do ar no meio de uma partida ou uma pontuação
			perdida. Não use o Placar como único registro de resultados que tenham valor oficial, financeiro ou legal.
		</p>

		<h2>8. Excluir a conta</h2>
		<p>
			Você pode excluir sua conta quando quiser, em <strong>Perfil › Configurações › Excluir conta</strong>. Isso
			apaga a conta e todos os seus placares, sem volta. Também podemos encerrar contas que descumprirem estes
			termos.
		</p>

		<h2>9. Privacidade</h2>
		<p>
			O que coletamos e como usamos está na
			<NuxtLink to="/privacidade">Política de Privacidade</NuxtLink>, que faz parte destes termos.
		</p>

		<h2>10. Mudanças nestes termos</h2>
		<p>
			Podemos atualizar estes termos. A data no topo da página mostra a última versão. Se a mudança for
			importante, avisaremos no site. Continuar usando o Placar depois da mudança significa que você concorda com
			a nova versão.
		</p>

		<h2>11. Lei aplicável</h2>
		<p>Estes termos seguem as leis do Brasil.</p>

		<h2>12. Contato</h2>
		<p>
			Dúvidas, sugestões ou problemas: abra uma
			<a :href="ISSUES_URL" target="_blank" rel="noopener">issue no GitHub do Placar</a>.
		</p>
	</LegalPage>
</template>
