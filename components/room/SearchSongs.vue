<template>
  <div class="bg-slate-800/50 rounded-xl p-4 border border-slate-700 relative">
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
            <p class="text-sm font-medium text-white truncate">
                <span v-if="loadingPreview" class="text-slate-400 italic">Fetching info...</span>
                <span v-else>{{ previewTitle }}</span>
            </p>
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

            <!-- 1. API Key -->
            <div class="bg-indigo-900/20 border border-indigo-500/30 p-3 rounded-lg animate-fade-in">
                <div class="flex justify-between items-center mb-2">
                    <p class="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">Youtube API Key</p>
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
      
       <!-- Search Results -->
       <div v-if="displayedResults.length > 0" class="space-y-3 pb-4 max-h-[45vh] overflow-y-auto pr-2 custom-scrollbar">
          <div 
            v-for="video in displayedResults" 
            :key="video.id"
            @click="addSongToQueue(video)"
            class="flex gap-4 p-3 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer group hover:ring-1 hover:ring-rose-500/50 active:scale-[0.99] transform duration-100 m-1"
          >
            <!-- Thumbnail -->
            <div class="relative w-32 aspect-video flex-shrink-0 bg-black rounded-lg overflow-hidden group-hover:ring-2 ring-rose-500/50 transition-all">
                <img :src="video.thumbnail" class="w-full h-full object-cover opacity-90 group-hover:opacity-100" />
                <div v-if="video.duration" class="absolute bottom-1 right-1 bg-black/80 text-[10px] px-1.5 py-0.5 rounded text-white font-mono">
                    {{ video.duration }}
                </div>
            </div>

            <!-- Info -->
            <div class="flex-1 flex flex-col justify-center min-w-0">
                <h3 class="font-bold text-white text-xs line-clamp-2 leading-tight mb-1" v-html="video.title"></h3>
                <p class="text-xs text-slate-400 truncate">{{ video.uploaderName }}</p>
                <!-- Cache Badge -->
                <p v-if="video.isCached" class="text-[8px] text-emerald-400 mt-1 flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Community Library
                </p>
            </div>

            <!-- Action (Visual Only) -->
            <div 
                class="self-center bg-slate-700 group-hover:bg-rose-600 text-white p-2 rounded-full transition-colors flex-shrink-0"
            >
                <PlusIcon class="w-5 h-5" />
            </div>
          </div>

          <!-- Infinite Scroll Trigger -->
          <div ref="loadMoreTrigger" class="h-8 flex items-center justify-center">
              <span v-if="displayedResults.length < searchResults.length" class="text-xs text-slate-500 animate-pulse">
                Loading more songs...
              </span>
              <span v-else-if="searchResults.length > 20" class="text-xs text-slate-600">
                End of results
              </span>
          </div>
       </div>

       <!-- Status / Errors -->
       <div v-if="searchResults.length === 0 && !searching" class="text-center p-8 bg-slate-900/30 rounded-xl">
           <p class="text-sm text-slate-400 mb-2">
                {{ searchQuery ? 'No results found.' : (mode === 'search' ? 'No cached songs yet. Search to add some!' : 'Enter a search term.') }}
           </p>
           <p v-if="errorMsg" class="text-xs text-red-400 bg-red-900/10 p-2 rounded border border-red-900/30">{{ errorMsg }}</p>
       </div>
      
       <!-- Toast Notification -->
       <Transition
          enter-active-class="transition ease-out duration-300 transform"
          enter-from-class="opacity-0 translate-y-4 scale-95"
          enter-to-class="opacity-100 translate-y-0 scale-100"
          leave-active-class="transition ease-in duration-200 transform"
          leave-from-class="opacity-100 translate-y-0 scale-100"
          leave-to-class="opacity-0 translate-y-4 scale-95"
       >
          <div v-if="showToast" class="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:w-auto md:min-w-[300px] bg-slate-900 border border-slate-700 shadow-2xl shadow-black text-white px-4 py-3 rounded-lg flex items-center gap-3 z-[100] border-l-4 border-l-emerald-500">
              <div class="bg-emerald-500/20 p-2 rounded-full text-emerald-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <div>
                  <h4 class="font-bold text-sm text-white">Song Added</h4>
                  <p class="text-xs text-slate-400">{{ toastMessage }}</p>
              </div>
          </div>
       </Transition>
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
const previewTitle = ref('')
const loadingPreview = ref(false)

function extractVideoId(input: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = input.match(regExp);
  if (match && match[2] && match[2].length === 11) return match[2];
  if (input.length === 11) return input;
  return null;
}

