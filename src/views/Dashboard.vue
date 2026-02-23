<script setup>
import { onMounted, ref } from 'vue';
import TVChartWidget from '../components/TVChartWidget.vue';
import TVTickerWidget from '../components/TVTickerWidget.vue';
import OrderBook from '../components/OrderBook.vue';
import MarketTrades from '../components/MarketTrades.vue';
import TradeForm from '../components/TradeForm.vue';
import OrderHistory from '../components/OrderHistory.vue';
import { useWalletStore } from '../stores/wallet';
import { useMarketStore } from '../stores/market';

const marketStore = useMarketStore();
const walletStore = useWalletStore(); // Init wallet store
const activeSideTab = ref('book'); // Desktop Sidebar Tab ('book' or 'trades')
const mobileActiveTab = ref('trade'); // Mobile Main Tab ('market', 'trade', 'analysis', 'history')
const isMobile = ref(false);

const checkMobile = () => {
    isMobile.value = window.innerWidth < 768;
};

// Computed Total Balance
import { computed } from 'vue';
const totalBalance = computed(() => {
    let total = walletStore.wallet.usdt;
    // Add value of other coins if any (mock logic for now or loop through supported coins if wallet has them)
    // For now just USDT + Active Coin value roughly
    // Better: Iterate all wallet keys that look like coins
    // But for simplicity/safety, let's just show USDT + Current Active Coin Value? 
    // User asked for "Saldo" placement.
    // Let's rely on the same logic as App.vue: USDT + Active Coin
    // Or better: Just USDT if that's the main thing, or loop.
    // Let's replicate App.vue logic:
    const activeVal = (walletStore.wallet[marketStore.activeCoin.symbol.toLowerCase()] || 0) * marketStore.currentPrice;
    return total + activeVal;
});

const formatCurrency = (value) => {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

onMounted(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);

    if (marketStore.connectionStatus === 'Disconnected') {
        marketStore.initDashboard();
    }
});

// Helper to get data from marketOverview array based on coin symbol/id
const getMarketData = (symbol) => {
    if (!marketStore.marketOverview.length) return null;
    const id = marketStore.COIN_MAP[symbol].id;
    return marketStore.marketOverview.find(item => item.id === id);
};

// Start fetching when tab is active? Or just fetch once on mount?
// Better to fetch when tab becomes 'market' to be fresh
import { watch } from 'vue';
watch(mobileActiveTab, (newTab) => {
    if (newTab === 'market') {
        marketStore.fetchMarketOverview();
    }
});
</script>

