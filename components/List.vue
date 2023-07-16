<script setup lang="ts">
import PlusIcon from './icons/PlusIcon.vue'
import ArrowRightIcon from './icons/ArrowRightIcon.vue'
import UserIcon from './icons/UserIcon.vue'
import ExitIcon from './icons/ExitIcon.vue'

import CreatePlacarModal from './CreatePlacarModal.vue'

import { useUserStore } from '../stores/user'
import { usePlacarStore } from '../stores/placar'

const userStore = useUserStore()
const placarStore = usePlacarStore()

const placares = await placarStore.getAllPlacar()

const createPlacarModal = ref(false)

</script>

<template>
   <CreatePlacarModal v-model="createPlacarModal" />
   <div id="List">
      <header>
         <div>
            <button class="ContainerCard" @click="userStore.signOut">
               <ExitIcon />
               <span>
                  Sair
               </span>
            </button>
         </div>

         <h1>Placar</h1>

         <div>
            <UserIcon />
            <span> {{ userStore.user?.email }} </span>
         </div>
      </header>
      <main>

         <NuxtLink :to="`/${placar.id}`" class="card ContainerCard" v-for="placar in placares">
            <div class="arrow">
               <ArrowRightIcon />
            </div>
            <h3>
               <span>#</span>{{ placar.id }}
            </h3>
            <div class="card-content">
               <div class="team">
                  <h4>{{ placar.team_a_name }}</h4>
                  <h2>{{ placar.team_a_score }}</h2>
               </div>
               <div class="team">
                  <h4>{{ placar.team_b_name }}</h4>
                  <h2>{{ placar.team_b_score }}</h2>
               </div>
            </div>
         </NuxtLink>

      </main>
      <footer>
         <button class="ContainerCard" @click="createPlacarModal = true">
            <PlusIcon />
            <span>
               Criar Placar
            </span>
         </button>
      </footer>
   </div>
</template>

<style lang="scss" scoped>
#List {
   height: 100vh;

   display: flex;
   flex-direction: column;
}

main {
   display: flex;
   justify-content: center;
   flex-wrap: wrap;
   gap: 32px;
   padding: 0 3%;
   margin-top: 16px;
   margin-bottom: 32px;
   overflow-y: auto;


   .card {
      height: 144px;
      width: 256px;
      position: relative;

      cursor: pointer;
      border-radius: 8px;
      text-decoration: none;
      color: white;

      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;

      h2 {
         opacity: 0.6;
      }

      h3 {
         width: 100%;
         font-size: 20px;
         text-align: center;
         font-weight: 400;

         span {
            opacity: 0.5;
         }
      }

      &:hover {
         .arrow {
            opacity: 0.5;
         }
      }

      .arrow {
         opacity: 0;
         position: absolute;
         top: 4px;
         right: 0px;

         width: 32px;
         height: 32px;
         border-radius: 4px;


         font-size: 24px;

         transition: all 0.3s;

         &:hover {
            opacity: 1;
         }
      }

      .card-content {
         width: 100%;
         display: flex;
         align-items: center;
         justify-content: space-between;
      }

      .team {
         flex: 1;
         display: flex;
         flex-direction: column;
         align-items: center;
         justify-content: center;

         h4 {
            font-size: 14px;
            font-weight: 700;
         }

         h2 {
            font-size: 28px;
            font-weight: 400;
         }
      }
   }
}

footer {
   margin: 16px;
   padding: 0 3%;
   display: flex;
   align-items: center;
   justify-content: center;
}

button {
   height: 40px;
   padding: 0 32px;

   display: flex;
   align-items: center;
   justify-content: center;
   gap: 4px;

   cursor: pointer;
   border-radius: 8px;

   color: white;
   font-size: 24px;

   span {
      font-size: 13px;
      font-weight: 400;
   }
}
</style>