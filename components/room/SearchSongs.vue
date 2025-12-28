<template>
  <div class="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
    <h3 class="font-bold text-white mb-4 flex items-center gap-2">
      <span>🔍</span> Add Song
    </h3>
    
    <!-- Tabs -->
    <div class="flex gap-2 mb-4 bg-slate-900/50 p-1 rounded-lg">
      <button 
        @click="mode = 'link'"
        :class="['flex-1 py-2 text-xs font-bold rounded-md transition-colors', mode === 'link' ? 'bg-slate-700 text-white shadow' : 'text-slate-500 hover:text-slate-300']"
      >
        Paste Link
      </button>
      <button 
        @click="mode = 'search'"
        :class="['flex-1 py-2 text-xs font-bold rounded-md transition-colors', mode === 'search' ? 'bg-slate-700 text-white shadow' : 'text-slate-500 hover:text-slate-300']"
      >
        Search (Free)
      </button>
      <button 
        @click="mode = 'api'"
        :class="['flex-1 py-2 text-xs font-bold rounded-md transition-colors', mode === 'api' ? 'bg-slate-700 text-white shadow' : 'text-slate-500 hover:text-slate-300']"
      >
        YouTube API
      </button>
    </div>
    
    <!-- Mode 1: Paste Link -->
    <div v-if="mode === 'link'" class="animate-fade-in">
      <div class="flex gap-2 mb-4">
        <input 
          v-model="query"
          @keyup.enter="handleLinkSearch"
          type="text" 
          placeholder="Paste YouTube URL..."
          class="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
        />
        <button 
          @click="handleLinkSearch"
          class="bg-gradient-to-r from-emerald-500 to-lime-600 hover:from-emerald-400 hover:to-lime-500 text-white font-bold px-4 rounded-lg shadow-lg hover:shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
        >
          <span class="hidden sm:block">Add</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
      </div>

       <!-- Google/YouTube External Hint -->
       <div class="text-center p-2 bg-slate-900/30 rounded-lg border border-slate-800/50 flex flex-col gap-2">
         <p class="text-[10px] text-slate-500">Cant find a song? Search externally:</p>
         <div class="flex gap-2 justify-center">
            <a 
                href="https://www.youtube.com/results?search_query=karaoke" 
                target="_blank"
                class="text-[10px] font-bold text-red-400 hover:underline border border-red-900/50 px-2 py-1 rounded bg-red-900/10"
            >
                Search on YouTube ↗
            </a>
            <a 
                href="https://www.google.com/search?q=youtube+karaoke&tbm=vid" 
                target="_blank"
                class="text-[10px] font-bold text-blue-400 hover:underline border border-blue-900/50 px-2 py-1 rounded bg-blue-900/10"
            >
                Search on Google ↗
            </a>
         </div>
         <p class="text-[9px] text-slate-600">Copy the URL from there and paste it above.</p>
      </div>

      <!-- Link Preview -->
      <div v-if="previewId" class="mt-4">
         <div class="bg-slate-900 rounded-lg p-3 flex gap-3 items-center border border-rose-500/30">
          <img :src="`https://img.youtube.com/vi/${previewId}/mqdefault.jpg`" class="w-16 h-12 object-cover rounded bg-slate-800" />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-white truncate">Video ID: {{ previewId }}</p>
            <button 
              @click="addPreviewToQueue"
              class="mt-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-lg w-full"
            >
              Add to Queue
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mode 2 & 3: Search UI (Shared) -->
    <div v-if="mode === 'search' || mode === 'api'" class="animate-fade-in">
       
        <!-- API Key Input for Mode 3 -->
        <div v-if="mode === 'api'" class="mb-4 space-y-3">

            <!-- 1. My Personal Key -->
            <div class="bg-indigo-900/20 border border-indigo-500/30 p-3 rounded-lg animate-fade-in">
                <div class="flex justify-between items-center mb-2">
                    <p class="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">My Personal Key</p>
                    <button v-if="localKey" @click="clearLocalKey" class="text-[10px] text-red-400 hover:text-red-300">Clear</button>
                </div>
                
                <div v-if="!localKey" class="flex gap-2">
                     <input type="password" v-model="tempKey" placeholder="Paste API Key" class="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white focus:border-indigo-500 outline-none" />
                     <button @click="saveLocalKey" class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 rounded font-bold">Save</button>
                </div>

                <div v-else class="flex items-center gap-2">
                    <span class="text-xs text-green-400">● Saved locally</span>
                    <span class="text-[10px] text-slate-500 font-mono">({{ localKey.substring(0, 6) }}...)</span>
                </div>

                <div>
                <p class="text-[10px] text-slate-400 my-2">
                    1. Go to <a href="https://console.cloud.google.com/apis/library/youtube.googleapis.com" target="_blank" class="text-indigo-400 underline">Google Cloud Console</a>.<br>
                    2. Enable "YouTube Data API v3".<br>
                    3. Create Credentials (API Key).
                </p>
                </div>
            </div>

            <!-- 2. Shared Room Key -->
            <div class="bg-slate-900/40 border border-slate-700/50 p-3 rounded-lg animate-fade-in">
                 <div class="flex justify-between items-center mb-2">
                    <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Room Shared Key</p>
                    <!-- Show ACTIVE badge if this is what we are using -->
                    <span v-if="usingRoomKey" class="text-[9px] bg-green-900/50 text-green-400 px-2 py-0.5 rounded border border-green-500/30">Active</span>
                </div>

                <div v-if="roomStore.roomApiKey">
                    <div class="flex items-center gap-2 mb-2">
                         <span class="text-xs">🔑</span>
                         <span class="text-xs text-white">Key is shared with room</span>
                    </div>
                    
                    <!-- Revoke Controls: Visible if Host OR if Local Key matches Room Key -->
                    <div v-if="localKey === roomStore.roomApiKey || roomStore.isHost" class="mt-2 text-right">
                         <button @click="revokeRoomKey" class="text-[10px] bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/30 px-2 py-1 rounded transition-colors">
                            Stop Sharing
                         </button>
                    </div>
                    <div v-else class="mt-2 text-[10px] text-slate-500 italic">
                        Only the host or sharer can remove this.
                    </div>
                </div>
                <div v-else>
                    <p class="text-[10px] text-slate-500 mb-2">No key shared. Users without a key cannot use search.</p>
                    <button 
                        v-if="localKey" 
                        @click="shareKeyToRoom"
                        class="w-full text-[10px] bg-indigo-900/20 hover:bg-indigo-900/40 text-indigo-300 border border-indigo-500/20 px-2 py-1 rounded transition-colors"
                    >
                        Share My Key (Uses your quota)
                    </button>
                </div>
            </div>

        </div>

       <div class="flex gap-2 mb-4">
        <input 
          v-model="searchQuery"
          @keyup.enter="performSearch"
          type="text" 
          placeholder="Search song title..."
          class="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
        />
        <button 
          @click="performSearch"
          class="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold px-4 rounded-lg shadow-lg hover:shadow-rose-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          :disabled="searching"
        >
          <span class="hidden sm:block">{{ searching ? 'Searching...' : 'Search' }}</span>
          <svg v-if="!searching" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </button>
      </div>
      
      <!-- Results Grid -->
      <div v-if="searchResults.length > 0" class="grid grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1">
          <div 
            v-for="item in searchResults" 
            :key="item.id"
            class="group relative bg-slate-900 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-rose-500 transition-all border border-slate-800"
            @click="addResultToQueue(item)"
          >
            <div class="aspect-video w-full relative bg-slate-950">
                <img :src="item.thumbnail" class="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" loading="lazy" />
                <div class="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] px-1 rounded font-mono" v-if="item.duration">
                    {{ item.duration }}
                </div>
                <div class="absolute top-1 left-1 bg-indigo-600/80 text-white text-[8px] px-1 rounded" v-if="item.isCached">
                    CACHED
                </div>
                <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-all">
                    <span class="text-3xl text-white">⊕</span>
                </div>
            </div>
            
            <div class="p-2">
                <p class="text-xs font-bold text-white line-clamp-2 leading-tight" v-html="item.title"></p>
                <div class="flex justify-between items-center mt-1">
                    <p class="text-[10px] text-slate-400 truncate max-w-[70%]">{{ item.uploaderName || 'Unknown' }}</p>
                </div>
            </div>
          </div>
      </div>

       <!-- Status / Errors -->
       <div v-if="searchResults.length === 0 && !searching && searchQuery" class="text-center p-8 bg-slate-900/30 rounded-xl">
           <p class="text-sm text-slate-400 mb-2">No results found.</p>
           <p v-if="errorMsg" class="text-xs text-red-400 bg-red-900/10 p-2 rounded border border-red-900/30">{{ errorMsg }}</p>
       </div>
      
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoomStore } from '~/stores/room'
import { useNuxtApp } from '#app'
import { ref as dbRef, get, query as dbQuery, orderByChild, startAt, endAt, limitToFirst } from 'firebase/database'

