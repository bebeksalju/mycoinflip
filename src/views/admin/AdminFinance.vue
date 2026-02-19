<script setup>
import { ref, computed } from 'vue';
import { useAdminStore } from '../../stores/admin';

const adminStore = useAdminStore();
const activeTab = ref('pending'); // 'pending', 'history'

const pendingTransactions = computed(() => {
    return adminStore.transactions.filter(t => t.status === 'pending');
});

const historyTransactions = computed(() => {
    return adminStore.transactions.filter(t => t.status !== 'pending');
});

const approve = (id) => {
    adminStore.updateTransactionStatus(id, 'approved');
};

const reject = (id) => {
    adminStore.updateTransactionStatus(id, 'rejected');
};
</script>

<template>
    <div>
        <h1 class="text-2xl font-bold mb-6">Finance Management</h1>

        <!-- Tabs -->
        <div class="flex border-b border-gray-700 mb-6">
            <button 
                @click="activeTab = 'pending'"
                class="px-6 py-3 font-bold border-b-2 transition-colors"
                :class="activeTab === 'pending' ? 'text-yellow-500 border-yellow-500' : 'text-gray-400 border-transparent hover:text-white'"
            >
                Pending Requests ({{ pendingTransactions.length }})
            </button>
            <button 
                @click="activeTab = 'history'"
                class="px-6 py-3 font-bold border-b-2 transition-colors"
                :class="activeTab === 'history' ? 'text-yellow-500 border-yellow-500' : 'text-gray-400 border-transparent hover:text-white'"
            >
                History
            </button>
        </div>

        <div class="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm text-gray-400">
                    <thead class="bg-gray-900/50 text-xs uppercase font-bold text-gray-500">
                        <tr>
                            <th class="px-6 py-4">Type</th>
                            <th class="px-6 py-4">User</th>
                            <th class="px-6 py-4 text-right">Amount</th>
                            <th class="px-6 py-4">Network</th>
                            <th class="px-6 py-4">Date</th>
                            <th class="px-6 py-4">Status</th>
                            <th v-if="activeTab === 'pending'" class="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-700/50">
                        <tr v-if="activeTab === 'pending' && pendingTransactions.length === 0">
                            <td colspan="7" class="px-6 py-8 text-center text-gray-500">No pending transactions</td>
                        </tr>
                        <tr v-for="tx in (activeTab === 'pending' ? pendingTransactions : historyTransactions)" :key="tx.id" class="hover:bg-gray-700/20 transition-colors">
                            <td class="px-6 py-4">
                                <span class="font-bold text-xs px-2 py-1 rounded"
                                    :class="tx.type === 'DEPOSIT' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-500'"
                                >
                                    {{ tx.type }}
                                </span>
                            </td>
                            <td class="px-6 py-4">
                                <div class="flex flex-col">
                                    <span class="font-bold text-white">{{ tx.user }}</span>
                                    <span class="text-xs text-gray-500">{{ tx.email }}</span>
                                </div>
                            </td>
                            <td class="px-6 py-4 font-mono font-bold text-white text-right">
                                {{ tx.amount.toLocaleString('en-US', {style: 'currency', currency: 'USD'}) }}
                            </td>
                            <td class="px-6 py-4">
                                <span class="text-xs font-mono bg-gray-900 text-gray-300 px-2 py-1 rounded">{{ tx.asset }} ({{ tx.network }})</span>
                            </td>
                            <td class="px-6 py-4 text-xs font-mono">{{ tx.date }}</td>
                             <td class="px-6 py-4">
                                <span class="text-xs font-bold uppercase"
                                    :class="{
                                        'text-yellow-500': tx.status === 'pending',
                                        'text-green-500': tx.status === 'approved',
                                        'text-red-500': tx.status === 'rejected'
                                    }"
                                >
                                    {{ tx.status }}
                                </span>
                            </td>
                            <td v-if="activeTab === 'pending'" class="px-6 py-4 text-right">
                                <div class="flex justify-end gap-2">
                                    <button @click="reject(tx.id)" class="bg-red-900/20 border border-red-900/50 text-red-400 px-3 py-1.5 rounded text-xs font-bold hover:bg-red-900/40 transition-colors">Reject</button>
                                    <button @click="approve(tx.id)" class="bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded text-xs font-bold shadow-lg transition-colors">Approve</button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>
