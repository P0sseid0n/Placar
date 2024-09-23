<template>
	<div class="bg-zinc-900">
		<NuxtPage />
	</div>
</template>

<style lang="scss">
:root {
	--success-color: #3080e2;
}

/* width */
::-webkit-scrollbar {
	width: 8px;
}

/* Track */
::-webkit-scrollbar-track {
	background: transparent;
}

/* Handle */
::-webkit-scrollbar-thumb {
	background: rgba(245, 245, 250, 0.2);
	border-radius: 40px;

	&:hover {
		background: rgba(245, 245, 250, 0.4);
	}
}

// #App > div > header,
// #App > div > div > header {
// 	height: 128px;

// 	display: flex;
// 	align-items: center;
// 	justify-content: space-between;
// 	padding: 0 3%;

// 	h1 {
// 		font-size: 40px;
// 		font-weight: 700;
// 	}

// 	a,
// 	button {
// 		text-decoration: none;
// 		color: white;
// 		cursor: pointer;

// 		height: 40px;
// 		padding: 0 32px;
// 		display: inline-flex;

// 		border-radius: 8px;
// 	}

// 	> div {
// 		flex: 1;

// 		&:last-of-type {
// 			text-align: right;
// 			justify-content: flex-end;
// 		}
// 	}

// 	a,
// 	button,
// 	> div:has(> span) {
// 		align-items: center;
// 		justify-content: center;
// 		gap: 8px;

// 		font-size: 24px;

// 		span {
// 			font-size: 16px;
// 		}
// 	}

// 	> div:has(> span) {
// 		display: flex;

// 		span {
// 			opacity: 0.5;
// 		}
// 	}
// }
</style>
