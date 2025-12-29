<template>
  <div class="h-screen flex flex-col md:flex-row overflow-hidden bg-slate-950">
    <!-- Left Pane: Player & Header (Desktop) -->
    <div class="flex-1 flex flex-col p-4 gap-4 overflow-y-auto md:overflow-hidden relative">
      
      <!-- Room Header -->
      <header class="flex flex-wrap justify-between items-center bg-slate-900/50 p-3 rounded-xl border border-slate-800 gap-2">
        <div>
          <h1 class="font-bold text-lg text-white flex items-center gap-2">
            <span class="text-rose-500">🎤</span> {{ roomStore.roomName || 'Room' }}
          </h1>
          <div class="flex items-center gap-2 text-xs text-slate-500 cursor-pointer hover:text-slate-300" @click="copyLink">
            <span>ID: {{ roomStore.roomId }}</span>
            <span v-if="copied" class="text-green-400 font-bold">Copied!</span>
            <span v-else>📋</span>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
             <!-- Player Toggle -->
            <button 
                @click="showPlayer = !showPlayer"
                :class="['px-3 py-1.5 rounded-lg text-xs font-bold transition-all border', showPlayer ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-900/20' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white']"
            >
                {{ showPlayer ? '📺 Hide Player' : '📱 Remote Mode' }}
            </button>

            <div class="text-xs text-right hidden sm:block">
               <div class="font-medium text-slate-300">{{ roomStore.userName }}</div>
               <div class="text-slate-500">{{ roomStore.users.length }} singing</div>
            </div>
        </div>
      </header>

      <!-- Player Stage -->
      <div v-if="showPlayer" class="flex-1 flex flex-col justify-center min-h-[300px] animate-fade-in">
        <VideoPlayer 
          :video-id="roomStore.currentSong?.youtubeId" 
          :is-playing="roomStore.isPlaying"
          @ended="roomStore.nextSong()"
          @state-change="handlePlayerState"
        />
        
        <!-- Now Playing Info -->
        <div class="mt-4 text-center">
          <h2 class="text-xl font-bold text-white truncate px-4">
            {{ roomStore.currentSong?.title || 'Waiting for songs...' }}
          </h2>
          <p v-if="roomStore.currentSong" class="text-sm text-slate-400">
            Selected by <span class="text-purple-400">{{ roomStore.currentSong.addedBy }}</span>
          </p>
          <p class="text-[10px] text-slate-600 mt-2 italic">* Accurate sync begins on the next song</p>
        </div>
      </div>
      
      <!-- Remote Mode Placeholder -->
      <div v-else class="flex-1 flex flex-col items-center justify-center min-h-[350px] bg-slate-900/30 rounded-xl border border-slate-800 border-dashed p-8 text-center animate-fade-in">
          <div class="text-6xl mb-4 opacity-50">📱</div>
          <h2 class="text-xl font-bold text-white mb-2">Remote Control Mode</h2>
          <p class="text-slate-400 text-sm max-w-xs mx-auto mb-2">
            The video player is hidden to save battery. You can still add songs and control playback.
          </p>
          <p class="text-[10px] text-slate-600 italic mb-6">* Accurate sync begins on the next song</p>
          
          <div v-if="roomStore.currentSong" class="bg-slate-800 p-4 rounded-xl border border-slate-700 max-w-sm w-full">
             <p class="text-xs text-rose-400 font-bold uppercase tracking-wider mb-1">Now Playing</p>
             <p class="text-white font-bold truncate">{{ roomStore.currentSong.title }}</p>
             <p class="text-xs text-slate-500 mt-1">added by {{ roomStore.currentSong.addedBy }}</p>
          </div>
          <div v-else class="text-sm text-slate-500">
            No song playing. Add one!
          </div>

           <button 
                @click="showPlayer = true"
                class="mt-2 text-xs text-slate-500 hover:text-white underline"
            >
                Show Video Player
            </button>
      </div>
      
      <!-- Controls -->
      <RoomControls 
        :is-playing="roomStore.isPlaying"
        @toggle-play="togglePlay"
        @next="roomStore.nextSong()"
      />

    </div>

    <!-- Right Pane: Queue & Search (Desktop: Sidebar, Mobile: Below) -->
    <div class="w-full md:w-96 flex flex-col bg-slate-900 border-l border-slate-800 h-[50vh] md:h-full">
      
      <!-- Tabs for Mobile/Compact -->
      <div class="flex border-b border-slate-800">
        <button 
          @click="tab = 'queue'"
          :class="['flex-1 p-3 text-sm font-bold transition-colors', tab === 'queue' ? 'text-white border-b-2 border-rose-500' : 'text-slate-500 hover:text-slate-300']"
        >
          Queue
        </button>
        <button 
          @click="tab = 'search'"
          :class="['flex-1 p-3 text-sm font-bold transition-colors', tab === 'search' ? 'text-white border-b-2 border-rose-500' : 'text-slate-500 hover:text-slate-300']"
        >
          Add Song
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-4 bg-slate-900/50">
        <Transition mode="out-in">
          <div v-if="tab === 'queue'" class="h-full">
             <QueueList 
               :songs="roomStore.queue" 
               @remove="roomStore.removeSong"
             />
          </div>
          <div v-else class="h-full">
             <SearchSongs @add="handleAddSong" />
             
             <!-- QR Code for easy join (Placeholder with link) -->
             <div class="mt-8 p-4 bg-white rounded-xl flex flex-col items-center gap-2">
                <img :src="`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(shareUrl)}`" alt="Join Room QR" />
                <p class="text-xs text-black font-mono mt-1 text-center break-all">{{ shareUrl }}</p>
             </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRoomStore } from '~/stores/room'
// Import components
import VideoPlayer from '~/components/player/VideoPlayer.vue'
import RoomControls from '~/components/room/RoomControls.vue'
import QueueList from '~/components/room/QueueList.vue'
import SearchSongs from '~/components/room/SearchSongs.vue'

const route = useRoute()
const router = useRouter()
const roomStore = useRoomStore()

const showPlayer = ref(false) // Default to hidden (Remote Mode)
const tab = ref<'queue' | 'search'>('queue')
const copied = ref(false)

const roomId = computed(() => route.params.id as string)
const shareUrl = computed(() => {
    if (import.meta.client) {
        return window.location.href.split('?')[0]
    }
    return ''
})

onMounted(async () => {
    const name = route.query.name as string
    if (!name) {
        // Redirect to home if no name
        await router.push(`/?room=${roomId.value}`)
        return
    }
    
    await roomStore.joinRoom(roomId.value, name)
})

function handleAddSong(song: { youtubeId: string, title: string }) {
    roomStore.addSong({
        youtubeId: song.youtubeId,
        title: song.title,
        addedBy: roomStore.userName
    })
    // Switch to queue to see it
    tab.value = 'queue'
}

function togglePlay() {
    roomStore.setPlaying(!roomStore.isPlaying)
}

function handlePlayerState(state: number) {
    // Sync player state if needed, e.g. buffering handling
    // YT Player state: 1 = Playing, 2 = Paused
    if (state === 1 && !roomStore.isPlaying) {
        // User clicked play on YouTube IFrame natively
        roomStore.setPlaying(true)
    } else if (state === 2 && roomStore.isPlaying) {
        roomStore.setPlaying(false)
    }
}

function copyLink() {
    if (import.meta.client) {
        navigator.clipboard.writeText(roomId.value)
        copied.value = true
        setTimeout(() => copied.value = false, 2000)
    }
}
</script>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.2s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
