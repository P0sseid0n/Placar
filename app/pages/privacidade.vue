<script setup lang="ts">
useHead({ title: 'Placar | Política de Privacidade' })
useSeoMeta({ description: 'Quais dados o Placar coleta, para que usa, com quem compartilha e como excluir.' })

const ISSUES_URL = 'https://github.com/P0sseid0n/Placar/issues'
</script>

<template>
	<LegalPage title="Política de Privacidade" updated-at="5 de novembro de 2026">
		<p>
			Esta política explica quais dados o Placar (<strong>placar.p0sseid0n.dev</strong>) coleta, para que usa e
			como você pode pedir para apagá-los, de acordo com a Lei Geral de Proteção de Dados (LGPD, Lei nº
			13.709/2018). Resumo: coletamos só o necessário para o login e para os seus placares, não vendemos nada e
			não usamos seus dados para rastreamento nem publicidade.
		</p>

		<h2>1. Quem cuida dos seus dados</h2>
		<p>
			O Placar é mantido por P0sseid0n, que é o responsável (controlador) pelos dados descritos aqui. O contato
			está no fim desta página.
		</p>

		<h2>2. Dados que coletamos</h2>
		<p><strong>Quando você entra com o Discord</strong>, o Discord nos envia:</p>
		<ul>
			<li>o ID da sua conta no Discord;</li>
			<li>seu nome de usuário e nome de exibição;</li>
			<li>o endereço da sua foto de perfil (avatar);</li>
			<li>seu e-mail, que o sistema de login exige para criar a conta.</li>
		</ul>
		<p>
			O Placar <strong>não tem acesso</strong> às suas mensagens, servidores, amigos ou senha do Discord. As
			permissões pedidas são só <strong>identify</strong> e <strong>email</strong>, e você as vê na tela de
			autorização do Discord antes de aceitar.
		</p>
		<p><strong>Quando você usa o Placar</strong>, guardamos:</p>
		<ul>
			<li>
				os placares que você cria: nomes dos times, cores, pontos, valor de cada ponto e tamanho dos números;
			</li>
			<li>
				as jogadas (qual time pontuou, quanto e quando), para mostrar as últimas jogadas e permitir desfazer;
			</li>
			<li>as datas de criação da conta, do último login e de cada placar.</li>
		</ul>
		<p>
			<strong>Dados técnicos:</strong> como em qualquer site, os servidores registram por pouco tempo dados como
			endereço IP, navegador e páginas acessadas, para manter o serviço funcionando e seguro.
		</p>

		<h2>3. Para que usamos</h2>
		<ul>
			<li>identificar você e manter sua sessão aberta;</li>
			<li>mostrar seu nome e sua foto no painel e no perfil (só para você);</li>
			<li>guardar seus placares e transmitir os pontos ao vivo para quem está assistindo;</li>
			<li>mostrar seus números no perfil, como quantos placares você criou;</li>
			<li>evitar abusos e corrigir erros.</li>
		</ul>
		<p>
			Não usamos seus dados para publicidade, não traçamos perfil de comportamento e não enviamos e-mails de
			marketing. As bases legais são a execução do serviço que você pediu e o legítimo interesse em mantê-lo
			seguro (art. 7º, V e IX, da LGPD).
		</p>

		<h2>4. O que fica público</h2>
		<p>
			Placares são públicos para quem tem o ID ou o link: nomes dos times, cores, pontos e jogadas. Quem assiste
			também vê se o dono do placar está com ele aberto (o selo de "ao vivo"). Seu nome, sua foto e seu e-mail
			<strong>não aparecem</strong> para quem assiste.
		</p>

		<h2>5. Com quem compartilhamos</h2>
		<p>Não vendemos nem alugamos dados. Eles passam só pelos serviços que fazem o Placar funcionar:</p>
		<ul>
			<li>
				<strong>Supabase</strong>: banco de dados, login e tempo real. Os dados ficam em servidores em São
				Paulo. <a href="https://supabase.com/privacy" target="_blank" rel="noopener">Política do Supabase</a>.
			</li>
			<li>
				<strong>Vercel</strong>: hospedagem do site.
				<a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener">Política da Vercel</a>.
			</li>
			<li>
				<strong>Discord</strong>: login. A foto de perfil é carregada direto dos servidores do Discord.
				<a href="https://discord.com/privacy" target="_blank" rel="noopener">Política do Discord</a>.
			</li>
		</ul>
		<p>
			Alguns desses serviços podem processar dados fora do Brasil, com as proteções previstas na LGPD. Também
			podemos compartilhar dados se a lei ou uma ordem judicial exigir.
		</p>

		<h2>6. Cookies</h2>
		<p>
			O Placar usa só os cookies necessários para manter você logado. Não usamos cookies de análise, de
			publicidade nem de terceiros para rastreamento. Quem só assiste a placares sem entrar não recebe cookie de
			sessão.
		</p>

		<h2>7. Por quanto tempo guardamos</h2>
		<ul>
			<li>Os dados da conta ficam guardados enquanto ela existir.</li>
			<li>Cada placar e suas jogadas ficam guardados até você apagar o placar ou a conta.</li>
			<li>Os registros técnicos dos servidores são apagados automaticamente pelos provedores em pouco tempo.</li>
		</ul>
		<p>
			Ao excluir a conta, ela e todos os seus placares e jogadas são apagados na hora. Cópias de segurança do
			banco podem guardar esses dados por alguns dias, até serem substituídas.
		</p>

		<h2>8. Seus direitos</h2>
		<p>Pela LGPD, você pode pedir para confirmar, acessar, corrigir, levar ou apagar seus dados. Na prática:</p>
		<ul>
			<li>
				<strong>Apagar tudo:</strong> em <strong>Perfil › Configurações › Excluir conta</strong>, sem precisar
				pedir para ninguém.
			</li>
			<li><strong>Apagar um placar:</strong> nas configurações do próprio placar.</li>
			<li>
				<strong>Corrigir nome ou foto:</strong> mude no Discord; o Placar recebe os dados novos no próximo
				login.
			</li>
			<li>
				<strong>Tirar o acesso do Placar:</strong> no Discord, em Configurações de Usuário › Aplicativos
				Autorizados.
			</li>
			<li><strong>Outros pedidos:</strong> pelo contato no fim desta página.</li>
		</ul>
		<p>
			Você também pode reclamar à Autoridade Nacional de Proteção de Dados (<a
				href="https://www.gov.br/anpd"
				target="_blank"
				rel="noopener"
				>ANPD</a
			>).
		</p>

		<h2>9. Segurança</h2>
		<p>
			Os dados trafegam com criptografia (HTTPS). No banco, regras de acesso garantem que só o dono altera ou
			apaga os próprios placares. Nenhum sistema é 100% seguro; se acontecer um incidente que possa trazer risco a
			você, avisaremos conforme a LGPD.
		</p>

		<h2>10. Crianças e adolescentes</h2>
		<p>
			Para criar placares é preciso ter conta no Discord, que exige idade mínima. Não coletamos de propósito dados
			de quem está abaixo dessa idade.
		</p>

		<h2>11. Mudanças nesta política</h2>
		<p>
			Podemos atualizar esta política. A data no topo da página mostra a última versão. Se a mudança for
			importante, avisaremos no site.
		</p>

		<h2>12. Contato</h2>
		<p>
			Dúvidas ou pedidos sobre seus dados: abra uma
			<a :href="ISSUES_URL" target="_blank" rel="noopener">issue no GitHub do Placar</a>. Não coloque dados
			pessoais na issue, porque ela é pública: descreva o pedido e combinamos por lá um canal privado.
		</p>
	</LegalPage>
</template>
