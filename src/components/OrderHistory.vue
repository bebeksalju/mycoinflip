<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useMarketStore } from '../stores/market';

import { useWalletStore } from '../stores/wallet';

const store = useMarketStore();
const walletStore = useWalletStore();
const activeTab = ref('history'); // Default tab: 'history', 'open', 'funds'

// Hitung total portfolio dalam USD untuk tab Funds
const totalPortfolioValue = computed(() => {
    return walletStore.wallet.usdt + (walletStore.wallet.btc * store.currentPrice);
});

// Persentase aset untuk visual bar
const assetAllocation = computed(() => {
    const btcVal = walletStore.wallet.btc * store.currentPrice;
    const total = totalPortfolioValue.value;
    return {
        usdt: ((walletStore.wallet.usdt / total) * 100).toFixed(1),
        btc: ((btcVal / total) * 100).toFixed(1)
    };
});

// PnL Stats
const winRate = computed(() => {
    const total = walletStore.stats.wins + walletStore.stats.losses;
    if (total === 0) return 0;
    return Math.round((walletStore.stats.wins / total) * 100);
});

const netProfit = computed(() => walletStore.stats.netProfit);

// News Logic
const newsList = ref([]);
const loadingNews = ref(false);

const fetchNews = async () => {
    loadingNews.value = true;
    try {
        const res = await fetch('https://min-api.cryptocompare.com/data/v2/news/?lang=EN');
        const data = await res.json();
        newsList.value = data.Data.slice(0, 10); // Ambil 10 berita terbaru
    } catch (e) {
        console.error("Failed to fetch news", e);
        // Fallback mock data
        newsList.value = [
            { id: 1, title: 'Bitcoin Hits New Highs amid ETF Logic', source: 'CryptoDaily', url: '#', body: 'Bitcoin continues its rally...', imageurl: '' },
            { id: 2, title: 'Ethereum Upgrade Scheduled for Next Month', source: 'CoinTelegraph', url: '#', body: 'Developers confirm the date...', imageurl: '' }
        ];
    } finally {
        loadingNews.value = false;
    }
};

// Fetch news when tab changes to 'news'
watch(activeTab, (newTab) => {
    if (newTab === 'news' && newsList.value.length === 0) {
        fetchNews();
    }
});
// Timer for UI updates
const now = ref(Date.now());
let timerInterval;

onMounted(() => {
    timerInterval = setInterval(() => {
        now.value = Date.now();
    }, 100);
});

onUnmounted(() => {
    clearInterval(timerInterval);
});

const getRemainingTime = (endTime) => {
    const diff = Math.max(0, Math.ceil((endTime - now.value) / 1000));
    return diff + 's';
};

const getProgress = (start, end) => {
    const total = end - start;
    const elapsed = now.value - start;
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
};
</script>

