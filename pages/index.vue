<script setup lang="ts">
import Login from '../components/LoginPage.vue'
import List from '../components/ListPage.vue'

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