<script setup lang="ts">
import Login from '../components/Login.vue'
import List from '../components/List.vue'

import { useUserStore } from '../stores/user'

const userStore = useUserStore()

</script>

<template>
   <div id="Home">
      <List v-if="userStore.isLogged" />
      <Login v-else />
   </div>
</template>

<style></style>