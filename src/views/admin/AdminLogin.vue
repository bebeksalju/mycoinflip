<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const error = ref('');

const handleLogin = () => {
    if (authStore.loginAdmin(email.value, password.value)) {
        router.push('/admin');
    } else {
        error.value = 'Invalid admin credentials';
    }
};
</script>

<template>
    <div class="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div class="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-8 border border-gray-700">
            <div class="flex justify-center mb-6">
                <div class="bg-yellow-500/10 p-4 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 text-yellow-500">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                </div>
            </div>

            <h1 class="text-2xl font-bold text-center text-white mb-2">Admin Portal</h1>
            <p class="text-gray-500 text-center mb-8 text-sm">Authorized Personnel Only</p>

            <form @submit.prevent="handleLogin" class="space-y-4">
                <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                    <input v-model="email" type="email" class="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-yellow-500 outline-none transition-colors" placeholder="admin@crypto.com" />
                </div>
                
                <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
                    <input v-model="password" type="password" class="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-yellow-500 outline-none transition-colors" placeholder="Admin Key" />
                </div>

                <div v-if="error" class="text-red-400 text-sm text-center font-bold bg-red-900/20 py-2 rounded">
                    {{ error }}
                </div>

                <button type="submit" class="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-3 rounded shadow-lg transition-colors mt-2">
                    Access System
                </button>
            </form>

            <div class="mt-6 text-center">
                <router-link to="/login" class="text-gray-500 hover:text-white text-xs transition-colors">
                    &larr; Return to User Login
                </router-link>
            </div>
        </div>
    </div>
</template>