<template>
    <div class="flex flex-col h-full bg-gray-900 text-xs border-t border-gray-800 font-sans relative">
        
        <div class="flex gap-1 px-2 border-b border-gray-800 bg-gray-950/50">
            <button 
                @click="activeTab = 'history'"
                class="px-4 py-2 font-bold border-b-2 transition-colors"
                :class="activeTab === 'history' ? 'text-yellow-500 border-yellow-500' : 'text-gray-500 border-transparent hover:text-gray-300'"
            >
                Order History
            </button>
            <button 
                @click="activeTab = 'open'"
                class="px-4 py-2 font-bold border-b-2 transition-colors relative"
                :class="activeTab === 'open' ? 'text-yellow-500 border-yellow-500' : 'text-gray-500 border-transparent hover:text-gray-300'"
            >
                Open Positions
                <span v-if="walletStore.activePositions.length > 0" class="absolute top-1 right-1 flex h-2 w-2">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                </span>
                <span v-if="walletStore.activeLimitOrders.length > 0" class="absolute top-1 right-3 flex h-2 w-2">
                    <span class="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
            </button>
            <button 
                @click="activeTab = 'funds'"
                class="px-4 py-2 font-bold border-b-2 transition-colors"
                :class="activeTab === 'funds' ? 'text-yellow-500 border-yellow-500' : 'text-gray-500 border-transparent hover:text-gray-300'"
            >
                Funds
            </button>
            <button 
                @click="activeTab = 'news'"
                class="px-4 py-2 font-bold border-b-2 transition-colors"
                :class="activeTab === 'news' ? 'text-yellow-500 border-yellow-500' : 'text-gray-500 border-transparent hover:text-gray-300'"
            >
                News
            </button>
        </div>

        <div class="flex-1 overflow-y-auto custom-scrollbar bg-gray-900 relative">
            
            <div v-if="activeTab === 'history'" class="h-full flex flex-col">
                <!-- Stats Header -->
                <div class="flex border-b border-gray-800 bg-gray-900/80 p-2 gap-4 text-xs">
                    <div class="flex gap-2">
                         <span class="text-gray-500">Win Rate:</span>
                         <span class="font-bold" :class="winRate >= 50 ? 'text-green-400' : 'text-red-400'">{{ winRate }}%</span>
                         <span class="text-gray-600">({{ walletStore.stats.wins }}W / {{ walletStore.stats.losses }}L)</span>
                    </div>
                    <div class="flex gap-2">
                         <span class="text-gray-500">Net PnL:</span>
                         <span class="font-bold font-mono" :class="netProfit >= 0 ? 'text-green-400' : 'text-red-400'">
                            {{ netProfit >= 0 ? '+' : '' }}{{ netProfit.toLocaleString('en-US', {style: 'currency', currency: 'USD'}) }}
                         </span>
                    </div>
                </div>

                <div class="grid grid-cols-6 px-4 py-2 text-[10px] font-bold text-gray-500 uppercase bg-gray-900/50 sticky top-0 z-10">
                    <span>Time</span>
                    <span>Pair</span>
                    <span>Type</span>
                    <span class="text-right">Price</span>
                    <span class="text-right">Amount</span>
                    <span class="text-right">Total (USDT)</span>
                </div>
                
                <div v-if="walletStore.orderHistory.length === 0" class="flex flex-col items-center justify-center flex-1 text-gray-600 gap-2 opacity-50">
                    <span>No trade history yet</span>
                </div>
                <div v-else>
                    <div v-for="order in walletStore.orderHistory" :key="order.id" 
                         class="grid grid-cols-6 px-4 py-1.5 border-b border-gray-800/50 hover:bg-gray-800 transition-colors font-mono text-[11px]">
                        <span class="text-gray-400">{{ order.time }}</span>
                        <span class="text-white font-bold">{{ order.pair }}</span>
                        <!-- Display TYPE (BUY/SELL or UP/DOWN) & RESULT (WIN/LOSS) -->
                        <span :class="{
                            'text-green-500': order.type === 'BUY' || order.type === 'UP',
                            'text-red-500': order.type === 'SELL' || order.type === 'DOWN'
                        }" class="font-bold flex gap-1">
                            {{ order.type }}
                            <span v-if="order.status === 'WIN'" class="text-green-400 text-[9px] bg-green-900/50 px-1 rounded ml-1">WIN</span>
                            <span v-if="order.status === 'LOSS'" class="text-red-400 text-[9px] bg-red-900/50 px-1 rounded ml-1">LOSS</span>
                        </span>
                        
                        <!-- PRICE: Use price for Spot, entryPrice for Timed -->
                        <span class="text-right text-gray-300">
                             {{ (order.price || order.entryPrice || 0).toLocaleString('en-US', {style: 'currency', currency: 'USD'}) }}
                             <span v-if="order.exitPrice" class="text-[9px] text-gray-500 block">➜ {{ order.exitPrice.toLocaleString('en-US', {style: 'currency', currency: 'USD'}) }}</span>
                        </span>
                        
                        <span class="text-right text-gray-300">{{ (order.amount || 0).toFixed(4) }}</span>
                        
                        <!-- TOTAL / PROFIT -->
                        <span class="text-right" :class="order.profit > 0 ? 'text-green-400' : (order.profit < 0 ? 'text-red-400' : 'text-gray-300')">
                            {{ (order.profit ? order.profit : (order.total || 0)).toLocaleString('en-US', {style: 'currency', currency: 'USD', signDisplay: 'always'}) }}
                        </span>
                    </div>
                </div>
            </div>

            <div v-else-if="activeTab === 'open'" class="h-full flex flex-col bg-gray-900/50">
                 <div v-if="walletStore.activePositions.length === 0 && walletStore.activeLimitOrders.length === 0" class="flex flex-col items-center justify-center flex-1 text-gray-600 gap-3 opacity-50">
                    <div class="text-4xl">⏱️</div>
                    <span>No Active Orders</span>
                 </div>
                 
                 <div v-else class="p-4 overflow-y-auto flex flex-col gap-6">
                    
                    <!-- LIMIT ORDERS SECTION -->
                    <div v-if="walletStore.activeLimitOrders.length > 0">
                        <h3 class="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Limit Orders ({{ walletStore.activeLimitOrders.length }})</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div v-for="order in walletStore.activeLimitOrders" :key="order.id" class="bg-gray-800 rounded-lg p-3 border border-gray-700 shadow-lg relative group">
                                <div class="flex justify-between items-start mb-2">
                                    <div class="flex flex-col">
                                        <span class="font-bold text-white text-sm">{{ order.pair }}</span>
                                        <span class="text-[10px] font-bold px-1.5 py-0.5 rounded w-fit mt-1 uppercase" 
                                            :class="order.type === 'BUY' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'">
                                            LIMIT {{ order.type }}
                                        </span>
                                    </div>
                                    <button @click="walletStore.cancelLimitOrder(order.id)" class="text-[10px] text-red-400 border border-red-900/50 bg-red-900/10 px-2 py-1 rounded hover:bg-red-900/30 transition-colors">
                                        Cancel
                                    </button>
                                </div>

                                <div class="grid grid-cols-2 gap-2 text-[11px] mb-2 bg-gray-900/50 p-2 rounded">
                                    <div class="flex flex-col">
                                        <span class="text-gray-500">Target</span>
                                        <span class="font-mono text-blue-400 font-bold">{{ order.limitPrice.toLocaleString('en-US', {style: 'currency', currency: 'USD'}) }}</span>
                                    </div>
                                    <div class="flex flex-col text-right">
                                        <span class="text-gray-500">Current</span>
                                        <span class="font-mono" :class="store.currentPrice <= order.limitPrice && order.type === 'BUY' ? 'text-green-500' : (store.currentPrice >= order.limitPrice && order.type === 'SELL' ? 'text-green-500' : 'text-gray-400')">
                                            {{ store.currentPrice.toLocaleString('en-US', {style: 'currency', currency: 'USD'}) }}
                                        </span>
                                    </div>
                                </div>

                                <div class="flex justify-between items-center text-xs text-gray-400 font-mono">
                                    <span>Amt: {{ order.amount }}</span>
                                    <span>Vol: {{ order.total.toLocaleString('en-US', {style: 'currency', currency: 'USD'}) }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- TIMED POSITIONS SECTION -->
                    <div v-if="walletStore.activePositions.length > 0">
                        <h3 class="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Timed Positions ({{ walletStore.activePositions.length }})</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div v-for="pos in walletStore.activePositions" :key="pos.id" class="bg-gray-800 rounded-lg p-3 border border-gray-700 relative overflow-hidden shadow-lg">
                                <!-- Progress Bar Background -->
                                <div class="absolute bottom-0 left-0 h-1 bg-yellow-500 transition-all duration-100 ease-linear" :style="{ width: getProgress(pos.startTime, pos.endTime) + '%' }"></div>
                                
                                <div class="flex justify-between items-start mb-2">
                                    <div class="flex flex-col">
                                        <span class="font-bold text-white text-sm">{{ pos.pair }}</span>
                                        <span class="text-[10px] font-bold px-1.5 py-0.5 rounded w-fit mt-1" 
                                            :class="pos.type === 'UP' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'">
                                            {{ pos.type === 'UP' ? 'CALL 🔼' : 'PUT 🔽' }}
                                        </span>
                                    </div>
                                    <div class="text-right">
                                        <div class="text-2xl font-mono font-bold text-white">{{ getRemainingTime(pos.endTime) }}</div>
                                        <div class="text-[10px] text-gray-400">Duration: {{ pos.duration }}s</div>
                                    </div>
                                </div>

                                <div class="grid grid-cols-2 gap-2 text-[11px] mb-2 bg-gray-900/50 p-2 rounded">
                                    <div class="flex flex-col">
                                        <span class="text-gray-500">Entry</span>
                                        <span class="font-mono text-gray-300">{{ pos.entryPrice.toLocaleString('en-US', {style: 'currency', currency: 'USD'}) }}</span>
                                    </div>
                                    <div class="flex flex-col text-right">
                                        <span class="text-gray-500">Current</span>
                                        <span class="font-mono font-bold" 
                                        :class="{
                                            'text-green-500': (pos.type === 'UP' && store.currentPrice > pos.entryPrice) || (pos.type === 'DOWN' && store.currentPrice < pos.entryPrice),
                                            'text-red-500': (pos.type === 'UP' && store.currentPrice <= pos.entryPrice) || (pos.type === 'DOWN' && store.currentPrice >= pos.entryPrice)
                                        }">
                                            {{ store.currentPrice.toLocaleString('en-US', {style: 'currency', currency: 'USD'}) }}
                                        </span>
                                    </div>
                                </div>

                                <div class="flex justify-between items-center text-xs font-bold">
                                    <span class="text-gray-400">Amount: {{ pos.amount.toLocaleString('en-US', {style: 'currency', currency: 'USD'}) }}</span>
                                    <span :class="{
                                        'text-green-400': (pos.type === 'UP' && store.currentPrice > pos.entryPrice) || (pos.type === 'DOWN' && store.currentPrice < pos.entryPrice),
                                        'text-gray-500': !((pos.type === 'UP' && store.currentPrice > pos.entryPrice) || (pos.type === 'DOWN' && store.currentPrice < pos.entryPrice))
                                    }">
                                        {{ ((pos.type === 'UP' && store.currentPrice > pos.entryPrice) || (pos.type === 'DOWN' && store.currentPrice < pos.entryPrice)) ? 'WINNING' : 'lOSING' }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                 </div>
            </div>

            <div v-else-if="activeTab === 'funds'" class="p-6 h-full flex flex-col gap-6">
                <div class="flex items-end gap-2">
                    <span class="text-gray-400 text-sm">Total Asset Value:</span>
                    <span class="text-2xl font-bold text-white font-mono">
                        {{ totalPortfolioValue.toLocaleString('en-US', {style: 'currency', currency: 'USD'}) }}
                    </span>
                    <span class="text-xs text-gray-500 mb-1">≈ Rp {{ (totalPortfolioValue * 15500).toLocaleString('id-ID') }}</span>
                </div>

                <div class="w-full h-4 bg-gray-800 rounded-full overflow-hidden flex">
                    <div class="bg-green-500 h-full transition-all duration-500" :style="{ width: assetAllocation.usdt + '%' }"></div>
                    <div class="bg-yellow-500 h-full transition-all duration-500" :style="{ width: assetAllocation.btc + '%' }"></div>
                </div>
                <div class="flex gap-4 text-xs">
                    <div class="flex items-center gap-2">
                        <div class="w-2 h-2 rounded-full bg-green-500"></div>
                        <span class="text-gray-400">USDT: {{ assetAllocation.usdt }}%</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-2 h-2 rounded-full bg-yellow-500"></div>
                        <span class="text-gray-400">BTC: {{ assetAllocation.btc }}%</span>
                    </div>
                </div>

                <div class="border border-gray-800 rounded overflow-hidden">
                    <div class="grid grid-cols-3 bg-gray-800/50 p-2 font-bold text-gray-500 uppercase text-[10px]">
                        <span>Asset</span>
                        <span class="text-right">Balance</span>
                        <span class="text-right">Value (USD)</span>
                    </div>
                    <div class="grid grid-cols-3 p-3 border-b border-gray-800 hover:bg-gray-800/30">
                        <div class="flex items-center gap-2">
                            <div class="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-[8px] text-black font-bold">$</div>
                            <span class="font-bold text-white">USDT</span>
                        </div>
                        <span class="text-right font-mono text-gray-300">{{ walletStore.wallet.usdt.toLocaleString() }}</span>
                        <span class="text-right font-mono text-gray-400">{{ walletStore.wallet.usdt.toLocaleString('en-US', {style: 'currency', currency: 'USD'}) }}</span>
                    </div>
                    <div class="grid grid-cols-3 p-3 hover:bg-gray-800/30">
                        <div class="flex items-center gap-2">
                            <div class="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center text-[8px] text-black font-bold">₿</div>
                            <span class="font-bold text-white">BTC</span>
                        </div>
                        <span class="text-right font-mono text-gray-300">{{ walletStore.wallet.btc.toFixed(6) }}</span>
                        <span class="text-right font-mono text-gray-400">{{ (walletStore.wallet.btc * store.currentPrice).toLocaleString('en-US', {style: 'currency', currency: 'USD'}) }}</span>
                    </div>
                </div>
            </div>

            <div v-else-if="activeTab === 'news'" class="h-full flex flex-col">
                <div v-if="loadingNews" class="flex-1 flex flex-col gap-3 p-4">
                    <div v-for="i in 5" :key="i" class="flex gap-3">
                        <div class="w-16 h-16 bg-gray-800 animate-pulse rounded flex-none"></div>
                        <div class="flex-1 flex flex-col gap-2">
                            <div class="h-4 bg-gray-800 animate-pulse rounded w-3/4"></div>
                            <div class="h-3 bg-gray-800 animate-pulse rounded w-full"></div>
                            <div class="h-3 bg-gray-800 animate-pulse rounded w-1/2"></div>
                        </div>
                    </div>
                </div>
                <div v-else class="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                     <div v-for="news in newsList" :key="news.id" class="flex gap-3 group cursor-pointer hover:bg-gray-800/50 p-2 rounded transition-colors">
                        <img v-if="news.imageurl" :src="news.imageurl" class="w-16 h-16 object-cover rounded bg-gray-800 flex-none" alt="news" />
                        <div v-else class="w-16 h-16 bg-gray-800 rounded flex-none flex items-center justify-center text-xl">📰</div>
                        
                        <div class="flex-1 min-w-0">
                            <a :href="news.url" target="_blank" class="font-bold text-white text-xs group-hover:text-yellow-500 transition-colors line-clamp-2 mb-1 leading-snug">
                                {{ news.title }}
                            </a>
                            <p class="text-[10px] text-gray-400 line-clamp-2 mb-1">{{ news.body }}</p>
                            <div class="flex gap-2 text-[9px] text-gray-500">
                                <span class="bg-gray-800 px-1 py-0.5 rounded text-gray-300">{{ news.source_info?.name || news.source }}</span>
                                <span>{{ new Date(news.published_on * 1000).toLocaleTimeString() }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
</style>