const emit = defineEmits<{
  (e: 'add', song: { youtubeId: string, title: string }): void
}>()

const roomStore = useRoomStore()
const { $db } = useNuxtApp()

const mode = ref<'link' | 'search' | 'api'>('search')
const query = ref('')
const previewId = ref('')

// Link Logic
function extractVideoId(input: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = input.match(regExp);
  if (match && match[2] && match[2].length === 11) return match[2];
  if (input.length === 11) return input;
  return null;
}

function handleLinkSearch() {
  const id = extractVideoId(query.value)
  if (id) previewId.value = id
  else alert("Invalid YouTube Link or ID")
}

function addPreviewToQueue() {
  if (!previewId.value) return
  emit('add', { youtubeId: previewId.value, title: `YouTube Video (${previewId.value})` })
  query.value = ''
  previewId.value = ''
}

// Search Logic
const searchQuery = ref('')
const searchResults = ref<any[]>([])
const searching = ref(false)
const errorMsg = ref('')

// API Key Logic
const localKey = ref('')
const tempKey = ref('')

// Effective Key: Prefer Local, then Room Shared
const effectiveApiKey = computed(() => localKey.value || roomStore.roomApiKey)
const usingRoomKey = computed(() => !localKey.value && !!roomStore.roomApiKey)

