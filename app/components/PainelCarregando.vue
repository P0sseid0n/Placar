<template>
	<div role="status" aria-busy="true" aria-label="Carregando placares" class="flex flex-col gap-10">
		<div class="h-42 animate-skeleton rounded-feature bg-surface ring-1 ring-raised ring-inset" />

		<div class="grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-4">
			<div
				v-for="n in 4"
				:key="n"
				class="flex h-49 animate-skeleton flex-col gap-4.5 rounded-card bg-surface px-5 py-4.5 ring-1 ring-raised ring-inset"
			>
				<span class="h-5.5 w-18 rounded-chip bg-raised" />
				<span class="h-7 rounded-chip bg-raised" />
				<span class="h-7 rounded-chip bg-raised" />
			</div>
		</div>
	</div>
</template>