async function handleLinkSearch() {
  const id = extractVideoId(query.value)
  if (!id) {
    alert("Invalid YouTube Link or ID")
    return
  }
  
  previewId.value = id
  previewTitle.value = `Video ID: ${id}` // Fallback initially
  loadingPreview.value = true

  // Fetch Metadata Immediately
  try {
      // Primary: Piped API
      const res = await fetch(`https://pipedapi.kavin.rocks/streams/${id}`)
      if (res.ok) {
          const data = await res.json()
          if (data.title) previewTitle.value = data.title
      } else {
        throw new Error("Piped failed")
      }
  } catch (e) {
      // Fallback: NoEmbed (Reliable for titles)
      try {
          const res2 = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${id}`)
          const data2 = await res2.json()
          if (data2.title) previewTitle.value = data2.title
      } catch (e2) {
          console.warn("All metadata fetches failed", e2)
      }
  } finally {
      loadingPreview.value = false
  }
}

async function addPreviewToQueue() {
  if (!previewId.value) return

  const title = previewTitle.value !== `Video ID: ${previewId.value}` ? previewTitle.value : `YouTube Video (${previewId.value})`
  const thumbnail = `https://img.youtube.com/vi/${previewId.value}/mqdefault.jpg`

  emit('add', { youtubeId: previewId.value, title: title })
  
  // Cache the song
  roomStore.cacheSong({
      youtubeId: previewId.value,
      title: title,
      thumbnail: thumbnail,
      url: `https://www.youtube.com/watch?v=${previewId.value}`
  })

  query.value = ''
  previewId.value = ''
  previewTitle.value = ''
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
    if (!confirm("Are you sure? Everyone in this room will use API (1000 songs/day).")) return
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

// Cache State
const allCachedSongs = ref<any[]>([])
const displayLimit = ref(20)
const loadMoreTrigger = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

// Computed: Only render a subset of results for performance
const displayedResults = computed(() => {
    return searchResults.value.slice(0, displayLimit.value)
})

// Lifecycle: Fix initial load
onMounted(() => {
    if (mode.value === 'search') {
        loadAllCache()
    }
    setupIntersectionObserver()
})

onUnmounted(() => {
    if (observer) observer.disconnect()
})

// Watchers
watch(mode, async (newMode) => {
    if (newMode === 'search') {
        if (allCachedSongs.value.length === 0) await loadAllCache()
        else searchResults.value = allCachedSongs.value // Restore instant access
    }
})

// Reset pagination when results change
watch(searchResults, () => {
    displayLimit.value = 20
    // Re-connect observer if we have more results to show
    nextTick(() => {
        if (observer && loadMoreTrigger.value) {
            observer.disconnect()
            observer.observe(loadMoreTrigger.value)
        }
    })
})

function setupIntersectionObserver() {
    observer = new IntersectionObserver((entries) => {
        if (entries && entries[0] && entries[0].isIntersecting) {
            loadMore()
        }
    }, { rootMargin: '100px' })
}

function loadMore() {
    if (displayLimit.value < searchResults.value.length) {
        displayLimit.value += 20
    }
}

async function loadAllCache() {
    try {
        // Fetch a larger chunk since we are paginating the RENDER
        const songsRef = dbQuery(dbRef($db, 'songs'), limitToFirst(500))
        const snapshot = await get(songsRef)
        const cache = snapshot.val()
        
        if (cache) {
            allCachedSongs.value = Object.values(cache).map((s: any) => ({
                 ...s,
                 id: s.youtubeId,
                 isCached: true
            })).sort((a: any, b: any) => a.title.localeCompare(b.title))
            
            // If no search query, show these immediately
            if (!searchQuery.value) {
                searchResults.value = allCachedSongs.value
            }
        }
    } catch (e) {
        console.warn("Failed to load cache", e)
    }
}

// Watch search query to toggle between Cache List and Search Results
watch(searchQuery, (newVal) => {
    if (!newVal && mode.value === 'search') {
        searchResults.value = allCachedSongs.value
        errorMsg.value = ''
    }
})

async function performSearch() {
    // If empty query, reload cache
    if (!searchQuery.value) {
        if (mode.value === 'search') {
             searchResults.value = allCachedSongs.value
        }
        return
    }

    searching.value = true
    errorMsg.value = ''
    // Don't clear immediately to prevent UI flash, but we must new results
    
    // 1. If Free Search, Check Firebase Cache FIRST
    let cacheMatches: any[] = []
    if (mode.value === 'search') {
        // Client-side filter of loaded cache first (instant)
        const terms = searchQuery.value.toLowerCase().split(' ')
        cacheMatches = allCachedSongs.value.filter((s: any) => {
            const t = s.title.toLowerCase()
            return terms.every(term => t.includes(term))
        })
    }

    // If we have plenty of cache results, just show them
    if (cacheMatches.length >= 5) {
        searchResults.value = cacheMatches
        searching.value = false
        return
    }

    // Otherwise, fetch from API
    searchResults.value = cacheMatches // Show what we have while loading...

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
            
            // Cache these results
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
                        const finalResults = [...searchResults.value]
                        pipedResults.forEach((r: any) => {
                            if (!existingIds.has(r.id)) finalResults.push(r)
                        })
                        
                        searchResults.value = finalResults
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

// Toast State
const showToast = ref(false)
const toastMessage = ref('')

function addSongToQueue(item: any) {
    emit('add', { youtubeId: item.id, title: item.title })
    // Also cache if adding from free search!
    roomStore.cacheSong({
        youtubeId: item.id,
        title: item.title,
        thumbnail: item.thumbnail,
        url: item.url || `https://www.youtube.com/watch?v=${item.id}`
    })

    // Show visual feedback (Toast)
    toastMessage.value = item.title
    showToast.value = true
    setTimeout(() => showToast.value = false, 2000)
}
</script>
