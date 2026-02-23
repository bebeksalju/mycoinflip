<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import { useMarketStore } from '../stores/market';

const authStore = useAuthStore();
const router = useRouter();
const marketStore = useMarketStore();

const email = ref('');
const password = ref('');
const isLoading = ref(false);

const handleLogin = async () => {
    if (!email.value || !password.value) {
        marketStore.showToast('Error', 'Please enter email and password', 'error');
        return;
    }

    isLoading.value = true;

    // Simulate Network Delay (removed, using real API)
    const result = await authStore.login(email.value, password.value);
    if (result.success) {
        marketStore.showToast('Success', 'Welcome back!', 'success');
        router.push('/dashboard');
    } else if (result.banned) {
        router.push('/banned');
    } else {
        marketStore.showToast('Error', 'Invalid credentials', 'error');
    }
    isLoading.value = false;
};
</script>

<template>
    <div class="flex items-center justify-center min-h-screen bg-gray-950 p-4">
        <div class="w-full max-w-md bg-gray-900 border border-gray-800 rounded-lg p-8 shadow-2xl">
            <div class="flex flex-col items-center mb-8">
                <img src="../assets/logo.png" alt="MyCOINFLIP" class="h-12 w-auto object-contain mb-4" />
                <h2 class="text-2xl font-bold text-white">Welcome Back</h2>
                <p class="text-gray-400 text-sm">Sign in to continue trading</p>
            </div>

            <form @submit.prevent="handleLogin" class="space-y-6">
                <div>
                    <label class="block text-xs uppercase font-bold text-gray-500 mb-2">Email Address</label>
                    <input type="email" v-model="email"
                        class="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white focus:outline-none focus:border-yellow-500"
                        placeholder="name@example.com">
                </div>

                <div>
                    <label class="block text-xs uppercase font-bold text-gray-500 mb-2">Password</label>
                    <input type="password" v-model="password"
                        class="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white focus:outline-none focus:border-yellow-500"
                        placeholder="••••••••">
                </div>

                <button type="submit"
                    class="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold rounded transition-colors shadow-lg shadow-yellow-500/10 flex items-center justify-center gap-2"
                    :disabled="isLoading">
                    <svg v-if="isLoading" class="animate-spin h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg"
                        fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                    </svg>
                    <span>{{ isLoading ? 'Signing In...' : 'Sign In' }}</span>
                </button>
            </form>

            <p class="text-center text-gray-500 text-sm mt-6">
                Don't have an account? <router-link to="/register"
                    class="text-yellow-500 hover:underline">Register</router-link>
            </p>
        </div>
    </div>
</template>
