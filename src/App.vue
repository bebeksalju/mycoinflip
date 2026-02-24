<script setup>
import { onMounted, computed } from 'vue';
import ToastNotification from './components/ToastNotification.vue';
import ChatWidget from './components/ChatWidget.vue';
import { useMarketStore } from './stores/market';
import { useWalletStore } from './stores/wallet';
import { useAuthStore } from './stores/auth';
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router';

const marketStore = useMarketStore();
const walletStore = useWalletStore();
const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const coins = marketStore.supportedCoins;

onMounted(() => {
  // Only init market if we are on dashboard or if we want background updates
  if (authStore.isAuthenticated) {
    marketStore.initDashboard();
  }
});

const isDashboard = () => route.name === 'dashboard';
const isLanding = () => route.name === 'landing';


const handleLogout = () => {
  authStore.logout();
  marketStore.showToast('Logged Out', 'See you soon!', 'info');
  router.push('/login');
};

</script>

<template>
  <div class="h-full w-full bg-gray-950 text-white flex flex-col overflow-hidden font-sans">

    <ToastNotification />

    <!-- Header (Hide on Login page AND Admin pages AND Landing Page if not authenticated - actually we want a header on landing page but maybe different?) -->
    <!-- Let's keep the main header for Landing Page but simplify it? Or hide it and let LandingPage have its own? -->
    <!-- Decision: LandingPage has its own header/hero. Hide main app header on Landing Page if NOT authenticated. -->
    <!-- If authenticated, we might want to show the app header even on landing page? -->
    <!-- Actually, if we are on landing page, we probably want the landing page's design. -->
    <!-- Let's HIDE the app header on the landing page completely, as the landing page has its own navigation/hero -->
    <header v-if="route.name !== 'login' && route.name !== 'landing' && !route.path.startsWith('/admin')"
      class="h-12 bg-gray-900 border-b border-gray-800 flex-none flex items-center justify-between px-3 md:px-4 z-20">
      <div class="flex items-center gap-3 md:gap-6 min-w-0">
        <RouterLink to="/" class="flex items-center gap-2 flex-none hover:opacity-80 transition-opacity">
          <img src="./assets/logo.png" alt="MyCOINFLIP" class="h-10 md:h-12 w-auto object-contain" />
        </RouterLink>

        <!-- Navigation Links (Protected) -->
        <nav v-if="authStore.isAuthenticated" class="hidden md:flex items-center gap-1">
          <RouterLink to="/dashboard" class="px-3 py-1 text-sm font-medium rounded transition-colors"
            :class="$route.path === '/dashboard' ? 'text-yellow-500 bg-gray-800' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'">
            Trade</RouterLink>
          <RouterLink to="/deposit" class="px-3 py-1 text-sm font-medium rounded transition-colors"
            :class="$route.path === '/deposit' ? 'text-yellow-500 bg-gray-800' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'">
            Deposit</RouterLink>
          <RouterLink to="/withdrawal" class="px-3 py-1 text-sm font-medium rounded transition-colors"
            :class="$route.path === '/withdrawal' ? 'text-yellow-500 bg-gray-800' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'">
            Withdraw</RouterLink>
        </nav>

        <!-- Coin Selector (Only show on Dashboard & Auth) -->
        <div v-if="authStore.isAuthenticated && isDashboard()"
          class="flex bg-gray-800 rounded p-1 gap-1 overflow-x-auto no-scrollbar max-w-[150px] md:max-w-none hidden sm:flex">
          <button v-for="coin in coins" :key="coin" @click="marketStore.switchCoin(coin)"
            class="px-2 py-0.5 text-[10px] md:text-xs font-bold rounded transition-colors flex-none"
            :class="marketStore.activeCoin.symbol === coin ? 'bg-gray-700 text-yellow-500 shadow' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-700/50'">
            {{ coin }}
          </button>
        </div>
      </div>

      <div v-if="authStore.isAuthenticated" class="flex items-center gap-2 md:gap-3 flex-none">
        <!-- Connection Status -->
        <div class="hidden lg:flex items-center gap-2 text-[10px] px-3 py-1 bg-gray-800 rounded border border-gray-700">
          <span :class="marketStore.connectionStatus.includes('Connected') ? 'bg-green-500' : 'bg-yellow-500'"
            class="w-2 h-2 rounded-full animate-pulse"></span>
          <span class="text-gray-400">{{ marketStore.connectionStatus }}</span>
        </div>

        <!-- Wallet Balance -->
        <div class="hidden md:flex gap-2 text-[10px] font-mono bg-gray-800 px-3 py-1 rounded border border-gray-700">
          <span class="text-gray-400">Est. Value:</span>
          <span class="font-bold text-green-400">{{ (walletStore.wallet.usdt +
            (walletStore.wallet[marketStore.activeCoin.symbol.toLowerCase()] || 0) *
            marketStore.currentPrice).toLocaleString('en-US', { style: 'currency', currency: 'USD'}) }}</span>
        </div>

        <!-- Profile Menu -->
        <RouterLink to="/kyc"
          class="p-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded border border-gray-700 transition-colors"
          title="KYC Verification">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
            stroke="currentColor" class="w-5 h-5"
            :class="authStore.user.kycStatus === 'verified' ? 'text-green-500' : 'text-gray-400'">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
          </svg>
        </RouterLink>

        <RouterLink to="/profile"
          class="p-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded border border-gray-700 transition-colors"
          title="Profile">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
            stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A7.5 7.5 0 014.501 20.118z" />
          </svg>
        </RouterLink>
        <RouterLink to="/settings"
          class="p-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded border border-gray-700 transition-colors"
          title="Settings">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
            stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </RouterLink>

        <!-- Logout Button -->
        <button @click="handleLogout"
          class="p-1.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded border border-red-500/50 transition-colors"
          title="Logout">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
            stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
        </button>
      </div>

      <!-- Not Auth Header Content -->
      <div v-if="!authStore.isAuthenticated" class="flex items-center gap-3">
        <RouterLink to="/login"
          class="px-4 py-1.5 bg-yellow-500 text-gray-900 font-bold rounded text-sm hover:bg-yellow-400 transition-colors">
          Login</RouterLink>
      </div>
    </header>

    <!-- Mobile Nav (Bottom) - Only show if authenticated AND not admin AND not landing -->
    <nav
      v-if="authStore.isAuthenticated && route.name !== 'login' && route.name !== 'landing' && !route.path.startsWith('/admin')"
      class="md:hidden flex items-center justify-around bg-gray-900 border-t border-gray-800 text-xs py-2 fixed bottom-0 left-0 w-full z-50">
      <RouterLink to="/dashboard" class="flex flex-col items-center gap-1 p-2 rounded"
        :class="$route.path === '/dashboard' ? 'text-yellow-500' : 'text-gray-500'">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
          class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
        </svg>
        <span>Trade</span>
      </RouterLink>
      <RouterLink to="/deposit" class="flex flex-col items-center gap-1 p-2 rounded"
        :class="$route.path === '/deposit' ? 'text-yellow-500' : 'text-gray-500'">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
          class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        <span>Deposit</span>
      </RouterLink>
      <RouterLink to="/withdrawal" class="flex flex-col items-center gap-1 p-2 rounded"
        :class="$route.path === '/withdrawal' ? 'text-yellow-500' : 'text-gray-500'">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
          class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
        <span>Withdraw</span>
      </RouterLink>
      <RouterLink to="/wallet" class="flex flex-col items-center gap-1 p-2 rounded"
        :class="$route.path === '/wallet' ? 'text-yellow-500' : 'text-gray-500'">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
          class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
        </svg>
        <span>Wallet</span>
      </RouterLink>
      <RouterLink to="/profile" class="flex flex-col items-center gap-1 p-2 rounded"
        :class="$route.path === '/profile' ? 'text-yellow-500' : 'text-gray-500'">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
          class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A7.5 7.5 0 014.501 20.118z" />
        </svg>
        <span>Profile</span>
      </RouterLink>
    </nav>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-h-0 overflow-hidden" :class="{ 'mb-[50px] md:mb-0': authStore.isAuthenticated }">
      <RouterView />
    </div>

    <!-- Chat Widget (only for authenticated non-admin users) -->
    <ChatWidget v-if="authStore.isAuthenticated && !authStore.user.isAdmin && route.name !== 'login' && route.name !== 'landing' && route.name !== 'banned'" />

  </div>
</template>
