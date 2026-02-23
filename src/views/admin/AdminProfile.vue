<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../../stores/auth';

const authStore = useAuthStore();
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const message = ref('');
const messageType = ref('');
const isLoading = ref(false);

const updateProfile = async () => {
    if (!currentPassword.value || !newPassword.value) {
        message.value = 'Please fill all fields';
        messageType.value = 'error';
        return;
    }

    if (newPassword.value !== confirmPassword.value) {
        message.value = 'Passwords do not match';
        messageType.value = 'error';
        return;
    }

    isLoading.value = true;
    try {
        const result = await authStore.changePassword(currentPassword.value, newPassword.value);
        message.value = result.message || 'Password updated successfully';
        messageType.value = 'success';
        currentPassword.value = '';
        newPassword.value = '';
        confirmPassword.value = '';
    } catch (error) {
        message.value = error.response?.data?.error || 'Failed to update password';
        messageType.value = 'error';
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <div>
        <h1 class="text-2xl font-bold mb-6">Admin Profile</h1>

        <div class="bg-gray-800 rounded-xl border border-gray-700 max-w-2xl p-6">
            <div class="flex items-center gap-4 mb-8">
                <div
                    class="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center text-gray-900 font-bold text-2xl">
                    {{ (authStore.user.name || 'A').charAt(0) }}
                </div>
                <div>
                    <h2 class="text-xl font-bold text-white">{{ authStore.user.name }}</h2>
                    <p class="text-gray-400">{{ authStore.user.email }}</p>
                    <span
                        class="inline-block px-2 py-0.5 mt-1 rounded text-xs font-bold uppercase bg-purple-900/30 text-purple-400">
                        {{ authStore.user.role }}
                    </span>
                </div>
            </div>

            <h3 class="font-bold text-lg text-white mb-4">Security Settings</h3>

            <form @submit.prevent="updateProfile" class="space-y-4">
                <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Current Password</label>
                    <input v-model="currentPassword" type="password"
                        class="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-yellow-500 outline-none" />
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-bold text-gray-500 uppercase mb-1">New Password</label>
                        <input v-model="newPassword" type="password"
                            class="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-yellow-500 outline-none" />
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Confirm New Password</label>
                        <input v-model="confirmPassword" type="password"
                            class="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-yellow-500 outline-none" />
                    </div>
                </div>

                <div v-if="message" class="text-sm font-bold text-center p-2 rounded"
                    :class="messageType === 'success' ? 'text-green-400 bg-green-900/20' : 'text-red-400 bg-red-900/20'">
                    {{ message }}
                </div>

                <div class="pt-4">
                    <button type="submit" :disabled="isLoading"
                        class="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 rounded shadow-lg transition-colors disabled:opacity-50">
                        {{ isLoading ? 'Updating...' : 'Update Password' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>
