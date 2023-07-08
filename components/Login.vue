<script setup lang="ts">
import DiscordIcon from './icons/DiscordIcon.vue'
import LoadingIcon from './icons/LoadingIcon.vue';
import { useUserStore } from '../stores/user';

const userStore = useUserStore()

const id = ref('')

onMounted(() => {
   userStore.loading = false
})

watch(id, () => {
   id.value = id.value.toUpperCase()
})
</script>

<template>
   <div id="Login">
      <h3>
         Bem-vindo(a) ao
      </h3>
      <h1>
         Placar
      </h1>

      <LoadingIcon v-if="userStore.loading" />
      <template v-else>
         <h4>Entre com uma conta para criar um placar</h4>
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
            <input class="ContainerCard" type="text" placeholder="Digite o ID do Placar" v-model="id" maxlength="7" />
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

h3 {
   font-size: 16px;
   font-weight: 400;

   color: rgb(200, 200, 200);
}

h4 {
   font-size: 15px;
   color: rgb(200, 200, 200);

   font-weight: 400;
   margin-bottom: 24px;
}

#SocialLogin {
   margin-bottom: 24px;

   button {
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

input {
   width: 320px;
   height: 48px;

   border-radius: 8px;

   padding: 8px 16px;

   font-size: 14px;
   color: white;
   text-align: center;
}
</style>