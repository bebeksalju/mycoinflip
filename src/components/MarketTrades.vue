<script setup>
import { useMarketStore } from '../stores/market';

const marketStore = useMarketStore();

const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' });
};
</script>

<template>
    <div class="flex flex-col h-full bg-gray-900 text-xs font-mono">
        <div class="flex justify-between px-4 py-2 border-b border-gray-800 text-[10px] text-gray-500 uppercase font-bold tracking-wider">
            <span>Price (USD)</span>
            <span class="text-right">Amount</span>
            <span class="text-right">Time</span>
        </div>
        
        <div class="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
            <transition-group name="list" tag="div" class="flex flex-col">
                <div v-for="trade in marketStore.recentTrades" :key="trade.id" 
                     class="flex justify-between px-4 py-0.5 hover:bg-gray-800 transition-colors"
                >
                    <span :class="trade.side === 'buy' ? 'text-green-500' : 'text-red-500'" class="font-medium">
                        {{ trade.price.toLocaleString() }}
                    </span>
                    <span class="text-gray-300">{{ trade.amount.toFixed(4) }}</span>
                    <span class="text-gray-500">{{ formatTime(trade.time) }}</span>
                </div>
            </transition-group>
            
            <div v-if="marketStore.recentTrades.length === 0" class="flex flex-col items-center justify-center p-8 text-gray-600 gap-2 opacity-50">
                 <span v-if="marketStore.connectionStatus.includes('Connected')">Waiting for trades...</span>
                 <span v-else class="text-[10px]">Connecting...</span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 4px; }
</style>
