<script setup>
import { onMounted, computed } from 'vue';
import { useWalletStore } from '../stores/wallet';
import { useAuthStore } from '../stores/auth';

const walletStore = useWalletStore();
const authStore = useAuthStore();

onMounted(() => {
    walletStore.fetchStats();
    walletStore.fetchBalance();
});

const userInitial = computed(() => {
    return (authStore.user.name || authStore.user.email || 'U')[0].toUpperCase();
});

const totalTrades = computed(() => walletStore.stats.wins + walletStore.stats.losses);
const winRate = computed(() => {
    return totalTrades.value > 0
        ? ((walletStore.stats.wins / totalTrades.value) * 100).toFixed(1)
        : '0.0';
});
</script>

<template>
    <div class="h-screen overflow-y-auto p-4 md:p-8 max-w-4xl mx-auto w-full">
        <!-- Profile Header -->
        <div
            class="flex flex-col md:flex-row items-center gap-6 mb-8 bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
            <div class="relative">
                <div class="w-24 h-24 rounded-full bg-gradient-to-tr from-yellow-600 to-yellow-400 p-1">
                    <div
                        class="w-full h-full rounded-full bg-gray-900 flex items-center justify-center overflow-hidden">
                        <span class="text-3xl font-bold text-white">{{ userInitial }}</span>
                    </div>
                </div>
            </div>

            <div class="text-center md:text-left">
                <h2 class="text-3xl font-bold flex items-center justify-center md:justify-start gap-2">
                    {{ authStore.user.name || 'Trader' }}
                    <span v-if="authStore.user.kycStatus === 'approved'"
                        class="bg-green-500/10 text-green-500 text-xs px-2 py-0.5 rounded-full border border-green-500/20 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3">
                            <path fill-rule="evenodd"
                                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                                clip-rule="evenodd" />
                        </svg>
                        Verified
                    </span>
                    <span v-else
                        class="bg-orange-500/10 text-orange-400 text-xs px-2 py-0.5 rounded-full border border-orange-500/20 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3">
                            <path fill-rule="evenodd"
                                d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                                clip-rule="evenodd" />
                        </svg>
                        Unverified
                    </span>
                </h2>
                <p class="text-gray-400 mt-1">{{ authStore.user.email }}</p>
                <div class="flex items-center justify-center md:justify-start gap-3 mt-3">
                    <div class="bg-gray-800 px-3 py-1 rounded text-xs font-mono text-gray-300 border border-gray-700">
                        ID: {{ authStore.user.id }}
                    </div>
                    <div
                        class="bg-yellow-500/20 px-3 py-1 rounded text-xs font-bold text-yellow-500 border border-yellow-500/20">
                        {{ authStore.user.role }}
                    </div>
                </div>
            </div>
        </div>

        <!-- Wallet Overview -->
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
            <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                    stroke="currentColor" class="w-5 h-5 text-yellow-500">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
                </svg>
                Wallet Balance
            </h3>
            <p class="text-4xl font-bold text-white">${{ walletStore.wallet.usdt?.toLocaleString('en-US', {
                minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</p>
            <p class="text-gray-500 text-sm mt-1">USDT Balance</p>
        </div>

        <div class="grid grid-cols-1 gap-6">
            <!-- Stats Overview -->
            <div class="bg-gray-900 border border-gray-800 rounded-xl p-6 relative overflow-hidden">
                <!-- Decorative BG -->
                <div
                    class="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none">
                </div>

                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-lg font-bold text-white flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                            stroke="currentColor" class="w-5 h-5 text-yellow-500">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
                        </svg>
                        Performance Overview
                    </h3>
                </div>

                <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <!-- Total Trades -->
                    <div
                        class="bg-gray-800/40 p-4 rounded-lg border border-gray-700/50 hover:border-gray-600 transition-colors">
                        <label class="text-xs text-gray-500 uppercase font-bold tracking-wider">Total Trades</label>
                        <p class="text-2xl font-bold text-white mt-1">{{ totalTrades }}</p>
                    </div>

                    <!-- Win Rate -->
                    <div
                        class="bg-gray-800/40 p-4 rounded-lg border border-gray-700/50 hover:border-gray-600 transition-colors">
                        <label class="text-xs text-gray-500 uppercase font-bold tracking-wider">Win Rate</label>
                        <p class="text-2xl font-bold text-green-400 mt-1">{{ winRate }}%</p>
                    </div>

                    <!-- Net Profit (Highlighted) -->
                    <div
                        class="col-span-2 lg:col-span-2 bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-lg border border-gray-700/50 shadow-lg relative overflow-hidden">
                        <div class="absolute inset-0 bg-yellow-500/5"></div>
                        <label class="text-xs text-gray-400 uppercase font-bold tracking-wider relative z-10">Net Profit
                            (PnL)</label>
                        <div class="flex items-center justify-between mt-1 relative z-10">
                            <p class="text-3xl font-bold"
                                :class="walletStore.stats.netProfit >= 0 ? 'text-green-400' : 'text-red-400'">
                                {{ walletStore.stats.netProfit.toLocaleString('en-US', {
                                    style: 'currency', currency:
                                'USD' }) }}
                            </p>
                            <!-- Mini Sparkline -->
                            <div class="flex items-end gap-0.5 h-8">
                                <div class="w-1 rounded-sm h-3"
                                    :class="walletStore.stats.netProfit >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'">
                                </div>
                                <div class="w-1 rounded-sm h-5"
                                    :class="walletStore.stats.netProfit >= 0 ? 'bg-green-500/40' : 'bg-red-500/40'">
                                </div>
                                <div class="w-1 rounded-sm h-4"
                                    :class="walletStore.stats.netProfit >= 0 ? 'bg-green-500/60' : 'bg-red-500/60'">
                                </div>
                                <div class="w-1 rounded-sm h-7"
                                    :class="walletStore.stats.netProfit >= 0 ? 'bg-green-500/80' : 'bg-red-500/80'">
                                </div>
                                <div class="w-1 rounded-sm h-6"
                                    :class="walletStore.stats.netProfit >= 0 ? 'bg-green-500' : 'bg-red-500'"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Wins -->
                    <div class="bg-gray-800/40 p-4 rounded-lg border border-gray-700/50">
                        <label class="text-xs text-gray-500 uppercase font-bold">Wins</label>
                        <p class="text-xl font-bold text-green-500 mt-1">{{ walletStore.stats.wins }}</p>
                    </div>
                    <!-- Losses -->
                    <div class="bg-gray-800/40 p-4 rounded-lg border border-gray-700/50">
                        <label class="text-xs text-gray-500 uppercase font-bold">Losses</label>
                        <p class="text-xl font-bold text-red-500 mt-1">{{ walletStore.stats.losses }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
