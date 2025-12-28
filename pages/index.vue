<template>
  <div class="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <h1 class="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-purple-500 mb-2">
          KaraOkay
        </h1>
        <p class="text-slate-400">
          The instant, serverless karaoke room.
        </p>
      </div>

      <!-- Main Card -->
      <div class="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-xl">
        
        <!-- Tabs -->
        <div class="flex p-1 mb-6 bg-slate-800/50 rounded-xl">
          <button 
            @click="activeTab = 'join'"
            :class="[
              'flex-1 py-2 text-sm font-medium rounded-lg transition-all',
              activeTab === 'join' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            ]"
          >
            Join Room
          </button>
          <button 
            @click="activeTab = 'create'"
            :class="[
              'flex-1 py-2 text-sm font-medium rounded-lg transition-all',
              activeTab === 'create' ? 'bg-rose-600 text-white shadow-sm shadow-rose-900/20' : 'text-slate-400 hover:text-slate-200'
            ]"
          >
            Create Room
          </button>
        </div>

        <!-- Join Form -->
        <form v-if="activeTab === 'join'" @submit.prevent="handleJoin" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Room ID</label>
            <input 
              v-model="joinForm.roomId"
              type="text" 
              placeholder="e.g. -OEJ..."
              class="w-full bg-slate-800 border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder:text-slate-600"
              required
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Your Name</label>
            <input 
              v-model="joinForm.userName"
              type="text" 
              placeholder="Display Name"
              class="w-full bg-slate-800 border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder:text-slate-600"
              required
            />
          </div>
          <button 
            type="submit"
            :disabled="loading"
            class="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2"
          >
            <span v-if="loading" class="animate-spin text-xl">◌</span>
            Join Party
          </button>
        </form>

        <!-- Create Form -->
        <form v-else @submit.prevent="handleCreate" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Room Name</label>
            <input 
              v-model="createForm.roomName"
              type="text" 
              placeholder="Friday Night Karaoke!"
              class="w-full bg-slate-800 border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all placeholder:text-slate-600"
              required
            />
          </div>
           <div>
            <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Your Name (Host)</label>
            <input 
              v-model="createForm.hostName"
              type="text" 
              placeholder="Host Name"
              class="w-full bg-slate-800 border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all placeholder:text-slate-600"
              required
            />
          </div>
          <button 
            type="submit"
            :disabled="loading"
            class="w-full bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-rose-900/20 flex items-center justify-center gap-2"
          >
             <span v-if="loading" class="animate-spin text-xl">◌</span>
             Create Room
          </button>
        </form>

      </div>
      
      <p class="text-center text-slate-600 text-sm">
        Supports YouTube Karaoke Videos.<br>
        Multi-device sync via Firebase.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoomStore } from '~/stores/room'

const activeTab = ref<'join' | 'create'>('create')
const loading = ref(false)
const router = useRouter()
const roomStore = useRoomStore()

const joinForm = reactive({
  roomId: '',
  userName: ''
})

const createForm = reactive({
  roomName: '',
  hostName: ''
})

async function handleJoin() {
  if (!joinForm.roomId || !joinForm.userName) return
  loading.value = true
  try {
    // Navigate to room, let layout handle joining via URL params/store init
    // Or simpler: set store and verify existance first.
    // For now, direct navigation.
    // Ideally we store "myName" in localstorage or pinia persisting across route change.
    
    // We'll pass query params for setup
    await router.push({ 
        path: `/room/${joinForm.roomId}`,
        query: { name: joinForm.userName }
    })
  } catch (e) {
    console.error(e)
    alert("Failed to join")
  } finally {
    loading.value = false
  }
}

async function handleCreate() {
  if (!createForm.roomName || !createForm.hostName) return
  loading.value = true
  try {
    const roomId = await roomStore.createRoom(createForm.roomName, createForm.hostName)
    if (roomId) {
      await router.push({ 
          path: `/room/${roomId}`,
          query: { name: createForm.hostName }
      })
    }
  } catch (e) {
    console.error(e)
    alert("Failed to create room. Firebase configured?")
  } finally {
    loading.value = false
  }
}
</script>
