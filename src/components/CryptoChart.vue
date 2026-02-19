<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createChart } from 'lightweight-charts';
import { useMarketStore } from '../stores/market';

const chartContainer = ref(null);
const marketStore = useMarketStore();
let chart;
let candlestickSeries;

const handleResize = () => {
    if (chart) chart.applyOptions({ width: chartContainer.value.clientWidth });
};

onMounted(() => {
    chart = createChart(chartContainer.value, {
        width: chartContainer.value.clientWidth,
        height: chartContainer.value.clientHeight || 400, // Auto height
        layout: { background: { color: '#030712' }, textColor: '#9CA3AF' }, // Lebih gelap
        grid: { vertLines: { visible: false }, horzLines: { color: '#1F2937' } },
        timeScale: { timeVisible: true, secondsVisible: false, borderColor: '#374151' },
    });

    candlestickSeries = chart.addCandlestickSeries({
        upColor: '#22c55e', downColor: '#ef4444',
        borderVisible: false, wickUpColor: '#22c55e', wickDownColor: '#ef4444',
    });

    // 1. WATCHER: Tunggu data history dari Store masuk
    watch(() => marketStore.candleData, (newData) => {
        if (newData && newData.length > 0) {
            candlestickSeries.setData(newData);
        }
    }, { immediate: true });

    // 2. SUBSCRIBE: Update real-time (tambah candle satu per satu)
    marketStore.subscribeToUpdates((newCandle) => {
        if(candlestickSeries) candlestickSeries.update(newCandle);
    });

    window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    if (chart) chart.remove();
});
</script>

<template>
    <div class="w-full h-full relative">
        <div ref="chartContainer" class="w-full h-full"></div>
    </div>
</template>