const searchButtonLabel = computed(() => {
    if (mode.value === 'api') return 'Analyze'
    return 'Search'
})

onMounted(() => {
    if (import.meta.client) {
        localKey.value = localStorage.getItem('karaokay_yt_key') || ''
    }
})

function saveLocalKey() {
    if (tempKey.value) {
        localKey.value = tempKey.value
        localStorage.setItem('karaokay_yt_key', tempKey.value)
    }
}

function clearLocalKey() {
    localKey.value = ''
    localStorage.removeItem('karaokay_yt_key')
}

// Sharing Logic
async function shareKeyToRoom() {
    if (!localKey.value) return
    if (!confirm("Are you sure? Everyone in this room will use YOUR quota (100 queries/day).")) return
    await roomStore.setRoomApiKey(localKey.value)
}

async function revokeRoomKey() {
    await roomStore.setRoomApiKey(null)
}

// Unified Search
const PIPED_INSTANCES = [
    'https://pipedapi.kavin.rocks',
    'https://api.piped.io',
    'https://pipedapi.drgns.space',
    'https://pa.il.ax'
]

async function performSearch() {
    if (!searchQuery.value) return
    searching.value = true
    errorMsg.value = ''
    searchResults.value = []
    
    // 1. If Free Search, Check Firebase Cache FIRST
    if (mode.value === 'search') {
        try {
            // Very basic prefix search on global songs cache
            // Note: Firebase is case-sensitive and simple. 
            // We'll search by title? Actually we can't easily SEARCH by title without an index.
            // But we can fetch recent songs or similar?
            // Let's trying fetching ALL cached songs (limit 50) and CLIENT filtering?
            // If the cache is small it works. If large, we need Algolia.
            // For now, let's just fetch the last 100 played songs and see if any match.
            // This is a "Community Favorites" approach.
            
            const songsRef = dbQuery(dbRef($db, 'songs'), limitToFirst(100))
            const snapshot = await get(songsRef)
            const cache = snapshot.val()
            
            if (cache) {
                const terms = searchQuery.value.toLowerCase().split(' ')
                const matches = Object.values(cache)
                    .filter((s: any) => {
                        const t = s.title.toLowerCase()
                        return terms.every(term => t.includes(term))
                    })
                    .slice(0, 10) // Top 10 matches
                    .map((s: any) => ({
                        ...s,
                        id: s.youtubeId, // Fix: SearchSongs expects 'id' for key/adding
                        isCached: true
                    }))
                
                searchResults.value = [...matches]
            }
        } catch (e) {
            console.warn("Cache lookup failed", e)
        }
    }

    // If we have cache results, great! But user might want more.
    // If fewer than 5 results, we continue to Piped/API.
    if (searchResults.value.length >= 5) {
        searching.value = false
        return
    }

    const q = `${searchQuery.value} karaoke`

    try {
        if (mode.value === 'api') {
            // OFFICIAL API MODE
            if (!effectiveApiKey.value) throw new Error("Missing API Key (Local or Shared)")
            const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(q)}&key=${effectiveApiKey.value}&maxResults=25`
            const res = await fetch(url)
            const data = await res.json()
            
            if (data.error) throw new Error(data.error.message)
            if (!data.items) throw new Error("No items returned")
            
            const newResults = data.items.map((item: any) => ({
                id: item.id.videoId,
                title: item.snippet.title,
                thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
                uploaderName: item.snippet.channelTitle,
                url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
                duration: '' 
            }))
            
            searchResults.value = newResults
            
            // Cache these results for future users!
            // We don't wait for this.
            newResults.forEach((s: any) => {
                roomStore.cacheSong({
                    youtubeId: s.id,
                    title: s.title,
                    thumbnail: s.thumbnail,
                    url: s.url
                })
            })

        } else {
            // FREE/PIPED MODE (Fallback)
            let success = false
            for (const instance of PIPED_INSTANCES) {
                try {
                    const res = await fetch(`${instance}/search?q=${encodeURIComponent(q)}&filter=videos`, {
                        signal: AbortSignal.timeout(3000) 
                    })
                    if (!res.ok) continue
                    const data = await res.json()
                    
                    if (data.items && data.items.length > 0) {
                        const pipedResults = data.items.filter((i: any) => i.url && i.url.includes('watch?v=')).map((item: any) => ({
                            id: item.url.split('v=')[1],
                            title: item.title,
                            thumbnail: item.thumbnail,
                            uploaderName: item.uploaderName,
                            url: item.url.startsWith('http') ? item.url : `https://www.youtube.com${item.url}`,
                            duration: formatDuration(item.duration)
                        }))
                        
                        // Merge with existing cache results (deduplicate)
                        const existingIds = new Set(searchResults.value.map(r => r.id))
                        pipedResults.forEach((r: any) => {
                            if (!existingIds.has(r.id)) searchResults.value.push(r)
                        })
                        
                        success = true
                        break
                    }
                } catch (e) {
                    continue
                }
            }
            if (!success && searchResults.value.length === 0) throw new Error("All free servers are busy. Try 'Official API'.")
        }
    } catch (e: any) {
        console.error(e)
        errorMsg.value = e.message || "Search Failed"
    } finally {
        searching.value = false
    }
}

function formatDuration(s: any): string {
    if (!s) return ''
    const num = Number(s)
    if (isNaN(num)) return s
    const m = Math.floor(num / 60)
    const r = Math.floor(num % 60)
    return `${m}:${r.toString().padStart(2, '0')}`
}

function addResultToQueue(item: any) {
    emit('add', { youtubeId: item.id, title: item.title })
    // Also cache if adding from free search!
    roomStore.cacheSong({
        youtubeId: item.id,
        title: item.title,
        thumbnail: item.thumbnail,
        url: item.url || `https://www.youtube.com/watch?v=${item.id}`
    })
}
</script>
