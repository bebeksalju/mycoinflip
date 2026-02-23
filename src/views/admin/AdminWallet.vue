<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import api from '../../api/axios';

const authStore = useAuthStore();
const isSuperuser = authStore.user.role === 'SUPERUSER';
const wallets = ref([]);
const isEditing = ref(false);
const isSaving = ref(false);
const message = ref('');
const messageType = ref('');

const networks = ['TRC20', 'ERC20', 'BEP20'];

const editForm = reactive({
    TRC20: '',
    ERC20: '',
    BEP20: ''
});

onMounted(async () => {
    try {
        const res = await api.get('/admin/wallets');
        wallets.value = res.data;
        // Populate form
        wallets.value.forEach(w => {
            if (editForm.hasOwnProperty(w.network)) {
                editForm[w.network] = w.address;
            }
        });
    } catch (error) {
        console.error('Failed to fetch wallets:', error);
    }
});

const getAddress = (network) => {
    const w = wallets.value.find(w => w.network === network);
    return w?.address || 'Not configured';
};

const startEdit = () => {
    wallets.value.forEach(w => {
        if (editForm.hasOwnProperty(w.network)) {
            editForm[w.network] = w.address;
        }
    });
    isEditing.value = true;
};

const cancelEdit = () => {
    isEditing.value = false;
    message.value = '';
};

const saveWallets = async () => {
    isSaving.value = true;
    try {
        const payload = networks
            .filter(n => editForm[n])
            .map(n => ({ network: n, address: editForm[n] }));

        const res = await api.put('/admin/wallets', { wallets: payload });
        if (res.data.success) {
            wallets.value = res.data.wallets;
            isEditing.value = false;
            message.value = 'Wallet addresses updated successfully';
            messageType.value = 'success';
        }
    } catch (error) {
        message.value = error.response?.data?.error || 'Failed to update wallets';
        messageType.value = 'error';
    } finally {
        isSaving.value = false;
    }
};

const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    message.value = 'Address copied!';
    messageType.value = 'success';
    setTimeout(() => message.value = '', 2000);
};
</script>

<template>
    <div>
        <div class="flex justify-between items-center mb-6">
            <div>
                <h1 class="text-2xl font-bold">Admin Wallet</h1>
                <p class="text-sm text-gray-400 mt-1">Deposit wallet addresses shown to users</p>
            </div>
            <button v-if="isSuperuser && !isEditing" @click="startEdit"
                class="bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold px-4 py-2 rounded shadow transition-colors">
                Edit Addresses
            </button>
        </div>

        <div v-if="message" class="mb-4 text-sm font-bold text-center p-2 rounded"
            :class="messageType === 'success' ? 'text-green-400 bg-green-900/20' : 'text-red-400 bg-red-900/20'">
            {{ message }}
        </div>

        <!-- View Mode -->
        <div v-if="!isEditing" class="space-y-4">
            <div v-for="network in networks" :key="network"
                class="bg-gray-800 rounded-xl border border-gray-700 p-6 flex items-center justify-between">
                <div class="flex items-center gap-4 min-w-0">
                    <div class="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                        :class="{
                            'bg-red-500/20 text-red-400': network === 'TRC20',
                            'bg-blue-500/20 text-blue-400': network === 'ERC20',
                            'bg-yellow-500/20 text-yellow-400': network === 'BEP20'
                        }">
                        {{ network.slice(0, 3) }}
                    </div>
                    <div class="min-w-0">
                        <p class="text-xs uppercase font-bold text-gray-500">{{ network }} Network</p>
                        <p class="text-white font-mono text-sm truncate">{{ getAddress(network) }}</p>
                    </div>
                </div>
                <button v-if="getAddress(network) !== 'Not configured'" @click="copyToClipboard(getAddress(network))"
                    class="text-gray-400 hover:text-yellow-500 transition-colors shrink-0 ml-4"
                    title="Copy Address">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                    </svg>
                </button>
            </div>
        </div>

        <!-- Edit Mode (SUPERUSER only) -->
        <div v-else class="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h3 class="font-bold text-lg text-white mb-4">Edit Wallet Addresses</h3>
            <div class="space-y-4">
                <div v-for="network in networks" :key="network">
                    <label class="block text-xs font-bold text-gray-500 uppercase mb-1">{{ network }} Address</label>
                    <input v-model="editForm[network]" type="text"
                        class="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white font-mono text-sm focus:border-yellow-500 outline-none"
                        :placeholder="`Enter ${network} wallet address`" />
                </div>
            </div>

            <div class="flex gap-3 mt-6">
                <button @click="cancelEdit" class="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-bold">Cancel</button>
                <button @click="saveWallets" :disabled="isSaving"
                    class="flex-1 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded font-bold shadow-lg disabled:opacity-50">
                    {{ isSaving ? 'Saving...' : 'Save Addresses' }}
                </button>
            </div>
        </div>

        <!-- Info Box -->
        <div v-if="!isSuperuser" class="mt-6 bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg text-yellow-300 text-sm">
            <strong>Note:</strong> Only Superuser accounts can modify wallet addresses. Contact your administrator for changes.
        </div>
    </div>
</template>
