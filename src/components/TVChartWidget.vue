<script setup>
import { onMounted, ref, watch } from 'vue';
import { useMarketStore } from '../stores/market';

const store = useMarketStore();
const containerId = 'tradingview_widget';
let widget = null;
let resizeObserver = null;
let resizeTimeout = null;

// Fungsi Render Widget
const loadWidget = () => {
  if (window.TradingView) {
    if (document.getElementById(containerId)) {
        document.getElementById(containerId).innerHTML = ""; 
        const isMobile = window.innerWidth < 768;
        
        new window.TradingView.widget({
          "autosize": true, // Enable autosize
          "symbol": `BINANCE:${store.activeCoin.symbol}USDT`, 
          "interval": "1",
          "timezone": "Asia/Jakarta",
          "theme": "dark",
          "style": "1",
          "locale": "en",
          "toolbar_bg": "#f1f3f6",
          "enable_publishing": false,
          "hide_side_toolbar": isMobile, // Hide side bar on mobile
          "allow_symbol_change": false, 
          "container_id": containerId,
          "disabled_features": isMobile ? [
              "header_widget", 
              "left_toolbar", 
              "timeframes_toolbar", 
              "edit_buttons", 
              "context_menus", 
              "control_bar", 
              "border_around_the_chart"
          ] : [],
          "preset": isMobile ? "mobile" : "desktop"
        });
    }
  }
};

onMounted(() => {
  const script = document.createElement('script');
  script.src = 'https://s3.tradingview.com/tv.js';
  script.async = true;
  script.onload = loadWidget;
  document.head.appendChild(script);

  // Resize Observer logic
  resizeObserver = new ResizeObserver(() => {
    // Debounce resize event
    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // Only reload if widget exists (meaning script loaded)
        if (window.TradingView) loadWidget();
    }, 500); 
  });
  
  const container = document.getElementById(containerId);
  if (container) resizeObserver.observe(container);
});

// Watcher: Kalau koin di store berubah, render ulang chart
watch(() => store.activeCoin.symbol, () => {
    loadWidget();
});
</script>

<template>
  <div class="w-full h-full bg-gray-900">
    <div :id="containerId" class="w-full h-full"></div>
  </div>
</template>