<template>
	<div role="status" aria-busy="true" aria-label="Carregando placares" class="flex flex-col gap-10">
		<div class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
			<div
				v-for="n in 3"
				:key="n"
				class="flex h-24 animate-skeleton flex-col gap-3 rounded-card bg-surface p-5 ring-1 ring-inset ring-raised"
			>
				<span class="h-3 w-[110px] rounded bg-raised" />
				<span class="h-8 w-14 rounded-chip bg-raised" />
			</div>
		</div>

		<div class="h-42 animate-skeleton rounded-feature bg-surface ring-1 ring-inset ring-raised" />

		<div class="grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-4">
			<div
				v-for="n in 4"
				:key="n"
				class="flex h-49 animate-skeleton flex-col gap-[18px] rounded-card bg-surface px-5 py-[18px] ring-1 ring-inset ring-raised"
			>
				<span class="h-[22px] w-[72px] rounded-chip bg-raised" />
				<span class="h-7 rounded-chip bg-raised" />
				<span class="h-7 rounded-chip bg-raised" />
			</div>
		</div>
	</div>
</template>
