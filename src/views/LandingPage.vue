<script setup>
import { RouterLink } from 'vue-router';
import { useMarketStore } from '../stores/market';
import { onMounted, computed, ref, onUnmounted, reactive } from 'vue';

const marketStore = useMarketStore();

const stats = reactive({
    activeUsers: 14520,
    activetx: 890,
    volume: 125000000
});

let statsInterval = null;
const isMobileMenuOpen = ref(false);

const toggleMobileMenu = () => {
    isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

onMounted(() => {
    marketStore.fetchMarketOverview();
    statsInterval = setInterval(() => {
        stats.activeUsers = Math.max(10000, stats.activeUsers + Math.floor(Math.random() * 100) - 50);
        stats.activetx = Math.max(200, stats.activetx + Math.floor(Math.random() * 40) - 20);
        stats.volume += Math.floor(Math.random() * 50000);
    }, 3000);
});

onUnmounted(() => {
    if (statsInterval) clearInterval(statsInterval);
});

const topCoins = computed(() => marketStore.marketOverview);

const formatCompact = (num) => {
    if (num >= 1e9) return '$' + (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return '$' + (num / 1e6).toFixed(1) + 'M';
    return '$' + num.toLocaleString();
};
</script>

<template>
    <div
        class="bg-[#0a0a0f] min-h-screen text-white font-sans overflow-x-hidden selection:bg-emerald-500 selection:text-black">

        <!-- Navbar -->
        <nav class="fixed top-0 w-full z-50 bg-[#0a0a0f]/70 backdrop-blur-2xl border-b border-white/[0.04]">
            <div class="container mx-auto px-6 py-4 flex justify-between items-center">
                <div class="flex items-center gap-2 z-50">
                    <img src="../assets/logo.png" alt="MyCOINFLIP" class="h-8 md:h-10 w-auto" />
                </div>
                <div class="hidden md:flex items-center gap-10">
                    <a href="#features"
                        class="text-[13px] font-medium text-gray-400 hover:text-white transition-colors tracking-wide">Features</a>
                    <a href="#market"
                        class="text-[13px] font-medium text-gray-400 hover:text-white transition-colors tracking-wide">Markets</a>
                    <a href="#stats"
                        class="text-[13px] font-medium text-gray-400 hover:text-white transition-colors tracking-wide">Stats</a>
                </div>
                <div class="hidden md:flex items-center gap-3">
                    <RouterLink to="/login"
                        class="px-5 py-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors">Log In
                    </RouterLink>
                    <RouterLink to="/register"
                        class="px-6 py-2.5 bg-white text-black text-sm font-bold rounded-full transition-all hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:scale-105">
                        Get Started</RouterLink>
                </div>
                <button @click="toggleMobileMenu" class="md:hidden z-50 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                        stroke="currentColor" class="w-7 h-7">
                        <path v-if="!isMobileMenuOpen" stroke-linecap="round" stroke-linejoin="round"
                            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        <path v-else stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <div v-if="isMobileMenuOpen"
                    class="fixed inset-0 bg-[#0a0a0f]/98 backdrop-blur-xl z-40 flex flex-col items-center justify-center space-y-6 md:hidden">
                    <a href="#features" @click="toggleMobileMenu" class="text-2xl font-bold text-gray-200">Features</a>
                    <a href="#market" @click="toggleMobileMenu" class="text-2xl font-bold text-gray-200">Markets</a>
                    <a href="#stats" @click="toggleMobileMenu" class="text-2xl font-bold text-gray-200">Stats</a>
                    <hr class="border-gray-800 w-48 my-4" />
                    <RouterLink to="/login" @click="toggleMobileMenu" class="text-xl font-bold text-white">Log In
                    </RouterLink>
                    <RouterLink to="/register" @click="toggleMobileMenu"
                        class="w-64 py-4 text-center text-xl font-bold bg-white text-black rounded-2xl">Get Started
                    </RouterLink>
                </div>
            </div>
        </nav>

        <!-- HERO -->
        <section class="relative min-h-screen flex items-center justify-center overflow-hidden">
            <!-- Animated gradient orbs -->
            <div class="absolute inset-0 pointer-events-none">
                <div
                    class="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-emerald-500/[0.07] rounded-full blur-[150px] animate-pulse-slow">
                </div>
                <div class="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/[0.05] rounded-full blur-[150px] animate-pulse-slow"
                    style="animation-delay: 3s;"></div>
                <div
                    class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-500/[0.03] rounded-full blur-[200px]">
                </div>
            </div>

            <!-- Grid pattern overlay -->
            <div
                class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none">
            </div>

            <div class="container mx-auto px-6 text-center relative z-10 pt-24">
                <!-- Badge -->
                <div
                    class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-xs font-semibold text-emerald-400 mb-8 backdrop-blur-sm">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Live — {{ stats.activeUsers.toLocaleString() }} traders online
                </div>

                <!-- Main heading -->
                <h1 class="text-5xl sm:text-6xl md:text-8xl font-black mb-6 leading-[0.95] tracking-tighter">
                    <span class="text-white">Trade Crypto</span><br />
                    <span
                        class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">Without
                        Limits</span>
                </h1>

                <p class="text-base md:text-lg text-gray-400 mb-12 max-w-xl mx-auto leading-relaxed font-light">
                    The fastest, most secure way to trade digital assets. Zero fees on your first $10,000.
                </p>

                <!-- CTA buttons -->
                <div class="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                    <RouterLink to="/register"
                        class="group px-10 py-4 bg-white text-black font-extrabold rounded-2xl text-base transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.12)] flex items-center justify-center gap-3">
                        Create Free Account
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5"
                            stroke="currentColor" class="w-4 h-4 group-hover:translate-x-1 transition-transform">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                    </RouterLink>
                    <RouterLink to="/dashboard"
                        class="px-10 py-4 bg-white/[0.04] border border-white/[0.08] text-white font-bold rounded-2xl text-base transition-all hover:bg-white/[0.08] backdrop-blur-sm flex items-center justify-center">
                        Explore Platform
                    </RouterLink>
                </div>

                <!-- Live coin cards -->
                <div class="flex flex-wrap gap-3 justify-center max-w-3xl mx-auto" v-if="topCoins.length > 0">
                    <div v-for="coin in topCoins.slice(0, 5)" :key="coin.id"
                        class="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm hover:bg-white/[0.06] transition-all cursor-default">
                        <img :src="coin.image" class="w-6 h-6 rounded-full" :alt="coin.name" />
                        <span class="font-bold text-white text-sm">{{ coin.symbol.toUpperCase() }}</span>
                        <span class="font-mono text-gray-400 text-xs">{{ coin.current_price.toLocaleString('en-US', {
                            style: 'currency', currency: 'USD' }) }}</span>
                        <span class="text-[11px] font-bold px-1.5 py-0.5 rounded-md"
                            :class="coin.price_change_percentage_24h >= 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'">
                            {{ coin.price_change_percentage_24h >= 0 ? '+' : '' }}{{
                                coin.price_change_percentage_24h?.toFixed(1) }}%
                        </span>
                    </div>
                </div>

                <!-- Stats strip -->
                <div id="stats" class="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                    <div class="text-center">
                        <div class="text-3xl md:text-4xl font-black text-white mb-1 tabular-nums">{{
                            formatCompact(stats.volume) }}</div>
                        <div class="text-xs text-gray-500 uppercase tracking-widest font-semibold">24h Volume</div>
                    </div>
                    <div class="text-center">
                        <div class="text-3xl md:text-4xl font-black text-white mb-1 tabular-nums">{{
                            stats.activeUsers.toLocaleString() }}</div>
                        <div class="text-xs text-gray-500 uppercase tracking-widest font-semibold">Active Traders</div>
                    </div>
                    <div class="text-center">
                        <div class="text-3xl md:text-4xl font-black text-white mb-1">10+</div>
                        <div class="text-xs text-gray-500 uppercase tracking-widest font-semibold">Supported Assets
                        </div>
                    </div>
                </div>
            </div>

            <!-- Scroll indicator -->
            <div
                class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-600 animate-bounce">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                    stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
            </div>
        </section>

        <!-- FEATURES - Bento Grid -->
        <section id="features" class="py-24 relative">
            <div class="container mx-auto px-6">
                <div class="text-center mb-16">
                    <p class="text-emerald-400 text-xs font-bold uppercase tracking-[0.2em] mb-4">Why MyCOINFLIP</p>
                    <h2 class="text-3xl md:text-5xl font-black text-white tracking-tight">Built for serious traders</h2>
                </div>

                <div class="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
                    <!-- Feature 1 - Large -->
                    <div
                        class="md:col-span-2 p-8 md:p-10 rounded-3xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.06] group hover:border-emerald-500/20 transition-all">
                        <div
                            class="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                                stroke="currentColor" class="w-6 h-6 text-emerald-400">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-white mb-3">Lightning-Fast Execution</h3>
                        <p class="text-gray-400 leading-relaxed text-sm max-w-md">Orders execute in under 50ms. Our
                            matching engine ensures you never miss a market move, even during the highest volatility.
                        </p>
                    </div>

                    <!-- Feature 2 -->
                    <div
                        class="p-8 rounded-3xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.06] group hover:border-blue-500/20 transition-all">
                        <div
                            class="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                                stroke="currentColor" class="w-6 h-6 text-blue-400">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-white mb-3">Bank-Grade Security</h3>
                        <p class="text-gray-400 leading-relaxed text-sm">98% of assets in cold storage. ISO 27001
                            certified.</p>
                    </div>

                    <!-- Feature 3 -->
                    <div
                        class="p-8 rounded-3xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.06] group hover:border-violet-500/20 transition-all">
                        <div
                            class="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                                stroke="currentColor" class="w-6 h-6 text-violet-400">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-white mb-3">Deep Liquidity</h3>
                        <p class="text-gray-400 leading-relaxed text-sm">Trade any size. Aggregated liquidity ensures
                            best price always.</p>
                    </div>

                    <!-- Feature 4 - Large -->
                    <div
                        class="md:col-span-2 p-8 md:p-10 rounded-3xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.06] group hover:border-amber-500/20 transition-all">
                        <div
                            class="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                                stroke="currentColor" class="w-6 h-6 text-amber-400">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-white mb-3">Timed Trading</h3>
                        <p class="text-gray-400 leading-relaxed text-sm max-w-md">Predict price direction in as little
                            as 10 seconds. Set your duration, place your call, and watch the market decide your fate.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <!-- MARKET TABLE -->
        <section id="market" class="py-24 relative">
            <div
                class="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/[0.02] to-transparent pointer-events-none">
            </div>
            <div class="container mx-auto px-6 relative z-10">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-12">
                    <div>
                        <p class="text-emerald-400 text-xs font-bold uppercase tracking-[0.2em] mb-3">Live Prices</p>
                        <h2 class="text-3xl md:text-4xl font-black text-white tracking-tight">Today's Market</h2>
                    </div>
                    <RouterLink to="/register"
                        class="text-gray-400 hover:text-white text-sm font-semibold flex items-center gap-1 transition-colors">
                        View all assets
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
                            stroke="currentColor" class="w-3.5 h-3.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                    </RouterLink>
                </div>

                <div class="rounded-2xl border border-white/[0.06] overflow-hidden bg-white/[0.02] backdrop-blur-sm">
                    <div class="overflow-x-auto">
                        <table class="w-full text-left min-w-[600px]">
                            <thead>
                                <tr
                                    class="text-[11px] text-gray-500 uppercase tracking-widest border-b border-white/[0.04]">
                                    <th class="py-4 px-6 font-semibold">#</th>
                                    <th class="py-4 px-6 font-semibold">Asset</th>
                                    <th class="py-4 px-6 font-semibold text-right">Price</th>
                                    <th class="py-4 px-6 font-semibold text-right">24h</th>
                                    <th class="py-4 px-6 font-semibold text-right hidden md:table-cell">Market Cap</th>
                                    <th class="py-4 px-6 font-semibold text-right"></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(coin, index) in topCoins.slice(0, 6)" :key="coin.id"
                                    class="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group">
                                    <td class="py-4 px-6 text-gray-500 text-sm font-mono">{{ index + 1 }}</td>
                                    <td class="py-4 px-6">
                                        <div class="flex items-center gap-3">
                                            <img :src="coin.image" :alt="coin.name" class="w-8 h-8 rounded-full" />
                                            <div>
                                                <div class="font-bold text-white text-sm">{{ coin.name }}</div>
                                                <div class="text-[11px] text-gray-500 uppercase font-semibold">{{
                                                    coin.symbol }}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td
                                        class="py-4 px-6 text-right font-mono font-bold text-white text-sm tabular-nums">
                                        {{ coin.current_price.toLocaleString('en-US', {
                                            style: 'currency', currency:
                                        'USD' }) }}
                                    </td>
                                    <td class="py-4 px-6 text-right text-sm font-bold tabular-nums"
                                        :class="coin.price_change_percentage_24h >= 0 ? 'text-emerald-400' : 'text-red-400'">
                                        {{ coin.price_change_percentage_24h >= 0 ? '+' : '' }}{{
                                            coin.price_change_percentage_24h?.toFixed(2) }}%
                                    </td>
                                    <td
                                        class="py-4 px-6 text-right text-gray-400 text-sm hidden md:table-cell tabular-nums font-mono">
                                        {{ formatCompact(coin.market_cap) }}
                                    </td>
                                    <td class="py-4 px-6 text-right">
                                        <RouterLink to="/register"
                                            class="inline-block px-5 py-1.5 text-xs font-bold rounded-full transition-all bg-white/[0.04] border border-white/[0.08] text-gray-300 hover:bg-emerald-500 hover:text-black hover:border-emerald-500">
                                            Trade
                                        </RouterLink>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>

        <!-- CTA SECTION -->
        <section class="py-32 relative overflow-hidden">
            <div
                class="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.06] via-transparent to-blue-500/[0.06] pointer-events-none">
            </div>
            <div class="container mx-auto px-6 text-center relative z-10">
                <h2 class="text-4xl md:text-7xl font-black mb-6 text-white tracking-tighter leading-[0.95]">
                    Start trading<br />
                    <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">in
                        seconds</span>
                </h2>
                <p class="text-gray-400 text-lg mb-10 max-w-lg mx-auto font-light">
                    No minimum deposit. No hidden fees. Setup takes less than 2 minutes.
                </p>
                <RouterLink to="/register"
                    class="inline-flex items-center gap-3 px-12 py-5 bg-white text-black font-black rounded-2xl text-lg transition-all hover:scale-105 hover:shadow-[0_0_60px_rgba(255,255,255,0.1)]">
                    Create Account — It's Free
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5"
                        stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                </RouterLink>
            </div>
        </section>

        <!-- FOOTER -->
        <footer class="border-t border-white/[0.04] py-12 text-gray-500 text-sm">
            <div class="container mx-auto px-6 grid md:grid-cols-4 gap-8 mb-10">
                <div>
                    <div class="flex items-center gap-2 mb-4">
                        <img src="../assets/logo.png" alt="MyCOINFLIP" class="h-7 w-auto opacity-50 grayscale" />
                        <span class="font-bold text-gray-300">MyCOINFLIP</span>
                    </div>
                    <p class="leading-relaxed text-xs text-gray-600">The trusted platform for crypto trading. Secure,
                        fast, and reliable since 2026.</p>
                </div>
                <div>
                    <h4 class="font-bold text-gray-300 mb-4 text-xs uppercase tracking-widest">Platform</h4>
                    <ul class="space-y-3 text-xs">
                        <li><a href="#" class="hover:text-white transition-colors">Markets</a></li>
                        <li><a href="#" class="hover:text-white transition-colors">Exchange</a></li>
                        <li><a href="#" class="hover:text-white transition-colors">Earn</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-bold text-gray-300 mb-4 text-xs uppercase tracking-widest">Support</h4>
                    <ul class="space-y-3 text-xs">
                        <li><a href="#" class="hover:text-white transition-colors">Help Center</a></li>
                        <li><a href="#" class="hover:text-white transition-colors">API Docs</a></li>
                        <li><a href="#" class="hover:text-white transition-colors">Fees</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-bold text-gray-300 mb-4 text-xs uppercase tracking-widest">Legal</h4>
                    <ul class="space-y-3 text-xs">
                        <li><a href="#" class="hover:text-white transition-colors">Privacy Policy</a></li>
                        <li><a href="#" class="hover:text-white transition-colors">Terms of Service</a></li>
                    </ul>
                </div>
            </div>
            <div class="container mx-auto px-6 border-t border-white/[0.04] pt-8 text-center text-xs text-gray-600">
                <p>&copy; 2026 MyCOINFLIP. All rights reserved.</p>
            </div>
        </footer>
    </div>
</template>

<style scoped>
.animate-pulse-slow {
    animation: pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
