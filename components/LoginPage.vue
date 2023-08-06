<script setup lang="ts">
import DiscordIcon from './icons/DiscordIcon.vue'
import LoadingIcon from './icons/LoadingIcon.vue';
import ArrowRightIcon from './icons/ArrowRightIcon.vue';
import { useUserStore } from '../stores/user';

useHead({
   title: 'Placar | Login',
})

const userStore = useUserStore()
const router = useRouter()

const id = ref('')

onMounted(() => {
   userStore.loading = false
})

watch(id, () => {
   if (id.value === '') return

   id.value = id.value.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()


   if (!id.value.startsWith('#')) id.value = '#' + id.value
})

function goToPlacar() {
   const routeId = id.value.slice(1).trim().toLowerCase()

   console.log('Login -> goToPlacar -> routeId', routeId, routeId.length)
   if (routeId.length < 6) return

   router.push('/' + routeId)
}

</script>

<template>
   <div id="Login">
      <h2>
         Bem-vindo(a) ao
      </h2>
      <h1>
         Placar
      </h1>

      <LoadingIcon v-if="userStore.loading" />
      <template v-else>
         <h3>Entre com uma conta para criar um placar</h3>
         <div id="SocialLogin">
            <button id="DiscordSignIn" @click="userStore.signIn">
               <DiscordIcon />
               <span>
                  Entrar com Discord
               </span>
            </button>
         </div>
         <h4>Ou</h4>
         <div id="Visitor">
            <input class="ContainerCard" type="text" placeholder="Digite o ID do Placar" v-model="id" maxlength="7"
               @keypress.enter="goToPlacar" />
            <button @click="goToPlacar">
               <ArrowRightIcon />
            </button>
         </div>
      </template>

   </div>
</template>

<style lang="scss" scoped>
#Login {
   height: 100vh;

   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
}

h1 {
   font-size: 56px;
   font-weight: 700;

   margin-bottom: 96px;
}

h2 {
   font-size: 16px;
   font-weight: 400;

   color: rgb(200, 200, 200);
}

h3,
h4 {
   font-size: 15px;
   color: rgb(200, 200, 200);

   font-weight: 400;
}

h4 {
   margin: 32px;
}

#SocialLogin {
   button {
      margin-top: 24px;
      border: none;
      outline: none;

      border-radius: 8px;
      width: 256px;
      height: 48px;
      color: white;
      font-size: 24px;
      cursor: pointer;

      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;

      span {
         font-size: 14px;
      }
   }

   #DiscordSignIn {
      background: #7389da;
   }
}

#Visitor {
   position: relative;
   display: flex;
   align-items: center;
   justify-content: center;

   input {
      width: 320px;
      height: 48px;

      border-radius: 8px;

      padding: 8px 16px;

      font-size: 14px;
      color: white;
      text-align: center;
      vertical-align: middle;

   }

   button {
      display: flex;
      align-items: center;
      justify-content: center;

      position: absolute;
      right: 8px;

      border: none;
      outline: none;
      background: rgba(255, 255, 255, 0.05);
      padding: 4px;

      cursor: pointer;

      color: white;
      font-size: 24px;
      border-radius: 4px;
      // display: flex;
      // align-items: center;
      // justify-content: center;

   }
}
</style>