<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAdminStore } from '../../stores/admin';

const adminStore = useAdminStore();
const selectedKYC = ref(null);
const isModalOpen = ref(false);

onMounted(() => {
    adminStore.fetchKycRequests();
});

const pendingKYC = computed(() => {
    return adminStore.kycRequests.filter(k => k.status === 'pending');
});

const processedKYC = computed(() => {
    return adminStore.kycRequests.filter(k => k.status !== 'pending');
});

const openReview = (kyc) => {
    selectedKYC.value = kyc;
    isModalOpen.value = true;
};

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleString();
}

const approve = () => {
    if (selectedKYC.value) {
        adminStore.updateKYCStatus(selectedKYC.value.id, 'verified');
        isModalOpen.value = false;
        selectedKYC.value = null;
    }
};

const reject = () => {
    if (selectedKYC.value) {
        adminStore.updateKYCStatus(selectedKYC.value.id, 'rejected');
        isModalOpen.value = false;
        selectedKYC.value = null;
    }
};
</script>

<template>
    <div>
        <h1 class="text-2xl font-bold mb-6">Identity Verification (KYC)</h1>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- List Column -->
            <div class="space-y-6">
                <div class="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                    <div class="p-4 border-b border-gray-700 bg-gray-900/50">
                        <h3 class="font-bold text-gray-300">Pending Requests ({{ pendingKYC.length }})</h3>
                    </div>
                    <div v-if="pendingKYC.length === 0" class="p-8 text-center text-gray-500 text-sm">
                        No pending KYC requests.
                    </div>
                    <div v-else class="divide-y divide-gray-700/50">
                        <div v-for="kyc in pendingKYC" :key="kyc.id"
                            class="p-4 flex items-center justify-between hover:bg-gray-700/20 transition-colors">
                            <div class="flex items-center gap-3">
                                <div
                                    class="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center font-bold text-gray-400">
                                    {{ kyc.user[0] }}
                                </div>
                                <div class="flex flex-col">
                                    <span class="font-bold text-white text-sm">{{ kyc.user }}</span>
                                    <span class="text-xs text-gray-500">{{ kyc.email }}</span>
                                </div>
                            </div>
                            <button @click="openReview(kyc)"
                                class="text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded transition-colors">
                                Review
                            </button>
                        </div>
                    </div>
                </div>

                <div class="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden opacity-75">
                    <div class="p-4 border-b border-gray-700 bg-gray-900/50">
                        <h3 class="font-bold text-gray-300">Recently Processed</h3>
                    </div>
                    <div v-if="processedKYC.length === 0" class="p-8 text-center text-gray-500 text-sm">
                        No processed requests yet.
                    </div>
                    <div v-else class="divide-y divide-gray-700/50">
                        <div v-for="kyc in processedKYC" :key="kyc.id" class="p-4 flex items-center justify-between">
                            <div class="flex flex-col">
                                <span class="font-bold text-gray-400 text-sm">{{ kyc.user }}</span>
                                <span class="text-xs text-gray-600">{{ formatDate(kyc.date) }}</span>
                            </div>
                            <span class="text-xs font-bold uppercase px-2 py-1 rounded"
                                :class="kyc.status === 'verified' || kyc.status === 'approved' ? 'bg-green-900/30 text-green-500' : 'bg-red-900/30 text-red-500'">
                                {{ kyc.status }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Review Modal -->
        <div v-if="isModalOpen"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div
                class="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh]">
                <div class="flex justify-between items-center p-6 border-b border-gray-700">
                    <h2 class="text-xl font-bold text-white">Review KYC: {{ selectedKYC.user }}</h2>
                    <button @click="isModalOpen = false" class="text-gray-400 hover:text-white">✕</button>
                </div>

                <div class="flex-1 overflow-y-auto p-6 space-y-6">
                    <div class="grid grid-cols-2 gap-4">
                        <div class="bg-gray-900 p-3 rounded border border-gray-700">
                            <p class="text-xs text-gray-500 uppercase font-bold mb-2">Submitted</p>
                            <p class="text-white">{{ formatDate(selectedKYC.date) }}</p>
                        </div>
                        <div class="bg-gray-900 p-3 rounded border border-gray-700">
                            <p class="text-xs text-gray-500 uppercase font-bold mb-2">Email</p>
                            <p class="text-white">{{ selectedKYC.email }}</p>
                        </div>
                        <div v-if="selectedKYC.fullName" class="bg-gray-900 p-3 rounded border border-gray-700">
                            <p class="text-xs text-gray-500 uppercase font-bold mb-2">Full Name</p>
                            <p class="text-white">{{ selectedKYC.fullName }}</p>
                        </div>
                        <div v-if="selectedKYC.idNumber" class="bg-gray-900 p-3 rounded border border-gray-700">
                            <p class="text-xs text-gray-500 uppercase font-bold mb-2">ID Number</p>
                            <p class="text-white font-mono">{{ selectedKYC.idNumber }}</p>
                        </div>
                    </div>

                    <div class="space-y-2">
                        <p class="text-sm font-bold text-gray-400 uppercase">ID Documents</p>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="border border-gray-700 rounded-lg p-2 bg-gray-950">
                                <p class="text-xs text-center text-gray-500 mb-2">Front Side</p>
                                <div
                                    class="aspect-video bg-gray-800 rounded flex items-center justify-center text-gray-600 overflow-hidden">
                                    <img v-if="selectedKYC.documentUrl"
                                        :src="`http://localhost:3000${selectedKYC.documentUrl}`"
                                        class="w-full h-full object-contain" alt="ID Front" />
                                    <span v-else>No image uploaded</span>
                                </div>
                            </div>
                            <div class="border border-gray-700 rounded-lg p-2 bg-gray-950">
                                <p class="text-xs text-center text-gray-500 mb-2">Back Side</p>
                                <div
                                    class="aspect-video bg-gray-800 rounded flex items-center justify-center text-gray-600 overflow-hidden">
                                    <img v-if="selectedKYC.documentUrlBack"
                                        :src="`http://localhost:3000${selectedKYC.documentUrlBack}`"
                                        class="w-full h-full object-contain" alt="ID Back" />
                                    <span v-else>No image uploaded</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="p-6 border-t border-gray-700 flex gap-4">
                    <button @click="reject"
                        class="flex-1 py-3 bg-red-900/20 border border-red-900/50 hover:bg-red-900/40 text-red-400 font-bold rounded-lg transition-colors">
                        Reject Application
                    </button>
                    <button @click="approve"
                        class="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors shadow-lg">
                        Approve & Verify
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
