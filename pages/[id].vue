<script setup lang="ts">
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon.vue'
import GearIcon from '../components/icons/GearIcon.vue'
const route = useRoute()

const id = route.params.id

const fontSize = ref<'10vw' | '15vw' | '20vw'>('20vw')
</script>

<template>
   <div id="Placar">
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
            <h1>0</h1>
         </div>
         <div id="Divider"></div>
         <div class="score">
            <h1>0</h1>
         </div>
      </main>
      <footer>
         <p>{{ route.fullPath }} </p>
      </footer>
   </div>
</template>

<style lang="scss" scoped>
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

   .score h1 {
      font-size: v-bind(fontSize);
      font-weight: 700;
   }
}

footer {
   height: 128px;
}
</style>