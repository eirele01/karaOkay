<template>
  <div class="flex items-center justify-center gap-4 p-4 bg-slate-800/80 rounded-xl border border-slate-700 backdrop-blur">
    <!-- Prev (Disabled typically in karaoke, but maybe restart?) -->
    <button 
      class="p-3 text-slate-500 hover:text-white transition-colors disabled:opacity-30"
      disabled
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="5"></line></svg>
    </button>
    
    <!-- Play/Pause -->
    <button 
      @click="$emit('togglePlay')"
      class="p-4 bg-rose-600 hover:bg-rose-500 text-white rounded-full shadow-lg shadow-rose-900/30 transition-all active:scale-95"
    >
      <svg v-if="isPlaying" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
    </button>
    
    <!-- Next -->
    <button 
      @click="$emit('next')"
      class="p-3 text-slate-300 hover:text-white transition-colors active:scale-95"
      title="Skip Song"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isPlaying: boolean
}>()

defineEmits<{
  (e: 'togglePlay'): void
  (e: 'next'): void
}>()
</script>
