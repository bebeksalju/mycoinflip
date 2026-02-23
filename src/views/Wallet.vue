<script setup>
import { computed, onMounted } from 'vue';
import { useWalletStore } from '../stores/wallet';

const walletStore = useWalletStore();

onMounted(() => {
    walletStore.fetchBalance();
});
</script>

<template>
    <div class="p-4 md:p-8 max-w-2xl mx-auto w-full h-full overflow-y-auto pb-24">
        <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                stroke="currentColor" class="w-8 h-8 text-yellow-500">
                <path stroke-linecap="round" stroke-linejoin="round"
                    d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
            </svg>
            My Wallet
        </h2>

        <div class="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-8 shadow-xl">
            <!-- Total Balance Card -->
            <div class="text-center space-y-2">
                <p class="text-sm text-gray-400 uppercase tracking-wider font-bold">Total Balance</p>
                <h1 class="text-4xl font-bold text-white font-mono tracking-tight">
                    {{ walletStore.wallet.usdt.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) }}
                </h1>
                <p class="text-xs text-gray-500">≈ Rp {{ (walletStore.wallet.usdt * 15500).toLocaleString('id-ID') }}
                </p>
            </div>

            <!-- Asset List -->
            <div class="border border-gray-800 rounded-xl overflow-hidden bg-gray-900/50">
                <div
                    class="grid grid-cols-3 bg-gray-800 p-3 font-bold text-gray-500 uppercase text-[10px] tracking-wider">
                    <span>Asset</span>
                    <span class="text-right">Balance</span>
                    <span class="text-right">Value (USD)</span>
                </div>

                <!-- USDT Row -->
                <div class="grid grid-cols-3 p-4 hover:bg-gray-800/30 transition-colors items-center">
                    <div class="flex items-center gap-3">
                        <div
                            class="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center text-green-500 border border-green-500/30">
                            <span class="font-bold text-xs">$</span>
                        </div>
                        <div class="flex flex-col">
                            <span class="font-bold text-white text-sm">USDT</span>
                            <span class="text-[10px] text-gray-500">Tether</span>
                        </div>
                    </div>
                    <div class="flex flex-col text-right justify-center">
                        <span class="font-mono text-gray-300 text-sm">{{ walletStore.wallet.usdt.toLocaleString()
                        }}</span>
                    </div>
                    <div class="flex flex-col text-right justify-center">
                        <span class="font-mono text-white font-bold text-sm">{{
                            walletStore.wallet.usdt.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
                        }}</span>
                    </div>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="grid grid-cols-2 gap-4 pt-2">
                <router-link to="/deposit"
                    class="flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-green-900/20">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                        stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    Deposit
                </router-link>
                <router-link to="/withdrawal"
                    class="flex items-center justify-center gap-2 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-all border border-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                        stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Withdraw
                </router-link>
            </div>
        </div>
    </div>
</template>
