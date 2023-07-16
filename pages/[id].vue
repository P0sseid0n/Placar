<script setup lang="ts">
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon.vue'
import GearIcon from '../components/icons/GearIcon.vue'
import LoadingIcon from '../components/icons/LoadingIcon.vue'


import { usePlacarStore } from '../stores/placar'

const route = useRoute()

const placarStore = usePlacarStore()
type Placar = Awaited<ReturnType<typeof placarStore.getPlacarById>>

type ErrorsCode = '400' | '404' | '500'
const placar = ref<Placar>()
const codeError = ref<ErrorsCode>()

async function findPlacar() {
   const id = route.params.id

   console.log(id)

   if (!id || typeof id !== 'string') {
      codeError.value = '400'
      return
   }


   try {
      const placarPayload = await placarStore.getPlacarById(id)

      if (!placarPayload) codeError.value = '404'

      console.log('placarPayload', placarPayload)

      placar.value = placarPayload || undefined

   } catch (error) {
      codeError.value = '500'
   }
}

onMounted(() => {
   findPlacar()
})


const fontSize = ref<'10vw' | '15vw' | '20vw'>('20vw')
</script>

<template>
   <div v-if="codeError">
      <h1>{{ codeError }}</h1>
   </div>
   <div v-else-if="!placar" id="Loading">
      <LoadingIcon />
   </div>
   <div v-else id="Placar">
      <header>
         <div>
            <NuxtLink to="/" class="ContainerCard">
               <ArrowLeftIcon />
               <span>Voltar</span>
            </NuxtLink>
         </div>

         <h1>
            Placar
         </h1>

         <div>
            <button class="ContainerCard">
               <GearIcon />
               <span>
                  Configurações
               </span>
            </button>
         </div>
      </header>
      <main>
         <div class="score">
            <h4> </h4>
            <h2>0</h2>
         </div>
         <div id="Divider"></div>
         <div class="score">
            <h2>0</h2>
         </div>
      </main>
      <footer>
         <p>{{ route.fullPath }} </p>
      </footer>
   </div>
</template>

<style lang="scss" scoped>
#Loading {
   height: 100vh;
   display: flex;
   justify-content: center;
   align-items: center;
}

#Placar {
   height: 100vh;
   display: flex;
   flex-direction: column;
}


header>div {
   width: 200px;
}


main {
   flex: 1;
   display: flex;
   justify-content: space-around;
   align-items: center;
   padding: 0 5%;

   #Divider {
      height: 80%;
      width: 1px;
      border: 2px dashed rgba(255, 255, 255, 0.5);
   }

   .score h2 {
      font-size: v-bind(fontSize);
      font-weight: 700;
   }

   .score h4 {
      font-size: 16px;
      font-weight: 400;
      color: rgb(200, 200, 200);
   }
}

footer {
   height: 128px;
}
</style>