<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useMarketStore } from '../stores/market';
import { useWalletStore } from '../stores/wallet';
import api from '../api/axios';

const store = useMarketStore();
const walletStore = useWalletStore();
const inputAmount = ref(0);
const tradeType = ref('buy');
const tradeMode = ref('timed'); // Forced to 'timed'
const limitPrice = ref(0); // New State
const duration = ref(10); // seconds
const showConfirmModal = ref(false);
const tradingDurations = ref([]);

onMounted(async () => {
    try {
        const res = await api.get('/trade/durations');
        tradingDurations.value = res.data;
        if (res.data.length > 0) {
            duration.value = res.data[0].seconds;
        }
    } catch (e) {
        console.error('Failed to fetch durations:', e);
    }
});

const selectedPercentage = computed(() => {
    const d = tradingDurations.value.find(d => d.seconds === duration.value);
    return d?.percentage || 80;
});

const totalEstimate = computed(() => {
    const price = tradeMode.value === 'limit' ? limitPrice.value : store.currentPrice;
    return inputAmount.value * price;
});

// Update limit price when current price changes (optional convenience)
watch(() => store.currentPrice, (newVal) => {
    if (limitPrice.value === 0 && newVal > 0) limitPrice.value = newVal;
});

const isValidTrade = computed(() => {
    if (inputAmount.value <= 0) return false;
    const coinKey = store.activeCoin.symbol.toLowerCase();

    if (tradeType.value === 'buy' || tradeMode.value === 'timed') {
        return walletStore.wallet.usdt >= totalEstimate.value;
    } else {
        return (walletStore.wallet[coinKey] || 0) >= inputAmount.value;
    }
});

const setPercentage = (percent) => {
    const coinKey = store.activeCoin.symbol.toLowerCase();

    if (tradeType.value === 'buy' || tradeMode.value === 'timed') {
        const usdtAmount = walletStore.wallet.usdt * (percent / 100);
        const price = tradeMode.value === 'limit' && limitPrice.value > 0 ? limitPrice.value : store.currentPrice;
        inputAmount.value = usdtAmount / price;
    } else {
        inputAmount.value = walletStore.wallet[coinKey] * (percent / 100);
    }
};

const handleTrade = () => {
    if (!isValidTrade.value) return;
    showConfirmModal.value = true;
};

const executeConfirmedTrade = () => {
    let result;
    if (tradeMode.value === 'timed') {
        // Timed Trade: Type is UP (Buy) or DOWN (Sell)
        const type = tradeType.value === 'buy' ? 'UP' : 'DOWN';
        result = walletStore.openPosition(type, totalEstimate.value, duration.value, selectedPercentage.value);
    } else if (tradeMode.value === 'limit') {
        // Limit Order
        result = walletStore.placeLimitOrder(tradeType.value, limitPrice.value, inputAmount.value, totalEstimate.value);
    } else {
        // Spot Trade
        result = walletStore.executeTrade(tradeType.value, inputAmount.value, totalEstimate.value);
    }

    if (result.success) {
        inputAmount.value = 0;
        showConfirmModal.value = false;
    } else {
        alert(result.msg);
        showConfirmModal.value = false;
    }
};
</script>

