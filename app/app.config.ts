export default defineAppConfig({
	ui: {
		colors: {
			primary: 'indigo',
			neutral: 'zinc',
		},
		// Ensina o tailwind-merge do Nuxt UI sobre os raios e sombras de app/assets/style.css,
		// senão `rounded-panel` não substitui o `rounded-lg` padrão dos componentes
		tv: {
			twMergeConfig: {
				extend: {
					theme: {
						radius: ['chip', 'btn', 'field', 'card', 'feature', 'panel', 'screen'],
						shadow: ['modal', 'toast'],
					},
				},
			},
		},
		modal: {
			slots: {
				content: 'bg-surface divide-raised',
				title: 'text-2xl font-bold text-white',
				description: 'text-fg-soft',
			},
			variants: {
				overlay: {
					true: { overlay: 'bg-scrim/72 backdrop-blur-xs' },
				},
				fullscreen: {
					false: { content: 'rounded-panel shadow-modal ring-raised' },
				},
			},
		},
		toast: {
			slots: {
				root: 'bg-surface rounded-card shadow-toast ring-edge',
				description: 'text-fg-soft',
			},
		},
	},
})
