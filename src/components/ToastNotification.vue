<script setup>
import { useMarketStore } from '../stores/market';
const store = useMarketStore();
</script>

<template>
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        <TransitionGroup name="toast">
            <div 
                v-for="toast in store.notifications" 
                :key="toast.id"
                class="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded shadow-xl border-l-4 min-w-[300px] backdrop-blur-md transition-all transform"
                :class="toast.type === 'success' ? 'bg-gray-800/90 border-green-500 text-green-400' : 'bg-gray-800/90 border-red-500 text-red-400'"
            >
                <span class="text-xl">{{ toast.type === 'success' ? '✅' : '⛔' }}</span>
                
                <div class="flex flex-col">
                    <span class="font-bold text-sm text-white">{{ toast.title }}</span>
                    <span class="text-xs text-gray-400">{{ toast.message }}</span>
                </div>
            </div>
        </TransitionGroup>
    </div>
</template>

<style scoped>
/* Animasi Masuk/Keluar */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>