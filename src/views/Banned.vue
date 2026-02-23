<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goToLogin = () => {
    router.push('/login');
};
</script>

<template>
    <div class="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div class="max-w-md w-full text-center">
            <!-- Ban Icon -->
            <div class="mb-8">
                <div
                    class="w-24 h-24 mx-auto bg-red-500/10 rounded-full flex items-center justify-center border-2 border-red-500/30">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                        stroke="currentColor" class="w-12 h-12 text-red-500">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                </div>
            </div>

            <!-- Message -->
            <h1 class="text-3xl font-bold text-white mb-3">Account Suspended</h1>
            <p class="text-gray-400 mb-8 leading-relaxed">
                Your account has been suspended due to a violation of our terms of service.
                If you believe this is an error, please contact our customer support team.
            </p>

            <!-- Contact Info -->
            <div class="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
                <h3 class="text-sm font-bold text-gray-400 uppercase mb-4">Contact Customer Support</h3>
                <div class="space-y-3">
                    <a href="mailto:support@mycoinflip.com"
                        class="flex items-center justify-center gap-2 text-yellow-500 hover:text-yellow-400 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                            stroke="currentColor" class="w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                        </svg>
                        support@mycoinflip.com
                    </a>
                    <a href="https://wa.me/6281234567890" target="_blank"
                        class="flex items-center justify-center gap-2 text-green-500 hover:text-green-400 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" class="w-5 h-5">
                            <path
                                d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                            <path
                                d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.96 7.96 0 01-4.108-1.138l-.292-.174-3.028.794.808-3.028-.19-.302A7.963 7.963 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z" />
                        </svg>
                        WhatsApp Support
                    </a>
                </div>
            </div>

            <!-- Back to Login -->
            <button @click="goToLogin" class="text-gray-500 hover:text-white text-sm transition-colors">
                &larr; Back to Login
            </button>
        </div>
    </div>
</template>
