<template>
  <div class="flex flex-col h-full bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
    <div class="p-4 border-b border-slate-700 bg-slate-800/80">
      <h3 class="font-bold text-white flex justify-between items-center">
        <span>Queue ({{ songs.length }})</span>
      </h3>
    </div>
    
    <div class="flex-1 overflow-y-auto p-2 space-y-2">
      <div 
        v-for="(song, index) in songs" 
        :key="song.id"
        class="flex items-center gap-3 p-3 rounded-lg bg-slate-800 hover:bg-slate-750 transition-colors group"
      >
        <div class="text-slate-500 font-mono text-xs w-6">{{ index + 1 }}</div>
        <div class="w-10 h-10 bg-slate-700 rounded overflow-hidden flex-shrink-0">
           <img :src="`https://img.youtube.com/vi/${song.youtubeId}/default.jpg`" class="w-full h-full object-cover opacity-80" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-white truncate">{{ song.title }}</p>
          <p class="text-xs text-slate-400">Added by {{ song.addedBy }}</p>
        </div>
        <button 
            @click="$emit('remove', song.id)"
            class="text-slate-600 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Remove"
        >
          ✕
        </button>
      </div>
      
      <div v-if="songs.length === 0" class="text-center py-8 text-slate-500 text-sm">
        Queue is empty. Add a banger!
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Song } from '~/stores/room'

defineProps<{
  songs: Song[]
}>()

defineEmits<{
  (e: 'remove', id: string): void
}>()
</script>
