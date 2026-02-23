import { defineStore } from 'pinia';
import { ref, reactive } from 'vue';
import { io } from 'socket.io-client';

export const useMarketStore = defineStore('market', () => {
    // --- STATE DASAR ---
    const currentPrice = ref(0);
    const connectionStatus = ref('Disconnected');
    const candleData = ref([]); 
    const stats = reactive({ high24h: 0, low24h: 0, change24h: 0, volume24h: 0 });
    const marketCache = new Map(); // Cache sederhana: { 'bitcoin': { data, timestamp } }
    const CACHE_DURATION = 5 * 60 * 1000; // 5 Menit
    const recentTrades = ref([]); // Live Market Trades

    
    // --- STATE BARU: MULTI-COIN ---
    const activeCoin = reactive({
        symbol: 'BTC',      // Untuk tampilan & pair tradingview
        id: 'bitcoin',      // Untuk API CoinGecko
        pair: 'btcusdt'     // Untuk WebSocket Binance (huruf kecil)
    });

    // Trading Durations (Seconds)
    const durations = ref([10, 30, 60]);

    function addDuration(seconds) {
        if (!durations.value.includes(seconds)) {
            durations.value.push(seconds);
            durations.value.sort((a, b) => a - b);
        }
    }

    function removeDuration(seconds) {
        durations.value = durations.value.filter(d => d !== seconds);
    }

    // Database Koin yang didukung (Top 10)
    const COIN_MAP = {
        'BTC': { id: 'bitcoin', pair: 'btcusdt', name: 'Bitcoin' },
        'ETH': { id: 'ethereum', pair: 'ethusdt', name: 'Ethereum' },
        'SOL': { id: 'solana', pair: 'solusdt', name: 'Solana' },
        'BNB': { id: 'binancecoin', pair: 'bnbusdt', name: 'BNB' },
        'XRP': { id: 'ripple', pair: 'xrpusdt', name: 'XRP' },
        'DOGE': { id: 'dogecoin', pair: 'dogeusdt', name: 'Dogecoin' },
        'ADA': { id: 'cardano', pair: 'adausdt', name: 'Cardano' },
        'AVAX': { id: 'avalanche-2', pair: 'avaxusdt', name: 'Avalanche' },
        'DOT': { id: 'polkadot', pair: 'dotusdt', name: 'Polkadot' },
        'LINK': { id: 'chainlink', pair: 'linkusdt', name: 'Chainlink' }
    };

    const supportedCoins = Object.keys(COIN_MAP);

    // --- STATE BARU: NOTIFICATION ---
    const notifications = ref([]); 
    const marketOverview = ref([]); // Data harga untuk list koin

    let ws = null;
    let onCandleUpdate = null;
    let lastCandle = null;

    // --- ACTION: FETCH MARKET OVERVIEW (Top 10) ---
    async function fetchMarketOverview() {
        const ids = supportedCoins.map(sym => COIN_MAP[sym].id).join(',');
        try {
            // Cek Cache untuk overview jika ada (opsional, tapi bagus untuk hemat API)
            // Untuk sekarang langsung fetch saja karena ini user request interaction
            const res = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=24h`);
            
            if (!res.ok) {
                if (res.status === 429) throw new Error("API Limit Reached");
                throw new Error("Network Error");
            }

            const data = await res.json();
            marketOverview.value = data;
        } catch (error) {
            console.error('Failed to fetch market overview:', error);
            // Fallback: don't break app, just show empty or cached if available
        }
    }

    // --- ACTION: NOTIFICATION SYSTEM ---
    function showToast(title, message, type = 'success') {
        const id = Date.now();
        notifications.value.push({ id, title, message, type });
        // Hapus otomatis setelah 3 detik
        setTimeout(() => {
            notifications.value = notifications.value.filter(n => n.id !== id);
        }, 3000);
    }

    // --- ACTION: GANTI KOIN ---
    async function switchCoin(symbol) {
        if (!COIN_MAP[symbol]) return;
        
        // 1. Update State Active Coin
        activeCoin.symbol = symbol;
        activeCoin.id = COIN_MAP[symbol].id;
        activeCoin.pair = COIN_MAP[symbol].pair;

        // 2. Reset Data Lama
        currentPrice.value = 0;
        candleData.value = [];
        recentTrades.value = []; // Reset trades
        connectionStatus.value = 'Switching...';
        
        // 3. Matikan koneksi lama
        if (ws) ws.close();

        // 4. Init ulang dashboard dengan koin baru
        await initDashboard();
        
        showToast('Asset Changed', `Switched to ${symbol}/USDT`, 'success');
    }

    // --- ACTION: INIT DASHBOARD (Updated) ---
    // --- ACTION: INIT DASHBOARD (Updated) ---
    async function initDashboard() {
        connectionStatus.value = 'Connecting...';
        
        let usedCache = false;
        const now = Date.now();
        const cached = marketCache.get(activeCoin.id);

        // 1. Cek Cache dulu
        if (cached && (now - cached.timestamp < CACHE_DURATION)) {
            console.log(`Using cache for ${activeCoin.id}`);
            applyMarketData(cached.data);
            usedCache = true;
        }

        try {
            // 2. Fetch API CoinGecko dengan ID dinamis (activeCoin.id), hanya jika tidak pakai cache
            // Atau bisa kita fetch background untuk update cache, tapi untuk hemat API limit, kita skip kalau cache valid
            if (!usedCache) {
                const res = await fetch(`https://api.coingecko.com/api/v3/coins/${activeCoin.id}?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false`);
                if (!res.ok) {
                     if (res.status === 429) throw new Error("API Limit Reached");
                     throw new Error("Network Error");
                }
                
                const data = await res.json();
                
                // Fetch History Dinamis
                const ohlcRes = await fetch(`https://api.coingecko.com/api/v3/coins/${activeCoin.id}/ohlc?vs_currency=usd&days=1`);
                const ohlcData = await ohlcRes.json();
                
                // Gabungkan data untuk disimpan di cache
                const fullData = { market: data.market_data, ohlc: ohlcData };
                
                // Simpan ke Cache
                marketCache.set(activeCoin.id, { data: fullData, timestamp: Date.now() });
                
                applyMarketData(fullData);
            }

            // 3. Connect WebSocket (Selalu connect, baik cache atau fresh)
            connectWebSocket();

        } catch (error) {
            console.error('API Error (Fallback to Live Only):', error);
            
            // Fallback: Jika API error tapi kita punya CACHE (meskipun expired), pakai saja
            if (cached) {
                showToast('API Limit', 'Using cached data', 'warning');
                applyMarketData(cached.data);
                connectWebSocket();
            } else {
                // Jika benar-benar tidak ada data, kita coba connect WebSocket saja 
                // supaya harga live tetap jalan. Chart mungkin kosong/loading.
                showToast('API Limit', 'Switching to Live-Only Mode', 'warning');
                
                // Set harga awal sementara (fallback hardcode)
                if (currentPrice.value === 0) {
                     currentPrice.value = activeCoin.symbol === 'BTC' ? 96000 : 100;
                }
                connectWebSocket();
                connectionStatus.value = 'Connected (Live Only)';
            }
        }
    }

    function applyMarketData(data) {
        const m = data.market;
        currentPrice.value = m.current_price.usd;
        stats.high24h = m.high_24h.usd; 
        stats.low24h = m.low_24h.usd;
        stats.change24h = m.price_change_percentage_24h;
        stats.volume24h = m.total_volume.usd;

        candleData.value = data.ohlc.map(item => ({
            time: item[0] / 1000, open: item[1], high: item[2], low: item[3], close: item[4]
        }));
        
        lastCandle = candleData.value[candleData.value.length - 1];
    }

    function connectWebSocket() {
        if (ws) {
            ws.disconnect(); // Socket.io disconnect
            ws = null;
        }

        console.log('Connecting to Backend Socket.io...');
        // Import socket.io-client dynamically or assume it's available if script tag (but we installed it)
        // Better: import at top. For now, let's use the installed package.
        // We need to import 'io' from 'socket.io-client' at the text. 
        // Since this is inside a function, I will add the import at the top later.
        // Assuming 'io' is imported.
        
        ws = io('http://localhost:3000'); // Connect to backend

        ws.on('connect', () => {
             connectionStatus.value = 'Connected (Backend)';
             console.log('Connected to Backend Socket.io');
        });

        ws.on('market:update', (trade) => {
            // Data is already parsed from backend
            if (!trade) return;

            const symbol = trade.s.toUpperCase(); 
            
            // Map Symbol back to our ID
            const coinKey = Object.keys(COIN_MAP).find(key => COIN_MAP[key].pair.toUpperCase() === symbol);
            
            if (!coinKey) return; 

            const price = parseFloat(trade.p);
            const coinId = COIN_MAP[coinKey].id;

            // 1. GLOBAL UPDATE
            const overviewIndex = marketOverview.value.findIndex(item => item.id === coinId);
            if (overviewIndex !== -1) {
                marketOverview.value[overviewIndex].current_price = price;
            }

            // 2. ACTIVE COIN UPDATE
            if (activeCoin.id === coinId) {
                currentPrice.value = price;
                
                const isBuyerMaker = trade.m; 
                const side = isBuyerMaker ? 'sell' : 'buy'; 
                
                const newTrade = {
                    id: trade.a, 
                    price: price,
                    amount: parseFloat(trade.q), 
                    time: trade.T, 
                    side: side
                };
                
                recentTrades.value.unshift(newTrade);
                if (recentTrades.value.length > 50) recentTrades.value.pop();

                // Candle Logic
                const time = Math.floor(Date.now() / 1000);
                if (lastCandle && time >= lastCandle.time + 60) {
                     lastCandle = { time: Math.floor(time/60)*60, open: lastCandle.close, high: price, low: price, close: price };
                } else if (lastCandle) {
                    lastCandle.close = price;
                    lastCandle.high = Math.max(lastCandle.high, price);
                    lastCandle.low = Math.min(lastCandle.low, price);
                } else {
                     lastCandle = { time: Math.floor(time/60)*60, open: price, high: price, low: price, close: price };
                }
                if (onCandleUpdate) onCandleUpdate(lastCandle);
            }
        });

        ws.on('disconnect', () => {
             console.log('Socket.io Disconnected');
             connectionStatus.value = 'Disconnected';
        });

        ws.on('connect_error', (err) => {
             console.error('Socket.io Error:', err);
             connectionStatus.value = 'Error';
        });
    }

    // Fungsi Simulasi (Dinamis Harga)
    function startSimulationMode(basePrice) {
        connectionStatus.value = 'Simulating';
        currentPrice.value = basePrice;
        // ... (Logic simulasi generateDummyHistory bisa disesuaikan dengan basePrice, disingkat disini) ...
    }



    function subscribeToUpdates(cb) { onCandleUpdate = cb; }

    // --- SOUND EFFECTS (AudioContext) ---
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    function playSound(type) {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        const now = audioCtx.currentTime;
        
        if (type === 'open') {
            // Short high blip
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'win') {
            // Success Chime (Ascending)
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.linearRampToValueAtTime(800, now + 0.1);
            osc.frequency.linearRampToValueAtTime(1200, now + 0.3);
            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.linearRampToValueAtTime(0, now + 0.5);
            osc.start(now);
            osc.stop(now + 0.5);
        } else if (type === 'loss') {
            // Failure Buzz (Descending/Low)
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.linearRampToValueAtTime(100, now + 0.3);
            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.linearRampToValueAtTime(0, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        }
    }

    return { 
        currentPrice, connectionStatus, stats, candleData, 
        notifications, activeCoin, recentTrades, marketOverview,
        initDashboard, subscribeToUpdates, switchCoin, fetchMarketOverview,
        showToast, playSound, supportedCoins, COIN_MAP // Export lists
    };
});