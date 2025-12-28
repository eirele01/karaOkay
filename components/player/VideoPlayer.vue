<template>
  <div class="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
    <div id="youtube-player" class="w-full h-full "></div>
    
    <!-- Transparent Click Blocker (prevents opening YT in new tab) -->
    <div v-if="isPlaying || !isPlaying" class="absolute inset-10 z-0 "></div>

    <!-- Overlay for no song or loading -->
    <div v-if="!videoId" class="absolute inset-0 flex items-center justify-center bg-slate-900/90 z-10">
      <div class="text-center p-6">
        <div class="text-6xl mb-4">🎵</div>
        <h3 class="text-xl font-bold text-white mb-2">Ready to Sing?</h3>
        <p class="text-slate-400">Add a song to the queue to start.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch, ref } from 'vue'
import { useScriptTag } from '@vueuse/core'

const props = defineProps<{
  videoId?: string
  isPlaying: boolean
}>()

const emit = defineEmits<{
  (e: 'ended'): void
  (e: 'stateChange', state: number): void
}>()

let player: any = null
const scriptLoaded = ref(false)

// Load YouTube IFrame API
useScriptTag(
  'https://www.youtube.com/iframe_api',
  () => {
    // API Loaded, but we need to wait for onYouTubeIframeAPIReady
    // However, useScriptTag usually fires on onload.
    // The YT API is weird, it looks for window.onYouTubeIframeAPIReady
    // If we missed it or it's already there.
    
    if (window.YT && window.YT.Player) {
       initPlayer()
    } else {
       // Bind to window
       window.onYouTubeIframeAPIReady = () => initPlayer()
    }
  }
)

function initPlayer() {
  if (player) return
  
  player = new window.YT.Player('youtube-player', {
    height: '100%',
    width: '100%',
    videoId: props.videoId || '',
    playerVars: {
      'playsinline': 1,
      'controls': 1, // Allow users to scrub if they want
      'disablekb': 0,
      'autoplay': 1 // We handle play via store, but autoplay helps
    },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  })
}

function onPlayerReady(event: any) {
  if (props.videoId && props.isPlaying) {
    event.target.playVideo()
  }
}

function onPlayerStateChange(event: any) {
   // YT.PlayerState.ENDED = 0
   // YT.PlayerState.PLAYING = 1
   // YT.PlayerState.PAUSED = 2
   emit('stateChange', event.data)
   
   if (event.data === 0) {
     emit('ended')
   }
}

// Watchers
watch(() => props.videoId, (newId) => {
  if (player && player.loadVideoById && newId) {
    player.loadVideoById(newId)
    // If we just loaded, we probably want to play if isPlaying is true
    if (props.isPlaying) {
        player.playVideo() // loadVideoById usually autoplays but to be safe
    }
  }
})

watch(() => props.isPlaying, (playing) => {
  if (!player || !player.playVideo) return
  
  if (playing) {
    player.playVideo()
  } else {
    player.pauseVideo()
  }
})
</script>
