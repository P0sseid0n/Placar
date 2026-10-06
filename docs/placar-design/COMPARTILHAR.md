# Placar — compartilhar com QR code

Complementa o `HANDOFF.md`. Referência visual: `designs/Compartilhar.dc.html` (o QR do design é ilustrativo; no app ele deve ser gerado de verdade).

## Onde abre
- Botão “Compartilhar” no cabeçalho de `/id/[id]` (dono) abre o modal `app/components/ShareModal.vue`. Hoje ele só copiava o link.

## Modal (até 480px, raio 20, fundo #1d1d20; topo e rodapé fixos, meio rola)
- Título “Compartilhar placar” + “Quem abrir acompanha ao vivo, sem precisar entrar.” e X para fechar.
- QR code de 216px num cartão branco (raio 16, 10px de respiro), apontando para a URL completa do placar: `${origin}/id/${public_id}` (usar `useRequestURL().origin` ou `window.location.origin`). Abaixo: “Aponte a câmera do celular para abrir”. QR em #18181b sobre branco, correção de erro M, `role="img"` com `aria-label`.
- Bloco “ID do placar” com `#public_id` grande em monoespaçada + botão “Copiar ID”.
- Campo “Link” somente leitura com a URL + botão branco “Copiar link”.
- Botões “Baixar QR code” (PNG ~1024px, nome `placar-<id>.png`) e “Mostrar em tela cheia”.
- Rodapé: “Fechar”.
- Copiar/baixar mostram toast de sucesso do Nuxt UI (“ID copiado!”, “Link copiado!”).

## Tela cheia (para TV/projetor)
- Ocupa a tela toda, fundo com grade de pontos, X no canto.
- “{Time A} x {Time B}”, título “Escaneie para acompanhar ao vivo”, QR grande (min(56vh, 80vw, 440px)) em cartão branco raio 24, e “ou digite o ID na tela inicial” + `#id` grande.
- Usar a Fullscreen API quando disponível; Esc fecha.

## Implementação
- Gerar o QR no cliente com uma biblioteca leve (ex.: `qrcode` ou `uqr`) como SVG; para o PNG, gerar em canvas.
- Não depende de backend.
