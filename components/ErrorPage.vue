<script setup lang="ts">
const props = defineProps<{
   errorCode: '400' | '404' | '500'
}>()

function getErrorText() {
   switch (props.errorCode) {
      case '400':
         return 'ID inválido'
      case '404':
         return 'Placar não encontrado'
      case '500':
         return 'Erro interno do servidor'
      default:
         return 'Error desconhecido'
   }
}

</script>

<template>
   <div id="Error">
      <h1>
         {{ errorCode }}
      </h1>
      <h3>
         {{ getErrorText() }}
      </h3>

      <NuxtLink to="/" class="ContainerCard">
         Voltar para a página inicial
      </NuxtLink>
   </div>
</template>

<style scoped>
#Error {
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
   height: 100vh;
   width: 100vw;
}

h1 {
   font-size: 128px;
}

h3 {
   font-size: 24px;
}

.ContainerCard {
   margin-top: 128px;
   text-decoration: none;
   color: white;
   font-size: 15px;
   cursor: pointer;

   height: 48px;
   padding: 0 32px;
   display: flex;
   align-items: center;

   border-radius: 8px;

}
</style>