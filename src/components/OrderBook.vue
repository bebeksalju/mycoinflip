<script setup>
import { ref, watch, onMounted } from 'vue';
import { useMarketStore } from '../stores/market';

const marketStore = useMarketStore();
const asks = ref([]);
const bids = ref([]);

// Fungsi Randomizer
const randomAmount = () => (Math.random() * 2).toFixed(4);

const updateOrderBook = () => {
    const price = marketStore.currentPrice || 96500;
    const spread = 10; 
    
    // Generate 15 baris data (Cukup untuk mengisi layar tanpa scroll berlebih)
    const newAsks = [];
    for (let i = 1; i <= 15; i++) {
        newAsks.push({ price: Math.floor(price + (i * spread)), amount: randomAmount() });
    }
    asks.value = newAsks.reverse();

    const newBids = [];
    for (let i = 1; i <= 15; i++) {
        newBids.push({ price: Math.floor(price - (i * spread)), amount: randomAmount() });
    }
    bids.value = newBids;
};

onMounted(() => {
    updateOrderBook();
    setInterval(() => {
        if(asks.value.length) asks.value[Math.floor(Math.random()*10)].amount = randomAmount();
    }, 800);
});

watch(() => marketStore.currentPrice, updateOrderBook);
</script>

<template>
    <div class="flex flex-col h-full bg-gray-900 text-xs font-mono">
        
        <div class="flex justify-between px-4 py-2 border-b border-gray-800 text-[10px] text-gray-500 uppercase font-bold tracking-wider">
            <span>Price (USD)</span>
            <span>Amount (BTC)</span>
        </div>
        
        <div class="flex-1 min-h-0 overflow-y-auto custom-scrollbar flex flex-col relative">
            
            <!-- Asks (Red) -->
            <div v-if="marketStore.currentPrice > 0" class="flex-1 flex flex-col justify-end pb-1"> 
                <div v-for="ask in asks" :key="ask.price" class="flex justify-between px-4 py-0.5 hover:bg-gray-800 cursor-pointer relative group">
                     <div class="absolute right-0 top-0 bottom-0 bg-red-500/10 transition-all duration-300" :style="{ width: (ask.amount * 15) + '%' }"></div>
                    <span class="text-red-500 z-10 font-medium">{{ ask.price.toLocaleString() }}</span>
                    <span class="text-gray-400 z-10 text-[10px]">{{ ask.amount }}</span>
                </div>
            </div>
            <div v-else class="flex-1 flex flex-col justify-end pb-1 gap-1 px-4">
                <div v-for="i in 15" :key="i" class="h-4 bg-gray-800 animate-pulse rounded w-full"></div>
            </div>

            <div class="sticky top-0 bottom-0 py-2 my-1 border-y border-gray-800 bg-gray-800/80 backdrop-blur text-center z-20">
                <div v-if="marketStore.currentPrice > 0" class="text-lg font-bold" :class="marketStore.stats.change24h >= 0 ? 'text-green-500' : 'text-red-500'">
                    {{ marketStore.currentPrice?.toLocaleString() }} 
                    <span class="text-xs text-gray-500 opacity-0 group-hover:opacity-100">Now</span>
                </div>
                <div v-else class="h-6 w-24 mx-auto bg-gray-700 animate-pulse rounded"></div>
            </div>

            <div v-if="marketStore.currentPrice > 0" class="flex-1 pt-1">
                <div v-for="bid in bids" :key="bid.price" class="flex justify-between px-4 py-0.5 hover:bg-gray-800 cursor-pointer relative">
                    <div class="absolute right-0 top-0 bottom-0 bg-green-500/10 transition-all duration-300" :style="{ width: (bid.amount * 15) + '%' }"></div>
                    <span class="text-green-500 z-10 font-medium">{{ bid.price.toLocaleString() }}</span>
                    <span class="text-gray-400 z-10 text-[10px]">{{ bid.amount }}</span>
                </div>
            </div>
            <div v-else class="flex-1 pt-1 gap-1 px-4 flex flex-col">
                <div v-for="i in 15" :key="i" class="h-4 bg-gray-800 animate-pulse rounded w-full"></div>
            </div>

        </div>
    </div>
</template>

<style scoped>
/* Scrollbar Tipis */
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 4px; }
</style>