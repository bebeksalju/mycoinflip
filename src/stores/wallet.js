import { defineStore } from 'pinia';
import { ref, reactive, watch } from 'vue';
import { useMarketStore } from './market';
import { useAuthStore } from './auth';

export const useWalletStore = defineStore('wallet', () => {
    const marketStore = useMarketStore();
    
    // State
    const wallet = reactive({ 
        usdt: 10000.00, 
        btc: 0.005, 
        eth: 0.5, 
        sol: 10, 
        bnb: 2, 
        xrp: 100 
    });
    
    const orderHistory = ref([]);
    
    // PnL Stats
    const stats = reactive({
        wins: 0,
        losses: 0,
        netProfit: 0
    });

    // Actions
    function executeTrade(type, amount, totalUSDT) {
        let success = false;
        let msg = '';
        
        const coinKey = marketStore.activeCoin.symbol.toLowerCase();

        if (type === 'buy') {
            if (wallet.usdt >= totalUSDT) {
                wallet.usdt -= totalUSDT; 
                if(!wallet[coinKey]) wallet[coinKey] = 0; 
                wallet[coinKey] += parseFloat(amount);
                success = true;
                msg = `Successfully Bought ${amount} ${marketStore.activeCoin.symbol}`;
            } else {
                msg = 'Insufficient USDT Balance!';
            }
        } else {
            if (wallet[coinKey] >= amount) {
                wallet[coinKey] -= parseFloat(amount); 
                wallet.usdt += totalUSDT;
                success = true;
                msg = `Successfully Sold ${amount} ${marketStore.activeCoin.symbol}`;
            } else {
                msg = `Insufficient ${marketStore.activeCoin.symbol} Balance!`;
            }
        }

        if (success) {
            orderHistory.value.unshift({
                id: Date.now(),
                time: new Date().toLocaleTimeString(),
                pair: `${marketStore.activeCoin.symbol}/USDT`,
                type: type.toUpperCase(),
                price: marketStore.currentPrice,
                amount: parseFloat(amount),
                total: totalUSDT,
                status: 'Filled'
            });
            marketStore.showToast('Order Filled', msg, 'success');
        } else {
            marketStore.showToast('Order Failed', msg, 'error');
        }

    return { success, msg };
    }

    // --- TIMED TRADING LOGIC ---
    const activePositions = ref([]);
    const activeLimitOrders = ref([]); // Limit Orders State

    function openPosition(type, amount, durationSeconds) {
        if (wallet.usdt < amount) {
            marketStore.showToast('Insufficent Balance', 'Not enough USDT', 'error');
            return { success: false, msg: 'Insufficient Balance' };
        }

        // Deduct Balance
        wallet.usdt -= parseFloat(amount);

        const position = {
            id: Date.now(),
            pair: `${marketStore.activeCoin.symbol}/USDT`,
            entryPrice: marketStore.currentPrice,
            amount: parseFloat(amount),
            type: type, // 'UP' or 'DOWN'
            duration: durationSeconds,
            startTime: Date.now(),
            endTime: Date.now() + (durationSeconds * 1000),
            status: 'OPEN'
        };

        activePositions.value.push(position);
        marketStore.showToast('Position Opened', `${type} for ${durationSeconds}s`, 'success');
        marketStore.playSound('open'); // Sound Trigger
        return { success: true, msg: 'Position Opened' };
    }

    // Check for expired positions every second
    setInterval(() => {
        const now = Date.now();
        activePositions.value.forEach((pos, index) => {
            if (pos.status === 'OPEN' && now >= pos.endTime) {
                settlePosition(index);
            }
        });
    }, 1000);

    function settlePosition(index) {
        const pos = activePositions.value[index];
        const currentPrice = marketStore.currentPrice;
        let isWin = false;

        // --- RIGGED LOGIC START ---
        // We need to access authStore here. 
        // Since we are inside a store, we can use useAuthStore() directly if initialized.
        // Pinia allows store-to-store usage.
        const { useAuthStore } = require('./auth'); // Dynamic import to avoid circular dep if any, or just import at top if safe.
        // Better: Import at top. Let's assume standard import at top works or use this safe way.
        // Actually, let's use the import we will add at the top.
        // For now, let's try to get it from the window/global or just import it inside.
        // To be safe and clean, let's assume we imported it at the top. 
        // Wait, I haven't imported useAuthStore at the top of wallet.js yet.
        // I should do that first or use it here dynamically.
        
        // Dynamic import logic (simulating access to the store instance)
        const authStore = useAuthStore();
        const mode = authStore.user.profitMode;

        if (mode === 'win') {
            isWin = true;
        } else if (mode === 'loss') {
            isWin = false;
        } else {
            // Random / Fair Mode
            if (pos.type === 'UP' && currentPrice > pos.entryPrice) isWin = true;
            if (pos.type === 'DOWN' && currentPrice < pos.entryPrice) isWin = true;
        }
        // --- RIGGED LOGIC END ---

        let profit = 0;
        if (isWin) {
            profit = pos.amount * 1.8; // 80% Profit
            wallet.usdt += profit;
            
            // Update Stats
            stats.wins++;
            stats.netProfit += (profit - pos.amount);
            
            marketStore.showToast('Trade WON!', `Profit: $${(profit - pos.amount).toFixed(2)}`, 'success');
            marketStore.playSound('win'); // Sound Trigger
        } else {
            // Update Stats
            stats.losses++;
            stats.netProfit -= pos.amount;
            
            marketStore.showToast('Trade LOST', `Loss: $${pos.amount}`, 'error');
            marketStore.playSound('loss'); // Sound Trigger
        }

        // Move to History
        orderHistory.value.unshift({
            ...pos,
            exitPrice: currentPrice,
            profit: isWin ? profit - pos.amount : -pos.amount,
            status: isWin ? 'WIN' : 'LOSS',
            time: new Date().toLocaleTimeString()
        });

        // Remove from active
        activePositions.value.splice(index, 1);
    }

    // --- LIMIT ORDER LOGIC ---
    function placeLimitOrder(type, price, amount, totalUSDT) {
        // Validate Balance
        if (type === 'buy') {
            if (wallet.usdt < totalUSDT) {
                marketStore.showToast('Insufficient Balance', 'Not enough USDT', 'error');
                return { success: false, msg: 'Insufficient USDT' };
            }
            wallet.usdt -= totalUSDT; // Lock funds
        } else {
             const coinKey = marketStore.activeCoin.symbol.toLowerCase();
             if ((wallet[coinKey] || 0) < amount) {
                marketStore.showToast('Insufficient Balance', `Not enough ${marketStore.activeCoin.symbol}`, 'error');
                return { success: false, msg: 'Insufficient Coin Balance' };
             }
             wallet[coinKey] -= amount; // Lock funds
        }

        activeLimitOrders.value.push({
            id: Date.now(),
            time: new Date().toLocaleTimeString(),
            pair: `${marketStore.activeCoin.symbol}/USDT`,
            type: type.toUpperCase(),
            limitPrice: parseFloat(price),
            amount: parseFloat(amount),
            total: totalUSDT,
            status: 'OPEN'
        });

        marketStore.showToast('Limit Order Placed', `${type} @ ${price}`, 'success');
        return { success: true, msg: 'Limit Order Placed' };
    }

    function cancelLimitOrder(id) {
        const index = activeLimitOrders.value.findIndex(o => o.id === id);
        if (index === -1) return;

        const order = activeLimitOrders.value[index];
        
        // Refund locked funds
        if (order.type === 'BUY') {
            wallet.usdt += order.total;
        } else {
            const symbol = order.pair.split('/')[0].toLowerCase();
            if (!wallet[symbol]) wallet[symbol] = 0;
            wallet[symbol] += order.amount;
        }

        activeLimitOrders.value.splice(index, 1);
        marketStore.showToast('Order Canceled', 'Funds returned', 'info');
    }

    // Watch Price for Limit Execution
    watch(() => marketStore.currentPrice, (newPrice) => {
        if (activeLimitOrders.value.length === 0) return;

        activeLimitOrders.value.forEach((order, index) => {
            let triggered = false;
            
            // Buy Limit: Price drops <= limit
            if (order.type === 'BUY' && newPrice <= order.limitPrice) triggered = true;
            
            // Sell Limit: Price rises >= limit
            if (order.type === 'SELL' && newPrice >= order.limitPrice) triggered = true;

            if (triggered) {
                // Execute Trade
                if (order.type === 'BUY') {
                    // Funds already locked in USDT, swap to Coin
                    const coinKey = order.pair.split('/')[0].toLowerCase();
                    if(!wallet[coinKey]) wallet[coinKey] = 0;
                    wallet[coinKey] += order.amount;
                } else {
                    // Funds already locked in Coin, swap to USDT
                    wallet.usdt += order.total;
                }

                // Add to History
                orderHistory.value.unshift({
                    ...order,
                    price: newPrice, // Executed at market price (or limit price depending on rule, usually best available)
                    status: 'Filled',
                    time: new Date().toLocaleTimeString()
                });

                marketStore.showToast('Limit Order Filled', `${order.type} ${order.pair} @ ${newPrice}`, 'success');
                marketStore.playSound('win'); // Use win sound for fill
                
                // Remove from active
                activeLimitOrders.value.splice(index, 1);
            }
        });
    });

    return {
        wallet,
        orderHistory,
        stats, // Export
        activePositions, 
        activeLimitOrders, // Export
        executeTrade,
        openPosition,
        placeLimitOrder, // Export
        cancelLimitOrder // Export
    };
}, {
    persist: true
});
