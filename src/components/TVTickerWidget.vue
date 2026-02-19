<script setup>
import { onMounted, ref } from 'vue';

const container = ref(null);

onMounted(() => {
  const script = document.createElement('script');
  script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
  script.async = true;
  script.innerHTML = JSON.stringify({
    "symbols": [
      { "proName": "BINANCE:BTCUSDT", "title": "Bitcoin" },
      { "proName": "BINANCE:ETHUSDT", "title": "Ethereum" },
      { "proName": "BINANCE:BNBUSDT", "title": "BNB" },
      { "proName": "BINANCE:SOLUSDT", "title": "Solana" },
      { "proName": "BINANCE:XRPUSDT", "title": "XRP" }
    ],
    "showSymbolLogo": true,
    "colorTheme": "dark",
    "isTransparent": false, 
    "displayMode": "adaptive",
    "locale": "en"
  });
  container.value.appendChild(script);
});
</script>

<template>
  <div class="tradingview-widget-container w-full h-12 border-b border-gray-800 bg-gray-900">
    <div ref="container" class="tradingview-widget-container__widget"></div>
  </div>
</template>