<template>
    <div class="bg-gray-900 p-3 flex flex-col gap-2 text-sm font-sans">
        <!-- Trade Mode Toggle (Hidden/Removed - Forced to TIMED) -->
        <div
            class="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs font-bold text-center py-1 rounded mb-1">
            TIMED TRADING MODE ⏳
        </div>

        <div class="flex bg-gray-950 p-0.5 rounded-lg">
            <button @click="tradeType = 'buy'" class="flex-1 py-1.5 text-xs font-bold rounded transition-colors"
                :class="tradeType === 'buy' ? 'bg-green-600 text-white' : 'text-gray-500 hover:text-gray-300'">
                {{ tradeMode === 'timed' ? 'CALL (UP)' : 'BUY' }}
            </button>
            <button @click="tradeType = 'sell'" class="flex-1 py-1.5 text-xs font-bold rounded transition-colors"
                :class="tradeType === 'sell' ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-gray-300'">
                {{ tradeMode === 'timed' ? 'PUT (DOWN)' : 'SELL' }}
            </button>
        </div>

        <div class="flex justify-between text-[10px] text-gray-400">
            <span>Available</span>
            <span v-if="store.currentPrice > 0" class="font-mono text-gray-200">
                {{ tradeType === 'buy' || tradeMode === 'timed'
                    ? walletStore.wallet.usdt.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
                    : (walletStore.wallet[store.activeCoin.symbol.toLowerCase()] || 0).toFixed(5) + ' ' +
                    store.activeCoin.symbol
                }}
            </span>
            <span v-else class="w-16 h-3 bg-gray-800 animate-pulse rounded"></span>
        </div>

        <div class="flex flex-col gap-1.5">
            <div v-if="tradeMode === 'timed'">
                <span class="text-[10px] text-gray-500 mb-1 block">Timer</span>
                <div class="flex gap-1.5">
                    <button v-for="d in tradingDurations" :key="d.seconds" @click="duration = d.seconds"
                        class="flex-1 flex flex-col items-center justify-center py-1.5 rounded border transition-all"
                        :class="duration === d.seconds
                            ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500'
                            : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700/50'">
                        <span class="text-xs font-bold font-mono">{{ d.seconds }}s</span>
                        <span class="text-[9px] opacity-70">{{ d.percentage }}%</span>
                    </button>
                </div>
            </div>

            <div class="flex bg-gray-800 rounded border border-gray-700 px-2 py-1.5 items-center"
                :class="{ 'opacity-60': tradeMode !== 'limit' }">
                <span class="text-[10px] text-gray-500 w-10">{{ tradeMode === 'limit' ? 'Limit' : 'Price' }}</span>

                <input v-if="tradeMode === 'limit'" v-model="limitPrice" type="number" step="0.01"
                    class="bg-transparent flex-1 text-right text-xs text-white font-mono outline-none" />

                <!-- Display properly formatted currency for current price -->
                <div v-else-if="store.currentPrice > 0"
                    class="bg-transparent flex-1 text-right text-xs text-gray-300 font-mono outline-none">
                    {{ store.currentPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) }}
                </div>

                <div v-else class="flex-1 flex justify-end"><span
                        class="w-12 h-3 bg-gray-700 animate-pulse rounded"></span></div>
                <!-- REMOVE 'USD' suffix since format includes $ -->
            </div>

            <div class="flex bg-gray-800 rounded border border-gray-700 px-2 py-1.5 items-center">
                <span class="text-[10px] text-gray-500 w-10">Amount</span>
                <input v-model="inputAmount" type="number" step="0.0001"
                    class="bg-transparent flex-1 text-right text-xs text-white font-mono outline-none"
                    placeholder="0.00" />
                <span class="text-[10px] text-gray-500 w-6 text-right">{{ store.activeCoin.symbol }}</span>
            </div>
        </div>

        <div class="flex gap-1">
            <button v-for="pct in [25, 50, 75, 100]" :key="pct" @click="setPercentage(pct)"
                class="flex-1 bg-gray-800 hover:bg-gray-700 text-[10px] text-gray-400 py-0.5 rounded border border-gray-700 transition">
                {{ pct }}%
            </button>
        </div>

        <div class="pt-2 mt-1 border-t border-gray-800">
            <div class="flex justify-between items-center text-[10px] mb-2">
                <span class="text-gray-500">Total Value</span>
                <span class="font-mono font-bold text-white">{{ totalEstimate.toLocaleString('en-US', {
                    style:
                        'currency', currency: 'USD'}) }}</span>
            </div>

            <button @click="handleTrade" :disabled="!isValidTrade"
                class="w-full py-2.5 rounded font-bold text-white shadow-lg active:scale-95 text-xs tracking-wide transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                :class="tradeType === 'buy' ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'">
                {{ tradeType }} {{ store.activeCoin.symbol }}
            </button>
        </div>

        <!-- Confirmation Modal -->
        <div v-if="showConfirmModal"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div class="bg-gray-900 border border-gray-700 rounded-lg p-4 w-full max-w-xs shadow-2xl">
                <h3 class="text-sm font-bold text-white mb-3">Confirm Trade</h3>

                <div class="space-y-2 text-xs text-gray-300 mb-4 bg-gray-800 p-3 rounded">
                    <div class="flex justify-between">
                        <span class="text-gray-500">Type</span>
                        <span class="font-bold uppercase"
                            :class="tradeType === 'buy' ? 'text-green-500' : 'text-red-500'">{{ tradeType }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-500">Pair</span>
                        <span class="font-bold">{{ store.activeCoin.symbol }}/USDT</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-500">Price</span>
                        <span class="font-mono">{{ store.currentPrice.toLocaleString() }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-500">Amount</span>
                        <span class="font-mono">{{ inputAmount.toFixed(6) }} {{ store.activeCoin.symbol }}</span>
                    </div>
                    <div class="border-t border-gray-700 pt-1 flex justify-between font-bold">
                        <span class="text-gray-400">Total</span>
                        <span class="text-white">{{ totalEstimate.toLocaleString('en-US', {
                            style: 'currency', currency:
                            'USD'}) }}</span>
                    </div>

                    <div v-if="tradeMode === 'timed'" class="flex justify-between text-yellow-500 pt-1">
                        <span>Duration</span>
                        <span>{{ duration }}s</span>
                    </div>
                    <div v-if="tradeMode === 'limit'" class="flex justify-between text-blue-400 pt-1">
                        <span>Limit Price</span>
                        <span>{{ limitPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) }}</span>
                    </div>
                    <div v-if="tradeMode === 'timed'" class="flex justify-between text-green-400 pt-1">
                        <span>Payout ({{ selectedPercentage }}%)</span>
                        <span>{{ (totalEstimate * (1 + selectedPercentage / 100)).toLocaleString('en-US', {
                            style:
                            'currency', currency: 'USD'}) }}</span>
                    </div>
                </div>

                <div class="flex gap-2">
                    <button @click="showConfirmModal = false"
                        class="flex-1 py-1.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold transition-colors">
                        Cancel
                    </button>
                    <button @click="executeConfirmedTrade"
                        class="flex-1 py-1.5 rounded text-white text-xs font-bold transition-colors shadow-lg"
                        :class="tradeType === 'buy' ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'">
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>