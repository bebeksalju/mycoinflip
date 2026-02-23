<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useMarketStore } from '../stores/market';
import { useWalletStore } from '../stores/wallet';
import api from '../api/axios';

const marketStore = useMarketStore();
const walletStore = useWalletStore();

const depositForm = reactive({
    network: 'TRC20',
    amount: '',
    txId: ''
});

const fileInput = ref(null);
const fileName = ref('');

const adminWallets = ref({
    'TRC20': 'Not configured',
    'ERC20': 'Not configured',
    'BEP20': 'Not configured'
});

onMounted(async () => {
    try {
        const res = await api.get('/admin/wallets/public');
        if (res.data) {
            adminWallets.value = { ...adminWallets.value, ...res.data };
        }
    } catch (error) {
        console.error('Failed to fetch deposit wallets:', error);
    }
});

const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
        marketStore.showToast('Copied', 'Wallet address copied to clipboard', 'success');
    });
};

const proofFile = ref(null);

const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
        fileName.value = file.name;
        proofFile.value = file;
    }
};

const submitDeposit = async () => {
    if (!depositForm.amount || !depositForm.txId || !proofFile.value) {
        marketStore.showToast('Error', 'Please fill all fields and upload proof', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('amount', depositForm.amount);
    formData.append('proof', proofFile.value);

    const result = await walletStore.deposit(formData);

    if (result.success) {
        marketStore.showToast('Deposit Submitted', result.msg, 'success');
        depositForm.amount = '';
        depositForm.txId = '';
        fileName.value = '';
        proofFile.value = null;
    } else {
        marketStore.showToast('Error', result.msg, 'error');
    }
};
</script>

<template>
    <div class="h-full overflow-y-auto bg-gray-950 p-4 md:p-8">
        <div class="max-w-2xl mx-auto w-full pb-20"> <!-- Added pb-20 for safe bottom spacing -->
            <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                    stroke="currentColor" class="w-8 h-8 text-yellow-500">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                Deposit Funds
            </h2>

            <div class="bg-gray-900 border border-gray-800 rounded-xl p-4 md:p-6 space-y-6 md:space-y-8">
                <!-- Warning Banner -->
                <div
                    class="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg flex gap-3 text-sm text-yellow-200">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                        stroke="currentColor" class="w-5 h-5 flex-none text-yellow-500 mt-0.5">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    <div>
                        <p class="font-bold mb-1">Important Security Note</p>
                        <p class="text-yellow-200/80 leading-relaxed text-xs md:text-sm">Please ensure you select the
                            correct network. Sending funds to the wrong address or network will result in permanent
                            loss.</p>
                    </div>
                </div>

                <!-- Network Selection -->
                <div>
                    <label class="block text-xs uppercase font-bold text-gray-500 mb-3 tracking-wider">Select Payment
                        Network</label>
                    <div class="grid grid-cols-3 gap-2 md:gap-3">
                        <button v-for="(addr, net) in adminWallets" :key="net" @click="depositForm.network = net"
                            class="px-2 py-3 md:px-4 rounded-lg text-xs md:text-sm font-bold border transition-all duration-200 flex flex-col items-center gap-1 group"
                            :class="depositForm.network === net ? 'bg-yellow-500 text-gray-900 border-yellow-500 shadow-lg shadow-yellow-500/20' : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500 hover:bg-gray-750'">
                            <span>USDT</span>
                            <span class="text-[10px] md:text-xs opacity-70 group-hover:opacity-100 uppercase">{{ net
                            }}</span>
                        </button>
                    </div>
                </div>

                <!-- Wallet Display + QR -->
                <div
                    class="bg-gray-800/50 border border-gray-700 rounded-xl p-4 md:p-6 flex flex-col md:flex-row gap-6 items-center">

                    <!-- Mock QR Code -->
                    <div class="bg-white p-2 rounded-lg shrink-0 hidden md:block">
                        <div class="w-32 h-32 bg-gray-900 flex items-center justify-center">
                            <!-- Simple QR Pattern Mock -->
                            <div class="grid grid-cols-5 gap-1 w-28 h-28 opacity-80">
                                <div class="col-span-2 row-span-2 bg-black"></div>
                                <div class="bg-black"></div>
                                <div class="col-span-2 row-span-2 bg-black"></div>
                                <div class="bg-black"></div>
                                <div class="col-span-5 bg-black h-1 my-auto"></div>
                                <div class="bg-black"></div>
                                <div class="bg-black"></div>
                                <div class="bg-black"></div>
                                <div class="bg-black"></div>
                                <div class="bg-black"></div>
                                <div class="col-span-2 row-span-2 bg-black"></div>
                                <div class="bg-black"></div>
                                <div class="col-span-2 row-span-2 bg-black"></div>
                            </div>
                        </div>
                    </div>

                    <div class="flex-1 w-full min-w-0">
                        <label class="block text-xs text-gray-500 mb-1">Deposit Address ({{ depositForm.network
                        }})</label>
                        <div
                            class="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-lg p-3 w-full group focus-within:border-yellow-500 transition-colors">
                            <p class="font-mono text-xs md:text-sm text-gray-300 break-all flex-1">{{
                                adminWallets[depositForm.network] }}</p>
                            <button @click="copyToClipboard(adminWallets[depositForm.network])"
                                class="p-2 text-gray-500 hover:text-white bg-gray-800 hover:bg-gray-700 rounded transition-all shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                    stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                                </svg>
                            </button>
                        </div>
                        <p class="text-[10px] text-gray-500 mt-2">Only send USDT ({{ depositForm.network }}) to this
                            address.</p>
                    </div>
                </div>

                <!-- Form -->
                <div class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs uppercase font-bold text-gray-500 mb-2">Amount (USDT)</label>
                            <input type="number" v-model="depositForm.amount" placeholder="e.g. 100"
                                class="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all font-mono">
                        </div>
                        <div>
                            <label class="block text-xs uppercase font-bold text-gray-500 mb-2">TxID (Hash)</label>
                            <input type="text" v-model="depositForm.txId" placeholder="Paste Transaction ID"
                                class="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all">
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs uppercase font-bold text-gray-500 mb-2">Upload Payment Proof</label>
                        <div class="border-2 border-dashed border-gray-700 rounded-xl p-6 md:p-8 text-center hover:border-yellow-500/50 hover:bg-gray-800/50 transition-all cursor-pointer group"
                            @click="$refs.fileInput.click()">
                            <input type="file" ref="fileInput" class="hidden" @change="handleFileUpload"
                                accept="image/*">
                            <div
                                class="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                    stroke-width="1.5" stroke="currentColor"
                                    class="w-6 h-6 text-gray-400 group-hover:text-yellow-500">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                </svg>
                            </div>
                            <p class="text-sm font-medium text-gray-300">{{ fileName || 'Click orDragtoUploadScreenshot'
                            }}</p>
                            <p class="text-xs text-gray-500 mt-1">Supports JPG, PNG (Max 5MB)</p>
                        </div>
                    </div>
                </div>

                <div class="pt-4">
                    <button @click="submitDeposit"
                        class="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-all shadow-lg shadow-green-500/10 active:scale-[0.98]">
                        Submit Deposit Request
                    </button>
                </div>

            </div>
        </div>
    </div>
</template>
