<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useMarketStore } from '../stores/market';

const router = useRouter();
const authStore = useAuthStore();
const marketStore = useMarketStore();

const form = reactive({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    dob: '',
    pob: '',
    phone: '',
    address: ''
});

const isLoading = ref(false);

const handleRegister = () => {
    if (form.password !== form.confirmPassword) {
        marketStore.showToast('Error', 'Passwords do not match', 'error');
        return;
    }

    isLoading.value = true;

    setTimeout(() => {
        const success = authStore.register({
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            password: form.password,
            dob: form.dob,
            pob: form.pob,
            phone: form.phone,
            address: form.address
        });

        if (success) {
            marketStore.showToast('Success', 'Account created successfully!', 'success');
            router.push('/');
        } else {
            marketStore.showToast('Error', 'Email already exists', 'error');
        }
        isLoading.value = false;
    }, 1000);
};
</script>

<template>
    <div class="min-h-screen bg-gray-950 flex items-start md:items-center justify-center p-4 overflow-y-auto">
        <div class="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-lg p-6 md:p-8 shadow-2xl my-8 mx-auto">
            <div class="flex flex-col items-center mb-6 md:mb-8">
                <img src="../assets/logo.png" alt="MyCOINFLIP" class="h-10 md:h-12 w-auto object-contain mb-4" />
                <h2 class="text-xl md:text-2xl font-bold text-white text-center">Create Account</h2>
                <p class="text-gray-400 text-xs md:text-sm text-center">Join the leading crypto trading platform</p>
            </div>

            <form @submit.prevent="handleRegister" class="space-y-4 md:space-y-6">
                <!-- Name -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label for="firstName" class="block text-xs uppercase font-bold text-gray-500 mb-1 md:mb-2">First Name</label>
                        <input id="firstName" autocomplete="given-name" required v-model="form.firstName" type="text" class="w-full bg-gray-800 border border-gray-700 rounded p-2.5 md:p-3 text-white text-sm focus:outline-none focus:border-yellow-500" placeholder="John">
                    </div>
                    <div>
                        <label for="lastName" class="block text-xs uppercase font-bold text-gray-500 mb-1 md:mb-2">Last Name</label>
                        <input id="lastName" autocomplete="family-name" required v-model="form.lastName" type="text" class="w-full bg-gray-800 border border-gray-700 rounded p-2.5 md:p-3 text-white text-sm focus:outline-none focus:border-yellow-500" placeholder="Doe">
                    </div>
                </div>

                <!-- Contact -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label for="email" class="block text-xs uppercase font-bold text-gray-500 mb-1 md:mb-2">Email Address</label>
                        <input id="email" autocomplete="email" required v-model="form.email" type="email" class="w-full bg-gray-800 border border-gray-700 rounded p-2.5 md:p-3 text-white text-sm focus:outline-none focus:border-yellow-500" placeholder="john@example.com">
                    </div>
                    <div>
                        <label for="phone" class="block text-xs uppercase font-bold text-gray-500 mb-1 md:mb-2">Phone Number</label>
                        <input id="phone" autocomplete="tel" required v-model="form.phone" type="tel" class="w-full bg-gray-800 border border-gray-700 rounded p-2.5 md:p-3 text-white text-sm focus:outline-none focus:border-yellow-500" placeholder="+1 234 567 890">
                    </div>
                </div>

                <!-- Personal Info -->
                 <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label for="dob" class="block text-xs uppercase font-bold text-gray-500 mb-1 md:mb-2">Date of Birth</label>
                        <input id="dob" autocomplete="bday" required v-model="form.dob" type="date" class="w-full bg-gray-800 border border-gray-700 rounded p-2.5 md:p-3 text-white text-sm focus:outline-none focus:border-yellow-500">
                    </div>
                    <div>
                        <label for="pob" class="block text-xs uppercase font-bold text-gray-500 mb-1 md:mb-2">Place of Birth</label>
                        <input id="pob" autocomplete="address-level2" required v-model="form.pob" type="text" class="w-full bg-gray-800 border border-gray-700 rounded p-2.5 md:p-3 text-white text-sm focus:outline-none focus:border-yellow-500" placeholder="City, Country">
                    </div>
                </div>

                <!-- Address -->
                <div>
                    <label for="address" class="block text-xs uppercase font-bold text-gray-500 mb-1 md:mb-2">Residential Address</label>
                    <textarea id="address" autocomplete="street-address" required v-model="form.address" rows="2" class="w-full bg-gray-800 border border-gray-700 rounded p-2.5 md:p-3 text-white text-sm focus:outline-none focus:border-yellow-500" placeholder="Full residential address"></textarea>
                </div>

                <!-- Security -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label for="password" class="block text-xs uppercase font-bold text-gray-500 mb-1 md:mb-2">Password</label>
                        <input id="password" autocomplete="new-password" required v-model="form.password" type="password" class="w-full bg-gray-800 border border-gray-700 rounded p-2.5 md:p-3 text-white text-sm focus:outline-none focus:border-yellow-500" placeholder="••••••••">
                    </div>
                    <div>
                        <label for="confirmPassword" class="block text-xs uppercase font-bold text-gray-500 mb-1 md:mb-2">Confirm Password</label>
                        <input id="confirmPassword" autocomplete="new-password" required v-model="form.confirmPassword" type="password" class="w-full bg-gray-800 border border-gray-700 rounded p-2.5 md:p-3 text-white text-sm focus:outline-none focus:border-yellow-500" placeholder="••••••••">
                    </div>
                </div>

                <div class="pt-4">
                    <button 
                        type="submit" 
                        class="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold rounded transition-colors shadow-lg shadow-yellow-500/10 flex items-center justify-center gap-2 text-sm md:text-base"
                        :disabled="isLoading"
                    >
                        <svg v-if="isLoading" class="animate-spin h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>{{ isLoading ? 'Creating Account...' : 'Register Account' }}</span>
                    </button>
                </div>
            </form>
            
            <p class="text-center text-gray-500 text-xs md:text-sm mt-6">
                Already have an account? <router-link to="/login" class="text-yellow-500 hover:underline">Sign In</router-link>
            </p>
        </div>
    </div>
</template>