<template>
    <div class="flex flex-col h-full bg-gray-950">
        <!-- Top Ticker (Hidden on Mobile) -->
        <div class="hidden md:block h-10 flex-none z-10 border-b border-gray-800">
            <TVTickerWidget />
        </div>

        <!-- Mobile Navigation Tabs (Top) -->
        <div class="md:hidden flex border-b border-gray-800 bg-gray-950 sticky top-0 z-20">
            <button @click="mobileActiveTab = 'market'"
                class="flex-1 py-3 text-xs font-bold border-b-2 transition-colors"
                :class="mobileActiveTab === 'market' ? 'text-yellow-500 border-yellow-500' : 'text-gray-500 border-transparent'">
                Market
            </button>
            <button @click="mobileActiveTab = 'trade'"
                class="flex-1 py-3 text-xs font-bold border-b-2 transition-colors"
                :class="mobileActiveTab === 'trade' ? 'text-yellow-500 border-yellow-500' : 'text-gray-500 border-transparent'">
                Trade
            </button>
            <button @click="mobileActiveTab = 'analysis'"
                class="flex-1 py-3 text-xs font-bold border-b-2 transition-colors"
                :class="mobileActiveTab === 'analysis' ? 'text-yellow-500 border-yellow-500' : 'text-gray-500 border-transparent'">
                Book
            </button>
            <button @click="mobileActiveTab = 'history'"
                class="flex-1 py-3 text-xs font-bold border-b-2 transition-colors"
                :class="mobileActiveTab === 'history' ? 'text-yellow-500 border-yellow-500' : 'text-gray-500 border-transparent'">
                History
            </button>
        </div>

        <div class="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden relative">

            <!-- DESKTOP LAYOUT (Unchanged logic, just hidden on mobile based on structure) -->
            <!-- We will use v-show/v-if to maintain state but control visibility per mobile tab -->

            <!-- MAIN CONTENT AREA (Chart + Desktop History) -->
            <main
                class="flex flex-col bg-gray-900 border-r border-gray-800 min-w-0 min-h-0 order-1 md:order-1 transition-all duration-300"
                :class="{
                    'hidden md:flex flex-1': mobileActiveTab !== 'trade',
                    'flex-1 flex': mobileActiveTab === 'trade'
                }">
                <!-- Chart Section -->
                <div class="flex-1 min-h-0 relative">
                    <TVChartWidget />
                </div>

                <!-- Desktop Order History (Always visible on Desktop, Hidden on Mobile) -->
                <div class="hidden md:block h-48 md:h-64 flex-none z-10 border-t border-gray-800">
                    <OrderHistory />
                </div>
            </main>

            <!-- SIDEBAR AREA (TradeForm + OrderBook) -->
            <aside
                class="flex flex-col bg-gray-900 border-t md:border-t-0 md:border-l border-gray-800 order-2 md:order-2 md:w-80 md:flex-none transition-all duration-300"
                :class="{
                    'hidden md:flex h-full': mobileActiveTab === 'history',
                    'flex-1 overflow-y-auto md:overflow-hidden': mobileActiveTab !== 'history'
                }">

                <!-- Trade Form: Visible on Desktop OR Mobile Trade Tab -->
                <div class="flex-none z-20 bg-gray-900 border-b border-gray-800 md:border-b-0 order-1 md:order-2"
                    v-show="mobileActiveTab === 'trade' || !isMobile" :class="{ 'p-0': true }">
                    <TradeForm />
                </div>

                <!-- Order Book / Trades Section -->
                <!-- Mobile: Visible on 'analysis' tab. Desktop: Always visible below form/tabs. -->
                <div class="flex-1 flex flex-col min-h-0 order-2 md:order-1"
                    v-show="mobileActiveTab === 'analysis' || !isMobile">
                    <div class="flex border-b border-gray-800 bg-gray-950/50 sticky top-0 z-10">
                        <button @click="activeSideTab = 'book'"
                            class="flex-1 py-2 text-xs font-bold border-b-2 transition-colors"
                            :class="activeSideTab === 'book' ? 'text-yellow-500 border-yellow-500' : 'text-gray-500 border-transparent hover:text-gray-300'">
                            Order Book
                        </button>
                        <button @click="activeSideTab = 'trades'"
                            class="flex-1 py-2 text-xs font-bold border-b-2 transition-colors"
                            :class="activeSideTab === 'trades' ? 'text-yellow-500 border-yellow-500' : 'text-gray-500 border-transparent hover:text-gray-300'">
                            Recent Trades
                        </button>
                    </div>

                    <div class="flex-1 min-h-0 relative border-b border-gray-800">
                        <!-- Desktop: Fill space. Mobile: Fill remaining space (flex-1 in parent) -->
                        <div class="absolute inset-0 h-full w-full">
                            <OrderBook v-show="activeSideTab === 'book'" />
                            <MarketTrades v-show="activeSideTab === 'trades'" />
                        </div>
                    </div>
                </div>

            </aside>

            <!-- Mobile ONLY History View -->
            <div v-if="mobileActiveTab === 'history'" class="md:hidden absolute inset-0 z-30 bg-gray-900 flex flex-col">
                <OrderHistory />
            </div>

            <!-- Mobile ONLY Market Selection View -->
            <div v-if="mobileActiveTab === 'market'"
                class="md:hidden absolute inset-0 z-30 bg-gray-900 flex flex-col p-4 overflow-y-auto">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-white font-bold text-lg">Market Overview</h3>
                    <div class="bg-gray-800 rounded px-3 py-1 text-xs text-gray-400 border border-gray-700">
                        Top 10 Assets
                    </div>
                </div>

                <!-- Simple Search Placeholder -->
                <div class="mb-4 relative">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                        stroke="currentColor" class="w-4 h-4 absolute left-3 top-3 text-gray-500">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    <input type="text" placeholder="Search markets..."
                        class="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500 placeholder-gray-600">
                </div>

                <div class="space-y-3">
                    <button v-for="coin in marketStore.supportedCoins" :key="coin"
                        @click="marketStore.switchCoin(coin); mobileActiveTab = 'trade'"
                        class="w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200 relative overflow-hidden group hover:scale-[1.01]"
                        :class="marketStore.activeCoin.symbol === coin ? 'bg-gradient-to-r from-yellow-500/10 to-transparent border-yellow-500/50' : 'bg-gray-800 border-gray-700/50 hover:bg-gray-700'">
                        <div class="flex items-center gap-4">
                            <!-- Coin Logo -->
                            <img v-if="getMarketData(coin)?.image" :src="getMarketData(coin).image" :alt="coin"
                                class="w-10 h-10 rounded-full shrink-0 shadow-lg" />
                            <div v-else
                                class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-gray-900 text-sm shadow-lg shrink-0 bg-gray-700">
                                {{ coin[0] }}
                            </div>
                            <div class="flex flex-col items-start gap-0.5">
                                <span class="font-bold text-white text-base">{{ marketStore.COIN_MAP[coin].name
                                    }}</span>
                                <span class="text-xs text-gray-400 font-mono">{{ coin }}/USDT</span>
                            </div>
                        </div>

                        <!-- Market Data (Price & Change) -->
                        <div class="flex flex-col items-end gap-0.5">
                            <template v-if="getMarketData(coin)">
                                <span
                                    class="font-bold text-base tracking-wide transition-colors duration-300 font-mono">${{
                                        getMarketData(coin).current_price?.toLocaleString(undefined, {
                                    minimumFractionDigits: 2, maximumFractionDigits: 4 }) }}</span>
                                <span class="text-xs font-bold px-1.5 py-0.5 rounded"
                                    :class="getMarketData(coin).price_change_percentage_24h >= 0 ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'">
                                    {{ getMarketData(coin).price_change_percentage_24h >= 0 ? '+' : '' }}{{
                                        getMarketData(coin).price_change_percentage_24h?.toFixed(2) }}%
                                </span>
                            </template>
                            <template v-else>
                                <span class="text-xs text-gray-500 animate-pulse">Syncing...</span>
                            </template>
                        </div>
                    </button>
                </div>
            </div>

        </div>
    </div>
</template>
