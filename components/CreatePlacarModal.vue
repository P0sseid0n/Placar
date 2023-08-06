<script setup lang="ts">
import { usePlacarStore } from '../stores/placar'
import LoadingIcon from './icons/LoadingIcon.vue';
const router = useRouter()

const placarStore = usePlacarStore()
interface Props {
   modelValue: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
   (e: 'update:modelValue', value: boolean): void
}>()

const teamA = ref('')
const teamB = ref('')
const score = ref<number>(1)

const loading = ref(false)

const isValidForm = computed(() => teamA.value.trim() !== '' && teamB.value.trim() !== '' && score.value !== undefined && score.value > 0)

async function handleCreate() {
   if (!isValidForm.value) return

   loading.value = true

   placarStore.createPlacar({
      score: score.value,
      teamA: teamA.value,
      teamB: teamB.value
   })
      .then(placarId => {
         emit('update:modelValue', false)

         router.push(`/${placarId}`)
      })
      .catch((error) => {
         console.log('error')
         console.log(error)
      })
      .finally(() => {
         loading.value = false
      })

}

function handleCancel() {
   teamA.value = ''
   teamB.value = ''
   score.value = 1

   emit('update:modelValue', false)
}

</script>

<template>
   <div class="background-modal" @click.self="emit('update:modelValue', false)" v-if="props.modelValue">
      <div id="CreatePlacar">
         <h1>Criando Placar</h1>
         <div>
            <label for="Team1">Nome do time 1</label>
            <input id="Team1" type="text" placeholder="ABC" v-model="teamA" :disabled="loading" />
         </div>
         <div>
            <label for="Team2">Nome do time 2</label>
            <input id="Team2" type="text" placeholder="ABC" v-model="teamB" :disabled="loading" />
         </div>
         <div>
            <label for="Score">Valor da pontuação</label>
            <input id="Score" type="number" placeholder="1" v-model="score" :disabled="loading" />
         </div>
         <div id="Submit">
            <button class="cancel" @click="handleCancel" :disabled="loading">Cancelar</button>
            <button :class="[{ valid: isValidForm, }, 'ContainerCard', 'create']" :disabled="!isValidForm || loading"
               @click="handleCreate">
               <LoadingIcon v-if="loading" />
               <span v-else>
                  Criar
               </span>
            </button>
         </div>
      </div>
   </div>
</template>

<style lang="scss" scoped>
.background-modal {
   position: fixed;
   top: 0;
   left: 0;
   width: 100%;
   height: 100%;
   background-color: rgba(0, 0, 0, 0.75);
   display: flex;
   justify-content: center;
   align-items: center;
   z-index: 10;
   text-align: center;
}

#CreatePlacar {
   width: 480px;
   height: 480px;
   background: rgb(25, 25, 27);
   border: 1px solid rgba(245, 245, 255, 0.1);
   border-radius: 8px;
   padding: 24px 32px;
   display: flex;
   flex-direction: column;
   justify-content: space-between;
   align-items: center;

   >div {
      width: 100%;
      text-align: left;
   }
}

input {
   width: 100%;
   height: 40px;
   border-radius: 4px;
   background: rgba(245, 245, 255, 0.06);
   border: 1px solid rgba(245, 245, 255, 0.06);

   color: white;
   font-size: 16px;
   line-height: 20px;
   padding: 16px;
   margin-top: 8px;
}

div#Submit {
   display: flex;
   flex-direction: row;
   justify-content: space-between;
   align-items: center;
   gap: 32px;
   padding: 0 32px;
}

button {
   flex: 1;
   height: 32px;
   border-radius: 4px;
   cursor: pointer;

   transition: 0.3s;

   color: white;
   font-size: 16px;
   line-height: 20px;
   padding: 0 8px;
   margin-top: 8px;
}

button.cancel {
   background: transparent;
   color: white;
   border: none;

   &:hover {
      background: rgba(245, 245, 255, 0.06);
   }
}

button.create {
   svg {
      width: 32px;
      height: 32px;
   }

   &.valid {
      background: var(--success-color);
   }
}
</style>